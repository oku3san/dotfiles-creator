// ── Option click handlers ─────────────────────────────
function setupOptions() {
  // Radio options
  document.querySelectorAll('.options[data-type="radio"]').forEach(container => {
    const key = container.dataset.key;
    container.querySelectorAll('.option').forEach(option => {
      option.addEventListener('click', () => {
        container.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');

        // Tool selection
        if (key === 'tool') {
          const btn = document.getElementById('btn-select-tool');
          if (btn) btn.disabled = false;
          return;
        }

        // tmux options
        if (key.startsWith('tmux-')) {
          const tmuxKey = key.replace('tmux-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          tmuxAnswers[tmuxKey] = option.dataset.value;
          const stepEl = option.closest('.step');
          const stepId = stepEl?.id;
          if (stepId === 'tmux-step-0') updateTmuxNextButton(0);
          if (stepId === 'tmux-step-1') updateTmuxNextButton(1);
          if (stepId === 'tmux-step-2') updateTmuxNextButton(2);
          return;
        }

        // zsh options
        if (key.startsWith('zsh-')) {
          const zshKey = key.replace('zsh-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          zshAnswers[zshKey] = option.dataset.value;
          const stepEl = option.closest('.step');
          const stepId = stepEl?.id;
          if (stepId === 'zsh-step-0') updateZshNextButton(0);
          if (stepId === 'zsh-step-1') updateZshNextButton(1);
          return;
        }

        // neovim options
        if (key.startsWith('neovim-')) {
          const nvimKey = key.replace('neovim-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          neovimAnswers[nvimKey] = option.dataset.value;
          const stepEl = option.closest('.step');
          const stepId = stepEl?.id;
          if (stepId === 'neovim-step-0') updateNeovimNextButton(0);
          if (stepId === 'neovim-step-2') updateNeovimNextButton(2);
          if (stepId === 'neovim-step-3') updateNeovimNextButton(3);
          return;
        }

        // Starship options
        answers[key] = option.dataset.value;
        // Clear custom character if a preset is selected
        if (key === 'character' && option.dataset.value !== 'custom') {
          answers.customCharacter = '';
          const customInput = document.getElementById('custom-char-input');
          if (customInput) customInput.value = '';
        }
        const stepEl = option.closest('.step');
        const stepIndex = parseInt(stepEl.id.replace('step-', ''), 10);
        updateNextButton(stepIndex);
      });
    });
  });

  // Checkbox options
  document.querySelectorAll('.options[data-type="checkbox"]').forEach(container => {
    const key = container.dataset.key;
    container.querySelectorAll('.option').forEach(option => {
      option.addEventListener('click', () => {
        option.classList.toggle('selected');
        const val = option.dataset.value;

        // tmux checkboxes
        if (key.startsWith('tmux-')) {
          const tmuxKey = key.replace('tmux-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          if (option.classList.contains('selected')) {
            if (!tmuxAnswers[tmuxKey].includes(val)) tmuxAnswers[tmuxKey].push(val);
          } else {
            tmuxAnswers[tmuxKey] = tmuxAnswers[tmuxKey].filter(v => v !== val);
          }
          return;
        }

        // zsh checkboxes
        if (key.startsWith('zsh-')) {
          const zshKey = key.replace('zsh-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          if (option.classList.contains('selected')) {
            if (!zshAnswers[zshKey].includes(val)) zshAnswers[zshKey].push(val);
          } else {
            zshAnswers[zshKey] = zshAnswers[zshKey].filter(v => v !== val);
          }
          return;
        }

        // neovim checkboxes
        if (key.startsWith('neovim-')) {
          const nvimKey = key.replace('neovim-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          if (option.classList.contains('selected')) {
            if (!neovimAnswers[nvimKey].includes(val)) neovimAnswers[nvimKey].push(val);
          } else {
            neovimAnswers[nvimKey] = neovimAnswers[nvimKey].filter(v => v !== val);
          }
          return;
        }

        // Starship checkboxes
        if (option.classList.contains('selected')) {
          if (!answers[key].includes(val)) answers[key].push(val);
        } else {
          answers[key] = answers[key].filter(v => v !== val);
        }
      });
    });
  });

  // Color swatches
  document.querySelectorAll('.color-options[data-type="color"]').forEach(container => {
    const key = container.dataset.key;
    container.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
        answers[key] = swatch.dataset.value;
        answers.customColor = '';
        const customInput = document.getElementById('custom-color-input');
        if (customInput) customInput.value = '#';
        const customPreview = document.getElementById('custom-color-preview');
        if (customPreview) customPreview.style.background = 'transparent';
        const stepEl = swatch.closest('.step');
        const stepIndex = parseInt(stepEl.id.replace('step-', ''), 10);
        updateNextButton(stepIndex);
      });
    });
  });

  // Custom character input
  const customCharInput = document.getElementById('custom-char-input');
  if (customCharInput) {
    customCharInput.addEventListener('input', () => {
      const val = customCharInput.value.trim();
      if (val) {
        answers.character = 'custom';
        answers.customCharacter = val;
        // Deselect preset options
        const container = customCharInput.closest('.step').querySelector('.options[data-type="radio"]');
        if (container) {
          container.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
        }
        updateNextButton(1);
      }
    });
  }

  // Custom color input
  const customColorInput = document.getElementById('custom-color-input');
  if (customColorInput) {
    customColorInput.addEventListener('input', () => {
      const val = customColorInput.value.trim();
      const customPreview = document.getElementById('custom-color-preview');
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        answers.color = val;
        answers.customColor = val;
        if (customPreview) customPreview.style.background = val;
        // Deselect preset swatches
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        updateNextButton(2);
      } else {
        if (customPreview) customPreview.style.background = 'transparent';
      }
    });
  }

  // tmux specific listeners
  setupTmuxListeners();

  // zsh specific listeners
  setupZshListeners();

  // neovim specific listeners
  setupNeovimListeners();
}

