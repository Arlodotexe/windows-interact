# windows-interact

This library is a collection of tools for interacting with and automating Windows. It is designed to simplify and enhance existing tools while providing access to powerful new features.

With `windows-interact`, NodeJS gains the following functionality:

- [Control over audio devices](https://github.com/Arlodotexe/windows-interact#set-the-volume-of-the-current-audio-device)
- [Shutdown, Restart, Lock, Sleep, or start Screen Saver](https://github.com/Arlodotexe/windows-interact#winpower)
- [Send Toast notifications or Tray Balloons](https://github.com/Arlodotexe/windows-interact#winnotify)
- [Take screenshots](https://github.com/Arlodotexe/windows-interact#take-a-screenshot)
- [Asynchronous Text to speech](https://github.com/Arlodotexe/windows-interact#winspeak)
- [Manipulate windows](https://github.com/Arlodotexe/windows-interact#winwindow) (Maximize, Minimize, etc.)
- [Manage a list of registered apps](https://github.com/Arlodotexe/windows-interact#winappmanager) (with lots of extra features)
- [Manage processes](https://github.com/Arlodotexe/windows-interact#winprocess)
- Mixin replacements for the browser's [alert()](https://github.com/Arlodotexe/windows-interact#winconfirm), [confirm()](https://github.com/Arlodotexe/windows-interact#winconfirm), and [prompt()](https://github.com/Arlodotexe/windows-interact#winconfirm)
- Enhance [console.log](https://github.com/Arlodotexe/windows-interact#winlog) and [Error throwing](https://github.com/Arlodotexe/windows-interact#winerror)
- Different functions for running [PowerShell](https://github.com/Arlodotexe/windows-interact#winpowershell) or [CMD](https://github.com/Arlodotexe/windows-interact#wincmd) commands
---
New in this version (1.1.7): 
 - Added support for the native Windows File Picker
 - Added method for playing audio files
 - Added Win.prompt as a replacement for the browser's `prompt()`
 - An upgrade for managing and getting info about Audio Devices:
    - Retrieve information about audio devices 
    - Check/Set volume levels
    - Check/Set mute status
    - Check/Set default device
    - All of the above are available for input AND output devices!

 What's changed:
 - Dependency on robot.js has been removed. Huzzah!
 - Removed `Win.Cortana()`. This hasn't been working on slower machines (my bad) and would require a massive amount of work to do properly. Likely to return in a future update.
 - `Win.pauseMedia()` is now `Win.toggleMediaPlayback()`
 - Complete rewrite of Win.PowerShell. There was a lot of issue with the previous implementation when it came to string parsing. Not only is it fixed now, but you can also run multiple commands in the same powershell process before closing it by passing in an array.

Completely open to new features. Submit an issue labeled "Feature request" or contact me on twitter @[Arlodottxt](https://twitter.com/Arlodottxt) with your input.

---

# Installation

---

Install the [npm](https://www.npmjs.com/package/windows-interact) package by running `npm install windows-interact` in your project folder

Then, in your js file, `require` the package.
```javascript 
const Win = require('windows-interact');
```

Windows-Interact also relies moderately on [nircmd](http://nircmd.nirsoft.net/). This is included in the package but untested on another machine, so if you start having troubles, try installing it to your machine. 

# Documentation
---
## `Win.set`
---
Used to set various things within Windows, as well as set preferences for windows-interact

#### Set Global user preferences for Windows Interact
---

```javascript
Win.set.preferences({ 
    // Set master key (For Win.authCode)
    masterKey: 'MASTERKEY',
    authCodeParse: function(receivedCode) {
    // Should return true or false if the receivedCode meets your criteria
        if (receivedCode > 5) {
            Win.alert('Correct code: ' + receivedCode)
            return true;
        }
        else {
            Win.alert('Incorrect code: ' + receivedCode)
            return false;
        }
    },
    // Default text to speech voice to use (For Win.speak)
    TTSVoice: 'Microsoft David Desktop',
    // Inverval at which the app manager gets the status of registered apps. Leaving unset defaults the interval to 5000
    appManagerRefreshInterval: 2500,
    // Log options
    log: {
        // File to save log and error history
        outputFile: Win.path`C:\Users\User\node-server\log.txt`,
        // Show or hide timestamp in log (For Win.log & Win.error)
        showTime: true,
        // Default message to speak when an error occurs (For Win.error)
        spokenErrorMessage: 'Something is wrong with your node server. Details are in the log', 
        // Control verbosity of parts of windows-interact
        verbose: {
            // Show preformatted log when requests are made
            requestTo: true
        }
    }
    // Store URLs for quick access when using Win.requestTo
    httpUrls: { 
        thisMachine: 'http://127.0.0.1:80/',
        thermostat: 'http://localhost:8084/'
    }
});
```

#### Set the volume of the current audio device
---
This 99% accurate due to the math required behind the scenes
```javascript
Win.set.volume('50');
```

#### Set the default playback device in Windows
---

```javascript
Win.set.defaultSoundDevice('Headset Earphone');
```

### `Win.log()`
---
An alternative to `console.log`. It will push the output of the log to the console and record each entry in a .txt file, and provide styling options for the text

Available colours for background and text are:

- Red
- Green
- Yellow
- Blue
- Magenta
- Cyan
- Black

You can set the default log file location with `Win.set.preferences`, like so:

```javascript
Win.set.preferences({
    log: {
        // File to save log and error history (For Win.log)
        outputFile: Win.path`C:\Users\User\node-server\log.txt`,
        // Show or hide timestamp in log (For Win.log & Win.error)
        showTime: true,
        // Control verbosity of parts of windows-interact
        verbose: {
            // Show preformatted log when requests are made
            requestTo: true
        }
    }
});
```

Usage:
```javascript
Win.log(message, {backgroundColor: 'color', color: 'color'});

// Log information to the console and .txt file
Win.log('Logged information');

// Log information to the console and .txt file, with colored background and text
Win.log('Logged information', {background: 'color', color: 'color'})

Win.log.speak(phrase, voice, speed, options);
// Log information to the console and .txt file, and also Win.speak() it
Win.log.speak('Testing'); 

// Log information to the console and .txt file, Win.speak() it with a specific voice, at half speed, with a black background and a blue text colour
Win.log.speak('Testing', 'Microsoft David Desktop', 0.5, {backgroundColor: 'black', colour: 'blue'})
```


### `Win.error()`
---
An alternative to `throw new Error()` or `console.error`. It will push the output of the log to the console (in a red colour) with a stack trace, and record each entry in the specified log file

You can set some default options with `Win.set.preferences`, like so:

```javascript
Win.set.preferences({
    log: {
        // Default message to speak when an error occurs
        spokenErrorMessage: 'Something is wrong with your node server. Details are in the log', 
        // File to save log and error history (For Win.log)
        outputFile: Win.path`C:\Users\User\node-server\log.txt`,
        // Show or hide timestamp in log (For Win.log & Win.error)
        showTime: true
    }
});
```

Usage:
```javascript
// Log an error to the console and default .txt file (if set)
Win.error('Error information');

// Log an error to the console, but don't speak the set spokenErrorMessage
Win.error('Error information', {silent: true});
```

### `Win.notify()`
---

Show a toast notification in Windows 10 (Or tray balloon on older versions of windows)

If you need something more advanced than basic notifications, I'd recommend using [node-notifier](https://github.com/mikaelbr/node-notifier)

```javascript
// Show toast notification
Win.notify('Title', 'Message');

// Show single line toast notification
Win.notify('Message'); 
```

### `Win.path`` `
---
Return a properly formatted Windows path for use in Javascript. This allows you to simply copy and paste a path from the File Explorer without having to worry about character-escaping (`\`) slashes

```javascript
Win.path`C:\WINDOWS\system32\notepad.exe`;
```

### `Win.speak()`
---
Speak text asynchronously. Similar to my [async-sayjs](https://github.com/Arlodotexe/async-sayjs) package (Yep, that started here), but with some benefits and enhancments.

You can set the default text to speech voice with `Win.set.preferences`, like so:

```javascript
Win.set.preferences({
	TTSVoice: 'Microsoft Eva Mobile'
});
```

Usage:
```javascript
// Speak something asynchronously (wait for each request to finish before moving on)
Win.speak('The quick brown fox');

// Speak something synchronously (Say it right now, even if something is already being said)
Win.speak.now('Jumped over the lazy dog');

// Supply a string as the second parameter to change the TTS voice
Win.speak('As it ran through the woods', 'Microsoft David Desktop');

// Speak something, but slowly
Win.speak('Lorem ipsum dolor sit amet', 'Microsoft Zira Desktop', 0.5);

// Speak something, then fire a callback
Win.speak('Lorem ipsum dolor sit amet', 'Microsoft David Desktop', 0.5, (err) => {
    console.log('Done');
});

// Speak something and Win.log() it (Same as Win.log.speak(''))
Win.speak.log('Lorem ipsum dolor sit amet');

// Stop anything currently being spoken (Queued text will continue after that)
Win.speak.stop(callback);
```

---

## `Win.appManager`
---

The App Manager is possibly the biggest part of Windows Interact. It allows you to:

- Register applications and manage them in one simple place
- Run code when a registered app is launched or killed
- Quickly launch or kill an app
- Get the title of an app window
- Check if an app is currently running
- Hide an app
- Switch to an app

To get started, you need to register your apps. You will need the absolute path of the executable at the minimum. To easily format a Windows path for use in Javascript, it is recommended that you use ```Win.path`C:\absolute\path` ```

NOTICE: The registered name must be the same as the executable.

#### Register a new application

```javascript
Win.appManager.register({
    'notepad': {
        path: Win.path`C:\WINDOWS\system32\notepad.exe`
    },
    'Code': {
       path: Win.path`C:\Program Files\Microsoft VS Code\Code.exe`,
       onLaunch: function() {
           Win.speak('VSCode was launched');
       },
       onKill: function() {
           Win.speak('VSCode was killed');
       }
    },
    'firefox': {
        path: Win.path`C:\Program Files\Mozilla Firefox\firefox.exe`,
        onKill: function() {
            Win.log('firefox killed');
        },
        onLaunch: function() {
            Win.log('firefox launch');
        }
    }
});
```

#### Retrieve registered applications

```javascript
Win.appManager.registeredApplications
```

#### Launch a registered application

```javascript
Win.appManager.launch('notepad');
```

#### Kill a registered application

```javascript
Win.appManager.kill('notepad');
```

#### Hide a registered application

```javascript
Win.appManager.hide('notepad');
```

#### Switch to a registered application

```javascript
Win.appManager.switchTo('notepad');
```


## `Win.process`
---

`Win.process` is very similar to `appManager`, but can be used for unregistered apps. Use sparcely and avoid loops, this is not as efficient as `appManager`.


#### Get PID of a running process

Returns an array of PIDs associated with a running process. If no process is found, false is returned. The data is piped into a callback.

```javascript
Win.process.getPid('notepad', function(output) {
    Win.log(output);
});
```

#### Kill a running app

```javascript
Win.process.kill('notepad', callback);
```

#### Run a callback when a process is killed
App must already be running, if not, it will wait until it has started and then tell powershell to wait until the app is done before continuing.

```javascript
Win.process.onKill('notepad', function() {
    Win.log('Notepad killed');
});
```

#### Get Window Title of running application

```javascript
Win.process.getWindowTitle('notepad', function(output) {
    Win.log(output);
});
```

#### Check if a process is running

```javascript
    Win.process.isRunning('notepad', function(bool) {
        Win.log(bool);
    });
```

## `Win.window`

Control a Window's state

#### Minimize a window

If no processName is specified, it will minimize the current window in the foreground.

```javascript
// Minimize a window by process name. The ".exe" is optional.
Win.window.minimize('firefox.exe');

// Minimize the current window
Win.window.minimize();
```

#### Maximize a window

If no processName is specified, it will maximize the current window in the foreground.

```javascript
// Maximize a window by process name. The ".exe" is optional
Win.window.maximize('firefox.exe');

// Maximize the current window
Win.window.maximize();
```

#### Restore a window to a windowed state
If no processName is specified, it will restore the current window in the foreground.

```javascript
// Restore a window by process name. The ".exe" is optional
Win.window.restore('firefox.exe');

// Restore the current window
Win.window.restore();
```

#### Resize a window
If no processName is specified, it will resize the current window in the foreground.

```javascript
Win.window.resize(width, height, processName);

// Resize a window by process name. The ".exe" is optional
Win.window.resize('800', '600', 'firefox.exe');

// Resize the current window
Win.window.resize(960, 1080);
```

#### Move a window
- X and Y are relative to the current window position. 
- If no processName is specified, it will move the current window in the foreground.

```javascript
Win.window.move(x, y, processName);

// Move a window by process name. The ".exe" is optional
Win.window.move('-50', '0', 'firefox.exe');

// Move the current window
Win.window.move(0, 50);
```

### `Win.cmd()`
---
Run a command in Command Prompt.

```javascript
Win.cmd('dir');

// Run a command, then do something with the output
Win.cmd('tasklist', function(output) {
    doSomething(output);
});

// Run a command, then do something with the output and any possible errors
Win.cmd('tasklist', function(output, errors){
    doSomething(output)
    if(errors) doSomethingElse(errors)
});

// Run a command, but supress any errors that occur (Don't print them to console or log)
Win.cmd('tasklist', function(output){
    doSomething();
}, {suppressErrors: true});

// Run a command, but don't print to log

Win.cmd('tasklist', function(output){
    doSomething();
}, {noLog: true});
```

### `Win.PowerShell()`
---
Run a PowerShell command.

You can run a single powershell command by passing a string, or run multiple commands in the same powershell instance by passing commands in an array.

When you pass an array to run multiple commands, the returned output and errors will be an array, not a string 

This is playing with real power. See [here](https://docs.microsoft.com/en-us/powershell/module/?view=powershell-6) and [here](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.management/?view=powershell-6) for resources on what you can do with PowerShell to automate and interact with Windows, beyond what Windows interact provides

```javascript
Win.PowerShell(string|array: command, callback, options)


Win.PowerShell('ls');

// Run a command, then do something with the output
Win.PowerShell('Move-Item -Path C:\\test.txt -Destination E:\\Temp\\tst.txt', function(output) {
    doSomething(output);
});

// Run a command, then do something with the output and any possible errors
Win.PowerShell('Move-Item -Path C:\\Temp -Destination C:\\Logs', function(output, errors){
    doSomething(output)
    if(errors) doSomethingElse(errors)
});

// Run a command, but suppress any errors that occurr (Don't print them to console or log)
Win.PowerShell('Move-Item -Path .\\*.txt -Destination C:\\Logs', function(output){
    doSomething();
}, {suppressErrors: true});

// Run a command, but do not log the output and supress any errors that occurr (Don't print them to console or log)
Win.PowerShell('Restart-Service -Name Audiosrv', function(output){
    doSomething();
}, {suppressErrors: true, noLog: true});

// Run multiple commands in the same powershell window
Win.PowerShell(['$somevariable="Hello World!"', 'Write-Host "$somevariable"'], function(output, errors){
    console.log(output); // ['Hello World!']
    if(errors.length > 0) Win.error('Something went wrong');
}, {noLog: true});
```

### `Win.requestTo()`
---

Make an HTTP request the easy way.

To simplify this feature and make using it more natural, there is some flexibility with the parameters

- There are 4 default parameters which will work in every scenario (no shorthand): `deviceName, method, formData, callback`
- If the all parameters are ommited, an assumed GET request will be made.
- If the second paramter is a function, it will assume that this is a callback and an assumed GET request will be made
- If the third parameter is an object, it will send this as form data.
- If the third parameter is a function, it execute it as a callback

You can give friendly, reuseable names to URLs with `Win.set.preferences`. These are used in place of a URL when sending a request.

```javascript
Win.set.preferences({
    httpUrls: { 
        thisMachine: 'http://127.0.0.1:80/',
        thermostat: 'http://localhost:8084/'
    }
});
```

```javascript
Win.requestTo(deviceName, method, formData, callback);

// Make a POST request
Win.requestTo('http://httpbin.org/post/', 'POST', {
    property: 'value'
});

// Make a POST request, then do something with the response
Win.requestTo('http://httpbin.org/post/', 'POST', {
    property: 'value'
}, function(response) {
    Win.log(response);
});

// Make a GET request
Win.requestTo('http://httpbin.org/get/', 'GET', function(response) {
    Win.log(response)
});

// Make an assumed GET request
Win.requestTo('http://httpbin.org/get/', function(response) {
    Win.log(response)
});

// Make an assumed GET request to a predefined URL, and do nothing else
Win.requestTo('thermostat');

// Make a PUT request
Win.requestTo('thisMachine', 'PUT', {
    property: 'value'
});

// Make a PUT request, then do something with the response
Win.requestTo('thisMachine', 'PUT', {
    property: 'value'
}, function(response) {
    Win.log(response)
});

```

## `Win.authCode`

Used to quickly authenticate a user

This was originally designed for keeping just anyone from using Cortana or Alexa to do serious stuff like shutting down or restarting.
By default, it will return as valid when the code starts with the Nth letter of a zero indexed alphabet, where N is the first digit of the current Second of your PC's System time. For example, if it the time is 5:15:08, '0' is parsed and the receivedCode should start with A. 

You can set a custom parsing function, as well as a master key that will always be accepted.

```javascript
Win.set.preferences({
    // Set a master key
    masterKey: 'AREALLYLONGSTRINGWITHLOTSOFCOMPLICATEDCHARACTERS',
    authCodeParse: function(receivedCode) {
    // Should return true or false if the receivedCode meets your criteria
    /**   Example start **/
        if (receivedCode > 5) {
            Win.alert('Correct code: ' + receivedCode)
            return true;
        }
        else {
            Win.alert('Incorrect code: ' + receivedCode)
            return false;
        }
    }
    /**   Example end **/
});
```


```javascript
if(Win.authCode.isValid('6')) {
    console.log('It\'s valid');
}
```

### `Win.confirm()`

An alternative to the browsers's `confirm()`. Unlike the browser, it will not stop execution of code and wait for the user. It will instead show multiple dialog boxes. To chain consecutive dialog boxes, you need to wrap them in an async function (see below).

```javascript
Win.confirm('Title', 'Question?');

Win.alert('Question'); 

// Chain consecutive alerts
async function chain() {
    if(await Win.confirm('Message')) {
        await Win.alert('Message!');
    }
}
chain();

// Super simple self-executing async function
(async()=>{
    if(await Win.confirm('Message?')) {
        await Win.alert('Ok!');
    } else {
        await Win.alert('Canceled...');
    }
})();

```

### `Win.alert()`

An alternative to the browsers's `alert()`. Unlike the browser, it will not stop execution of code and wait for the user. It will instead show multiple dialog boxes. To chain consecutive alerts, you need to wrap them in an async function (see below).

```javascript
// Show an alert box with title and message
Win.alert('Message', 'Title'); 

Win.alert('Message'); 

// Chain consecutive alerts
async function chain() {
    await Win.alert('Message');
    await Win.alert('More message');
}
chain();

// Super simple self-executing async function
(async()=>{
    await Win.alert('Message');
    await Win.alert('More message');
})();
```

### `Win.prompt()`

An alternative to the browsers's `prompt()`. Unlike the browser, it will not stop execution of code and wait for the user. It will instead show multiple dialog boxes. To chain consecutive prompts, you need to wrap them in an async function (see below).

```javascript
Win.prompt('Message', 'Title', 'Placeholder');

Win.prompt('Message'); 

// Chain consecutive alerts
async function chain() {
    if(await Win.prompt('Please type bananas') == 'bananas') {
        await Win.alert('Thank you for typing bananas');
    }
}
chain();

// Super simple self-executing async function
(async()=>{
    if(await Win.prompt('Do you like Pie?')) {
        await Win.alert('Me too!');
    }
})();

```


## `Win.power()`
---

### Shutdown the PC

```javascript
// If no delay is provided, it will shutdown immediately
Win.power.shutdown(delay);
```

### Restart the PC

```javascript
// If no delay is provided, it will restart immediately
Win.power.restart(delay);
```

### Lock the PC

```javascript
// If no delay is provided, it will lock immediately
Win.power.lock(delay);
```

### Put the PC to sleep

```javascript
// If no delay is provided, it will go to sleep immediately
Win.power.sleep(delay);
```

### Start the screensaver

```javascript
// If no delay is provided, it will start the screensaver immediately
Win.power.screenSaver(delay);
```
---

### Show the desktop

```javascript
Win.showDesktop();
```

### Pause or resume media being played
Same as pressing the pause button on keyboard.

```javascript
Win.pauseMedia();
```

### Take a screenshot

```javascript
// Screenshot the entire screen and save to clipboard
Win.screenshot();
Win.screenshot('full');

// Screenshot a region of the screen and save it to clipboard
Win.screenshot('window');

// Screenshot the entire screen and save to file
Win.screenshot('full', Win.path`C:\Users\User\Pictures\Screenshots\screenshot.png`);

// Screenshot the current window only and save to file
Win.screenshot('window', Win.path`C:\Users\User\Pictures\Screenshots\screenshot.png`);
```

## `Win.Cortana`

Interact with Cortana

### Give Cortana a generic command

```javascript
Win.Cortana.genericCommand('Hello!');
```

### Use Cortana to open an app

```javascript
Win.Cortana.openApp('Microsoft Edge');
```

### Use Cortana to play a song

```javascript
Win.Cortana.playSong(songName, service);

// Play 'Carry on my wayward son' on Spotify
Win.Cortana.playSong('Carry on my wayward son', 'Spotify');
// Play 'Carry on my warward son' on Groove
Win.Cortana.playSong('Carry on my wayward son', 'Groove');
```

### Use Cortana to play a playlist

```javascript
Win.Cortana.playSong(playlist, service);

// Play 'Carry on my wayward son' on Spotify
Win.Cortana.playSong('Gaming'. 'Spotify');
// Play 'Carry on my warward son' on Groove
Win.Cortana.playSong('Oldies'. 'Groove');
```

### Invoke Cortana's listening mode
Make sure you have "Let Cortana listen for my commands when I press the Windows Logo + C" enabled in the Setting app

```javascript
Win.Cortana.startListening();
```
