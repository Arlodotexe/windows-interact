const robot = require('robotjs');
const exec = require('child_process').exec;
const fs = require('fs');
const util = require('util');
const say = require('say');
const requestify = require('requestify');

function replaceAll(str, find, replace) {
	return String.raw`${str}`.replace(new RegExp(find.replace(/([.*+?^=!:${}()|\[\]\/\\\r\n\t|\n|\r\t])/g, '\\$1'), 'g'), replace);
}

function isUrl(url) {
	return /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/.test(url);
}

String.prototype.replaceAll = function(t, e, n) {
	let r = "" + this, g = "", l = r, s = 0, h = -1
	for (n && (t = t.toLowerCase(), l = r.toLowerCase()); (h = l.indexOf(t)) > -1;)g += r.substring(s, s + h) + e, l = l.substring(h + t.length, l.length), s += h + t.length;
	return l.length > 0 && (g += r.substring(r.length - l.length, r.length)), g;
};

function toStandardTime(militaryTime) {
	militaryTime = militaryTime.split(':');
	if (militaryTime[0].charAt(0) && militaryTime[0].charAt(1) > 2) {
		return (militaryTime[0] - 12) + ':' + militaryTime[1] + ':' + militaryTime[2] + ' PM';
	} else {
		return militaryTime.join(':') + ' AM';
	}
}


let split = {
	first: function(t) {
		let n = Math.floor(t.length / 2), r = t.lastIndexOf(" ", n), f = t.indexOf(" ", n + 1);
		return n = -1 == r || -1 != f && n - r >= f - n ? f : r, t.substr(0, n);
	}, last: function(t) {
		let n = Math.floor(t.length / 2), r = t.lastIndexOf(" ", n), f = t.indexOf(" ", n + 1);
		return n = -1 == r || -1 != f && n - r >= f - n ? f : r, t.substr(n + 1);
	}
};

let prefs = {
	masterKey: 'AREALLYLONGSTRINGWITHLOTSOFLETTERSANDNUMBERS'
};

const parseAuthCode = function(receivedCode) {
	if (receivedCode == System.prefs.masterKey) return true;
	if (typeof System.prefs.authCodeParse !== 'function' && typeof System.prefs.authCodeParse == undefined) {
		System.error('Type of "authCodeParse" is not a function');
	}
	if (typeof System.prefs.authCodeParse == 'function') {
		return System.prefs.authCodeParse(receivedCode);
	} else {
		const s = parseInt(new Date().getSeconds().toString().charAt(0));
		let alph = 'abcdefghij'.split('');
		if (alph.indexOf(receivedCode.toLowerCase().charAt(0)) === s) return true; else return false;
	}
}

const authCode = {
	isValid: function(code) {
		if (code === undefined) {
			System.error('No code provided');
			return false;
		} else if (code && parseAuthCode(code)) {
			if (code === System.prefs.masterKey) System.log('Master key authorized');
			else System.log('Code "' + code + '" authorized');
			return true;
		} else if (!parseAuthCode(code)) {
			System.log('Invalid code: "' + code + '".');
			return false;
		}
	}
};

function speak() {
	let speechQ = [];
	let fn = function(phrase, TTSVoice, speed, callback) {
		if (!TTSVoice) TTSVoice = System.prefs.TTSVoice;
		speaking = {
			now: null
		};
		function trySpeech() {
			speechQ.push(phrase);
			if (speaking.now === false || speechQ.length == 1) {
				speaking.now = true;
				say.speak(speechQ.slice(-1)[0], TTSVoice, speed, (err) => {
					speaking.now = false;
					speechQ.pop();
					if (callback) callback(err);
				});
			} else {
				setTimeout(() => {
					trySpeech();
				}, 250);
			}
		}
		trySpeech();
	};
	fn.now = function(phrase, TTSVoice) {
		if (!TTSVoice) TTSVoice = System.prefs.TTSVoice;
		say.speak(phrase, TTSVoice);
	};
	fn.stop = function(callback) {
		say.stop(() => {
			if (callback) callback();
		});
	};
	fn.log = function(phrase, voice, speed) {
		System.log('(Spoken): ' + phrase);
		System.speak(phrase, voice, speed);
	};
	return fn;
}

