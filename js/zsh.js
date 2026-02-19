// ── zsh plugins section (Step 2) ──────────────────────
function buildZshPluginsSection() {
  const container = document.getElementById('zsh-plugins-container');
  if (!container) return;
  container.innerHTML = '';

  const pluginManager = zshAnswers.pluginManager;

  if (pluginManager === 'oh-my-zsh') {
    // Oh My Zsh: Theme + Plugins
    const themeSection = document.createElement('div');
    themeSection.className = 'detail-section';
    themeSection.innerHTML = `
      <h3>テーマ</h3>
      <div class="options" data-key="zsh-theme" data-type="radio">
        <div class="option" data-value="robbyrussell">
          <div class="option-radio"></div>
          <div class="option-label">robbyrussell<small>デフォルトのシンプルなテーマ</small></div>
        </div>
        <div class="option" data-value="agnoster">
          <div class="option-radio"></div>
          <div class="option-label">agnoster<small>パワーライン風のテーマ</small></div>
        </div>
        <div class="option" data-value="powerlevel10k">
          <div class="option-radio"></div>
          <div class="option-label">powerlevel10k<small>高速でカスタマイズ可能なテーマ</small></div>
        </div>
        <div class="option" data-value="bureau">
          <div class="option-radio"></div>
          <div class="option-label">bureau<small>Git情報が豊富なテーマ</small></div>
        </div>
      </div>
    `;
    container.appendChild(themeSection);

    const pluginsSection = document.createElement('div');
    pluginsSection.className = 'detail-section';
    pluginsSection.innerHTML = `
      <h3>プラグイン</h3>
      <div class="options" data-key="zsh-plugins" data-type="checkbox">
        <div class="option" data-value="git">
          <div class="option-check"></div>
          <div class="option-label">git<small>Git エイリアスとヘルパー</small></div>
        </div>
        <div class="option" data-value="zsh-autosuggestions">
          <div class="option-check"></div>
          <div class="option-label">zsh-autosuggestions<small>コマンド履歴からの自動提案</small></div>
        </div>
        <div class="option" data-value="zsh-syntax-highlighting">
          <div class="option-check"></div>
          <div class="option-label">zsh-syntax-highlighting<small>コマンドのシンタックスハイライト</small></div>
        </div>
        <div class="option" data-value="autojump">
          <div class="option-check"></div>
          <div class="option-label">autojump<small>ディレクトリへの高速ジャンプ</small></div>
        </div>
        <div class="option" data-value="docker">
          <div class="option-check"></div>
          <div class="option-label">docker<small>Docker コマンドの補完</small></div>
        </div>
        <div class="option" data-value="docker-compose">
          <div class="option-check"></div>
          <div class="option-label">docker-compose<small>Docker Compose の補完</small></div>
        </div>
        <div class="option" data-value="kubectl">
          <div class="option-check"></div>
          <div class="option-label">kubectl<small>Kubernetes の補完</small></div>
        </div>
        <div class="option" data-value="npm">
          <div class="option-check"></div>
          <div class="option-label">npm<small>npm の補完とエイリアス</small></div>
        </div>
        <div class="option" data-value="yarn">
          <div class="option-check"></div>
          <div class="option-label">yarn<small>Yarn の補完とエイリアス</small></div>
        </div>
      </div>
    `;
    container.appendChild(pluginsSection);

  } else if (pluginManager === 'zinit') {
    // Zinit: Plugins only
    const pluginsSection = document.createElement('div');
    pluginsSection.className = 'detail-section';
    pluginsSection.innerHTML = `
      <h3>プラグイン</h3>
      <div class="options" data-key="zsh-plugins" data-type="checkbox">
        <div class="option" data-value="zsh-autosuggestions">
          <div class="option-check"></div>
          <div class="option-label">zsh-autosuggestions<small>コマンド履歴からの自動提案</small></div>
        </div>
        <div class="option" data-value="zsh-syntax-highlighting">
          <div class="option-check"></div>
          <div class="option-label">zsh-syntax-highlighting<small>コマンドのシンタックスハイライト</small></div>
        </div>
        <div class="option" data-value="fast-syntax-highlighting">
          <div class="option-check"></div>
          <div class="option-label">fast-syntax-highlighting<small>高速なシンタックスハイライト</small></div>
        </div>
        <div class="option" data-value="zsh-completions">
          <div class="option-check"></div>
          <div class="option-label">zsh-completions<small>追加の補完定義</small></div>
        </div>
        <div class="option" data-value="powerlevel10k">
          <div class="option-check"></div>
          <div class="option-label">powerlevel10k<small>高速でカスタマイズ可能なテーマ</small></div>
        </div>
      </div>
    `;
    container.appendChild(pluginsSection);

  } else if (pluginManager === 'none') {
    // No plugin manager: Just a note
    const note = document.createElement('p');
    note.className = 'detail-note';
    note.textContent = 'プラグインマネージャーを使用しないため、基本的な設定のみが生成されます。';
    container.appendChild(note);
  }

  // Attach event listeners only for newly generated elements
  setupDynamicOptions(container);
}

