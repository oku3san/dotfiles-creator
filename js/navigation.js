// ── Tool Selection ────────────────────────────────────
function selectTool() {
  const toolOption = document.querySelector('.option[data-value="starship"].selected') ||
                      document.querySelector('.option[data-value="tmux"].selected') ||
                      document.querySelector('.option[data-value="zsh"].selected') ||
                      document.querySelector('.option[data-value="neovim"].selected');
  if (!toolOption) return;

  selectedTool = toolOption.dataset.value;

  // Hide tool selection
  document.getElementById('step-tool-selection').classList.remove('visible');

  // Show appropriate steps (clear inline styles so CSS classes control visibility)
  const allStepClasses = ['.starship-step', '.tmux-step', '.zsh-step', '.neovim-step'];
  allStepClasses.forEach(cls => {
    document.querySelectorAll(cls).forEach(s => s.style.display = 'none');
  });

  if (selectedTool === 'starship') {
    document.querySelectorAll('.starship-step').forEach(s => s.style.display = '');
    showStep(0);
  } else if (selectedTool === 'tmux') {
    document.querySelectorAll('.tmux-step').forEach(s => s.style.display = '');
    showTmuxStep(0);
  } else if (selectedTool === 'zsh') {
    document.querySelectorAll('.zsh-step').forEach(s => s.style.display = '');
    showZshStep(0);
  } else if (selectedTool === 'neovim') {
    document.querySelectorAll('.neovim-step').forEach(s => s.style.display = '');
    showNeovimStep(0);
  }
}

function goBackToToolSelection() {
  selectedTool = null;
  currentStep = 0;
  document.querySelectorAll('.step').forEach(s => s.classList.remove('visible'));
  document.getElementById('step-tool-selection').classList.add('visible');
  document.getElementById('progress').innerHTML = '';
}

// ── Progress bar ──────────────────────────────────────
function renderProgress() {
  const bar = document.getElementById('progress');
  bar.innerHTML = '';
  let totalSteps = TOTAL_STEPS;
  if (selectedTool === 'tmux') totalSteps = TMUX_TOTAL_STEPS;
  if (selectedTool === 'zsh') totalSteps = ZSH_TOTAL_STEPS;
  if (selectedTool === 'neovim') totalSteps = NEOVIM_TOTAL_STEPS;
  for (let i = 0; i < totalSteps; i++) {
    const el = document.createElement('div');
    el.className = 'progress-step';
    if (i < currentStep) el.classList.add('done');
    if (i === currentStep) el.classList.add('active');
    bar.appendChild(el);
  }
}

// ── Step navigation ───────────────────────────────────
function showStep(index) {
  document.querySelectorAll('.starship-step').forEach((s, i) => {
    s.classList.toggle('visible', i === index);
  });
  currentStep = index;
  renderProgress();

  // Build detail settings when entering step 4
  if (index === 4) {
    buildDetailSettings();
  }

  if (index === TOTAL_STEPS - 1) {
    renderResult();
  }
}

function showTmuxStep(index) {
  document.querySelectorAll('.tmux-step').forEach((s, i) => {
    s.classList.toggle('visible', i === index);
  });
  currentStep = index;
  renderProgress();

  if (index === TMUX_TOTAL_STEPS - 1) {
    renderTmuxResult();
  }
}

function showZshStep(index) {
  document.querySelectorAll('.zsh-step').forEach((s, i) => {
    s.classList.toggle('visible', i === index);
  });
  currentStep = index;
  renderProgress();

  // Build plugins section when entering step 2
  if (index === 2) {
    buildZshPluginsSection();
  }

  if (index === ZSH_TOTAL_STEPS - 1) {
    renderZshResult();
  }
}

function showNeovimStep(index) {
  document.querySelectorAll('.neovim-step').forEach((s, i) => {
    s.classList.toggle('visible', i === index);
  });
  currentStep = index;
  renderProgress();

  // Build plugins section when entering step 2
  if (index === 2) {
    buildNeovimPluginsSection();
  }

  if (index === NEOVIM_TOTAL_STEPS - 1) {
    renderNeovimResult();
  }
}

