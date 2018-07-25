const Win = require('windows-interact');
const AudioDevicesCmdlets = {
	install: () => {
		// This allows for more detailed information and more advanced control over audio devices
		Win.PowerShell(['New-Item "$($profile | split-path)\\Modules\\AudioDeviceCmdlets" -Type directory -Force', 'Copy-Item "' + __dirname + '\\AudioDevicesCmdlets.dll" "$($profile | split-path)\\Modules\\AudioDeviceCmdlets\\AudioDeviceCmdlets.dll'], { noLog: true });
		Win.PowerShell(['Set-Location "$($profile | Split-Path)\\Modules\\AudioDeviceCmdlets"', 'Get-ChildItem | Unblock-File', 'Import-Module AudioDeviceCmdlets'], { noLog: true }, () => {
			Win.log('AudioDevicesCmdlets should now be installed. Checking...');
			AudioDevicesCmdlets.checkInstall();
		});
	},
	checkInstall: () => {
		Win.PowerShell('Get-AudioDevice -List', result => {
			if (result.includes('list')) {
				
				return true;
			} else {
				Win.error('The AudioDevicesCmdlet is not installed correctly');
			}
		}, { noLog: true });
	}
}

AudioDevicesCmdlets.install();