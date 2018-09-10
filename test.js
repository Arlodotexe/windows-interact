const Win = require('./windows-interact');
let x = ['write-host "test"', 'write-host "Still alive?"'];
const supplementals = require('./supplementals');

Win.set.preferences({
    log: {
        verbose: {
            PowerShell: true
        }
    }
});

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
            Win.log('Notepad Launched')
        },
        onKill: function() {
            Win.log('Notepad killed')
        }
    },
})

Win.appManager.register.group({
    "test": {
        apps: ["Pad", "VSCode", "boincmgr"],
        onLaunch: function() {
            console.log('test launch');
        }
    }
}); */


let com = 'get-process "Code" | select ProcessName, MainWindowTitle';
let note = 'get-process "notepad" | select ProcessName, MainWindowTitle';

Win.PowerShell([...x, note], (result, err) => {
    console.log('\n');
    console.log('result ', result);
}, { noLog: true, id: 'test', suppressErrors: false, keepAlive: true });


// Current mission: First command is getting overwritten by second command
// No callbacks are being called, is output even being collected?

// Where the green command are showing in windows-interact.js is where I am currently investigating the problem (function qCommand)



Win.PowerShell.newCommand('write-host "tesT"', (result, err) => {
    console.log('newCommand: ', result);
}, { id: 'test', noLog: true });

Win.PowerShell.newCommand('write-host "tesT 2"', (result, err) => {
    console.log('newCommand 2: ', result);
}, { id: 'test', noLog: true });

Win.PowerShell.newCommand('$vari = "Hello world Pt. 3"', (result, err) => {
    console.log('newCommand 3: ', result);
}, { id: 'test', noLog: true });


Win.PowerShell.newCommand('write-host $vari', (result, err) => {
    console.log('newCommand 4: ', result);
}, { id: 'test', noLog: true });

 setTimeout(() => {
    
}, 2000); 


 
Win.PowerShell('ls', result => {
    console.log('result 2 ', result);
}, { noLog: true, id: 'test2', suppressErrors: true, keepAlive: false }); 


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