function nextStep() {
  if (selectedTool === 'tmux') {
    if (currentStep < TMUX_TOTAL_STEPS - 1) showTmuxStep(currentStep + 1);
  } else if (selectedTool === 'zsh') {
    if (currentStep < ZSH_TOTAL_STEPS - 1) showZshStep(currentStep + 1);
  } else if (selectedTool === 'neovim') {
    if (currentStep < NEOVIM_TOTAL_STEPS - 1) showNeovimStep(currentStep + 1);
  } else {
    if (currentStep < TOTAL_STEPS - 1) showStep(currentStep + 1);
  }
}

function prevStep() {
  if (currentStep > 0) {
    if (selectedTool === 'tmux') {
      showTmuxStep(currentStep - 1);
    } else if (selectedTool === 'zsh') {
      showZshStep(currentStep - 1);
    } else if (selectedTool === 'neovim') {
      showNeovimStep(currentStep - 1);
    } else {
      showStep(currentStep - 1);
    }
  }
}

function goToStart() {
  // Reset starship answers
  answers.style = null;
  answers.character = null;
  answers.customCharacter = '';
  answers.color = null;
  answers.customColor = '';
  answers.modules = [];
  answers.dirTruncationLength = 3;
  answers.dirTruncateToRepo = true;
  answers.timeFormat = '%H:%M';
  answers.cmdDurationMinTime = 2000;
  answers.rightPromptModules = [];
  answers.gitShowStash = false;
  answers.gitBranchTruncation = 20;
  answers.pythonShowVenv = true;
  answers.memoryThreshold = 75;

  // Reset tmux answers
  tmuxAnswers.prefix = null;
  tmuxAnswers.mouse = true;
  tmuxAnswers.baseIndex = true;
  tmuxAnswers.renumber = true;
  tmuxAnswers.autoRename = false;
  tmuxAnswers.visualBell = true;
  tmuxAnswers.historyLimit = 10000;
  tmuxAnswers.terminalType = 'screen-256color';
  tmuxAnswers.focusEvents = true;
  tmuxAnswers.clipboard = true;
  tmuxAnswers.displayPanesTime = 2000;
  tmuxAnswers.repeatTime = 500;
  tmuxAnswers.aggressiveResize = true;
  tmuxAnswers.theme = null;
  tmuxAnswers.paneBorder = false;
  tmuxAnswers.activeBorder = true;
  tmuxAnswers.statusPosition = null;
  tmuxAnswers.statusModules = [];
  tmuxAnswers.statusInterval = 5;
  tmuxAnswers.statusLeftLength = 40;
  tmuxAnswers.statusRightLength = 50;
  tmuxAnswers.statusJustify = 'centre';
  tmuxAnswers.splitKeys = null;
  tmuxAnswers.extraBindings = [];
  tmuxAnswers.plugins = [];

  // Reset zsh answers
  zshAnswers.pluginManager = null;
  zshAnswers.historySize = 10000;
  zshAnswers.saveHistory = 10000;
  zshAnswers.shareHistory = true;
  zshAnswers.histIgnoreDups = true;
  zshAnswers.autoMenu = true;
  zshAnswers.caseSensitive = false;
  zshAnswers.keymap = null;
  zshAnswers.theme = null;
  zshAnswers.plugins = [];
  zshAnswers.aliases = [];

  document.querySelectorAll('.option.selected').forEach(o => o.classList.remove('selected'));
  document.querySelectorAll('.color-swatch.selected').forEach(o => o.classList.remove('selected'));
  const customCharInput = document.getElementById('custom-char-input');
  if (customCharInput) customCharInput.value = '';
  const customColorInput = document.getElementById('custom-color-input');
  if (customColorInput) customColorInput.value = '#';
  const customColorPreview = document.getElementById('custom-color-preview');
  if (customColorPreview) customColorPreview.style.background = 'transparent';

  // Reset tmux DOM elements
  const tmuxToggles = {
    'tmux-mouse': true,
    'tmux-base-index': true,
    'tmux-renumber': true,
    'tmux-auto-rename': false,
    'tmux-visual-bell': true,
    'tmux-pane-border': false,
    'tmux-active-border': true,
    'tmux-focus-events': true,
    'tmux-clipboard': true,
    'tmux-aggressive-resize': true,
  };
  for (const [id, defaultVal] of Object.entries(tmuxToggles)) {
    const el = document.getElementById(id);
    if (el) el.checked = defaultVal;
  }

  const tmuxRanges = {
    'tmux-history-limit': { value: 10000, display: 'tmux-history-limit-val', suffix: '' },
    'tmux-status-interval': { value: 5, display: 'tmux-status-interval-val', suffix: '秒' },
    'tmux-status-left-length': { value: 40, display: 'tmux-status-left-length-val', suffix: '' },
    'tmux-status-right-length': { value: 50, display: 'tmux-status-right-length-val', suffix: '' },
    'tmux-display-panes-time': { value: 2000, display: 'tmux-display-panes-time-val', suffix: 'ms' },
    'tmux-repeat-time': { value: 500, display: 'tmux-repeat-time-val', suffix: 'ms' },
  };
  for (const [id, cfg] of Object.entries(tmuxRanges)) {
    const el = document.getElementById(id);
    if (el) el.value = cfg.value;
    const display = document.getElementById(cfg.display);
    if (display) display.textContent = cfg.value + cfg.suffix;
  }

  const tmuxJustify = document.getElementById('tmux-status-justify');
  if (tmuxJustify) tmuxJustify.value = 'centre';

  const tmuxTerminalType = document.getElementById('tmux-terminal-type');
  if (tmuxTerminalType) tmuxTerminalType.value = 'screen-256color';

  // Reset neovim answers
  neovimAnswers.pluginManager = null;
  neovimAnswers.number = true;
  neovimAnswers.relativenumber = true;
  neovimAnswers.cursorline = true;
  neovimAnswers.signcolumn = true;
  neovimAnswers.wrap = false;
  neovimAnswers.termguicolors = true;
  neovimAnswers.scrolloff = 8;
  neovimAnswers.tabWidth = 2;
  neovimAnswers.expandtab = true;
  neovimAnswers.smartindent = true;
  neovimAnswers.ignorecase = true;
  neovimAnswers.smartcase = true;
  neovimAnswers.hlsearch = true;
  neovimAnswers.clipboard = true;
  neovimAnswers.mouse = true;
  neovimAnswers.swapfile = true;
  neovimAnswers.undofile = true;
  neovimAnswers.splitright = true;
  neovimAnswers.splitbelow = true;
  neovimAnswers.colorscheme = null;
  neovimAnswers.plugins = [];
  neovimAnswers.leader = null;
  neovimAnswers.keymaps = [];

  // Reset zsh DOM elements
  const zshToggles = {
    'zsh-share-history': true,
    'zsh-hist-ignore-dups': true,
    'zsh-auto-menu': true,
    'zsh-case-sensitive': false,
  };
  for (const [id, defaultVal] of Object.entries(zshToggles)) {
    const el = document.getElementById(id);
    if (el) el.checked = defaultVal;
  }

  const zshRanges = {
    'zsh-history-size': { value: 10000, display: 'zsh-history-size-val', suffix: '' },
    'zsh-save-history': { value: 10000, display: 'zsh-save-history-val', suffix: '' },
  };
  for (const [id, cfg] of Object.entries(zshRanges)) {
    const el = document.getElementById(id);
    if (el) el.value = cfg.value;
    const display = document.getElementById(cfg.display);
    if (display) display.textContent = cfg.value + cfg.suffix;
  }

  // Reset neovim DOM elements
  const nvimToggles = {
    'nvim-number': true,
    'nvim-relativenumber': true,
    'nvim-cursorline': true,
    'nvim-signcolumn': true,
    'nvim-wrap': false,
    'nvim-termguicolors': true,
    'nvim-expandtab': true,
    'nvim-smartindent': true,
    'nvim-ignorecase': true,
    'nvim-smartcase': true,
    'nvim-hlsearch': true,
    'nvim-clipboard': true,
    'nvim-mouse': true,
    'nvim-swapfile': true,
    'nvim-undofile': true,
    'nvim-splitright': true,
    'nvim-splitbelow': true,
  };
  for (const [id, defaultVal] of Object.entries(nvimToggles)) {
    const el = document.getElementById(id);
    if (el) el.checked = defaultVal;
  }

  const nvimRanges = {
    'nvim-scrolloff': { value: 8, display: 'nvim-scrolloff-val', suffix: '' },
    'nvim-tabwidth': { value: 2, display: 'nvim-tabwidth-val', suffix: '' },
  };
  for (const [id, cfg] of Object.entries(nvimRanges)) {
    const el = document.getElementById(id);
    if (el) el.value = cfg.value;
    const display = document.getElementById(cfg.display);
    if (display) display.textContent = cfg.value + cfg.suffix;
  }

  // Go back to tool selection
  goBackToToolSelection();
}

