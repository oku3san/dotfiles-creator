import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadContext } from './helpers.mjs';

const ctx = loadContext();

// Helper: reset zsh state to known defaults
function reset() {
  const a = ctx.getZshAnswers();
  a.pluginManager = null;
  a.historySize = 10000;
  a.saveHistory = 10000;
  a.shareHistory = true;
  a.histIgnoreDups = true;
  a.autoMenu = true;
  a.caseSensitive = false;
  a.keymap = null;
  a.theme = null;
  a.plugins = [];
  a.aliases = [];
}

// ── generateZshConfig ──────────────────────────────────
describe('generateZshConfig', () => {
  test('output contains zsh header comment', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'none';
    const config = ctx.generateZshConfig();
    assert.match(config, /# zsh Configuration/);
  });

  test('oh-my-zsh: exports ZSH home path', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'oh-my-zsh';
    const config = ctx.generateZshConfig();
    assert.match(config, /export ZSH="\$HOME\/.oh-my-zsh"/);
  });

  test('oh-my-zsh: sources oh-my-zsh.sh', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'oh-my-zsh';
    const config = ctx.generateZshConfig();
    assert.match(config, /source \$ZSH\/oh-my-zsh\.sh/);
  });

  test('oh-my-zsh: custom theme is set via ZSH_THEME', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'oh-my-zsh';
    ctx.getZshAnswers().theme = 'agnoster';
    const config = ctx.generateZshConfig();
    assert.match(config, /ZSH_THEME="agnoster"/);
  });

  test('oh-my-zsh: no theme falls back to robbyrussell', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'oh-my-zsh';
    ctx.getZshAnswers().theme = null;
    const config = ctx.generateZshConfig();
    assert.match(config, /ZSH_THEME="robbyrussell"/);
  });

  test('oh-my-zsh: selected plugins appear in plugins=(...)', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'oh-my-zsh';
    ctx.getZshAnswers().plugins = ['git', 'docker'];
    const config = ctx.generateZshConfig();
    assert.match(config, /plugins=\(git docker\)/);
  });

  test('zinit: includes clone command for zinit', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'zinit';
    const config = ctx.generateZshConfig();
    assert.match(config, /git clone.*zinit/);
  });

  test('zinit: zsh-autosuggestions plugin generates zinit light line', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'zinit';
    ctx.getZshAnswers().plugins = ['zsh-autosuggestions'];
    const config = ctx.generateZshConfig();
    assert.match(config, /zinit light zsh-users\/zsh-autosuggestions/);
  });

  test('zinit: powerlevel10k uses zinit ice depth=1', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'zinit';
    ctx.getZshAnswers().plugins = ['powerlevel10k'];
    const config = ctx.generateZshConfig();
    assert.match(config, /zinit ice depth=1/);
    assert.match(config, /zinit light romkatv\/powerlevel10k/);
  });

  test('no plugin manager: does not include oh-my-zsh or zinit setup', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'none';
    const config = ctx.generateZshConfig();
    assert.doesNotMatch(config, /oh-my-zsh/);
    assert.doesNotMatch(config, /zinit/);
  });

  test('historySize is reflected in HISTSIZE', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'none';
    ctx.getZshAnswers().historySize = 5000;
    const config = ctx.generateZshConfig();
    assert.match(config, /HISTSIZE=5000/);
  });

  test('shareHistory true adds SHARE_HISTORY setopt', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'none';
    ctx.getZshAnswers().shareHistory = true;
    const config = ctx.generateZshConfig();
    assert.match(config, /setopt SHARE_HISTORY/);
  });

  test('shareHistory false omits SHARE_HISTORY setopt', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'none';
    ctx.getZshAnswers().shareHistory = false;
    const config = ctx.generateZshConfig();
    assert.doesNotMatch(config, /setopt SHARE_HISTORY/);
  });

  test('caseSensitive false adds case-insensitive zstyle matcher', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'none';
    ctx.getZshAnswers().caseSensitive = false;
    const config = ctx.generateZshConfig();
    assert.match(config, /matcher-list/);
  });

  test('vi keymap adds "bindkey -v"', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'none';
    ctx.getZshAnswers().keymap = 'vi';
    const config = ctx.generateZshConfig();
    assert.match(config, /bindkey -v/);
  });

  test('emacs keymap adds "bindkey -e"', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'none';
    ctx.getZshAnswers().keymap = 'emacs';
    const config = ctx.generateZshConfig();
    assert.match(config, /bindkey -e/);
  });

  test('ls aliases include ll and la', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'none';
    ctx.getZshAnswers().aliases = ['ls'];
    const config = ctx.generateZshConfig();
    assert.match(config, /alias ll="ls -lh"/);
    assert.match(config, /alias la="ls -A"/);
  });

  test('git aliases include gst and gco', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'none';
    ctx.getZshAnswers().aliases = ['git'];
    const config = ctx.generateZshConfig();
    assert.match(config, /alias gst="git status"/);
    assert.match(config, /alias gco="git checkout"/);
  });

  test('safety aliases include rm -i', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'none';
    ctx.getZshAnswers().aliases = ['safety'];
    const config = ctx.generateZshConfig();
    assert.match(config, /alias rm="rm -i"/);
  });

  test('no aliases selected: no alias section', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'none';
    ctx.getZshAnswers().aliases = [];
    const config = ctx.generateZshConfig();
    assert.doesNotMatch(config, /^# Aliases$/m);
  });

  test('oh-my-zsh with zsh-autosuggestions: includes install note', () => {
    reset();
    ctx.getZshAnswers().pluginManager = 'oh-my-zsh';
    ctx.getZshAnswers().plugins = ['zsh-autosuggestions'];
    const config = ctx.generateZshConfig();
    assert.match(config, /Install zsh-autosuggestions/);
  });
});
