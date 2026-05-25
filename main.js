'use strict';

const { Plugin, Notice } = require('obsidian');

const RESTORE_HOTKEY = 'Control+Shift+Alt+O';
const DEFAULT_SETTINGS = { enabled: false };

function getRemote() {
    try {
        const electron = require('electron');
        if (electron && electron.remote) return electron.remote;
    } catch (e) {}
    try {
        const r = require('@electron/remote');
        if (r) return r;
    } catch (e) {}
    try {
        if (typeof window !== 'undefined' && window.electron && window.electron.remote) {
            return window.electron.remote;
        }
    } catch (e) {}
    return null;
}

class CaptureShieldPlugin extends Plugin {
    async onload() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

        this.remote = getRemote();
        if (!this.remote) {
            new Notice('Capture Shield: cannot access Electron remote. Plugin disabled.');
            return;
        }
        try { this.win = this.remote.getCurrentWindow(); } catch (e) { this.win = null; }
        if (!this.win) {
            new Notice('Capture Shield: cannot access window. Plugin disabled.');
            return;
        }

        this.applyState(this.settings.enabled, true);
        this.registerRestoreHotkey();

        this.statusEl = this.addStatusBarItem();
        this.statusEl.style.cursor = 'pointer';
        this.statusEl.onclick = () => this.toggle();
        this.renderStatus();

        this.addRibbonIcon('eye-off', 'Toggle Capture Shield', () => this.toggle());

        this.addCommand({
            id: 'toggle-capture-shield',
            name: 'Toggle hide (capture + taskbar)',
            callback: () => this.toggle(),
        });

        this.addCommand({
            id: 'show-window',
            name: 'Restore / focus Obsidian window',
            callback: () => this.showWindow(),
        });
    }

    onunload() {
        try { this.win && this.win.setContentProtection(false); } catch (e) {}
        try { this.win && this.win.setSkipTaskbar(false); } catch (e) {}
        try {
            if (this.remote && this.remote.globalShortcut) {
                this.remote.globalShortcut.unregister(RESTORE_HOTKEY);
            }
        } catch (e) {}
    }

    toggle() {
        this.applyState(!this.settings.enabled);
    }

    async applyState(enabled, silent) {
        if (!this.win) return;
        try {
            this.win.setContentProtection(!!enabled);
            this.win.setSkipTaskbar(!!enabled);
            this.settings.enabled = !!enabled;
            await this.saveData(this.settings);
            this.renderStatus();
            if (!silent) {
                new Notice(
                    'Capture Shield: ' +
                    (enabled
                        ? 'HIDDEN. Restore: ' + RESTORE_HOTKEY
                        : 'visible')
                );
            }
        } catch (e) {
            new Notice('Capture Shield error: ' + (e && e.message ? e.message : String(e)));
        }
    }

    registerRestoreHotkey() {
        try {
            if (!this.remote || !this.remote.globalShortcut) return;
            this.remote.globalShortcut.unregister(RESTORE_HOTKEY);
            const ok = this.remote.globalShortcut.register(RESTORE_HOTKEY, () => this.showWindow());
            if (!ok) {
                new Notice('Capture Shield: could not register hotkey ' + RESTORE_HOTKEY + ' (taken by another app?)');
            }
        } catch (e) {}
    }

    showWindow() {
        try {
            if (this.win.isMinimized()) this.win.restore();
            this.win.show();
            this.win.focus();
            this.win.moveTop();
            this.win.setAlwaysOnTop(true);
            setTimeout(() => { try { this.win.setAlwaysOnTop(false); } catch (e) {} }, 200);
        } catch (e) {}
    }

    renderStatus() {
        if (!this.statusEl) return;
        this.statusEl.setText(this.settings.enabled ? 'Shield: ON' : 'Shield: off');
        this.statusEl.title = 'Click to toggle. Restore hotkey: ' + RESTORE_HOTKEY;
    }
}

module.exports = CaptureShieldPlugin;