// ── zsh config generation ─────────────────────────────
function generateZshConfig() {
  const lines = [];

  lines.push('# zsh Configuration');
  lines.push('# Generated by Dotfiles Config Generator');
  lines.push('');

  const pluginManager = zshAnswers.pluginManager;

  // Plugin manager setup
  if (pluginManager === 'oh-my-zsh') {
    lines.push('# Path to oh-my-zsh installation');
    lines.push('export ZSH="$HOME/.oh-my-zsh"');
    lines.push('');

    // Theme
    if (zshAnswers.theme) {
      lines.push('# Theme');
      lines.push(`ZSH_THEME="${zshAnswers.theme}"`);
      lines.push('');
    } else {
      lines.push('ZSH_THEME="robbyrussell"');
      lines.push('');
    }

    // Plugins
    if (zshAnswers.plugins.length > 0) {
      lines.push('# Plugins');
      lines.push(`plugins=(${zshAnswers.plugins.join(' ')})`);
      lines.push('');
    }

    lines.push('source $ZSH/oh-my-zsh.sh');
    lines.push('');

  } else if (pluginManager === 'zinit') {
    lines.push('# Zinit installation');
    lines.push('ZINIT_HOME="${XDG_DATA_HOME:-${HOME}/.local/share}/zinit/zinit.git"');
    lines.push('[ ! -d $ZINIT_HOME ] && mkdir -p "$(dirname $ZINIT_HOME)"');
    lines.push('[ ! -d $ZINIT_HOME/.git ] && git clone https://github.com/zdharma-continuum/zinit.git "$ZINIT_HOME"');
    lines.push('source "${ZINIT_HOME}/zinit.zsh"');
    lines.push('');

    // Plugins
    if (zshAnswers.plugins.length > 0) {
      lines.push('# Plugins');
      if (zshAnswers.plugins.includes('powerlevel10k')) {
        lines.push('zinit ice depth=1; zinit light romkatv/powerlevel10k');
      }
      if (zshAnswers.plugins.includes('zsh-autosuggestions')) {
        lines.push('zinit light zsh-users/zsh-autosuggestions');
      }
      if (zshAnswers.plugins.includes('zsh-syntax-highlighting')) {
        lines.push('zinit light zsh-users/zsh-syntax-highlighting');
      }
      if (zshAnswers.plugins.includes('fast-syntax-highlighting')) {
        lines.push('zinit light zdharma-continuum/fast-syntax-highlighting');
      }
      if (zshAnswers.plugins.includes('zsh-completions')) {
        lines.push('zinit light zsh-users/zsh-completions');
      }
      lines.push('');
    }
  }

  // History settings
  lines.push('# History configuration');
  lines.push(`HISTSIZE=${zshAnswers.historySize}`);
  lines.push(`SAVEHIST=${zshAnswers.saveHistory}`);
  lines.push('HISTFILE=~/.zsh_history');
  if (zshAnswers.shareHistory) {
    lines.push('setopt SHARE_HISTORY');
  }
  if (zshAnswers.histIgnoreDups) {
    lines.push('setopt HIST_IGNORE_DUPS');
    lines.push('setopt HIST_IGNORE_ALL_DUPS');
  }
  lines.push('setopt HIST_SAVE_NO_DUPS');
  lines.push('setopt HIST_FIND_NO_DUPS');
  lines.push('');

  // Completion settings
  lines.push('# Completion configuration');
  lines.push('autoload -Uz compinit');
  lines.push('compinit');
  if (zshAnswers.autoMenu) {
    lines.push('setopt AUTO_MENU');
  }
  if (!zshAnswers.caseSensitive) {
    lines.push('zstyle ":completion:*" matcher-list "m:{a-z}={A-Za-z}"');
  }
  lines.push('zstyle ":completion:*" menu select');
  lines.push('');

  // Keymap
  if (zshAnswers.keymap) {
    lines.push('# Key bindings');
    if (zshAnswers.keymap === 'vi') {
      lines.push('bindkey -v');
    } else if (zshAnswers.keymap === 'emacs') {
      lines.push('bindkey -e');
    }
    lines.push('');
  }

  // Aliases
  if (zshAnswers.aliases.length > 0) {
    lines.push('# Aliases');

    if (zshAnswers.aliases.includes('ls')) {
      lines.push('# ls aliases');
      lines.push('alias ll="ls -lh"');
      lines.push('alias la="ls -A"');
      lines.push('alias lla="ls -lAh"');
      lines.push('alias l="ls -CF"');
    }

    if (zshAnswers.aliases.includes('git')) {
      lines.push('# Git aliases');
      lines.push('alias gst="git status"');
      lines.push('alias gco="git checkout"');
      lines.push('alias gcb="git checkout -b"');
      lines.push('alias gaa="git add --all"');
      lines.push('alias gcm="git commit -m"');
      lines.push('alias gp="git push"');
      lines.push('alias gpl="git pull"');
      lines.push('alias glog="git log --oneline --graph --decorate"');
    }

    if (zshAnswers.aliases.includes('docker')) {
      lines.push('# Docker aliases');
      lines.push('alias dk="docker"');
      lines.push('alias dkc="docker-compose"');
      lines.push('alias dkps="docker ps"');
      lines.push('alias dkpsa="docker ps -a"');
      lines.push('alias dki="docker images"');
      lines.push('alias dkrm="docker rm"');
      lines.push('alias dkrmi="docker rmi"');
    }

    if (zshAnswers.aliases.includes('navigation')) {
      lines.push('# Navigation aliases');
      lines.push('alias ..="cd .."');
      lines.push('alias ...="cd ../.."');
      lines.push('alias ....="cd ../../.."');
      lines.push('alias .....="cd ../../../.."');
    }

    if (zshAnswers.aliases.includes('safety')) {
      lines.push('# Safety aliases');
      lines.push('alias rm="rm -i"');
      lines.push('alias cp="cp -i"');
      lines.push('alias mv="mv -i"');
    }

    lines.push('');
  }

  // Additional notes
  if (pluginManager === 'oh-my-zsh') {
    lines.push('# Note: Install oh-my-zsh first:');
    lines.push('# sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"');
    lines.push('');
    if (zshAnswers.plugins.includes('zsh-autosuggestions')) {
      lines.push('# Install zsh-autosuggestions:');
      lines.push('# git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions');
      lines.push('');
    }
    if (zshAnswers.plugins.includes('zsh-syntax-highlighting')) {
      lines.push('# Install zsh-syntax-highlighting:');
      lines.push('# git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting');
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ── zsh result rendering ──────────────────────────────
function renderZshResult() {
  const config = generateZshConfig();
  document.getElementById('zsh-config-output').innerHTML = highlightZsh(config);
}

function copyZshConfig() {
  const text = document.getElementById('zsh-config-output').innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast('コピーしました');
  }).catch(() => {
    showToast('コピーに失敗しました');
  });
}

function downloadZshConfig() {
  const text = document.getElementById('zsh-config-output').innerText;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '.zshrc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
