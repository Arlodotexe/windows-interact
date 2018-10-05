const Win = require('./windows-interact');
/* 
Win.set.preferences({
    log: {
        showTime: false,
        verbose: {
            stackTrace: true,
            PowerShell: true,
            appManager: true
        }
    }
}); */

Win.log(function() { }, 'test', { bg: 'red', test: 3 }, 4);
console.log(function() { }, 'test', { bg: 'red', test: 3 }, 4);

let x = ['write-host "test"', 'write-host "Still alive?"'];
let com = 'get-process "Code" | select ProcessName, MainWindowTitle';
let note = 'get-process "notepad" | select ProcessName, MainWindowTitle';

/* async function crawl(data) {
    return new Promise(resolve => {
        if (typeof data == 'string' || typeof data == 'number' || typeof data == 'boolean') {
            resolve('\x1b[33m' + data + '\x1b[0m');
        } else if (typeof data == 'object') {
            Object.entries(data).forEach(async function([name, props]) {
                let newData = await crawl(props);
                resolve(newData);
            });
        }
    });
}
(async function() {
    let y = await crawl({'data': 'Test', 'Number': 5})
    console.log(y);
})() */



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



/* Win.appManager.register({
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
            // Win.log('Notepad Launched')
        },
        onKill: function() {
            // Win.log('Notepad killed')
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
            Win.log('test launch: ', appName);
        },
        onKill: function(appName) {
            Win.log('test kill: ', appName); 
        }
    },
    "test 2": {
        apps: ["Pad"],
        onLaunch: function(appName) {
            Win.log('test launch 2: ', appName);
        },
        onKill: function(appName) {
            Win.log('test kill 2: ', appName); 
        }
    }
}); */