// ── Next button validation ────────────────────────────
function updateNextButton(stepIndex) {
  const btn = document.getElementById(`btn-next-${stepIndex}`);
  if (!btn) return;
  const stepEl = document.getElementById(`step-${stepIndex}`);
  const container = stepEl.querySelector('[data-type]');
  const type = container?.dataset.type;
  if (type === 'radio' || type === 'color') {
    const key = container.dataset.key;
    btn.disabled = answers[key] === null;
  }
}

function updateTmuxNextButton(stepIndex) {
  const btn = document.getElementById(`btn-tmux-next-${stepIndex}`);
  if (!btn) return;

  if (stepIndex === 0) {
    btn.disabled = tmuxAnswers.prefix === null;
  } else if (stepIndex === 1) {
    btn.disabled = tmuxAnswers.theme === null;
  } else if (stepIndex === 2) {
    btn.disabled = tmuxAnswers.statusPosition === null;
  }
}

function updateZshNextButton(stepIndex) {
  const btn = document.getElementById(`btn-zsh-next-${stepIndex}`);
  if (!btn) return;

  if (stepIndex === 0) {
    btn.disabled = zshAnswers.pluginManager === null;
  } else if (stepIndex === 1) {
    btn.disabled = zshAnswers.keymap === null;
  }
}

