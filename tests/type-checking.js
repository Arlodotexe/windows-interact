const exec = require('child_process').exec;
const fs = require('fs');

let prefs = {};

function speak() {
    let fn = function(phrase, TTSVoice, speed, callback) {
        if (arguments.length < 1) throw new Error('At least 1 argument must be supplied')
        if (phrase && typeof phrase !== 'string') throw new Error('Spoken phrase must be a string');
        if (TTSVoice && typeof TTSVoice !== 'string') throw new Error('Text to speech voice must be a string');
        if (speed && isNaN(speed)) throw new Error('TTS speech rate must be an integer');
        if (callback && typeof callback !== 'function') throw new Error('Callback is not a function');
    };
    fn.now = function(phrase, TTSVoice) {
        if (arguments.length < 1) throw new Error('At least 1 argument must be supplied')
        if (phrase && typeof phrase !== 'string') throw new Error('Spoken phrase must be a string');
    };
    fn.stop = function(callback) {
        if (typeof callback !== 'function') throw new Error('Callback is not a function')
    };
    fn.log = function(phrase, voice, speed) {
        if (arguments.length < 1) throw new Error('At least 1 argument must be supplied')
        if (phrase && typeof phrase !== 'string') throw new Error('Spoken/Logged phrase must be a string');
        if (voice && typeof voice !== 'string') throw new Error('Text to speech voice must be a string');
        if (speed && isNaN(speed)) throw new Error('TTS speech rate must be an integer');
    };
    return fn;
}

function log() {
    let fn = function(message, colours) {
        if (arguments.length < 1) throw new Error('At least 1 argument must be supplied')
        if (message && typeof message !== 'string') throw new Error('Logged message must be a string');
        if (colours !== undefined) {
            if (typeof colours !== 'object') throw new Error('Second argument must be an object containing log colours');
            if (typeof colours.colour !== 'string') throw new Error('Object.colour must be a string');
            if (typeof colours.background !== 'string') throw new Error('Object.background must be a string');
            for (var i in Object.keys(colours)) {
                if (Object.keys(colours)[i] !== 'colour' || 'background') throw new Error('Invalid option: ' + Object.keys(colours)[i]);
            }
        }
    };
    fn.speak = function(phrase, voice, speed, options) {
        typeChecking.speak(phrase, voice, speed);
        typeChecking.log(phrase, options);
    };
    return fn;
}

const authCode = {
    isValid: function(code) {
        if (arguments.length < 1) throw new Error('At least 1 argument must be supplied')
        if (code && typeof code !== 'string') throw new Error('authCode is not a string');
    }
};

const typeChecking = {
    prefs: prefs,
    authCode: authCode,
    path: function(pathUrl) {
        if (typeof pathUrl !== 'string') throw new Error('Path must be a string');
    },
    log: log(),
    requestTo: function(deviceName, method, formData, callback) {
        /* Type checking is not needed, this function has dynamic parameters */
    },
    speak: speak(),
    error: function(loggedMessage, options) {
        if (arguments.length < 1) throw new Error('At least 1 argument must be supplied')
        if (options) {
            if (typeof options !== 'object') throw new Error('Second parameter should be object');
            if (typeof options.silent !== 'boolean') throw new Error('Object.silent should be boolean');
        }
    },
    cmd: function(command, callback, options) {
        if (arguments.length < 1) throw new Error('At least 1 argument must be supplied')
        if (command && typeof command != 'string') throw new Error('First argument should be a string ')
    },
    PowerShell: function(command, callback, options) {

    },
    notify: function(title, message) {

    },
    confirm: function(title, message) {

    },
    alert: function(title, message) {

    },
    appManager: {
        registeredApps: {},
        register: function(obj) {
            
        },
        launch: function(appName) {

        },
        kill: function(appName) {

        },
        hide: function(appName) {

        },
        switchTo: function(appName) {

        }
    },
    process: {
        getPid: function(processName, callback) {

        },
        kill: function(processName) {

        },
        onKill: function(appName, callback) {

        },
        getWindowTitle: function(processName, callback) {

        },
        isRunning: function(processName, callback) {

        }
    },
    set: {
        volume: function(vol) {

        },
        defaultSoundDevice: function(device) {

        },
        location: function(string) {

        },
        preferences: function(object) {

        },
    },
    power: {
        shutdown: function(delay) {

        },
        restart: function(delay) {

        },
        lock: function(delay) {

        },
        sleep: function(delay) {

        },
        screenSaver: function(delay) {

        }
    },
    window: {
        minimize: function(processName) {

        },
        maximize: function(processName) {

        },
        restore: function(processName) {

        },
        resize: function(width, height, processName) {

        },
        move: function(x, y, processName) {

        }
    },
    showDesktop: function() {

    },
    screenshot: function(region, path) {

    },
    Cortana: {
        genericCommand: function(command) {

        },
        openApp: function(appName) {

        },
        playSong: function(songName, service) {

        },
        playPlaylist: function(playlist, service) {

        },
        startListening: function() {

        }
    },
    pauseMedia: function() {

    }
}

module.exports = typeChecking;