const Win = require('./windows-interact');
let x = ['write-host "test"', 'write-host "Still alive?"'];
const supplementals = require('./supplementals');

Win.set.preferences({
    appManagerRefreshInterval: 2500,
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
    donation: {
        path: Win.path`"C:\Program Files\BOINC\boincmgr.exe"`
    }
})

Win.appManager.register.group({
    "test": {
        apps: ["Pad", "donation"],
        onLaunch: function() {
            console.log('test launch');
        }
    }
}); 


Win.appManager.kill.group('test');

 */
 let com = 'get-process "Code" | select ProcessName, MainWindowTitle';
let note = 'get-process "notepad" | select ProcessName, MainWindowTitle';

Win.PowerShell([...x, note], (result, err) => {
    console.log('\n');
    console.log('result ', result);
}, { noLog: true, id: 'test', suppressErrors: true, keepAlive: true });


Win.PowerShell.newCommand( 'Start-Sleep 2', (result, err) => {
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


Win.PowerShell('ls', result => {
    console.log('result 2 ', result);
}, { noLog: true, id: 'test2', suppressErrors: true, keepAlive: false }); 
 

Win.PowerShell(`
$app = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe'

[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]

$Template = [Windows.UI.Notifications.ToastTemplateType]::ToastImageAndText01

#Gets the Template XML so we can manipulate the values

[xml]$ToastTemplate = ([Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent($Template).GetXml())


[xml]$ToastTemplate = @"

<toast launch="app-defined-string">

  <visual>

    <binding template="ToastGeneric">

      <text>DNS Alert...</text>

      <text>We noticed that you are near Wasaki. Thomas left a 5 star rating after his last visit, do you want to try it?</text>

    </binding>

  </visual>

  <actions>

    <action activationType="background" content="Remind me later" arguments="later"/>

  </actions>

</toast>

"@


$ToastXml = New-Object -TypeName Windows.Data.Xml.Dom.XmlDocument

$ToastXml.LoadXml($ToastTemplate.OuterXml)

$notify = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($app)

$notify.Show($ToastXml)`, () => {
    
    }, { keepAlive: true, id: 'test 3', noLog: true, suppressErrors: true });


    Win.log('Testing', 'Something')

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