// ── tmux option listeners ─────────────────────────────
function setupTmuxListeners() {
  const tmuxMouse = document.getElementById('tmux-mouse');
  if (tmuxMouse) {
    tmuxMouse.addEventListener('change', () => {
      tmuxAnswers.mouse = tmuxMouse.checked;
    });
  }

  const tmuxBaseIndex = document.getElementById('tmux-base-index');
  if (tmuxBaseIndex) {
    tmuxBaseIndex.addEventListener('change', () => {
      tmuxAnswers.baseIndex = tmuxBaseIndex.checked;
    });
  }

  const tmuxRenumber = document.getElementById('tmux-renumber');
  if (tmuxRenumber) {
    tmuxRenumber.addEventListener('change', () => {
      tmuxAnswers.renumber = tmuxRenumber.checked;
    });
  }

  const tmuxPaneBorder = document.getElementById('tmux-pane-border');
  if (tmuxPaneBorder) {
    tmuxPaneBorder.addEventListener('change', () => {
      tmuxAnswers.paneBorder = tmuxPaneBorder.checked;
    });
  }

  const tmuxActiveBorder = document.getElementById('tmux-active-border');
  if (tmuxActiveBorder) {
    tmuxActiveBorder.addEventListener('change', () => {
      tmuxAnswers.activeBorder = tmuxActiveBorder.checked;
    });
  }

  const tmuxStatusInterval = document.getElementById('tmux-status-interval');
  if (tmuxStatusInterval) {
    tmuxStatusInterval.addEventListener('input', () => {
      tmuxAnswers.statusInterval = parseInt(tmuxStatusInterval.value, 10);
      document.getElementById('tmux-status-interval-val').textContent = tmuxStatusInterval.value + '秒';
    });
  }

  const tmuxAutoRename = document.getElementById('tmux-auto-rename');
  if (tmuxAutoRename) {
    tmuxAutoRename.addEventListener('change', () => {
      tmuxAnswers.autoRename = tmuxAutoRename.checked;
    });
  }

  const tmuxVisualBell = document.getElementById('tmux-visual-bell');
  if (tmuxVisualBell) {
    tmuxVisualBell.addEventListener('change', () => {
      tmuxAnswers.visualBell = tmuxVisualBell.checked;
    });
  }

  const tmuxHistoryLimit = document.getElementById('tmux-history-limit');
  if (tmuxHistoryLimit) {
    tmuxHistoryLimit.addEventListener('input', () => {
      tmuxAnswers.historyLimit = parseInt(tmuxHistoryLimit.value, 10);
      document.getElementById('tmux-history-limit-val').textContent = tmuxHistoryLimit.value;
    });
  }

  const tmuxStatusLeftLength = document.getElementById('tmux-status-left-length');
  if (tmuxStatusLeftLength) {
    tmuxStatusLeftLength.addEventListener('input', () => {
      tmuxAnswers.statusLeftLength = parseInt(tmuxStatusLeftLength.value, 10);
      document.getElementById('tmux-status-left-length-val').textContent = tmuxStatusLeftLength.value;
    });
  }

  const tmuxStatusRightLength = document.getElementById('tmux-status-right-length');
  if (tmuxStatusRightLength) {
    tmuxStatusRightLength.addEventListener('input', () => {
      tmuxAnswers.statusRightLength = parseInt(tmuxStatusRightLength.value, 10);
      document.getElementById('tmux-status-right-length-val').textContent = tmuxStatusRightLength.value;
    });
  }

  const tmuxStatusJustify = document.getElementById('tmux-status-justify');
  if (tmuxStatusJustify) {
    tmuxStatusJustify.addEventListener('change', () => {
      tmuxAnswers.statusJustify = tmuxStatusJustify.value;
    });
  }

  const tmuxTerminalType = document.getElementById('tmux-terminal-type');
  if (tmuxTerminalType) {
    tmuxTerminalType.addEventListener('change', () => {
      tmuxAnswers.terminalType = tmuxTerminalType.value;
    });
  }

  const tmuxFocusEvents = document.getElementById('tmux-focus-events');
  if (tmuxFocusEvents) {
    tmuxFocusEvents.addEventListener('change', () => {
      tmuxAnswers.focusEvents = tmuxFocusEvents.checked;
    });
  }

  const tmuxClipboard = document.getElementById('tmux-clipboard');
  if (tmuxClipboard) {
    tmuxClipboard.addEventListener('change', () => {
      tmuxAnswers.clipboard = tmuxClipboard.checked;
    });
  }

  const tmuxAggressiveResize = document.getElementById('tmux-aggressive-resize');
  if (tmuxAggressiveResize) {
    tmuxAggressiveResize.addEventListener('change', () => {
      tmuxAnswers.aggressiveResize = tmuxAggressiveResize.checked;
    });
  }

  const tmuxDisplayPanesTime = document.getElementById('tmux-display-panes-time');
  if (tmuxDisplayPanesTime) {
    tmuxDisplayPanesTime.addEventListener('input', () => {
      tmuxAnswers.displayPanesTime = parseInt(tmuxDisplayPanesTime.value, 10);
      document.getElementById('tmux-display-panes-time-val').textContent = tmuxDisplayPanesTime.value + 'ms';
    });
  }

  const tmuxRepeatTime = document.getElementById('tmux-repeat-time');
  if (tmuxRepeatTime) {
    tmuxRepeatTime.addEventListener('input', () => {
      tmuxAnswers.repeatTime = parseInt(tmuxRepeatTime.value, 10);
      document.getElementById('tmux-repeat-time-val').textContent = tmuxRepeatTime.value + 'ms';
    });
  }
}

