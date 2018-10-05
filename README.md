# windows-interact

This library is a collection of tools for interacting with and automating Windows. It is designed to simplify and enhance existing tools while providing access to powerful new features.

With `windows-interact`, NodeJS gains the following functionality:

- [Control over audio devices](https://github.com/Arlodotexe/windows-interact#set-the-volume-of-the-current-audio-device)
- [Shutdown, Restart, Lock, Sleep, or start Screen Saver](https://github.com/Arlodotexe/windows-interact#winpower)
- [Send Toast notifications or Tray Balloons](https://github.com/Arlodotexe/windows-interact#winnotify)
- Mixin replacements for the browser's [alert()](https://github.com/Arlodotexe/windows-interact#winconfirm), [confirm()](https://github.com/Arlodotexe/windows-interact#winalert), and [prompt()](https://github.com/Arlodotexe/windows-interact#winprompt)
- Native [Windows File Picker](https://github.com/Arlodotexe/windows-interact#winfilepicker)
- [Take screenshots](https://github.com/Arlodotexe/windows-interact#take-a-screenshot)
- [Asynchronous Text to speech](https://github.com/Arlodotexe/windows-interact#winspeak)
- Play audio files in the background
- [Manipulate windows](https://github.com/Arlodotexe/windows-interact#winwindow) (Maximize, Minimize, etc.)
- [Manage a list of registered apps](https://github.com/Arlodotexe/windows-interact#winappmanager) (with lots of extra features)
- [Manage processes](https://github.com/Arlodotexe/windows-interact#winprocess)
- Enhanced [logging](https://github.com/Arlodotexe/windows-interact#winlog) and [error throwing](https://github.com/Arlodotexe/windows-interact#winerror)
- VERY Advanced [PowerShell](https://github.com/Arlodotexe/windows-interact#winpowershell) session manager
  -  More advanced than [node-powershell](https://www.npmjs.com/package/node-powershell), with automatic output collection and seperation, and the ability to run multiple command in succession by passing in array. 

---

**The current released version is 1.3.1. [See the release notes](changelog.md) if this version number differs from below**

### Patch 1.3.1:
 - Fixed Win.PowerShell.newCommand rejecting empty 2nd and 3rd parameters

## New in version (1.3.0): 
 - New display methods, including:
    - Get/Set resolution
    - Set projection mode
 - Added `Win.get.user.idleTime()` to check the idle time of the user (last keyboard or mouse input)
 - Added detection for audio transmitted through both input and output (`Win.get.audioDevices.output.transmitting`, `Win.get.audioDevices.input.transmitting`).

 What's changed: 
 - Added `stackTrace` as a verbosity option. From now on, most internal methods that use PowerShell will start hiding their large and irrelevant error stack trace unless this option is enabled
 - `Win.log()` now parses Javascript objects properly (Similar to console.log. Formatting and color is coming soon)
 - App Manager:
    - Added verbosity options
    - onLaunch and onKill now return the name of the relevant application
 - Fixed bugs with `Win.alert()` and `Win.confirm()` and now uses the same PowerShell Session under the hood to prevent excessive process spawning 
 - Fixed a bug where Window Titles in `Win.appManager.registeredApps` would all be the same as the first app
 - Fixed an error associated with the AudioDeviceCmdlets module that appeared when installing windows-interact
 - Fixed `Win.notify()` and `Win.filePicker()` (These were broken in the last release, so sorry!)
 - Cleanup up miscellaneous internal code
 
 
 Known issues: 
 - `Win.PowerShell()`:
   - Using `Start-Sleep` with any value greater than 800ms will cause some very odd issues with the internals of `Win.PowerShell()`. This is because 800ms is the extra time that each command is manually seperated to better discern output. This will be fixed in the future, but for now, avoid using `Start-Sleep` if possible

 What's next: 
 - `Win.PowerShell()` is going to be optimized as much as possible and ran through with a fine tooth comb over the next few months.
 - There will be a lot of refactoring coming soon, this project is getting massive and its time to split it up a little.
 - Better documentation / An official, actually navigateable website.
 - Most or all methods will be converted to Promises instead of callbacks
 - Planning on removing dependency on requestify, perhaps building my own wrapper for nodes' native request methods with zero dependencies

Got ideas? Something you want windows-interact to include? _**Fantastic**_, contact me on twitter @[Arlodottxt](https://twitter.com/Arlodottxt) with your suggestions or open a new Issue on Github

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

### Set Global user preferences for Windows Interact
---

```javascript
Win.set.preferences({
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
            requestTo: true,
            // Be verbose while managing PowerShell sessions
            PowerShell: true,
            appManager: true
        }
    }
});
```
---
## Display

#### Set the resolution of the primary display
`Win.set.display.resolution(width, height, callback) => : void`
```javascript
Win.set.display.resolution(1920, 1080, () => {
    console.log('Done');
});
```

#### Set the projection mode
```javascript
// Accepted values are  "primary", "secondary", "extend" or "duplicate"
Win.set.display.projectionMode(mode);
```
---

## Audio Devices

### Input
#### Set the volume of the current input device
```javascript
Win.set.audioDevices.input.volume('50');
```

#### Set the mute state of the current input device

```javascript
Win.set.audioDevices.input.mute();
```

#### Set the default input device in Windows

```javascript
Win.set.audioDevices.input.default('Headset Earphone');
```

---

### Output
#### Set the volume of the current output device

```javascript
Win.set.audioDevices.output.volume('50');
```

#### Set the mute state of the current output device

```javascript
Win.set.audioDevices.output.mute();
```

#### Set the default output device in Windows

```javascript
Win.set.audioDevices.output.default('Headset Earphone');
```

<br>

## `Win.get`
Used to get the status of various things within Windows

---

## User

#### Get the Idle time of the current user

`Win.get.user.idleTime(callback) => : Promise`

```javascript
// Log the Idle time
Win.get.lastInput()
    .then(console.log); // : [hours, minutes, seconds]
```
---

## Display

#### Get the current display resolution

`Win.get.display.resolution(callback) => : void`


```javascript
Win.get.display.resolution(result => {
    console.log(result) // : { height: '1920', width: '1080' }
});
```
---
## Audio Devices


### Input
#### Get the volume of the current input device
```javascript
Win.get.audioDevices.input.volume(function(result) {
    console.log(result); // Volume level of the current default device
});
```

#### Get the mute state of the current input device
```javascript
Win.get.audioDevices.input.mute(function(result) {
    console.log(result); // Mute state of the current default device
});
```

#### Get the default input device in Windows

```javascript
Win.get.audioDevices.input.default(function(result) {
    console.log(result); // Name of the current default input device
});
```

#### Get the audio transmission state of the default input device (Microphone detection)
`Win.get.audioDevices.input.transmitting(callback => : boolean);`

```javascript
Win.get.audioDevices.input.transmitting((result) => {
    console.log(result); // Whether or not there is audio being transmitted through the default input 
});
```

---

### Output
#### Get the volume of the current output device

```javascript
Win.get.audioDevices.output.volume(function(result) {
    console.log(result); // Volume level of the current default device
});
```

#### Get the mute state of the current output device

```javascript
Win.get.audioDevices.output.mute(function(result) {
    console.log(result); // Mute state of the current default device
});
```

#### Get the default output device in Windows

```javascript
Win.get.audioDevices.output.default(function(result) {
    console.log(result); // Name of the current default output device
});
```

#### Get the audio transmission state of the default output device

`Win.get.audioDevices.output.transmitting(callback => : boolean);`
```javascript
Win.get.audioDevices.output.transmitting((result) => {
    console.log(result); // Whether or not there is audio being transmitted through the default output device
});
```


## `Win.log()`
---
`Win.log(message, {background: 'color', color: 'color'}); => : void`

An alternative to `console.log`. It pushes the output of the log to the console and can record each entry in a .txt file, while providing simple colour options for the text

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
            requestTo: true,
            // Be verbose while managing PowerShell sessions
            PowerShell: true,
            appManager: true
        }
    }
});
```

Usage:
```javascript

// Log information to the console and .txt file
Win.log('Logged information');

// Log information to the console and .txt file, with colored background and text, and don't show the timestamp (even if enabled in preferences)
Win.log('Logged ', 'information', {background: 'color', color: 'color', showTime: false});

Win.log.speak(phrase, voice, speed, options);
// Log information to the console and .txt file, and also Win.speak() it
Win.log.speak('Testing'); 

// Log information to the console and .txt file, Win.speak() it with a specific voice, at half speed, with a black background and a blue text colour
Win.log.speak('Testing', 'Microsoft David Desktop', 0.5, {background: 'black', colour: 'blue'})
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

## `Win.notify()`
---

Show a toast notification in Windows 10 (Or tray balloon on older versions of windows)

If you need something more advanced than basic notifications, I'd recommend using [node-notifier](https://github.com/mikaelbr/node-notifier)

```javascript
// Show toast notification with an image or animated GIF
Win.notify('Title', 'Message', Win.path`C:\path\to\image\or\animated.gif`);

// Show single line toast notification
Win.notify('Message'); 
```

## `Win.path`` `
---
Return a properly formatted Windows path for use in Javascript. This allows you to simply copy and paste a path from the File Explorer without having to worry about character-escaping (`\`) slashes. 

If you are passing in a directory, surround the path with double quotes or escape the last backslash. Surrounding double quotes are always removed.

```javascript
Win.path`C:\WINDOWS\system32\notepad.exe`;
```

## `Win.speak()`
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

#### Register a new application

```javascript
Win.appManager.register({
    'Pad': {
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
    'Mozilla': {
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
#### Group together registered apps

```javascript

Win.appManager.register.group({
    "Stuff": {
        apps: ["Pad", "Mozilla"],
        onLaunch: function(appName) {
            console.log(appName + ' launched');
        },
        onKill: function(appName) {
            console.log(appName + ' killed');
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

#### Launch a registered group of apps

```javascript
Win.appManager.launch.group('Stuff');
```

#### Kill a registered group of apps

```javascript
Win.appManager.kill.group('Stuff');
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
Kill an app by either process name or PID

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

#### Hide an application by process name

```javascript
Win.process.hide('notepad');
```

#### Check if a process is running

```javascript
    Win.process.isRunning('notepad', function(bool) {
        Win.log(bool);
    });
```

## `Win.window()`

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

## `Win.cmd()`
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

## `Win.PowerShell()`
---
Run one or more PowerShell commands.

You can run a single powershell command by passing a string, or run multiple commands in the same powershell instance by passing commands in an array.

When you pass an array to run multiple commands, the returned output and errors will be an array, not a string. The indexes of commands will matche the indexes of output returned

This is playing with real power. See [here](https://docs.microsoft.com/en-us/powershell/module/?view=powershell-6) and [here](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.management/?view=powershell-6) for resources on what you can do with PowerShell to automate and interact with Windows, beyond what Windows interact provides

```javascript
Win.PowerShell(string|array: command, callback, options);


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

## Keeping a PowerShell session open for later use

To keep a PowerShell session open, pass `keepAlive: true` and `ID: 'someid'` into the `options` object. 

### `Win.PowerShell.newCommand(id, command)`
Issue a new command to an open PowerShell session by the assigned ID

```javascript
// Keep a windows open first
Win.PowerShell('$tester = "Hello world"', (result, err) => {
    console.log('First run')
}, { noLog: false, keepAlive: true, id: 'test' });

// Then add a new command

```

### `Win.PowerShell.endSession(id, callback)`
End an open PowerShell session by ID

## `Win.requestTo()`
---

Make an HTTP request the easy way.

To simplify this feature and make using it more natural, there is some flexibility with the parameters

- There are 4 default parameters which will work in every scenario (no shorthand): `url, method, formData, callback`
- If the all parameters are ommited, an assumed GET request will be made.
- If the second paramter is a function, it will assume that this is a callback and an assumed GET request will be made
- If the third parameter is an object, it will send this as form data.
- If the third parameter is a function, it execute it as a callback


```javascript
Win.requestTo(url, method, formData, callback);

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
Win.requestTo('http://httpbin.org/get/');

// Make a PUT request
Win.requestTo('http://httpbin.org/put/', 'PUT', {
    property: 'value'
});

// Make a PUT request, then do something with the response
Win.requestTo('http://httpbin.org/put/', 'PUT', {
    property: 'value'
}, function(response) {
    Win.log(response)
});

```

## `Win.confirm()`

An alternative to the browsers's `confirm()`. Unlike the browser, it will not stop execution of code and wait for the user. It will instead show multiple dialog boxes. To chain consecutive dialog boxes, you need to wrap them in an async function (see below).

```javascript
Win.confirm('Title', 'Question?');

Win.alert('Question'); 

// Chain consecutive alerts
async function chain() {
    if(await Win.confirm('Message?')) {
        await Win.alert('Message!');
    }
}
chain();

// Super simple self-executing async function
(async ()=>{
    if(await Win.confirm('Message?')) {
        await Win.alert('Ok!');
    } else {
        await Win.alert('Canceled...');
    }
})();

```

## `Win.alert()`

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

## `Win.prompt()`

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
    if(await Win.prompt('Do you like Pie?') == 'Yes') {
        await Win.alert('Me too!');
    } else {
        Win.alert('More for me');
    }
})();

```

## `Win.filePicker()`
---
Shows the native Windows File Picker (No really!) and returns the path for the selected file. If no file is selected, `undefined` is returned instead.

```javascript
Win.filePicker(windowTitle, initialDirectory, filter, allowMultiSelect, callback);

// Default everything. 
// windowTitle will be "Select a file".
// initialDirectory will be C:\
// Filter will be set to "All files"
// multiSelect is disabled
Win.filePicker(null, null, null, null, function(result){
    console.log(result); // Path of selected file
});

// Have the user choose an application from Program Files
Win.filePicker('Choose an app', 'C:\\Program Files\\', {filtertext: 'Programs', filterby: '*.exe'}, false, function(result){
    console.log(result); // Path of a single chosen .exe file
});

// Have the user choose a very specific file
Win.filePicker('Where is it at?', Win.path`"C:\Users\Owner\OneDrive\Documents\"`, {filtertext: 'Specific file', filterby: 'Essay.docx'}, false, function(result){
    console.log(result); // Path of Essay.docx file
});

// Use some defaults and have the user pick a few .png files 
Win.filePicker(null, null, {filterby: '.png'}, true, function(result) {
    console.log(result); // Array of paths for the selected .png files
});

// Have the user select an image file
Win.filePicker('Select a picture', Win.path`"C:\Users\Owner\OneDrive\Pictures\"`, {filterby: ['.png', '.jpg', '.gif']}, true, function(result) {
    console.log(result); // Array of paths for the selected .png, .jpg, or .gif files
});

```

## `Win.playAudio(path);`
---
Play an audio file in the background. Must be a `.wav` format. If you try any other format, it will fall back to Windows Media Player to play it (so make sure it's installed through Optional Features).

```javascript
Win.playAudio(Win.path`"C:\windows\media\tada.wav"`);
```

## `Win.stopAudio(path);`
--
Stop a playing audio file using the same path supplied to `Win.playAudio()`.

```javascript

Win.playAudio(Win.path`"C:\windows\media\Alarm02.wav"`);

setTimeout(() => {
    Win.stopAudio(Win.path`"C:\windows\media\Alarm02.wav"`)
}, 2000);
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
Same as pressing the play/pause button on keyboard.

```javascript
Win.toggleMediaPlayback();
```

### Take a screenshot

`Win.screenshot(region, path) => : Promise`

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
