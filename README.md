# windows-interact
This library is a collection of tools for interacting with and automating Windows. It is designed to simplify and enhance existing tools while providing access to powerful new features. 

Completely open to new features. Submit an issue labeled "Feature request" if there is something you'd like to see implemented!

---

# Installation 
--- 

Install the [npm](https://www.npmjs.com/package/windows-interact) package by running `npm install windows-interact` in your project folder

Then, in your js file, `require` the package.
```javascript 
const System = require('windows-interact.js');
```

Windows-Interact also relies moderately on [nircmd](http://nircmd.nirsoft.net/). This is included in the package but untested on another machine, so if you start having troubles, try installing it to your machine. 

# Documentation
---
## `System.set`
---
Used to set various things within Windows, as well as set preferences for windows-interact

#### Set the volume of the current audio device
---
This 99% accurate due to the math required behind the scenes
```javascript
System.set.volume('50');
```

#### Set the default playback device in Windows
---

```javascript
System.set.defaultSoundDevice('Headset Earphone');
```

#### Set Global user preferences for Windows Interact
---

```javascript
System.set.preferences({ 
    // Set master key (For System.authCode)
    masterKey: 'MASTERKEY',
    authCodeParse: function(receivedCode) {
    // Should return true or false if the receivedCode meets your criteria
        if (receivedCode > 5) {
            System.alert('Correct code: ' + receivedCode)
            return true;
        }
        else {
            System.alert('Incorrect code: ' + receivedCode)
            return false;
        }
    },
    // Default text to speech voice to use (For System.speak)
    TTSVoice: 'Microsoft David Desktop',
    // Default message to speak when an error occurs (For System.error)
    spokenErrorMessage: 'Something is wrong with your node server. Details are in the log', 
    // Inverval at which the app manager gets the status of registered apps. Leaving unset defaults the interval to 5000
    appManagerRefreshInterval: 2500,
    // Log options
    log: {
        // File to save log and error history (For System.log)
        outputFile: System.path`C:\Users\User\node-server\log.txt`,
        // Show or hide timestamp in log (For System.log & System.error)
        showTime: true,
        // Control verbosity of parts of windows-interact
        verbose: {
            // Show preformatted log when requests are made
            requestTo: true
        }
    }
    // Store URLs for quick access when using System.requestTo
    httpUrls: { 
        thisMachine: 'http://127.0.0.1:80/',
        thermostat: 'http://localhost:8084/'
    }
});
```

### `System.log()`
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

You can set the default log file location with `System.set.preferences`, like so:

```javascript
System.set.preferences({
    log: {
    // File to save log and error history (For System.log)
    outputFile: System.path`C:\Users\User\node-server\log.txt`,
    // Show or hide timestamp in log (For System.log & System.error)
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
System.log(message, {background: 'colour', colour: 'colour'});

// Log information to the console and .txt file
System.log('Logged information');

// Log information to the console and .txt file, with colored background and text
System.log('Logged information', {background: 'colour', colour: 'colour'})

System.log.speak(phrase, voice, speed, options);
// Log information to the console and .txt file, and also System.speak() it
System.log.speak('Testing'); 

// Log information to the console and .txt file, System.speak() it with a specific voice, at half speed, with a black background and a blue text colour
System.log.speak('Testing', 'Microsoft David Desktop', 0.5, {background: 'black', colour: 'blue'})
```


### `System.error()`
---
An alternative to `console.error`. It will push the output of the log to the console (in red!) and record each entry in a .txt file

You can set some default options with `System.set.preferences`, like so:

```javascript
System.set.preferences({
    // Record each entry in an external file
    logOutputFile: System.path`C:\Users\User\node-server\log.txt`,
    // Message to System.speak() whenever System.error is called
    spokenErrorMessage: 'Something is wrong with your node server. Details are in the log'
});
```

Usage:
```javascript
// Log an error to the console and default .txt file (if set)
System.error('Error information');

// Log an error to the console, but don't speak the set spokenErrorMessage
System.error('Error information', {silent: true});
```

### `System.notify()`
---

Show a toast notification in Windows 10 (Or tray balloon on older versions of windows)

If you need something more advanced than basic notifications, I'd recommend using [node-notifier](https://github.com/mikaelbr/node-notifier)

```javascript
// Show toast notification
System.notify('Title', 'Message');

// Show single line toast notification
System.notify('Message'); 
```

### `System.path`` `
---
Return a properly formatted Windows path for use in Javascript. This allows you to simply copy and paste a path from the File Explorer without having to worry about character-escaping (`\`) slashes

```javascript
System.path`C:\WINDOWS\system32\notepad.exe`;
```

### `System.speak()`
---
Speak text asynchronously. Similar to my [async-sayjs](https://github.com/Arlodotexe/async-sayjs) package (Yep, that started here), but with some benefits and enhanments.

You can set the default text to speech voice with `System.set.preferences`, like so:

```javascript
System.set.preferences({
	TTSVoice: 'Microsoft Eva Mobile'
});
```

Usage:
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

To get started, you need to register your apps. You will need the absolute path of the executable at the minimum. To easily format a Windows path for use in Javascript, it is recommended that you use ```System.path`C:\absolute\path` ```

NOTICE: The registered name must be the same as the executable.

#### Register a new application

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

#### Retrieve registered applications

```javascript
System.appManager.registeredApplications
```

#### Launch a registered application

```javascript
System.appManager.launch('notepad');
```

#### Kill a registered application

```javascript
System.appManager.kill('notepad');
```

#### Hide a registered application

```javascript
System.appManager.hide('notepad');
```

#### Switch to a registered application

```javascript
System.appManager.switchTo('notepad');
```


## `System.process`
---

`System.process` is very similar to `appManager`, but can be used for unregistered apps. Use sparcely and avoid loops, this is not as efficient as `appManager`.


#### Get PID of a running process

Returns an array of PIDs associated with a running process. If no process is found, false is returned. The data is piped into a callback.

```javascript
System.process.getPid('notepad', function(output) {
    System.log(output);
});
```

#### Kill a running app

```javascript
System.process.kill('notepad', callback);
```

#### Run a callback when a process is killed
App must already be running, if not, it will wait until it has started and then tell powershell to wait until the app is done before continuing.

```javascript
System.process.onKill('notepad', function() {
    System.log('Notepad killed');
});
```

#### Get Window Title of running application

```javascript
System.process.getWindowTitle('notepad', function(output) {
    System.log(output);
});
```

#### Check if a process is running

```javascript
    System.process.isRunning('notepad', function(bool) {
        System.log(bool);
    });
```

## `System.window`

Control a Window's state

#### Minimize a window

If no processName is specified, it will minimize the current window in the foreground.

```javascript
// Minimize a window by process name. Don't sweat it if you forget the .exe, it'll correct it.
System.window.minimize('firefox.exe');

// Minimize the current window
System.window.minimize();
```

#### Maximize a window

If no processName is specified, it will maximize the current window in the foreground.

```javascript
// Maximize a window by process name. Don't sweat it if you forget the .exe, it'll correct it.
System.window.maximize('firefox.exe');

// Maximize the current window
System.window.maximize();
```

#### Restore a window to a windowed state
If no processName is specified, it will restore the current window in the foreground.

```javascript
// Restore a window by process name. Don't sweat it if you forget the .exe, it'll correct it.
System.window.restore('firefox.exe');

// Restore the current window
System.window.restore();
```

#### Resize a window
If no processName is specified, it will resize the current window in the foreground.

```javascript
System.window.resize(width, height, processName);

// Resize a window by process name. Don't sweat it if you forget the .exe, it'll correct it.
System.window.resize('800', '600', 'firefox.exe');

// Resize the current window
System.window.resize(960, 1080);
```

#### Move a window
- X and Y are relative to the current window position. 
- If no processName is specified, it will move the current window in the foreground.

```javascript
System.window.move(x, y, processName);

// Move a window by process name. Don't sweat it if you forget the .exe, it'll correct it.
System.window.move('-50', '0', 'firefox.exe');

// Move the current window
System.window.move(0, 50);
```

### `System.cmd()`
---
Run a command in Command Prompt.

Instead of simply printing errors and output, errors that occur will use `System.error()` and the output will use `System.log()`

```javascript
System.cmd('dir');

// Run a command, then do something with the output
System.cmd('tasklist', function(output) {
    doSomething(output);
});

// Run a command, then do something with the output and any possible errors
System.cmd('tasklist', function(output, errors){
    doSomething(output)
    if(errors) doSomethingElse(errors)
});

// Run a command, but supress any errors that occur (Don't print them to console or log)
System.cmd('tasklist', function(output){
    doSomething();
}, {suppressErrors: true});

// Run a command, but don't print to log

System.cmd('tasklist', function(output){
    doSomething();
}, {noLog: true});
```

### `System.PowerShell()`
---
Run a PowerShell command

Instead of simply printing errors and output, errors that occur will use System.error() and the output will use System.log()

This is playing with real power. See [here](https://docs.microsoft.com/en-us/powershell/module/?view=powershell-6) and [here](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.management/?view=powershell-6) for resources on what you can do with PowerShell to automate and interact with Windows, beyond what Windows interact provides

```javascript
System.PowerShell('ls');

// Run a command, then do something with the output
System.PowerShell('Move-Item -Path C:\\test.txt -Destination E:\\Temp\\tst.txt', function(output) {
    doSomething(output);
});

// Run a command, then do something with the output and any possible errors
System.PowerShell('Move-Item -Path C:\\Temp -Destination C:\\Logs', function(output, errors){
    doSomething(output)
    if(errors) doSomethingElse(errors)
});

// Run a command, but suppress any errors that occurr (Don't print them to console or log)
System.PowerShell('Move-Item -Path .\\*.txt -Destination C:\\Logs', function(output){
    doSomething();
}, {suppressErrors: true});

// Run a command, but do not log the output and supress any errors that occurr (Don't print them to console or log)

System.PowerShell('Restart-Service -Name Audiosrv', function(output){
    doSomething();
}, {suppressErrors: true, noLog: true});
```

### `System.requestTo()`
---

Make an HTTP request the easy way.

To simplify this feature and make using it more natural, there is some flexibility with the parameters

- There are 4 default parameters which will work in every scenario (no shorthand): `deviceName, method, formData, callback`
- If the all parameters are ommited, an assumed GET request will be made.
- If the second paramter is a function, it will assume that this is a callback and an assumed GET request will be made
- If the third parameter is an object, it will send this as form data.
- If the third parameter is a function, it execute it as a callback

You can give friendly, reuseable names to URLs with `System.set.preferences`. These are used in place of a URL when sending a request.

```javascript
System.set.preferences({
    httpUrls: { 
        thisMachine: 'http://127.0.0.1:80/',
        thermostat: 'http://localhost:8084/'
    }
});
```

```javascript
// Make a POST request
System.requestTo('http://httpbin.org/post/', 'POST', {
    property: 'value'
});

// Make a POST request, then do something with the response
System.requestTo('http://httpbin.org/post/', 'POST', {
    property: 'value'
}, function(response) {
    System.log(response);
});

// Make a GET request
System.requestTo('http://httpbin.org/get/', 'GET', function(response) {
    System.log(response)
});

// Make an assumed GET request
System.requestTo('http://httpbin.org/get/', function(response) {
    System.log(response)
});

// Make an assumed GET request to a predefined URL, and do nothing else
System.requestTo('thermostat');

// Make a PUT request
System.requestTo('thisMachine', 'PUT', {
    property: 'value'
});

// Make a PUT request, then do something with the response
System.requestTo('thisMachine', 'PUT', {
    property: 'value'
}, function(response) {
    System.log(response)
});

```

## `System.authCode`

Used to quickly authenticate a user

This was originally designed for keeping just anyone from using Cortana or Alexa to do serious stuff like shutting down or restarting.
By default, it will return as valid when the code starts with the Nth letter of a zero indexed alphabet, where N is the first digit of the current Second of your PC's System time. For example, if it the time is 5:15:08, '0' is parsed and the receivedCode should start with A. 

You can set a custom parsing function, as well as a master key that will always be accepted.

```javascript
System.set.preferences({
    // Set a master key
    masterKey: 'AREALLYLONGSTRINGWITHLOTSOFCOMPLICATEDCHARACTERS',
    authCodeParse: function(receivedCode) {
    // Should return true or false if the receivedCode meets your criteria
    /**   Example start **/
        if (receivedCode > 5) {
            System.alert('Correct code: ' + receivedCode)
            return true;
        }
        else {
            System.alert('Incorrect code: ' + receivedCode)
            return false;
        }
    }
    /**   Example end **/
});
```


```javascript
if(System.authCode.isValid('6')) {
    console.log('It\'s valid');
}
```

### `System.confirm()`

An alternative to the browsers's `confirm()`. Unlike the browser, it will not stop execution of code and wait for the user. Therefore, it requires a callback to do something with the user's choice (this will be changed to a promise in the future)

```javascript
System.confirm('Title', 'Message?', function(bool) {
    /// 'bool' returns true if the user clicks 'OK', or false if they click 'Cancel'
    doSomething();
});
```

### `System.alert()`

An alternative to the browsers's `alert()`. Unlike the browser, it will not stop execution of code and wait for the user. It will require a callback if you wish to run code only _after_ the user has clicked 'Ok' (this will be changed to a promise in the future)

```javascript
// Show an alert box with title and message
System.alert('Title', 'Message!', function() {
    doSomething();
});

System.alert('Simple message'); 
```

## `System.power()`
---

### Shutdown the PC

```javascript
// If no delay is provided, it will shutdown immediately
System.power.shutdown(delay);
```

### Restart the PC

```javascript
// If no delay is provided, it will restart immediately
System.power.restart(delay);
```

### Lock the PC

```javascript
// If no delay is provided, it will lock immediately
System.power.lock(delay);
```

### Put the PC to sleep

```javascript
// If no delay is provided, it will go to sleep immediately
System.power.sleep(delay);
```

### Start the screensaver

```javascript
// If no delay is provided, it will start the screensaver immediately
System.power.screenSaver(delay);
```
---

### Show the desktop

```javascript
System.showDesktop();
```

### Pause or resume media being played
Same as pressing the pause button on keyboard.

```javascript
System.pauseMedia();
```

### Take a screenshot

```javascript
// Screenshot the entire screen and save to clipboard
System.screenshot();
System.screenshot('full');

// Screenshot a region of the screen and save it to clipboard
System.screenshot('window');

// Screenshot the entire screen and save to file
System.screenshot('full', System.path`C:\Users\User\Pictures\Screenshots\screenshot.png`);

// Screenshot the current window only and save to file
System.screenshot('window', System.path`C:\Users\User\Pictures\Screenshots\screenshot.png`);
```

## `System.Cortana`

Interact with Cortana

### Give Cortana a generic command

```javascript
System.Cortana.genericCommand('Hello!');
```

### Use Cortana to open an app

```javascript
System.Cortana.openApp('Microsoft Edge');
```

### Use Cortana to play a song

```javascript
System.Cortana.playSong(songName, service);

// Play 'Carry on my wayward son' on Spotify
System.Cortana.playSong('Carry on my wayward son'. 'Spotify');
// Play 'Carry on my warward son' on Groove
System.Cortana.playSong('Carry on my wayward son'. 'Groove');
```

### Use Cortana to play a playlist

```javascript
System.Cortana.playSong(playlist, service);

// Play 'Carry on my wayward son' on Spotify
System.Cortana.playSong('Gaming'. 'Spotify');
// Play 'Carry on my warward son' on Groove
System.Cortana.playSong('Oldies'. 'Groove');
```

### Invoke Cortana's listening mode
Make sure you have "Let Cortana listen for my commands when I press the Windows Logo + C" enabled in the Setting app

```javascript
System.Cortana.startListening();
```
