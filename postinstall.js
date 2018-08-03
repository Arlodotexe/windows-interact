const Win = require('./windows-interact.js');
const AudioDevicesCmdlets = {
	install: () => {
		Win.log('Installing AudioDevicesCmdlets. This allows for more advanced control over audio devices');
		// This allows for more detailed information and more advanced control over audio devices
		Win.PowerShell(['New-Item "$($profile | split-path)\\Modules\\AudioDeviceCmdlets" -Type directory -Force', 'Copy-Item "' + __dirname + '\\AudioDevicesCmdlets.dll" "$($profile | split-path)\\Modules\\AudioDeviceCmdlets\\AudioDeviceCmdlets.dll'], { noLog: true });
		Win.PowerShell(['Set-Location "$($profile | Split-Path)\\Modules\\AudioDeviceCmdlets"', 'Get-ChildItem | Unblock-File', 'Import-Module AudioDeviceCmdlets'], () => {
			AudioDevicesCmdlets.checkInstall();
		}, { noLog: true });
	},
	checkInstall: () => {
		Win.PowerShell('Get-AudioDevice -List', result => {
			if (result.includes('Index')) {
				Win.log('AudioDevicesCmdlets is installed correctly.');
				return true;
			} else {
				Win.error('The AudioDevicesCmdlet did not installed correctly. Please reinstall windows-interact using a privileged account. If this does not install, you will lose audio device management functionality.');
			}
		}, { noLog: true });
	}
}

AudioDevicesCmdlets.install();