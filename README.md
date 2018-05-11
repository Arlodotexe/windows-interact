# windows-interact
This library is a collection of tools for interacting with and automating Windows. It is designed to simplify and enhance existing tools while providing access to powerful new features. 

This started out as a personal project to help automate some IoT stuff and automate Windows, and as such there may be some functionality that would only make sense in such a use case (such as `System.error`'s `receivingDevice` parameter). I plan on leaving this type of functionality unless enough people ask otherwise.

## NOTICE
---

This is incomplete documentation. I originally intended for this module to remain private and for personal use. I changed my mind, and since I worked on it for two months, I have 2 months worth of code to document. 

# Installation 
--- 
Windows-interact (Subject to name change) is yet available on any package manager. For now, you can install by cloning the repository into your `node_modules` folder and requiring it like so:

`const System = require('./node_modules/windows-interact/windows-interact.js');`

Windows-Interact also relies moderately on [nircmd](http://nircmd.nirsoft.net/), so if you start having troubles, try installing it to your machine. 

# Documentation
---

### `System.set.preferences`

Set Global user preferences for Windows Interact

```javascript
System.set.preferences({ 
	masterKey: 'MASTERKEY', // Set master key (For System.authCode)
	logOutputFile: System.path`C:\Users\User\node-server\log.txt`, // File to save log and error history (For System.log)
	showTimeInLog: true, // Show or hide timestamp in log (For System.log & System.error)
	defaultTTSVoice: 'Microsoft David Desktop', // Default text to speech voice to use (For System.speak)
    defaultSpokenErrorMessage: 'Something is wrong with your node server. Details are in the log', // Default message to speak when an error occurs (For System.error)
    appManagerRefreshInterval: 2500, // Inverval at which the app manager gets the status of registered apps. Leaving unset defaults the interval to 5000
	httpUrls: { // Store URLs for quick access when using System.requestTo
		thisMachine: 'http://127.0.0.1:80/',
		thermostat: 'http://localhost:8084/'
	}
});
```

### `System.log()`
--- 
`System.log` is a powerful alternative to `console.log`. It will push the output of the log to the console and record each entry in a .txt file.

You can set the default log file location with `System.set.preferences`, like so:

```javascript
System.set.preferences({
	logOutputFile: System.path`C:\Users\User\node-server\log.txt`
});
```

Usage:
```javascript
// Log information to the console and .txt file
System.log('Logged information');

// Log information to the console and .txt file, and also System.speak() it
System.log.speak('Testing');
```


### `System.error()`
---
`System.error` is a powerful alternative to `console.error`. It will push the output of the log to the console (in red!) and record each entry in a .txt file.

`System.error` can also be used to log errors from other devices. The second parameter will prepend `ERROR @ {device name}` to the log file.

You can set the default log file location with `System.set.preferences`, like so:

```javascript
System.set.preferences({
	logOutputFile: System.path`C:\Users\User\node-server\log.txt`
});
```

Usage:
```javascript
// Log an error to the console and default .txt file (if set)
System.error('Logged information');

// Log an error to the console and default .txt file (if set), but prepend 2nd parameter as ERROR @ {deviceName}
System.error('Error changing temp', 'Thermostat'); // Output: ERROR @ Thermostat: Error changing temp
```

#### `System.speak()`
---
Speak text asynchronously. Similar to my [async-sayjs](https://github.com/Arlodotexe/async-sayjs) package (Yep, that started here), but with some benefits and enhanments.

```javascript
// Speak something asynchronously (wait for each request to finish before moving on)
System.speak('The quick brown fox');

// Speak something synchronously (Say it right now, even if something is already being said)
System.speak.now('Jumped over the lazy dog');

// Supply a string as the second parameter to change the TTS voice
System.speak('As it ran through the woods', 'Microsoft David Desktop');

// Speak something, but slowly
System.speak('Lorem ipsum dolor sit amet', 'Microsoft Zira Desktop', 0.5);

// Speak something, then fire a callback
System.speak('Lorem ipsum dolor sit amet', 'Microsoft David Desktop', 0.5, (err) => {
    console.log('Done');
});

// Speak something and System.log() it (Same as System.log.speak(''))
System.speak.log('Lorem ipsum dolor sit amet');

// Stop anything currently being spoken (Queued text will continue after that)
System.speak.stop(callback);
```

---

## `System.appManager`
---

The App Manager is possibly the biggest part of Windows Interact. It allows you to:

- Register applications and manage them in one simple place
- Run code when a registered app is launched or killed
- Quickly launch or kill an app
- Get the title of an app window
- Check if an app is currently running
- Hide an app
- Switch to an app

To get started, you need to register your apps. You will need the absolute path of the executable at the minimum. To properly format a system path on Windows, it is recommended that you use ```System.path`C:\absolute\path` ```

NOTICE: The registered name must be the same as the executable.

### Register a new application

```javascript
System.appManager.register({
    'notepad': {
        path: System.path`C:\WINDOWS\system32\notepad.exe`
    },
    'Code': {
       path: System.path`C:\Program Files\Microsoft VS Code\Code.exe`,
       onLaunch: function() {
           System.speak('VSCode was launched');
       },
       onKill: function() {
           System.speak('VSCode was killed');
       }
    },
    'firefox': {
        path: System.path`C:\Program Files\Mozilla Firefox\firefox.exe`,
        onKill: function() {
            System.log('firefox killed');
        },
        onLaunch: function() {
            System.log('firefox launch');
        }
    }
});
```

### Retrieve registered applications

```javascript
System.appManager.registeredApplications
```

### Launch a registered application

```javascript
System.appManager.launch('notepad');
```

### Kill a registered application

```javascript
System.appManager.kill('notepad');
```

### Hide a registered application

```javascript
System.appManager.hide('notepad');
```

### Switch to a registered application

```javascript
System.appManager.switchTo('notepad');
```


## `System.process`
---

`System.process` is very similar to `appManager`, but can be used for unregistered apps. Use sparcely and avoid loops, this is not as efficient as `appManager`.


### Get PID of a running process

Returns an array of PIDs associated with a running process. If no process is found, false is returned. The data is piped into a callback.

```javascript
System.process.getPid('notepad', function(output) {
    System.log(output);
});
```

### Kill a running app

```javascript
System.process.kill('notepad', callback);
```

### Run a callback when a process is killed
App must already be running, if not, it will wait until it has started and then tell powershell to wait until the app is done before continuing.

```javascript
System.process.onKill('notepad', function() {
    System.log('Notepad killed');
});
```

### Run a callback when a process is spawned

Honestly this probably doesn't even work. This is on the todo list to fix, so just don't use it.

```javascript
System.process.onLaunch('notepad', function() {
    System.log('notepad launched');
});
```

### Get Window Title of running application

```javascript
System.process.getWindowTitle('notepad', function(output) {
    System.log(output);
});
```

### Check if a process is running

```javascript
    System.process.isRunning('notepad', function(bool) {
        System.log(bool);
    });
```


## More to come very very soon.