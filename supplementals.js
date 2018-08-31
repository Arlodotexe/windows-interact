// Detect if audio is playing
const AudioDetection = `Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

namespace Win
{
    public class Sound
    {
        public static bool IsWindowsPlayingSound()
        {
            IMMDeviceEnumerator enumerator = (IMMDeviceEnumerator)(new MMDeviceEnumerator());
            IMMDevice speakers = enumerator.GetDefaultAudioEndpoint(EDataFlow.eRender, ERole.eMultimedia);
            IAudioMeterInformation meter = (IAudioMeterInformation)speakers.Activate(typeof(IAudioMeterInformation).GUID, 0, IntPtr.Zero);
            float value = meter.GetPeakValue();
            return value > 1E-08;
        }

        [ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
        private class MMDeviceEnumerator
        {
        }

        private enum EDataFlow
        {
            eRender,
            eCapture,
            eAll,
        }

        private enum ERole
        {
            eConsole,
            eMultimedia,
            eCommunications,
        }

        [InterfaceType(ComInterfaceType.InterfaceIsIUnknown), Guid("A95664D2-9614-4F35-A746-DE8DB63617E6")]
        private interface IMMDeviceEnumerator
        {
            void NotNeeded();
            IMMDevice GetDefaultAudioEndpoint(EDataFlow dataFlow, ERole role);
        }

        [InterfaceType(ComInterfaceType.InterfaceIsIUnknown), Guid("D666063F-1587-4E43-81F1-B948E807363F")]
        private interface IMMDevice
        {
            [return: MarshalAs(UnmanagedType.IUnknown)]
            object Activate([MarshalAs(UnmanagedType.LPStruct)] Guid iid, int dwClsCtx, IntPtr pActivationParams);
        }

        [InterfaceType(ComInterfaceType.InterfaceIsIUnknown), Guid("C02216F6-8C67-4B5B-9D00-D008E73E0064")]
        private interface IAudioMeterInformation
        {
            float GetPeakValue();
        }
    }
}
'@;
[Win.Sound]::IsWindowsPlayingSound()`;

const lastInput = `Add-Type @'
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
namespace PInvoke.Win32 {
	public static class UserInput { [DllImport("user32.dll", SetLastError = false)] private static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
		[StructLayout(LayoutKind.Sequential)] private struct LASTINPUTINFO {
			public uint cbSize;
			public int dwTime;
		}
		public static DateTime LastInput {
			get {
				DateTime bootTime = DateTime.UtcNow.AddMilliseconds( - Environment.TickCount);
				DateTime lastInput = bootTime.AddMilliseconds(LastInputTicks);
				return lastInput;
			}
		}
		public static TimeSpan IdleTime {
			get {
				return DateTime.UtcNow.Subtract(LastInput);
			}
		}
		public static int LastInputTicks {
			get {
				LASTINPUTINFO lii = new LASTINPUTINFO();
				lii.cbSize = (uint) Marshal.SizeOf(typeof(LASTINPUTINFO));
				GetLastInputInfo(ref lii);
				return lii.dwTime;
			}
		}
	}
}
'@

Write-Host ("Idle for " + [PInvoke.Win32.UserInput]::IdleTime)`;

const supplementals = {
    lastInput:  lastInput,
    AudioDetection: AudioDetection
}

module.exports = supplementals;