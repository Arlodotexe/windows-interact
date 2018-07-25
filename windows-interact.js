const robot = require('robotjs');
const exec = require('child_process').exec;
const fs = require('fs');
const say = require('say');
const requestify = require('requestify');
let prefs = {};

const AudioDevicesCmdlets = {
	install: () => {
		// This allows for more detailed information and more advanced${str}ol over audio devices
		System.PowerShell(['New-Item "$($profile | split-path)\\Modules\\AudioDeviceCmdlets" -Type directory -Force', 'Copy-Item "' + __dirname + '\\AudioDevicesCmdlets.dll" "$($profile | split-path)\\Modules\\AudioDeviceCmdlets\\AudioDeviceCmdlets.dll'], { noLog: true });
		System.PowerShell(['Set-Location "$($profile | Split-Path)\\Modules\\AudioDeviceCmdlets"', 'Get-ChildItem | Unblock-File', 'Import-Module AudioDeviceCmdlets'], { noLog: true }, () => {
			System.log('AudioDevicesCmdlets should now be installed. Checking...');
			AudioDevicesCmdlets.checkInstall();
		});
	},
	checkInstall: () => {
		System.PowerShell('Get-AudioDevice -List', result => {
			if (result.includes('list')) {
				System.log('AudioDevicesCmdlets is installed');
			} else {
				System.error('The AudioDevicesCmdlet is not installed correctly');
			}
		}, { noLog: true });
	}
}

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
	function now(param, options) {
		let dateString = '';
		if (System.prefs.log && System.prefs.log.showTime) {
			dateString = new Date().toLocaleTimeString().toString() + ': ';
		}
		if (options && options.showTime == false) {
			dateString = '';
		}
		if (System.prefs.log && System.prefs.log.outputFile) fs.createWriteStream(System.prefs.log.outputFile, { flags: 'a' }).write(dateString + param + '\n');
		console.log(dateString + param);
	}
	let fn = function(message, options) {
		let colour = '';
		if (options && (options.colour || options.color)) {
			colour = options.colour.toLowerCase() || options.color.toLowerCase();
			switch (colour) {
				case 'red':
					colour = '\x1b[31m';
					break;
				case 'green':
					colour = '\x1b[32m';
					break;
				case 'yellow':
					colour = '\x1b[33m';
					break;
				case 'blue':
					colour = '\x1b[34m';
				case 'magenta':
					colour = '\x1b[35m';
					break;
				case 'cyan':
					colour = '\x1b[36m';
					break;
				case 'white':
					colour = '\x1b[37m';
					break;
				case 'black':
					colour = '\x1b[30m';
					break;
				default:
					System.error('Log: Could not find the colour ' + colour + '. See documentation for a complete list of colours');
			}
		}
		if (options && (options.background || options.backgroundColor)) {
			let background = options.background.toLowerCase() || options.backgroundColor.toLowerCase();
			switch (background) {
				case 'red':
					background = '\x1b[41m';
					break;
				case 'green':
					background = '\x1b[42m';
					break;
				case 'yellow':
					background = '\x1b[43m';
					break;
				case 'blue':
					background = '\x1b[44m';
				case 'magenta':
					background = '\x1b[45m';
					break;
				case 'cyan':
					background = '\x1b[46m';
					break;
				case 'white':
					background = '\x1b[47m';
					break;
				case 'black':
					background = '\x1b[40m';
					break;
				default:
					System.error('Log: Could not find the background colour ' + background + '. See documentation for a complete list of background colours');
			}
			colour = colour + background;
		}
		if (!options) {
			now(message, options);
		} else {
			colour = colour + message + '\x1b[0m';
			now(colour, options);
		}
	};
	fn.speak = function(phrase, voice, speed, options) {
		System.speak(phrase, voice, speed);
		System.log('(Spoken): ' + phrase, options);
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
	error: function(loggedMessage, options) {
		if (loggedMessage !== '' && loggedMessage) {
			let dateString = '';
			if (System.prefs.log && System.prefs.log.showTime) {
				dateString = new Date().toLocaleTimeString() + ': ';
			}
			if (options && options.showTime == false) {
				dateString = '';
			}
			if (System.prefs.log && System.prefs.log.spokenErrorMessage && !(options && options.silent)) System.speak(System.prefs.log.spokenErrorMessage);
			try { throw new Error(loggedMessage); }
			catch (error) {
				System.log(error.stack, { colour: 'red', background: 'black' });
			}
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
		if (typeof callback == 'object' && options == undefined) {
			options = callback;
			callback = undefined;
		}
		try {
			let self = {}, results = [];
			const spawn = require("child_process").spawn;
			const child = spawn("powershell.exe", ["-Command", "-"]);

			if (typeof command == 'string') command = [command];

			child.stdout.on("data", data => {
				self.out.push(data.toString());
				if (data.toString().trim() !== '' && !(options && options.noLog)) System.log(data.toString());
			});
			child.stderr.on("data", data => {
				self.err.push(data.toString());
				if (data.toString().trim() !== '' && !(options && options.suppressErrors)) System.error(data.toString());
			});

			child.on('exit', () => {
				if (callback && command.length > 1) callback(results);
				else if (callback) callback(results[0].output.toString(), results[0].errors.toString());
			});

			command.forEach(cmd => {
				self.out = [];
				self.err = [];
				child.stdin.write(`${cmd}\n`);
				results.push({ command: cmd, output: self.out, errors: self.err });

				if (results.length == command.length) {
					child.stdin.end();
				}
			});
		} catch (err) {
			System.error(err);
		}
	},
	notify: function(title, message) {
		if (title == undefined) System.error('Cannot send notification. No message was given');
		System.cmd(__dirname + '\\nircmd.exe trayballoon "' + ((!message) ? '' : title) + '" "' + ((message) ? message : title) + '" "c:\\"');
	},
	confirm: function(message, title) {
		return new Promise(resolve => {
			System.PowerShell('$wshell = New-Object -ComObject Wscript.Shell;$wshell.Popup("' + (message) + '",0,"' + ((!title) ? 'Node' : title) + '",0x1)', function(stdout) {
				resolve((stdout.trim() == '1') ? true : false);
			}, { noLog: true });
		});

	},
	alert: function(message, title) {
		return new Promise(resolve => {
			if (message && message.trim() !== '') {
				System.cmd(__dirname + '\\nircmd.exe infobox "' + (message) + '" "' + ((!title) ? 'Node' : title) + '"', () => {
					resolve();
				}, { noLog: true });
			}
		});
	},
	prompt: function(message, title, placeholder) {
		return new Promise(resolve => {
			System.PowerShell(`Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.Interaction]::InputBox('` + message + `' , '` + ((title) ? title : `Node`) + `' , '` + ((placeholder) ? placeholder : ``) + `')`, (response) => {
				resolve(response)
			}, { noLog: true });
		});
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
				}, { noLog: true, suppressErrors: true });

				setTimeout(() => {
					System.appManager.appWatcher();
				}, (System.prefs.appManagerRefreshInterval ? System.prefs.appManagerRefreshInterval : 3000));


			};
			System.appManager.appWatcher();

		},
		launch: function(appName) {
			if (!System.appManager.registeredApps[appName]) {
				System.error('Unable to launch requested application. The requested app is either not registered or misspelled');
			} else {
				System.cmd(__dirname + '\\nircmd.exe execmd ' + System.appManager.registeredApps[appName].path);
				if (System.appManager.registeredApps[appName].onLaunch) System.appManager.registeredApps[appName].onLaunch();
			}
		},
		kill: function(appName) {
			if (!System.appManager.registeredApps[appName]) {
				System.error('Unable to kill requested application. The requested app is either not registered or misspelled');
			} else {
				System.process.kill(System.appManager.registeredApps[appName].processName);
				if (System.appManager.registeredApps[appName].onKill) System.appManager.registeredApps[appName].onKill();
			}
		},
		hide: function(processName) {
			System.cmd(__dirname + '\\nircmd.exe win hide process "' + processName + '"');
		},
		switchTo: function(appName) {
			let windowTitle = System.appManager.registeredApps[appName].windowTitle;
			let processName = System.appManager.registeredApps[appName].processName;
			if (windowTitle !== undefined) {
				System.PowerShell('$myshell = New-Object -com "Wscript.Shell"; $myshell.AppActivate("' + windowTitle + '")', (stdout) => {
					if (stdout.includes('False')) {
						System.log('Using process name as fallback. This may not be as accurate');
						System.cmd(__dirname + '\\nircmd.exe win activate process "' + processName + '"');
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
			if (processName != '' && processName != undefined && processName != null) System.cmd('taskkill /F /IM "' + processName + '"');
		},
		onKill: function(appName, callback) {
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
		getWindowTitle: function(processName, callback) {
			System.PowerShell('get-process "' + replaceAll(processName, '.exe', '') + '" | select MainWindowTitle', function(stdout) {
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
				System.PowerShell('get-process "' + processName + '" | select ProcessName', (stdout) => {
					if (stdout.includes(processName)) callback(true);
					else callback(false);
				});
			} catch (error) {
				System.error(error);
				callback(false);
			}
		}
	},
	get: {
		audioDevices: {
			output: {
				default: function(callback) {
					System.PowerShell('Get-AudioDevice -Playback', (result) => {
						result = result.substring(result.indexOf('Name'), result.lastIndexOf('ID') - 1);
						result = result.substring(result.indexOf(':') + 2, result.indexOf('(') - 1);
						if (typeof callback == 'function') callback(result);
					}, { noLog: true });
				},
				volume: function(callback) {
					System.PowerShell('Get-AudioDevice -PlaybackVolume', result => {
						callback(result.trim());
					}, {noLog: true});
				},
				muteState: callback => {
					System.PowerShell('Get-AudioDevice -PlaybackMute', result => {
						callback(result.toLowerCase() == 'true');
					}, {noLog: true});
				}
			},
			input: {
				default: function(callback) {
					System.PowerShell('Get-AudioDevice -Recording', (result) => {
						result = result.substring(result.indexOf('Name'), result.lastIndexOf('ID') - 1);
						result = result.substring(result.indexOf(':') + 2, result.indexOf('(') - 1);
						if (typeof callback == 'function') callback(result);
					}, { noLog: true });
				},
				volume: function(callback) {
					System.PowerShell('Get-AudioDevice -RecordingVolume', result => {
						callback(result.trim());
					}, {noLog: true});
				},
				muteState: callback => {
					System.PowerShell('Get-AudioDevice -RecordingMute', result => {
						callback(result.toLowerCase() == 'true');
					}, {noLog: true});
				}
			}
		}
	},
	set: {
		audioDevices: {
			output: {
				volume: function(vol) {
					System.cmd(__dirname + '\\nircmd.exe setsysvolume ' + Math.floor(vol * 665.35));
				},
				default: function(device) {
					System.cmd(__dirname + '\\nircmd.exe setdefaultsounddevice "' + device + '"');
				}
			},
			input: {
				volume: function(vol) {
					System.PowerShell('Set-AudioDevice -RecordingVolume ' + vol);
				},
				default: function(vol) {
					System.PowerShell('Set-AudioDevice ')
				}
			}
		},
		preferences: function(object) {
			for (let property in object) {
				if (object.hasOwnProperty(property)) {
					System.prefs[property] = object[property];
				}
			}
			if (object.experimentalAudioControl) {
				AudioDevicesCmdlets.install();
			}
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
				System.cmd(__dirname + '\\nircmd.exe standby');
			}, ((delay) ? delay : 0));
		},
		screenSaver: function(delay) {
			setTimeout(() => {
				System.cmd(__dirname + '\\nircmd.exe screensaver');
			}, ((delay) ? delay : 0));
		}
	},
	window: {
		minimize: function(processName) {
			if (processName !== undefined) {
				if (!processName.includes('.exe')) processName = processName + '.exe';
				System.cmd(__dirname + '\\nircmd.exe win min process "' + processName + '"');
			} else {
				System.cmd(__dirname + '\\nircmd.exe win min foreground');
			}
		},
		maximize: function(processName) {
			if (processName !== undefined) {
				if (!processName.includes('.exe')) processName = processName + '.exe';
				System.cmd(__dirname + '\\nircmd.exe win max process "' + processName + '"');
			} else {
				System.cmd(__dirname + '\\nircmd.exe win max foreground');
			}
		},
		restore: function(processName) {
			if (processName !== undefined) {
				if (!processName.includes('.exe')) processName = processName + '.exe';
				System.cmd(__dirname + '\\nircmd.exe win normal process "' + processName + '"');
			} else {
				System.cmd(__dirname + '\\nircmd.exe win normal foreground');
			}
		},
		resize: function(width, height, processName) {
			if (isNaN(height)) System.error('Cannot resize: Invalid or no height was specified');
			if (isNaN(height)) System.error('Cannot resize: Invalid or no width was specified');

			if (processName !== undefined && isNaN(height) === false && isNaN(width) === false) {
				if (!processName.includes('.exe')) processName = processName + '.exe';
				System.window.restore(processName);
				System.cmd(__dirname + '\\nircmd.exe win setsize process "' + processName + '" x y ' + width + ' ' + height, { suppressErrors: true, noLog: true });
			} else {
				System.cmd(__dirname + '\\nircmd.exe win setsize foreground x y ' + width + ' ' + height, { supressErrors: true, noLog: true });
			}
		},
		move: function(x, y, processName) {
			if (isNaN(x)) System.error('Cannot resize: Invalid or no height was specified');
			if (isNaN(y)) System.error('Cannot resize: Invalid or no width was specified');

			if (processName !== undefined && isNaN(x) === false && isNaN(y) === false) {
				if (!processName.includes('.exe')) processName = processName + '.exe';
				System.window.restore(processName);
				System.cmd(__dirname + '\\nircmd.exe win move process "' + processName + '" ' + x + ' ' + y, { suppressErrors: true, noLog: true });
			} else {
				System.cmd(__dirname + '\\nircmd.exe win setsize foreground x y ' + width + ' ' + height, { supressErrors: true, noLog: true });
			}
		}
	},
	showDesktop: function() {
		System.PowerShell('(New-Object -ComObject shell.application).toggleDesktop()');
	},
	screenshot: function(region, path) {
		if (path == undefined) {
			path = '*clipboard*';
		} else path = '"' + path + '"';

		if (region == 'full') System.cmd(__dirname + '\\nircmd.exe savescreenshotfull ' + path);
		else if (region == 'window') System.cmd(__dirname + '\\nircmd.exe savescreenshotwin ' + path);
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
			System.Cortana('Play ' + songName + ' on ' + service);
		},
		playPlaylist: function(playlist, service) {
			System.Cortana.genericCommand('Play my ' + playlist + ' playlist on ' + service);
		},
		startListening: function() {
			robot.keyTap('C', 'command');
		}
	},
	pauseMedia: function() {
		robot.keyTap('audio_play');
		System.log('Media played/paused');
	}
}

module.exports = System;