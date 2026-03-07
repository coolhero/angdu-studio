/**
 * Platform detection utilities.
 */

export function isMacOS(): boolean {
  return process.platform === 'darwin'
}

export function isWindows(): boolean {
  return process.platform === 'win32'
}

export function isLinux(): boolean {
  return process.platform === 'linux'
}

/**
 * Checks if the app is running as an AppImage on Linux.
 * The APPIMAGE env var is set automatically by AppImage runtime.
 */
export function isAppImage(): boolean {
  return isLinux() && !!process.env.APPIMAGE
}
