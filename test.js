const Win = require('./windows-interact');
const supplementals = require('./supplementals');

Win.set.preferences({
    appManagerRefreshInterval: 2500,
    log: {
        verbose: {
            stackTrace: true,
            PowerShell: true,
            appManager: true
        }
    }
});

Win.appManager.register({
    VSCode: {
        path: Win.path`C:\Program Files\Microsoft VS Code\Code.exe`,
        onLaunch: function() {
            Win.log('VSCode launched');
            setTimeout(() => {
            }, 500);
        },
        onKill: function() {
            Win.log('VSCode killed');
        }
    },
    Pad: {
        path: Win.path`C:\WINDOWS\system32\notepad.exe`,
        onLaunch: function() {
            Win.log('Notepad Launched')
        },
        onKill: function() {
            Win.log('Notepad killed')
        }
    },
    donation: {
        path: Win.path`"C:\Program Files\BOINC\boincmgr.exe"`
    }
});

/* Win.appManager.register.group({
    "test": {
        apps: ["Pad", "donation"],
        onLaunch: function(appName) {
            console.log('test launch: ', appName);
        },
        onKill: function(appName) {
            console.log(appName); 
        }
    },
    "test 2": {
        apps: ["Pad", "donation"],
        onLaunch: function(appName) {
            console.log('test launch: ', appName);
        },
        onKill: function(appName) {
            console.log(appName); 
        }
    }
});

 */
/* 
 setInterval(() => {
     console.log(Win.appManager.registeredApps);
 }, 2000); */
let x = ['write-host "test"', 'write-host "Still alive?"'];

let com = 'get-process "Code" | select ProcessName, MainWindowTitle';
let note = 'get-process "notepad" | select ProcessName, MainWindowTitle';

Win.PowerShell(['New-Item "$($profile | split-path)\\Modules\\AudioDeviceCmdlets" -Type directory -Force',
'Copy-Item "' + __dirname + '\\AudioDeviceCmdlets.dll" "$($profile | split-path)\\Modules\\AudioDeviceCmdlets\\AudioDeviceCmdlets.dll"',
'Set-Location "$($profile | Split-Path)\\Modules\\AudioDeviceCmdlets"',
'Get-ChildItem | Unblock-File', 'Import-Module AudioDeviceCmdlets'], () => { 

}, { noLog: true });

/* Win.PowerShell([...x, note], (result, err) => {
    console.log('\n');
    console.log('result ', result);
}, { noLog: false, id: 'test', suppressErrors: true, keepAlive: true });

setTimeout(() => {
    Win.PowerShell.endSession('test');
}, 5000); */


/* Win.PowerShell('ls', result => {
    console.log('result 2 ', result);
}, { noLog: true, id: 'test2', suppressErrors: true, keepAlive: false });  */



//Win.notify('You can put GIFs in a notification', 'Hey look!', Win.path`"C:\Users\chuck\OneDrive\Downloads\13 MIN OF DANK MEMES COMPILATION #28.gif"`)