function log() {
	let fn = function(param) {
		if (System.prefs.log && System.prefs.log.outputFile) fs.createWriteStream(System.prefs.log.outputFile, { flags: 'a' }).write((System.prefs.log.showTime) ? toStandardTime(new Date().toLocaleTimeString()) + ': ' : '' + util.format.apply(null, arguments) + '\n');
		process.stdout.write((System.prefs.log && System.prefs.log.showTime) ? toStandardTime(new Date().toLocaleTimeString()) + ': ' : '' + util.format.apply(null, arguments) + '\n');
	};
	fn.error = function(arg) {
		if (arg != '' && arg != undefined && arg != null) {
			System.log('\nERROR ' + arg);
			if (System.prefs.spokenErrorMessage) System.speak(System.prefs.spokenErrorMessage);
		}
	};
	fn.speak = function(phrase, voice, speed) {
		System.speak(phrase, voice, speed);
		System.log('(Spoken): ' + phrase);
	};
	return fn;
}

//--The-big-one-------------------
const System = {
	prefs: prefs,
	authCode: authCode,
	path: function(pathUrl) {
		pathUrl = replaceAll(pathUrl.raw[0], '\\', '\\\\');
		if (pathUrl.slice(-1) == '"' && pathUrl.charAt(0) == '"') pathUrl = replaceAll(pathUrl, '"', '');
		return pathUrl;
	},
	log: log(),
	requestTo: function(deviceName, method, formData, callback) {
		if (!isUrl(deviceName)) deviceName = System.prefs.httpUrls[deviceName];
		if (typeof formData == 'function') {
			requestify[method.toLowerCase()](deviceName)
				.then(function(response) {
					if (System.prefs.verbose.requestTo) System.log('Sent ' + method + ' request to ' + deviceName);
					formData(response.body);
				});
		} else if (typeof method == 'function' || method == undefined) {
			requestify.get(deviceName)
				.then(function(response) {
					if (System.prefs.verbose.requestTo) System.log('Sent GET request to ' + deviceName);
					if (method) method(response.body);
				});
		} else {
			requestify[method.toLowerCase()](deviceName, formData)
				.then(function(response) {
					if (System.prefs.verbose.requestTo) System.log('Sent ' + method + ' request to ' + deviceName);
					if (callback) callback(response.body);
				});
		}
	},
	speak: speak(),
	error: function(loggedMessage) {
		if (loggedMessage !== '' && loggedMessage) {
			System.log('\x1b[31m%s\x1b[0m', '\nERROR: ' + loggedMessage);
			if (System.prefs.spokenErrorMessage) System.speak(System.prefs.spokenErrorMessage);
		}
	},
	cmd: function(command, callback, options) {
		exec('cmd /c ' + command, function(error, stdout, stderr) {
			if (typeof callback == 'object' && options == undefined) {
				options = callback;
				callback = undefined;
			}

			if (stderr && !(options && options.suppressErrors)) System.error(stderr);
			if (callback) callback(stdout, stderr);
			if (stdout && !(options && options.noLog)) return console.log(stdout);

		});
	},
	PowerShell: function(command, callback, options) {
		try {
			command = replaceAll(command, '"', '\'');
			System.cmd('PowerShell.exe -command "& {' + command + '}";', (stdout, stderr) => {
				if (callback) callback(stdout, stderr);
			}, options);
		} catch (err) {
			System.error(err);
		}
	},
	notify: function(title, message) {
		if (title == undefined) System.error('Cannot send notification. No message was given');
		System.cmd('nircmd trayballoon "' + ((!message) ? '' : title) + '" "' + ((message) ? message : title) + '" "c:\\"');
	},
	//TODO: For confirm and alert, make them return promises instead to avoid callback hell
	confirm: function(title, message, callback) {
		System.PowerShell('$wshell = New-Object -ComObject Wscript.Shell;$wshell.Popup("' + (typeof message == 'function' || !message) ? title : message + '",0,"' + (typeof message == 'function' || !message) ? 'Node' : title + '",0x1)', function(stdout) {
			if (callback) callback((stdout.trim() == '1') ? true : false);
		}, { noLog: true });
	},
	alert: function(title, message, callback) {
		System.cmd('nircmd infobox "' + ((message) ? message : title) + '" "' + ((!message) ? 'Node' : message) + '"', () => {
			if (callback) callback();
		}, { noLog: true });
	},
	appManager: {
		registeredApps: {},
		register: function(obj) {
			let apps = [];
			let registrationComplete = false;

			Object.entries(obj).forEach(([appName, props]) => {
				if (appName == undefined) System.error('Name not defined for registered app. You need to define a name and path to the application.');
				else if (props.path == undefined && appName) System.error('Path not defined for registered app: ' + appName);

				props.id = Object.keys(System.appManager.registeredApps).length + 1;
				System.appManager.registeredApps[appName] = props;

				//Handle and parse app path
				let appPath = System.appManager.registeredApps[appName].path;
				if (!(appPath.slice(-1) == '"' && appPath.charAt(0) == '"')) appPath = '"' + appPath + '"';
				System.appManager.registeredApps[appName].path = appPath;

				//Handle and parse process name
				let processName = appPath.substr(appPath.lastIndexOf(`\\\\`));
				processName = replaceAll(processName, '\\\\', '');
				processName = replaceAll(processName, '"', '');
				System.appManager.registeredApps[appName].processName = processName;

				apps.push(replaceAll(processName, '.exe', ''));
			});

			System.appManager.appWatcher = function() {
				System.PowerShell('get-process "' + apps.join('", "') + '" | select ProcessName, MainWindowTitle', stdout => {
					for (var i = 0; i < apps.length; i++) {
						let appName = apps[i];
						if (stdout.includes(appName)) {
							System.appManager.registeredApps[appName].isRunning = true;
							setTimeout(() => {
								System.appManager.registeredApps[appName].wasRunning = true;
							}, (System.prefs.appManagerRefreshInterval ? System.prefs.appManagerRefreshInterval / 2 : 2500));
						} else {
							System.appManager.registeredApps[appName].isRunning = false;
							setTimeout(() => {
								System.appManager.registeredApps[appName].wasRunning = false;
							}, (System.prefs.appManagerRefreshInterval ? System.prefs.appManagerRefreshInterval / 2 : 2500));
						}

						if (!System.appManager.registeredApps[appName].isRunning && System.appManager.registeredApps[appName].wasRunning && System.appManager.registeredApps[appName].onKill) System.appManager.registeredApps[appName].onKill();
						if (!registrationComplete) registrationComplete = true;
						if (registrationComplete && System.appManager.registeredApps[appName].isRunning && !System.appManager.registeredApps[appName].wasRunning && System.appManager.registeredApps[appName].onLaunch) System.appManager.registeredApps[appName].onLaunch();

						windowTitle = stdout.substr(stdout.lastIndexOf('\n' + appName));
						windowTitle = windowTitle.substring(0, windowTitle.indexOf('\r'));
						windowTitle = replaceAll(windowTitle, appName, '').trim();
						if (windowTitle == '') windowTitle = null;
						System.appManager.registeredApps[appName].windowTitle = windowTitle;
					}
				}, { suppressErrors: true, noLog: true });

				setTimeout(() => {
					System.appManager.appWatcher();
				}, (System.prefs.appManagerRefreshInterval ? System.prefs.appManagerRefreshInterval : 5000));
			};
			System.appManager.appWatcher();

		},
		launch: function(appName) {
			if (System.appManager.registeredApps[appName].onLaunch) System.appManager.registeredApps[appName].onLaunch();
			else System.error('Unable to launch requested application. The requested app is either not registered or misspelled');
			System.cmd('nircmd execmd ' + System.appManager.registeredApps[appName].path);
		},
		kill: function(appName) {
			if (System.appManager.registeredApps[appName].onKill) System.appManager.registeredApps[appName].onKill();
			else System.error('Unable to kill requested application. The requested app is either not registered or misspelled');
			System.process.kill(System.appManager.registeredApps[appName].processName);
		},
		hide: function(appName) {
			System.cmd('nircmd win hide process "' + processName + '"');
		},
		switchTo: function(appName) {
			let windowTitle = System.appManager.registeredApps[appName].windowTitle;
			let processName = System.appManager.registeredApps[appName].processName;
			if (windowTitle !== undefined) {
				System.PowerShell('$myshell = New-Object -com "Wscript.Shell"; $myshell.AppActivate("' + windowTitle + '")', (stdout) => {
					if (stdout.includes('False')) {
						System.log('Using process name as fallback. This may not be as accurate');
						System.cmd('nircmd win activate process "' + processName + '"');
					}
				}, { noLog: true });
			} else {
				System.error('Could not find Window title "' + windowTitle + '" or process of requested app "' + appName + '". The app may not be running.');
			}
		}
	},
	process: {
		getPid: function(processName, callback) {
			System.PowerShell('get-process -ProcessName "' + replaceAll(processName, '.exe', '') + '" | Format-Table id', (stdout, stderr) => {
				stdout = replaceAll(stdout, 'Id', '');
				stdout = replaceAll(stdout, '--', '');
				stdout = replaceAll(stdout, '\r', '');
				stdout = stdout.trim();
				stdout = stdout.split('\n');
				stdout = stdout.filter(String);
				callback((!stdout.length ? false : stdout));
			}, { noLog: true, suppressErrors: true });
		},
		kill: function(processName) {
			if (processName != '' && processName != undefined && processName != null) System.cmd('taskkill /F /IM ' + processName);
		},
		onKill: function(appName, callback) {
			//App must already be running, if not, it will wait until it has started and then listen via powershell for an exit event
			System.PowerShell('Wait-Process -Name ' + appName, function(stdout, stderr) {
				if (stderr) {
					setTimeout(() => {
						System.process.onKill(appName, callback);
					}, 3000);
				}
				else {
					callback();
				}
			}, { noLog: true, suppressErrors: true });
		},
		onLaunch: function(appName, callback) {
			System.process.isRunning(appName, function(bool) {
				if (!bool) {
					setTimeout(() => {
						System.process.onLaunch(appName, callback);
					}, 3000);
				}
				else if (bool) callback();
			});
		},
		getWindowTitle: function(processName, callback) {
			System.PowerShell('get-process ' + replaceAll(processName, '.exe', '') + ' | select MainWindowTitle', function(stdout) {
				output = '' + stdout;
				output = replaceAll(output, 'MainWindowTitle', '');
				output = replaceAll(output, '---------------', '');
				output = output.trim();
				if (output == '') output = false;
				callback(output);
			}, { noLog: true, suppressErrors: true });
		},
		isRunning: function(processName, callback) {
			try {
				System.PowerShell('get-process ' + processName + ' | select ProcessName', (stdout) => {
					if (stdout.includes(processName)) callback(true);
					else callback(false);
				});
			} catch (error) {
				System.error(error);
				callback(false);
			}
		}
	},
	set: {
		volume: function(vol) {
			System.cmd('nircmd setsysvolume ' + Math.floor(vol * 665.35));
		},
		defaultSoundDevice: function(device) {
			System.cmd("nircmd setdefaultsounddevice \"" + device + "\"");
		},
		location: function(string) {
			System.log('Set location to ' + string);
			System.currentLocation = string;
		},
		preferences: function(object) {
			System.prefs = object;
		},
	},
	power: {
		shutdown: function(delay) {
			System.cmd('shutdown.exe /s /t ' + ((delay) ? delay : 0));
		},
		restart: function(delay) {
			System.cmd('shutdown.exe /r /t ' + ((delay) ? delay : 0));
		},
		lock: function(delay) {
			setTimeout(() => {
				System.cmd('rundll32.exe user32.dll,LockWorkStation');
			}, ((delay) ? delay : 0));
		},
		sleep: function(delay) {
			setTimeout(() => {
				System.cmd('nircmd standby');
			}, ((delay) ? delay : 0));
		},
		screenSaver: function(delay) {
			setTimeout(() => {
				System.cmd('nircmd screensaver');
			}, ((delay) ? delay : 0));
		}
	},
	window: {
		minimize: function(processName) {
			if (processName !== undefined) {
				if (!processName.includes('.exe')) processName = processName + '.exe';
				System.cmd('nircmd win min process ' + processName);
			} else {
				System.cmd('nircmd win min foreground');
			}
		},
		maximize: function(processName) {
			if (processName !== undefined) {
				if (!processName.includes('.exe')) processName = processName + '.exe';
				System.cmd('nircmd win max process ' + processName);
			} else {
				System.cmd('nircmd win max foreground');
			}
		},
		restore: function(processName) {
			if (processName !== undefined) {
				if (!processName.includes('.exe')) processName = processName + '.exe';
				System.cmd('nircmd win normal process ' + processName);
			} else {
				System.cmd('nircmd win normal foreground');
			}
		},
		resize: function(width, height, processName) {
			if (isNaN(height)) System.error('Cannot resize: Invalid or no height was specified');
			if (isNaN(height)) System.error('Cannot resize: Invalid or no width was specified');

			if (processName !== undefined && isNaN(height) === false && isNaN(width) === false) {
				if (!processName.includes('.exe')) processName = processName + '.exe';
				System.window.restore(processName);
				System.cmd('nircmd win setsize process ' + processName + ' x y ' + width + ' ' + height, { suppressErrors: true, noLog: true });
			} else {
				System.cmd('nircmd win setsize foreground x y ' + width + ' ' + height, { supressErrors: true, noLog: true });
			}
		},
		move: function(x, y, processName) {
			if (isNaN(x)) System.error('Cannot resize: Invalid or no height was specified');
			if (isNaN(y)) System.error('Cannot resize: Invalid or no width was specified');

			if (processName !== undefined && isNaN(x) === false && isNaN(y) === false) {
				if (!processName.includes('.exe')) processName = processName + '.exe';
				System.window.restore(processName);
				System.cmd('nircmd win move process ' + processName + ' ' + x + ' ' + y, { suppressErrors: true, noLog: true });
			} else {
				System.cmd('nircmd win setsize foreground x y ' + width + ' ' + height, { supressErrors: true, noLog: true });
			}
		}
	},
	interact: {
		showDesktop: function() {
			System.PowerShell('(New-Object -ComObject shell.application).toggleDesktop()');
		},
		pauseMedia: function() {
			robot.keyTap('audio_play');
			System.log('Media played/paused');
		},
		screenshot: function(region, path) {
			if (path == undefined) {
				path = '*clipboard*';
			} else path = '"' + path + '"';

			if (region == 'full') System.cmd('nircmd savescreenshotfull ' + path);
			else if (region == 'window') System.cmd('nircmd savescreenshotwin ' + path);
		},
		Cortana: {
			genericCommand: function(command) {
				robot.keyTap('command');
				setTimeout(() => {
					robot.typeString(command);
					setTimeout(() => { robot.keyTap('enter'); }, 500);
				}, 500);
			},
			openApp: function(appName) {
				robot.keyTap('command');
				setTimeout(() => {
					robot.typeString('Open ' + appName);
					robot.keyTap('enter');
				}, 500);
			},
			playSong: function(songName, service) {
				System.interact.Cortana('Play ' + songName + ' on ' + service);
				System.interact.minimizeWindow();
			},
			playPlaylist: function(playlist, service) {
				System.interact.Cortana.genericCommand('Play my ' + playlist + ' playlist on ' + service);
			},
			startListening: function() {
				robot.keyTap('C', 'command');
			}
		}
	}
}

module.exports = System;