// ── zsh option listeners ──────────────────────────────
function setupZshListeners() {
  const zshHistorySize = document.getElementById('zsh-history-size');
  if (zshHistorySize) {
    zshHistorySize.addEventListener('input', () => {
      zshAnswers.historySize = parseInt(zshHistorySize.value, 10);
      document.getElementById('zsh-history-size-val').textContent = zshHistorySize.value;
    });
  }

  const zshSaveHistory = document.getElementById('zsh-save-history');
  if (zshSaveHistory) {
    zshSaveHistory.addEventListener('input', () => {
      zshAnswers.saveHistory = parseInt(zshSaveHistory.value, 10);
      document.getElementById('zsh-save-history-val').textContent = zshSaveHistory.value;
    });
  }

  const zshShareHistory = document.getElementById('zsh-share-history');
  if (zshShareHistory) {
    zshShareHistory.addEventListener('change', () => {
      zshAnswers.shareHistory = zshShareHistory.checked;
    });
  }

  const zshHistIgnoreDups = document.getElementById('zsh-hist-ignore-dups');
  if (zshHistIgnoreDups) {
    zshHistIgnoreDups.addEventListener('change', () => {
      zshAnswers.histIgnoreDups = zshHistIgnoreDups.checked;
    });
  }

  const zshAutoMenu = document.getElementById('zsh-auto-menu');
  if (zshAutoMenu) {
    zshAutoMenu.addEventListener('change', () => {
      zshAnswers.autoMenu = zshAutoMenu.checked;
    });
  }

  const zshCaseSensitive = document.getElementById('zsh-case-sensitive');
  if (zshCaseSensitive) {
    zshCaseSensitive.addEventListener('change', () => {
      zshAnswers.caseSensitive = zshCaseSensitive.checked;
    });
  }
}

// ── Neovim option listeners ───────────────────────────
function setupNeovimListeners() {
  const nvimToggles = {
    'nvim-number': 'number',
    'nvim-relativenumber': 'relativenumber',
    'nvim-cursorline': 'cursorline',
    'nvim-signcolumn': 'signcolumn',
    'nvim-wrap': 'wrap',
    'nvim-termguicolors': 'termguicolors',
    'nvim-expandtab': 'expandtab',
    'nvim-smartindent': 'smartindent',
    'nvim-ignorecase': 'ignorecase',
    'nvim-smartcase': 'smartcase',
    'nvim-hlsearch': 'hlsearch',
    'nvim-clipboard': 'clipboard',
    'nvim-mouse': 'mouse',
    'nvim-swapfile': 'swapfile',
    'nvim-undofile': 'undofile',
    'nvim-splitright': 'splitright',
    'nvim-splitbelow': 'splitbelow',
  };

  for (const [id, key] of Object.entries(nvimToggles)) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        neovimAnswers[key] = el.checked;
      });
    }
  }

  const nvimScrolloff = document.getElementById('nvim-scrolloff');
  if (nvimScrolloff) {
    nvimScrolloff.addEventListener('input', () => {
      neovimAnswers.scrolloff = parseInt(nvimScrolloff.value, 10);
      document.getElementById('nvim-scrolloff-val').textContent = nvimScrolloff.value;
    });
  }

  const nvimTabwidth = document.getElementById('nvim-tabwidth');
  if (nvimTabwidth) {
    nvimTabwidth.addEventListener('input', () => {
      neovimAnswers.tabWidth = parseInt(nvimTabwidth.value, 10);
      document.getElementById('nvim-tabwidth-val').textContent = nvimTabwidth.value;
    });
  }
}
