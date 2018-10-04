const Win = require('./windows-interact.js');
const AudioDevicesCmdlets = {
	install: () => {
		Win.log('Installing AudioDevicesCmdlets. This allows for richer control over audio devices');
		// This allows for more detailed information and more advanced control over audio devices

		Win.PowerShell([
			'New-Item "$($profile | split-path)\\Modules\\AudioDeviceCmdlets" -Type directory -Force',
			'Copy-Item "' + __dirname + '\\AudioDeviceCmdlets.dll" "$($profile | split-path)\\Modules\\AudioDeviceCmdlets\\AudioDeviceCmdlets.dll"',
			'Set-Location "$($profile | Split-Path)\\Modules\\AudioDeviceCmdlets"',
			'Get-ChildItem | Unblock-File', 'Import-Module AudioDeviceCmdlets'
		], () => {
			AudioDevicesCmdlets.checkInstall();
		}, { noLog: true, suppressErrors: true });
	},
	checkInstall: () => {
		Win.PowerShell('Get-AudioDevice -List', result => {
			if (result.includes('Index')) {
				Win.log('AudioDevicesCmdlets is installed correctly.');
				return true;
			} else {
				Win.error('The AudioDevicesCmdlet did not installed correctly. Please reinstall windows-interact using a privileged command line. If this does not install, you will not have audio device management functionality.');
			}
		}, { noLog: true, suppressErrors: true });
	}
}

AudioDevicesCmdlets.install();