function updateNeovimNextButton(stepIndex) {
  const btn = document.getElementById(`btn-neovim-next-${stepIndex}`);
  if (!btn) return;

  if (stepIndex === 0) {
    btn.disabled = neovimAnswers.pluginManager === null;
  } else if (stepIndex === 2) {
    btn.disabled = neovimAnswers.colorscheme === null;
  }
}

// ── Bulk select / deselect ────────────────────────────
function bulkSelect(dataKey, selectAll) {
  const container = document.querySelector(`.options[data-key="${dataKey}"]`);
  if (!container) return;

  const values = [];
  container.querySelectorAll('.option').forEach(option => {
    if (selectAll) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
    if (selectAll) values.push(option.dataset.value);
  });

  // Update the appropriate state
  if (dataKey === 'modules') {
    answers.modules = values;
  } else if (dataKey.startsWith('tmux-')) {
    const tmuxKey = dataKey.replace('tmux-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    tmuxAnswers[tmuxKey] = values;
  } else if (dataKey.startsWith('zsh-')) {
    const zshKey = dataKey.replace('zsh-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    zshAnswers[zshKey] = values;
  } else if (dataKey.startsWith('neovim-')) {
    const nvimKey = dataKey.replace('neovim-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    neovimAnswers[nvimKey] = values;
  }
}
