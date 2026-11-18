# Screen-sharing privacy

## Purpose

The desktop app can ask the operating system to exclude its own windows from supported screen-capture paths. This is intended to reduce accidental disclosure of private candidate documents, notes, credentials, and other app content during a screen share or recording.

This is a privacy aid, not a guarantee. It must not be used to bypass interview rules, proctoring, employer monitoring, or a participant's expectations.

## Implementation

- Electron's main process owns the setting and calls `BrowserWindow.setContentProtection(enabled)` for every existing app window.
- Newly created windows receive the current setting immediately after construction.
- The setting is user-controlled, enabled by default, and persisted in the Electron user-data directory in `desktop-settings.json`.
- The renderer accesses the setting only through the typed, context-isolated preload bridge. It never receives unrestricted Electron or Node.js APIs.
- The UI reports whether the current platform is one where this feature is supported and displays the limitation message.

## Platform behavior and limitations

- **Windows:** Electron delegates to operating-system capture-exclusion behavior. Support depends on the Windows version and the capture API used by the screen-sharing or recording application.
- **macOS:** Electron requests the platform's content-protection behavior. Capture behavior can still vary by API and application.
- **Linux:** equivalent support is not provided by this implementation. Assume app windows may be visible in screen shares.

No implementation can promise that a window is invisible to every capture method. Users must verify the behavior with the specific screen-sharing software and follow the applicable meeting or interview rules.

## User experience requirements

1. Protection is enabled by default.
2. The user can turn it on or off in the app.
3. The app explains that support is best-effort and platform-dependent.
4. The app must not hide itself from the taskbar, manipulate meeting software, suppress capture indicators, or claim to be undetectable.
5. Audio capture, if/when implemented, must have a separate, persistent visible capture indicator and emergency stop.
6. Do not use this feature to conceal prohibited assistance or evade monitoring.

## Manual acceptance checklist

- [ ] On Windows 11, enable protection and verify the app window is excluded from a supported OS capture path.
- [ ] Repeat with the actual meeting/screen-sharing client; document whether its capture method honors the OS hint.
- [ ] Disable protection and verify the app returns to normal capture behavior.
- [ ] Restart the app and confirm the selected setting persists.
- [ ] Open a second app window and confirm the same setting is applied.
- [ ] On Linux, confirm the UI clearly warns that equivalent protection is unavailable.
- [ ] Do not describe the result as guaranteed or undetectable.
