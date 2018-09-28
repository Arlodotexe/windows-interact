const Win = require('./windows-interact');
let x = ['write-host "test"', 'write-host "Still alive?"'];
const supplementals = require('./supplementals');

Win.set.preferences({
    appManagerRefreshInterval: 2500,
    log: {
        verbose: {
            PowerShell: true,
            appManager: true
        }
    }
});

Win.notify('test')
/* 
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

Win.appManager.register.group({
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


Win.window.maximize('firefox');
Win.window.move(1920, 0, 'firefox'); */


setInterval(() => {
    //console.log(Win.appManager.registeredApps);
}, 2000);


/* Win.playAudio(Win.path`"C:\Users\chuck\OneDrive\Desktop (1)\Projects\Video editing\Extras\Ding.mp3"`);

setTimeout(() => {
    Win.stopAudio(Win.path`"C:\Users\chuck\OneDrive\Desktop (1)\Projects\Video editing\Extras\Ding.mp3"`);
}, 1500);

let com = 'get-process "Code" | select ProcessName, MainWindowTitle';
let note = 'get-process "notepad" | select ProcessName, MainWindowTitle';

Win.PowerShell([...x, note], (result, err) => {
    console.log('\n');
    console.log('result ', result);
}, { noLog: false, id: 'test', suppressErrors: true, keepAlive: true });

setTimeout(() => {
    Win.PowerShell.endSession('test');
}, 5000);


Win.PowerShell('ls', result => {
    console.log('result 2 ', result);
}, { noLog: true, id: 'test2', suppressErrors: true, keepAlive: false }); */



//Win.notify('Version 2.5 has been released to the Store', 'MyTube Companion has been updated!', Win.path`"C:\Users\chuck\OneDrive\Downloads\13 MIN OF DANK MEMES COMPILATION #28.gif"`)

//Win.PowerShell('Start-Process rykentube:');
/*
// Ignore this, this is for testing the audio detection


/*
setTimeout(() => {
}, 2000);
/* Win.get.audioDevices.output.isPlaying(result => {
    console.log(result);
}); */

/* Win.PowerShell(supplementals.AudioDetection, result => {
        //console.log(result)
    }); */