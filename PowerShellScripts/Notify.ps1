$app = '{6D809377-6AF0-444B-8957-A3773F02200E}\nodejs\node.exe'
$title = $args[0];
$message = $args[1];
$image = $args[2];

[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]

$Template = [Windows.UI.Notifications.ToastTemplateType]::ToastImageAndText01

#Gets the Template XML so we can manipulate the values

[xml]$ToastTemplate = ([Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent($Template).GetXml())

if (Test-Path Variable:\image) { 
  
    [xml]$ToastTemplate = @"
<toast launch="app-defined-string">
<visual>
  <binding template="ToastGeneric">
    <text>$title</text>
    <text>$message</text>
    <image src="$image"> </image>
  </binding>
</visual>
<actions>
  <action activationType="background" content="Dismiss" arguments="later"/>
</actions>
</toast>
"@
}
else {
    [xml]$ToastTemplate = @"
  <toast launch="app-defined-string">
  <visual>
    <binding template="ToastGeneric">
      <text>$title</text>
      <text>$message</text>
    </binding>
  </visual>
  <actions>
    <action activationType="background" content="Dismiss" arguments="later"/>
  </actions>
  </toast>
"@
}


$ToastXml = New-Object -TypeName Windows.Data.Xml.Dom.XmlDocument

$ToastXml.LoadXml($ToastTemplate.OuterXml)

$notify = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($app)

$notify.Show($ToastXml)