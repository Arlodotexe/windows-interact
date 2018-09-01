# Changelog
I only started keeping a changelog for Windows Interact as of 1.1.7, but if you really want to see all the changes across all of the released versions, you can compare different versions of README.md in Github.

## 1.1.7
---
New in this version:
 - Added support for the native Windows File Picker
 - Added method for playing/stopping audio files
 - Added Win.prompt as a replacement for the browser's `prompt()`
 - An upgrade for managing and getting info about Audio Devices:
    - Retrieve information about audio devices 
    - Check/Set volume levels
    - Check/Set mute status
    - Check/Set default device
    - All of the above are available for input AND output devices!

 What's changed: 
 - Dependency on robot.js has been removed. Huzzah!
 - Removed `Win.Cortana()`. This hasn't been working on slower machines (my bad) and would require a massive amount of work to do properly. Likely to return in a future update.
 - `Win.pauseMedia()` is now `Win.toggleMediaPlayback()`
 - Complete rewrite of Win.PowerShell. There was a lot of issue with the previous implementation when it came to string parsing. Not only is it fixed now, but you can also run multiple commands in the same powershell process before closing it by passing in an array.
 - Removed `httpUrls` in preferences. I realized that I reinvented variables. Oops.
