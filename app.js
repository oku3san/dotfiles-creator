// ── Helpers ────────────────────────────────────────────
function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ── Default State ─────────────────────────────────────
const STARSHIP_DEFAULTS = {
  style: null,
  character: null,
  customCharacter: '',
  color: null,
  customColor: '',
  modules: [],
  dirTruncationLength: 3,
  dirTruncateToRepo: true,
  timeFormat: '%H:%M',
  cmdDurationMinTime: 2000,
  rightPromptModules: [],
  gitShowStash: false,
  gitBranchTruncation: 20,
  pythonShowVenv: true,
  memoryThreshold: 75,
};

const TMUX_DEFAULTS = {
  prefix: null,
  mouse: true,
  baseIndex: true,
  renumber: true,
  autoRename: false,
  visualBell: true,
  historyLimit: 10000,
  terminalType: 'screen-256color',
  focusEvents: true,
  clipboard: true,
  displayPanesTime: 2000,
  repeatTime: 500,
  aggressiveResize: true,
  theme: null,
  paneBorder: false,
  activeBorder: true,
  statusPosition: null,
  statusModules: [],
  statusInterval: 5,
  statusLeftLength: 40,
  statusRightLength: 50,
  statusJustify: 'centre',
  splitKeys: null,
  extraBindings: [],
  plugins: [],
};

const ZSH_DEFAULTS = {
  pluginManager: null,
  historySize: 10000,
  saveHistory: 10000,
  shareHistory: true,
  histIgnoreDups: true,
  autoMenu: true,
  caseSensitive: false,
  keymap: null,
  theme: null,
  plugins: [],
  aliases: [],
};

const NEOVIM_DEFAULTS = {
  pluginManager: null,
  number: true,
  relativenumber: true,
  cursorline: true,
  signcolumn: true,
  wrap: false,
  termguicolors: true,
  scrolloff: 8,
  tabWidth: 2,
  expandtab: true,
  smartindent: true,
  ignorecase: true,
  smartcase: true,
  hlsearch: true,
  clipboard: true,
  mouse: true,
  swapfile: true,
  undofile: true,
  splitright: true,
  splitbelow: true,
  colorscheme: null,
  plugins: [],
  leader: null,
  keymaps: [],
};

// ── State ──────────────────────────────────────────────
let selectedTool = null;
let currentStep = 0;
const answers = deepClone(STARSHIP_DEFAULTS);
const tmuxAnswers = deepClone(TMUX_DEFAULTS);
const zshAnswers = deepClone(ZSH_DEFAULTS);
const neovimAnswers = deepClone(NEOVIM_DEFAULTS);

// ── Tool Registry ─────────────────────────────────────
const TOOL_CONFIG = {
  starship: { totalSteps: 6, stepClass: '.starship-step', stepPrefix: 'step-', state: answers, onStep: { 4: buildDetailSettings, 5: renderResult } },
  tmux:     { totalSteps: 5, stepClass: '.tmux-step',     stepPrefix: 'tmux-step-', state: tmuxAnswers, onStep: { 4: renderTmuxResult } },
  zsh:      { totalSteps: 5, stepClass: '.zsh-step',      stepPrefix: 'zsh-step-', state: zshAnswers, onStep: { 2: buildZshPluginsSection, 4: renderZshResult } },
  neovim:   { totalSteps: 5, stepClass: '.neovim-step',   stepPrefix: 'neovim-step-', state: neovimAnswers, onStep: { 2: buildNeovimPluginsSection, 4: renderNeovimResult } },
};

function getToolState(dataKey) {
  if (dataKey.startsWith('tmux-')) return { state: tmuxAnswers, key: kebabToCamel(dataKey.replace('tmux-', '')) };
  if (dataKey.startsWith('zsh-')) return { state: zshAnswers, key: kebabToCamel(dataKey.replace('zsh-', '')) };
  if (dataKey.startsWith('neovim-')) return { state: neovimAnswers, key: kebabToCamel(dataKey.replace('neovim-', '')) };
  return { state: answers, key: dataKey };
}

// ── Tool Selection ────────────────────────────────────
function selectTool() {
  const toolOption = document.querySelector('#step-tool-selection .option.selected');
  if (!toolOption) return;

  selectedTool = toolOption.dataset.value;
  document.getElementById('step-tool-selection').classList.remove('visible');

  const allStepClasses = Object.values(TOOL_CONFIG).map(c => c.stepClass);
  allStepClasses.forEach(cls => {
    document.querySelectorAll(cls).forEach(s => s.style.display = 'none');
  });

  const config = TOOL_CONFIG[selectedTool];
  document.querySelectorAll(config.stepClass).forEach(s => s.style.display = '');
  showToolStep(0);
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
  const config = TOOL_CONFIG[selectedTool];
  if (!config) return;
  for (let i = 0; i < config.totalSteps; i++) {
    const el = document.createElement('div');
    el.className = 'progress-step';
    if (i < currentStep) el.classList.add('done');
    if (i === currentStep) el.classList.add('active');
    bar.appendChild(el);
  }
}

// ── Step navigation ───────────────────────────────────
function showToolStep(index) {
  const config = TOOL_CONFIG[selectedTool];
  if (!config) return;
  document.querySelectorAll(config.stepClass).forEach((s, i) => {
    s.classList.toggle('visible', i === index);
  });
  currentStep = index;
  renderProgress();

  const callback = config.onStep[index];
  if (callback) callback();
}

function nextStep() {
  const config = TOOL_CONFIG[selectedTool];
  if (config && currentStep < config.totalSteps - 1) {
    showToolStep(currentStep + 1);
  }
}

function prevStep() {
  if (currentStep > 0) {
    showToolStep(currentStep - 1);
  }
}

function resetState(target, defaults) {
  for (const key of Object.keys(defaults)) {
    const val = defaults[key];
    target[key] = Array.isArray(val) ? [] : val;
  }
}

function goToStart() {
  // Reset all answer objects to defaults
  resetState(answers, STARSHIP_DEFAULTS);
  resetState(tmuxAnswers, TMUX_DEFAULTS);
  resetState(zshAnswers, ZSH_DEFAULTS);
  resetState(neovimAnswers, NEOVIM_DEFAULTS);

  // Reset UI selections
  document.querySelectorAll('.option.selected').forEach(o => o.classList.remove('selected'));
  document.querySelectorAll('.color-swatch.selected').forEach(o => o.classList.remove('selected'));
  const customCharInput = document.getElementById('custom-char-input');
  if (customCharInput) customCharInput.value = '';
  const customColorInput = document.getElementById('custom-color-input');
  if (customColorInput) customColorInput.value = '#';
  const customColorPreview = document.getElementById('custom-color-preview');
  if (customColorPreview) customColorPreview.style.background = 'transparent';

  // Reset all toggle and range DOM elements
  TOGGLE_BINDINGS.forEach(({ id, defaultVal }) => {
    const el = document.getElementById(id);
    if (el) el.checked = defaultVal;
  });

  RANGE_BINDINGS.forEach(({ id, defaultVal, displayId, suffix }) => {
    const el = document.getElementById(id);
    if (el) el.value = defaultVal;
    const display = document.getElementById(displayId);
    if (display) display.textContent = defaultVal + suffix;
  });

  // Reset select elements
  const tmuxJustify = document.getElementById('tmux-status-justify');
  if (tmuxJustify) tmuxJustify.value = 'centre';
  const tmuxTerminalType = document.getElementById('tmux-terminal-type');
  if (tmuxTerminalType) tmuxTerminalType.value = 'screen-256color';

  goBackToToolSelection();
}

// ── Next button validation ────────────────────────────
// Maps step DOM IDs to the state property that must be non-null
const STEP_REQUIRED_FIELDS = {
  'step-0': { state: answers, key: 'style' },
  'step-1': { state: answers, key: 'character' },
  'step-2': { state: answers, key: 'color' },
  'tmux-step-0': { state: tmuxAnswers, key: 'prefix' },
  'tmux-step-1': { state: tmuxAnswers, key: 'theme' },
  'tmux-step-2': { state: tmuxAnswers, key: 'statusPosition' },
  'zsh-step-0': { state: zshAnswers, key: 'pluginManager' },
  'zsh-step-1': { state: zshAnswers, key: 'keymap' },
  'neovim-step-0': { state: neovimAnswers, key: 'pluginManager' },
  'neovim-step-2': { state: neovimAnswers, key: 'colorscheme' },
};

// Maps step DOM IDs to their next-button DOM IDs
const STEP_BUTTON_MAP = {
  'step-0': 'btn-next-0',
  'step-1': 'btn-next-1',
  'step-2': 'btn-next-2',
  'tmux-step-0': 'btn-tmux-next-0',
  'tmux-step-1': 'btn-tmux-next-1',
  'tmux-step-2': 'btn-tmux-next-2',
  'zsh-step-0': 'btn-zsh-next-0',
  'zsh-step-1': 'btn-zsh-next-1',
  'neovim-step-0': 'btn-neovim-next-0',
  'neovim-step-2': 'btn-neovim-next-2',
};

function updateStepButton(stepId) {
  const btnId = STEP_BUTTON_MAP[stepId];
  const field = STEP_REQUIRED_FIELDS[stepId];
  if (!btnId || !field) return;
  const btn = document.getElementById(btnId);
  if (btn) btn.disabled = field.state[field.key] === null;
}

// ── Option click handlers ─────────────────────────────
function handleRadioClick(container, option) {
  const key = container.dataset.key;
  container.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
  option.classList.add('selected');

  if (key === 'tool') {
    const btn = document.getElementById('btn-select-tool');
    if (btn) btn.disabled = false;
    return;
  }

  const { state, key: stateKey } = getToolState(key);
  state[stateKey] = option.dataset.value;

  // Clear custom character if a preset is selected for starship character step
  if (key === 'character') {
    answers.customCharacter = '';
    const customInput = document.getElementById('custom-char-input');
    if (customInput) customInput.value = '';
  }

  const stepId = option.closest('.step')?.id;
  if (stepId) updateStepButton(stepId);
}

function handleCheckboxClick(container, option) {
  const key = container.dataset.key;
  option.classList.toggle('selected');
  const val = option.dataset.value;
  const { state, key: stateKey } = getToolState(key);
  const arr = state[stateKey];
  if (option.classList.contains('selected')) {
    if (!arr.includes(val)) arr.push(val);
  } else {
    state[stateKey] = arr.filter(v => v !== val);
  }
}

function setupOptions() {
  document.querySelectorAll('.options[data-type="radio"]').forEach(container => {
    container.querySelectorAll('.option').forEach(option => {
      option.addEventListener('click', () => handleRadioClick(container, option));
    });
  });

  document.querySelectorAll('.options[data-type="checkbox"]').forEach(container => {
    container.querySelectorAll('.option').forEach(option => {
      option.addEventListener('click', () => handleCheckboxClick(container, option));
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
        const stepId = swatch.closest('.step')?.id;
        if (stepId) updateStepButton(stepId);
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
        const container = customCharInput.closest('.step').querySelector('.options[data-type="radio"]');
        if (container) container.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
        updateStepButton('step-1');
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
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        updateStepButton('step-2');
      } else {
        if (customPreview) customPreview.style.background = 'transparent';
      }
    });
  }

  // Toggle and range listeners (data-driven)
  setupToggleAndRangeListeners();
}

// ── Toggle and range binding definitions ──────────────
const TOGGLE_BINDINGS = [
  // tmux toggles
  { id: 'tmux-mouse', state: tmuxAnswers, key: 'mouse', defaultVal: true },
  { id: 'tmux-base-index', state: tmuxAnswers, key: 'baseIndex', defaultVal: true },
  { id: 'tmux-renumber', state: tmuxAnswers, key: 'renumber', defaultVal: true },
  { id: 'tmux-auto-rename', state: tmuxAnswers, key: 'autoRename', defaultVal: false },
  { id: 'tmux-visual-bell', state: tmuxAnswers, key: 'visualBell', defaultVal: true },
  { id: 'tmux-pane-border', state: tmuxAnswers, key: 'paneBorder', defaultVal: false },
  { id: 'tmux-active-border', state: tmuxAnswers, key: 'activeBorder', defaultVal: true },
  { id: 'tmux-focus-events', state: tmuxAnswers, key: 'focusEvents', defaultVal: true },
  { id: 'tmux-clipboard', state: tmuxAnswers, key: 'clipboard', defaultVal: true },
  { id: 'tmux-aggressive-resize', state: tmuxAnswers, key: 'aggressiveResize', defaultVal: true },
  // zsh toggles
  { id: 'zsh-share-history', state: zshAnswers, key: 'shareHistory', defaultVal: true },
  { id: 'zsh-hist-ignore-dups', state: zshAnswers, key: 'histIgnoreDups', defaultVal: true },
  { id: 'zsh-auto-menu', state: zshAnswers, key: 'autoMenu', defaultVal: true },
  { id: 'zsh-case-sensitive', state: zshAnswers, key: 'caseSensitive', defaultVal: false },
  // neovim toggles
  { id: 'nvim-number', state: neovimAnswers, key: 'number', defaultVal: true },
  { id: 'nvim-relativenumber', state: neovimAnswers, key: 'relativenumber', defaultVal: true },
  { id: 'nvim-cursorline', state: neovimAnswers, key: 'cursorline', defaultVal: true },
  { id: 'nvim-signcolumn', state: neovimAnswers, key: 'signcolumn', defaultVal: true },
  { id: 'nvim-wrap', state: neovimAnswers, key: 'wrap', defaultVal: false },
  { id: 'nvim-termguicolors', state: neovimAnswers, key: 'termguicolors', defaultVal: true },
  { id: 'nvim-expandtab', state: neovimAnswers, key: 'expandtab', defaultVal: true },
  { id: 'nvim-smartindent', state: neovimAnswers, key: 'smartindent', defaultVal: true },
  { id: 'nvim-ignorecase', state: neovimAnswers, key: 'ignorecase', defaultVal: true },
  { id: 'nvim-smartcase', state: neovimAnswers, key: 'smartcase', defaultVal: true },
  { id: 'nvim-hlsearch', state: neovimAnswers, key: 'hlsearch', defaultVal: true },
  { id: 'nvim-clipboard', state: neovimAnswers, key: 'clipboard', defaultVal: true },
  { id: 'nvim-mouse', state: neovimAnswers, key: 'mouse', defaultVal: true },
  { id: 'nvim-swapfile', state: neovimAnswers, key: 'swapfile', defaultVal: true },
  { id: 'nvim-undofile', state: neovimAnswers, key: 'undofile', defaultVal: true },
  { id: 'nvim-splitright', state: neovimAnswers, key: 'splitright', defaultVal: true },
  { id: 'nvim-splitbelow', state: neovimAnswers, key: 'splitbelow', defaultVal: true },
];

const RANGE_BINDINGS = [
  // tmux ranges
  { id: 'tmux-history-limit', state: tmuxAnswers, key: 'historyLimit', displayId: 'tmux-history-limit-val', suffix: '', defaultVal: 10000 },
  { id: 'tmux-status-interval', state: tmuxAnswers, key: 'statusInterval', displayId: 'tmux-status-interval-val', suffix: '秒', defaultVal: 5 },
  { id: 'tmux-status-left-length', state: tmuxAnswers, key: 'statusLeftLength', displayId: 'tmux-status-left-length-val', suffix: '', defaultVal: 40 },
  { id: 'tmux-status-right-length', state: tmuxAnswers, key: 'statusRightLength', displayId: 'tmux-status-right-length-val', suffix: '', defaultVal: 50 },
  { id: 'tmux-display-panes-time', state: tmuxAnswers, key: 'displayPanesTime', displayId: 'tmux-display-panes-time-val', suffix: 'ms', defaultVal: 2000 },
  { id: 'tmux-repeat-time', state: tmuxAnswers, key: 'repeatTime', displayId: 'tmux-repeat-time-val', suffix: 'ms', defaultVal: 500 },
  // zsh ranges
  { id: 'zsh-history-size', state: zshAnswers, key: 'historySize', displayId: 'zsh-history-size-val', suffix: '', defaultVal: 10000 },
  { id: 'zsh-save-history', state: zshAnswers, key: 'saveHistory', displayId: 'zsh-save-history-val', suffix: '', defaultVal: 10000 },
  // neovim ranges
  { id: 'nvim-scrolloff', state: neovimAnswers, key: 'scrolloff', displayId: 'nvim-scrolloff-val', suffix: '', defaultVal: 8 },
  { id: 'nvim-tabwidth', state: neovimAnswers, key: 'tabWidth', displayId: 'nvim-tabwidth-val', suffix: '', defaultVal: 2 },
];

const SELECT_BINDINGS = [
  { id: 'tmux-status-justify', state: tmuxAnswers, key: 'statusJustify' },
  { id: 'tmux-terminal-type', state: tmuxAnswers, key: 'terminalType' },
];

function setupToggleAndRangeListeners() {
  TOGGLE_BINDINGS.forEach(({ id, state, key }) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => { state[key] = el.checked; });
  });

  RANGE_BINDINGS.forEach(({ id, state, key, displayId, suffix }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        state[key] = parseInt(el.value, 10);
        document.getElementById(displayId).textContent = el.value + suffix;
      });
    }
  });

  SELECT_BINDINGS.forEach(({ id, state, key }) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => { state[key] = el.value; });
  });
}

// ── Bulk select / deselect ────────────────────────────
function bulkSelect(dataKey, selectAll) {
  const container = document.querySelector(`.options[data-key="${dataKey}"]`);
  if (!container) return;

  const values = [];
  container.querySelectorAll('.option').forEach(option => {
    if (selectAll) {
      option.classList.add('selected');
      values.push(option.dataset.value);
    } else {
      option.classList.remove('selected');
    }
  });

  const { state, key } = getToolState(dataKey);
  state[key] = values;
}

// ── Starship preset templates ─────────────────────────
const STARSHIP_PRESETS = {
  minimal: ['git', 'cmd_duration'],
  full: ['git', 'node', 'python', 'golang', 'rust', 'docker', 'aws', 'kubernetes', 'java', 'ruby', 'php', 'package', 'hostname', 'username', 'jobs', 'memory', 'time', 'battery', 'cmd_duration', 'terraform'],
  devops: ['git', 'docker', 'aws', 'kubernetes', 'terraform', 'hostname', 'username', 'cmd_duration'],
  webdev: ['git', 'node', 'python', 'package', 'docker', 'cmd_duration'],
};

function applyStarshipPreset(preset) {
  const modules = STARSHIP_PRESETS[preset];
  if (!modules) return;

  answers.modules = [...modules];

  // Update the checkbox UI
  const container = document.querySelector('#step-3 .options[data-key="modules"]');
  if (!container) return;
  container.querySelectorAll('.option').forEach(option => {
    const val = option.dataset.value;
    if (modules.includes(val)) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });
}

// ── Detail settings (Step 4) ──────────────────────────
function buildDetailSettings() {
  const container = document.getElementById('detail-settings');
  if (!container) return;
  container.innerHTML = '';

  const modules = answers.modules;

  // Directory settings (always shown)
  const dirSection = document.createElement('div');
  dirSection.className = 'detail-section';
  dirSection.innerHTML = `
    <h3>ディレクトリ表示</h3>
    <div class="detail-row">
      <label for="dir-trunc-len">省略する深さ</label>
      <div class="detail-control">
        <input type="range" id="dir-trunc-len" min="1" max="10" value="${answers.dirTruncationLength}">
        <span id="dir-trunc-len-val">${answers.dirTruncationLength}</span>
      </div>
    </div>
    <div class="detail-row">
      <label for="dir-trunc-repo">リポジトリルートで省略</label>
      <div class="detail-control">
        <label class="toggle">
          <input type="checkbox" id="dir-trunc-repo" ${answers.dirTruncateToRepo ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
  `;
  container.appendChild(dirSection);

  // Git settings (only if git module selected)
  if (modules.includes('git')) {
    const gitSection = document.createElement('div');
    gitSection.className = 'detail-section';
    gitSection.innerHTML = `
      <h3>Git 設定</h3>
      <div class="detail-row">
        <label for="git-branch-trunc">ブランチ名の最大文字数</label>
        <div class="detail-control">
          <input type="range" id="git-branch-trunc" min="5" max="50" value="${answers.gitBranchTruncation}">
          <span id="git-branch-trunc-val">${answers.gitBranchTruncation}</span>
        </div>
      </div>
      <div class="detail-row">
        <label for="git-show-stash">スタッシュ数を表示</label>
        <div class="detail-control">
          <label class="toggle">
            <input type="checkbox" id="git-show-stash" ${answers.gitShowStash ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    `;
    container.appendChild(gitSection);
  }

  // Python settings (only if python module selected)
  if (modules.includes('python')) {
    const pySection = document.createElement('div');
    pySection.className = 'detail-section';
    pySection.innerHTML = `
      <h3>Python 設定</h3>
      <div class="detail-row">
        <label for="python-show-venv">仮想環境名を表示</label>
        <div class="detail-control">
          <label class="toggle">
            <input type="checkbox" id="python-show-venv" ${answers.pythonShowVenv ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    `;
    container.appendChild(pySection);
  }

  // Memory settings (only if memory module selected)
  if (modules.includes('memory')) {
    const memSection = document.createElement('div');
    memSection.className = 'detail-section';
    memSection.innerHTML = `
      <h3>メモリ使用量</h3>
      <div class="detail-row">
        <label for="memory-threshold">表示する閾値 (%)</label>
        <div class="detail-control">
          <input type="range" id="memory-threshold" min="0" max="100" step="5" value="${answers.memoryThreshold}">
          <span id="memory-threshold-val">${answers.memoryThreshold}%</span>
        </div>
      </div>
    `;
    container.appendChild(memSection);
  }

  // Time format (only if time module selected)
  if (modules.includes('time')) {
    const timeSection = document.createElement('div');
    timeSection.className = 'detail-section';
    timeSection.innerHTML = `
      <h3>時刻フォーマット</h3>
      <div class="detail-row">
        <div class="time-format-options">
          <label class="format-option ${answers.timeFormat === '%H:%M' ? 'selected' : ''}">
            <input type="radio" name="time-format" value="%H:%M" ${answers.timeFormat === '%H:%M' ? 'checked' : ''}>
            <span>HH:MM</span>
            <small>14:30</small>
          </label>
          <label class="format-option ${answers.timeFormat === '%H:%M:%S' ? 'selected' : ''}">
            <input type="radio" name="time-format" value="%H:%M:%S" ${answers.timeFormat === '%H:%M:%S' ? 'checked' : ''}>
            <span>HH:MM:SS</span>
            <small>14:30:05</small>
          </label>
          <label class="format-option ${answers.timeFormat === '%I:%M %p' ? 'selected' : ''}">
            <input type="radio" name="time-format" value="%I:%M %p" ${answers.timeFormat === '%I:%M %p' ? 'checked' : ''}>
            <span>12h</span>
            <small>02:30 PM</small>
          </label>
        </div>
      </div>
    `;
    container.appendChild(timeSection);
  }

  // Cmd duration threshold (only if cmd_duration selected)
  if (modules.includes('cmd_duration')) {
    const durationSection = document.createElement('div');
    durationSection.className = 'detail-section';
    durationSection.innerHTML = `
      <h3>コマンド実行時間</h3>
      <div class="detail-row">
        <label for="cmd-min-time">最低表示時間</label>
        <div class="detail-control">
          <input type="range" id="cmd-min-time" min="500" max="10000" step="500" value="${answers.cmdDurationMinTime}">
          <span id="cmd-min-time-val">${answers.cmdDurationMinTime / 1000}秒</span>
        </div>
      </div>
    `;
    container.appendChild(durationSection);
  }

  // Right prompt
  const rightCandidates = [];
  if (modules.includes('time')) rightCandidates.push({ value: 'time', label: '時刻' });
  if (modules.includes('battery')) rightCandidates.push({ value: 'battery', label: 'バッテリー' });
  if (modules.includes('cmd_duration')) rightCandidates.push({ value: 'cmd_duration', label: 'コマンド実行時間' });
  if (modules.includes('jobs')) rightCandidates.push({ value: 'jobs', label: 'ジョブ数' });
  if (modules.includes('memory')) rightCandidates.push({ value: 'memory', label: 'メモリ使用量' });

  if (rightCandidates.length > 0) {
    const rightSection = document.createElement('div');
    rightSection.className = 'detail-section';
    let checkboxesHtml = rightCandidates.map(c => {
      const checked = answers.rightPromptModules.includes(c.value) ? 'checked' : '';
      return `
        <label class="right-prompt-option">
          <input type="checkbox" name="right-prompt" value="${c.value}" ${checked}>
          <span>${c.label}</span>
        </label>
      `;
    }).join('');
    rightSection.innerHTML = `
      <h3>右プロンプト</h3>
      <p class="detail-description">右側に表示するモジュールを選択（選択しない場合は左に表示）</p>
      <div class="detail-row">
        <div class="right-prompt-options">${checkboxesHtml}</div>
      </div>
    `;
    container.appendChild(rightSection);
  }

  // Show placeholder if no modules for extra settings
  if (container.children.length === 1 && modules.length === 0) {
    const note = document.createElement('p');
    note.className = 'detail-note';
    note.textContent = 'モジュールを選択すると追加の設定が表示されます。';
    container.appendChild(note);
  }

  // Attach event listeners
  setupDetailListeners();
}

function setupDetailListeners() {
  const truncLen = document.getElementById('dir-trunc-len');
  if (truncLen) {
    truncLen.addEventListener('input', () => {
      answers.dirTruncationLength = parseInt(truncLen.value, 10);
      document.getElementById('dir-trunc-len-val').textContent = truncLen.value;
    });
  }

  const truncRepo = document.getElementById('dir-trunc-repo');
  if (truncRepo) {
    truncRepo.addEventListener('change', () => {
      answers.dirTruncateToRepo = truncRepo.checked;
    });
  }

  const gitBranchTrunc = document.getElementById('git-branch-trunc');
  if (gitBranchTrunc) {
    gitBranchTrunc.addEventListener('input', () => {
      answers.gitBranchTruncation = parseInt(gitBranchTrunc.value, 10);
      document.getElementById('git-branch-trunc-val').textContent = gitBranchTrunc.value;
    });
  }

  const gitShowStash = document.getElementById('git-show-stash');
  if (gitShowStash) {
    gitShowStash.addEventListener('change', () => {
      answers.gitShowStash = gitShowStash.checked;
    });
  }

  const pythonShowVenv = document.getElementById('python-show-venv');
  if (pythonShowVenv) {
    pythonShowVenv.addEventListener('change', () => {
      answers.pythonShowVenv = pythonShowVenv.checked;
    });
  }

  const memoryThreshold = document.getElementById('memory-threshold');
  if (memoryThreshold) {
    memoryThreshold.addEventListener('input', () => {
      answers.memoryThreshold = parseInt(memoryThreshold.value, 10);
      document.getElementById('memory-threshold-val').textContent = memoryThreshold.value + '%';
    });
  }

  document.querySelectorAll('input[name="time-format"]').forEach(radio => {
    radio.addEventListener('change', () => {
      answers.timeFormat = radio.value;
      document.querySelectorAll('.format-option').forEach(fo => fo.classList.remove('selected'));
      radio.closest('.format-option').classList.add('selected');
    });
  });

  const cmdMinTime = document.getElementById('cmd-min-time');
  if (cmdMinTime) {
    cmdMinTime.addEventListener('input', () => {
      answers.cmdDurationMinTime = parseInt(cmdMinTime.value, 10);
      document.getElementById('cmd-min-time-val').textContent = (cmdMinTime.value / 1000) + '秒';
    });
  }

  document.querySelectorAll('input[name="right-prompt"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const val = cb.value;
      if (cb.checked) {
        if (!answers.rightPromptModules.includes(val)) {
          answers.rightPromptModules.push(val);
        }
      } else {
        answers.rightPromptModules = answers.rightPromptModules.filter(v => v !== val);
      }
    });
  });
}

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

// ── Syntax highlighting ──────────────────────────────
function highlightToml(text) {
  return text.split('\n').map(line => {
    // Comments
    if (/^\s*#/.test(line)) {
      return `<span class="token-comment">${escapeHtml(line)}</span>`;
    }
    // Section headers [foo] or [[foo.bar]]
    if (/^\s*\[{1,2}[^\]]+\]{1,2}\s*$/.test(line)) {
      return `<span class="token-section">${escapeHtml(line)}</span>`;
    }
    // Key = value pairs
    const kvMatch = line.match(/^(\s*\S+)(\s*=\s*)(.+)$/);
    if (kvMatch) {
      const key = `<span class="token-key">${escapeHtml(kvMatch[1])}</span>`;
      const eq = escapeHtml(kvMatch[2]);
      const val = highlightValue(kvMatch[3]);
      return key + eq + val;
    }
    return escapeHtml(line);
  }).join('\n');
}

function highlightConf(text) {
  return text.split('\n').map(line => {
    // Comments
    if (/^\s*#/.test(line)) {
      return `<span class="token-comment">${escapeHtml(line)}</span>`;
    }
    // Commands like 'set -g key value', 'bind key action'
    const cmdMatch = line.match(/^(\s*(?:set|setw|bind|unbind|run|source-file)\b)(.*)$/);
    if (cmdMatch) {
      const cmd = `<span class="token-key">${escapeHtml(cmdMatch[1])}</span>`;
      const rest = highlightConfArgs(cmdMatch[2]);
      return cmd + rest;
    }
    return escapeHtml(line);
  }).join('\n');
}

function highlightZsh(text) {
  return text.split('\n').map(line => {
    // Comments
    if (/^\s*#/.test(line)) {
      return `<span class="token-comment">${escapeHtml(line)}</span>`;
    }
    // alias x="y"
    const aliasMatch = line.match(/^(\s*alias\s+)(\S+?)(=)(.+)$/);
    if (aliasMatch) {
      return `<span class="token-key">${escapeHtml(aliasMatch[1])}</span><span class="token-section">${escapeHtml(aliasMatch[2])}</span>${escapeHtml(aliasMatch[3])}${highlightValue(aliasMatch[4])}`;
    }
    // export VAR=val
    const exportMatch = line.match(/^(\s*export\s+)(\w+)(=)(.+)$/);
    if (exportMatch) {
      return `<span class="token-key">${escapeHtml(exportMatch[1])}</span><span class="token-section">${escapeHtml(exportMatch[2])}</span>${escapeHtml(exportMatch[3])}${highlightValue(exportMatch[4])}`;
    }
    // VAR=val
    const varMatch = line.match(/^(\s*\w+)(=)(.+)$/);
    if (varMatch) {
      return `<span class="token-section">${escapeHtml(varMatch[1])}</span>${escapeHtml(varMatch[2])}${highlightValue(varMatch[3])}`;
    }
    // Commands: setopt, autoload, compinit, bindkey, source, zstyle, zinit, plugins
    const cmdMatch = line.match(/^(\s*(?:setopt|autoload|compinit|bindkey|source|zstyle|zinit\s+\w+|plugins)\b)(.*)$/);
    if (cmdMatch) {
      return `<span class="token-key">${escapeHtml(cmdMatch[1])}</span>${escapeHtml(cmdMatch[2])}`;
    }
    return escapeHtml(line);
  }).join('\n');
}

function highlightValue(val) {
  val = val.trim();
  // Quoted strings
  if (/^".*"$/.test(val) || /^'.*'$/.test(val)) {
    return `<span class="token-string">${escapeHtml(val)}</span>`;
  }
  // Booleans
  if (/^(true|false|on|off|yes|no)$/i.test(val)) {
    return `<span class="token-boolean">${escapeHtml(val)}</span>`;
  }
  // Numbers
  if (/^-?\d+(\.\d+)?$/.test(val)) {
    return `<span class="token-number">${escapeHtml(val)}</span>`;
  }
  return escapeHtml(val);
}

function highlightConfArgs(text) {
  // Highlight quoted strings in tmux conf arguments
  return escapeHtml(text).replace(/(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;)/g, '<span class="token-string">$1</span>');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── Dynamic option setup (avoids duplicate listeners) ─
function setupDynamicOptions(root) {
  root.querySelectorAll('.options[data-type="radio"]').forEach(container => {
    container.querySelectorAll('.option').forEach(option => {
      option.addEventListener('click', () => handleRadioClick(container, option));
    });
  });

  root.querySelectorAll('.options[data-type="checkbox"]').forEach(container => {
    container.querySelectorAll('.option').forEach(option => {
      option.addEventListener('click', () => handleCheckboxClick(container, option));
    });
  });
}

// ── Config generation ─────────────────────────────────
function getCharacter() {
  if (answers.character === 'custom' && answers.customCharacter) {
    return answers.customCharacter;
  }
  return answers.character;
}

function getColor() {
  if (answers.customColor) return answers.customColor;
  return answers.color;
}

function generateConfig() {
  const { style, modules } = answers;
  const character = getCharacter();
  const color = getColor();
  const lines = [];

  lines.push('# Starship Configuration');
  lines.push('# Generated by Starship Config Generator');
  lines.push('');

  // Format string
  const isRight = (mod) => answers.rightPromptModules.includes(mod);
  const leftModules = modules.filter(m => !isRight(m));
  const rightModules = modules.filter(m => isRight(m));

  const formatParts = buildFormatParts(style, leftModules);
  if (style === 'multiline') {
    lines.push('format = """');
    lines.push(formatParts.join(''));
    lines.push('"""');
  } else {
    lines.push(`format = "${formatParts.join('')}"`);
  }
  lines.push('');

  // Right prompt
  if (rightModules.length > 0) {
    const rightParts = [];
    if (rightModules.includes('jobs')) rightParts.push('$jobs');
    if (rightModules.includes('memory')) rightParts.push('$memory_usage');
    if (rightModules.includes('cmd_duration')) rightParts.push('$cmd_duration');
    if (rightModules.includes('time')) rightParts.push('$time');
    if (rightModules.includes('battery')) rightParts.push('$battery');
    lines.push(`right_format = "${rightParts.join('')}"`);
    lines.push('');
  }

  // Character
  lines.push('[character]');
  lines.push(`success_symbol = "[${character}](bold ${color})"`);
  lines.push(`error_symbol = "[${character}](bold red)"`);
  lines.push('');

  // Directory
  lines.push('[directory]');
  lines.push(`style = "bold ${color}"`);
  lines.push(`truncation_length = ${answers.dirTruncationLength}`);
  lines.push(`truncate_to_repo = ${answers.dirTruncateToRepo}`);
  lines.push('');

  // Git
  if (modules.includes('git')) {
    lines.push('[git_branch]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    } else if (style === 'bracket') {
      lines.push('format = "[[$symbol$branch](bold purple)]($style) "');
    }
    lines.push('style = "bold purple"');
    lines.push(`truncation_length = ${answers.gitBranchTruncation}`);
    lines.push('');

    lines.push('[git_status]');
    lines.push('style = "bold red"');
    if (answers.gitShowStash) {
      lines.push('stashed = "📦 "');
    }
    if (style === 'nerd') {
      lines.push('conflicted = " "');
      lines.push('ahead = " ${count} "');
      lines.push('behind = " ${count} "');
      lines.push('untracked = " "');
      if (answers.gitShowStash) {
        lines.push('stashed = " ${count} "');
      }
      lines.push('modified = " "');
      lines.push('staged = " "');
      lines.push('deleted = " "');
    }
    lines.push('');
  }

  // Language modules
  if (modules.includes('node')) {
    lines.push('[nodejs]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold green"');
    lines.push('');
  }

  if (modules.includes('python')) {
    lines.push('[python]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold yellow"');
    lines.push('detect_extensions = ["py"]');
    if (!answers.pythonShowVenv) {
      lines.push('format = "via [${symbol}${pyenv_prefix}(${version})]($style) "');
    }
    lines.push('');
  }

  if (modules.includes('golang')) {
    lines.push('[golang]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold cyan"');
    lines.push('');
  }

  if (modules.includes('rust')) {
    lines.push('[rust]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold red"');
    lines.push('');
  }

  if (modules.includes('docker')) {
    lines.push('[docker_context]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold blue"');
    lines.push('');
  }

  if (modules.includes('aws')) {
    lines.push('[aws]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold yellow"');
    lines.push('');
  }

  if (modules.includes('kubernetes')) {
    lines.push('[kubernetes]');
    lines.push('disabled = false');
    if (style === 'nerd') {
      lines.push('symbol = "☸ "');
    }
    lines.push('style = "bold blue"');
    lines.push('');
  }

  if (modules.includes('terraform')) {
    lines.push('[terraform]');
    if (style === 'nerd') {
      lines.push('symbol = "💠 "');
    }
    lines.push('style = "bold purple"');
    lines.push('');
  }

  if (modules.includes('java')) {
    lines.push('[java]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold red"');
    lines.push('');
  }

  if (modules.includes('ruby')) {
    lines.push('[ruby]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold red"');
    lines.push('');
  }

  if (modules.includes('php')) {
    lines.push('[php]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold purple"');
    lines.push('');
  }

  if (modules.includes('package')) {
    lines.push('[package]');
    lines.push('disabled = false');
    if (style === 'nerd') {
      lines.push('symbol = "📦 "');
    }
    lines.push('style = "bold 208"');
    lines.push('');
  }

  if (modules.includes('hostname')) {
    lines.push('[hostname]');
    lines.push('ssh_only = true');
    lines.push('style = "bold green"');
    lines.push('');
  }

  if (modules.includes('username')) {
    lines.push('[username]');
    lines.push('show_always = false');
    lines.push('style_user = "bold yellow"');
    lines.push('style_root = "bold red"');
    lines.push('');
  }

  if (modules.includes('jobs')) {
    lines.push('[jobs]');
    if (style === 'nerd') {
      lines.push('symbol = " "');
    }
    lines.push('style = "bold blue"');
    lines.push('threshold = 1');
    lines.push('');
  }

  if (modules.includes('memory')) {
    lines.push('[memory_usage]');
    lines.push('disabled = false');
    if (style === 'nerd') {
      lines.push('symbol = "󰍛 "');
    }
    lines.push('style = "bold dimmed white"');
    lines.push(`threshold = ${answers.memoryThreshold}`);
    lines.push('');
  }

  if (modules.includes('time')) {
    lines.push('[time]');
    lines.push('disabled = false');
    lines.push(`format = "[$time]($style) "`);
    lines.push(`time_format = "${answers.timeFormat}"`);
    lines.push('style = "bold dimmed white"');
    lines.push('');
  }

  if (modules.includes('battery')) {
    lines.push('[battery]');
    lines.push('full_symbol = "🔋"');
    lines.push('charging_symbol = "⚡"');
    lines.push('discharging_symbol = "💀"');
    lines.push('');
    lines.push('[[battery.display]]');
    lines.push('threshold = 30');
    lines.push('style = "bold red"');
    lines.push('');
  }

  if (modules.includes('cmd_duration')) {
    lines.push('[cmd_duration]');
    lines.push(`min_time = ${answers.cmdDurationMinTime}`);
    lines.push('format = "took [$duration]($style) "');
    lines.push('style = "bold yellow"');
    lines.push('');
  }

  return lines.join('\n');
}

function buildFormatParts(style, modules) {
  const parts = [];

  // Prefix modules (username@hostname before directory)
  const addPrefixModules = (p) => {
    if (modules.includes('username')) p.push('$username');
    if (modules.includes('hostname')) p.push('$hostname');
  };

  // Suffix info modules (after language/cloud modules)
  const addSuffixModules = (p) => {
    if (modules.includes('jobs')) p.push('$jobs');
    if (modules.includes('memory')) p.push('$memory_usage');
    if (modules.includes('cmd_duration')) p.push('$cmd_duration');
    if (modules.includes('time')) p.push('$time');
    if (modules.includes('battery')) p.push('$battery');
  };

  if (style === 'multiline') {
    // Line 1: info
    addPrefixModules(parts);
    parts.push('$directory');
    if (modules.includes('git')) parts.push('$git_branch$git_status');
    addModuleVars(parts, modules);
    addSuffixModules(parts);
    parts.push('\\n');
    // Line 2: prompt
    parts.push('$character');
  } else if (style === 'bracket') {
    addPrefixModules(parts);
    parts.push('\\[');
    parts.push('$directory');
    parts.push('\\] ');
    if (modules.includes('git')) parts.push('$git_branch$git_status');
    addModuleVars(parts, modules);
    addSuffixModules(parts);
    parts.push('$character');
  } else {
    // plain / nerd
    addPrefixModules(parts);
    parts.push('$directory');
    if (modules.includes('git')) parts.push('$git_branch$git_status');
    addModuleVars(parts, modules);
    addSuffixModules(parts);
    parts.push('$character');
  }

  return parts;
}

function addModuleVars(parts, modules) {
  const langModules = ['node', 'python', 'golang', 'rust', 'java', 'ruby', 'php', 'docker', 'aws', 'kubernetes', 'terraform', 'package'];
  const varMap = {
    node: '$nodejs',
    python: '$python',
    golang: '$golang',
    rust: '$rust',
    java: '$java',
    ruby: '$ruby',
    php: '$php',
    docker: '$docker_context',
    aws: '$aws',
    kubernetes: '$kubernetes',
    terraform: '$terraform',
    package: '$package',
  };
  for (const m of langModules) {
    if (modules.includes(m)) parts.push(varMap[m]);
  }
}

// ── Prompt preview ────────────────────────────────────
function buildPromptPreview() {
  const { style, modules } = answers;
  const character = getCharacter();
  const color = getColor();

  const colorMap = {
    cyan: '#56d4dd',
    green: '#3fb950',
    blue: '#58a6ff',
    purple: '#bc8cff',
    yellow: '#d29922',
    red: '#f85149',
    white: '#e6edf3',
  };
  const hex = colorMap[color] || color;

  const isRight = (mod) => answers.rightPromptModules.includes(mod);

  // Build module spans
  const dir = `<span style="color:${hex};font-weight:bold">~/projects/my-app</span>`;

  const gitBranch = (modules.includes('git') && !isRight('git'))
    ? `<span style="color:#bc8cff;font-weight:bold">${style === 'nerd' ? ' ' : 'on '}main</span>`
    : '';
  const gitStatus = (modules.includes('git') && !isRight('git'))
    ? `<span style="color:#f85149"> [+2 ~1]</span>`
    : '';

  const nodeVer = (modules.includes('node') && !isRight('node'))
    ? `<span style="color:#3fb950"> ${style === 'nerd' ? ' ' : ''}v20.11.0</span>`
    : '';

  const pythonVer = (modules.includes('python') && !isRight('python'))
    ? `<span style="color:#d29922"> ${style === 'nerd' ? ' ' : ''}3.12.0</span>`
    : '';

  const goVer = (modules.includes('golang') && !isRight('golang'))
    ? `<span style="color:#56d4dd"> ${style === 'nerd' ? ' ' : ''}1.22</span>`
    : '';

  const rustVer = (modules.includes('rust') && !isRight('rust'))
    ? `<span style="color:#f85149"> ${style === 'nerd' ? ' ' : ''}1.77</span>`
    : '';

  const dockerCtx = (modules.includes('docker') && !isRight('docker'))
    ? `<span style="color:#58a6ff"> ${style === 'nerd' ? ' ' : ''}default</span>`
    : '';

  const awsProfile = (modules.includes('aws') && !isRight('aws'))
    ? `<span style="color:#d29922"> ${style === 'nerd' ? ' ' : ''}dev</span>`
    : '';

  const k8sCtx = (modules.includes('kubernetes') && !isRight('kubernetes'))
    ? `<span style="color:#58a6ff"> ${style === 'nerd' ? '☸ ' : ''}minikube</span>`
    : '';

  const tfWorkspace = (modules.includes('terraform') && !isRight('terraform'))
    ? `<span style="color:#bc8cff"> ${style === 'nerd' ? '💠 ' : ''}default</span>`
    : '';

  const javaVer = (modules.includes('java') && !isRight('java'))
    ? `<span style="color:#f85149"> ${style === 'nerd' ? ' ' : ''}21.0.1</span>`
    : '';

  const rubyVer = (modules.includes('ruby') && !isRight('ruby'))
    ? `<span style="color:#f85149"> ${style === 'nerd' ? ' ' : ''}3.3.0</span>`
    : '';

  const phpVer = (modules.includes('php') && !isRight('php'))
    ? `<span style="color:#bc8cff"> ${style === 'nerd' ? ' ' : ''}8.3.0</span>`
    : '';

  const packageVer = (modules.includes('package') && !isRight('package'))
    ? `<span style="color:#dd6620"> ${style === 'nerd' ? '📦 ' : ''}v1.0.0</span>`
    : '';

  const hostnameStr = (modules.includes('hostname'))
    ? `<span style="color:#3fb950">@myhost</span>`
    : '';

  const usernameStr = (modules.includes('username'))
    ? `<span style="color:#d29922">user</span>`
    : '';

  const jobsPart = (modules.includes('jobs') && !isRight('jobs'))
    ? `<span style="color:#58a6ff"> ${style === 'nerd' ? ' ' : ''}1</span>`
    : '';

  const memoryPart = (modules.includes('memory') && !isRight('memory'))
    ? `<span style="color:#8b949e"> ${style === 'nerd' ? '󰍛 ' : ''}52%</span>`
    : '';

  // Build time string based on format
  let timeStr = '14:30';
  if (answers.timeFormat === '%H:%M:%S') timeStr = '14:30:05';
  else if (answers.timeFormat === '%I:%M %p') timeStr = '02:30 PM';

  const timePart = (modules.includes('time') && !isRight('time'))
    ? `<span style="color:#8b949e">${timeStr}</span> `
    : '';

  const durationPart = (modules.includes('cmd_duration') && !isRight('cmd_duration'))
    ? `<span style="color:#d29922">took 3s</span> `
    : '';

  const batteryPart = (modules.includes('battery') && !isRight('battery'))
    ? `<span style="color:#3fb950">🔋</span> `
    : '';

  const charSpan = `<span style="color:${hex};font-weight:bold">${character === 'custom' && answers.customCharacter ? answers.customCharacter : character}</span>`;

  const allLangModules = nodeVer + pythonVer + goVer + rustVer + javaVer + rubyVer + phpVer + dockerCtx + awsProfile + k8sCtx + tfWorkspace + packageVer;
  const prefixPart = (usernameStr || hostnameStr) ? `${usernameStr}${hostnameStr} ` : '';
  const infoPart = jobsPart + memoryPart;

  // Left prompt
  let preview = '';
  if (style === 'multiline') {
    preview = `${prefixPart}${dir} ${gitBranch}${gitStatus}${allLangModules}${infoPart} ${durationPart}${timePart}${batteryPart}\n${charSpan} `;
  } else if (style === 'bracket') {
    preview = `${prefixPart}[${dir}] ${gitBranch}${gitStatus}${allLangModules}${infoPart} ${durationPart}${timePart}${batteryPart}${charSpan} `;
  } else {
    preview = `${prefixPart}${dir} ${gitBranch}${gitStatus}${allLangModules}${infoPart} ${durationPart}${timePart}${batteryPart}${charSpan} `;
  }

  // Right prompt
  const rightParts = [];
  if (modules.includes('jobs') && isRight('jobs')) {
    rightParts.push(`<span style="color:#58a6ff">${style === 'nerd' ? ' ' : ''}1</span>`);
  }
  if (modules.includes('memory') && isRight('memory')) {
    rightParts.push(`<span style="color:#8b949e">${style === 'nerd' ? '󰍛 ' : ''}52%</span>`);
  }
  if (modules.includes('cmd_duration') && isRight('cmd_duration')) {
    rightParts.push(`<span style="color:#d29922">took 3s</span>`);
  }
  if (modules.includes('time') && isRight('time')) {
    rightParts.push(`<span style="color:#8b949e">${timeStr}</span>`);
  }
  if (modules.includes('battery') && isRight('battery')) {
    rightParts.push(`<span style="color:#3fb950">🔋</span>`);
  }

  let rightPreview = '';
  if (rightParts.length > 0) {
    rightPreview = `<div style="display:flex;justify-content:space-between;align-items:center"><span>${preview}</span><span>${rightParts.join(' ')}</span></div>`;
  }

  if (rightPreview) return rightPreview;
  return preview;
}

// ── Result rendering ──────────────────────────────────
function renderResult() {
  const config = generateConfig();
  document.getElementById('config-output').innerHTML = highlightToml(config);
  const previewHtml = buildPromptPreview();
  document.getElementById('prompt-preview').innerHTML =
    '<div style="color:#8b949e;font-size:0.75rem;margin-bottom:0.5rem">プレビュー (イメージ)</div>' +
    previewHtml +
    '<span style="animation:blink 1s step-end infinite">▌</span>';
}

// ── Copy / Download ───────────────────────────────────
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function copyFromElement(elementId) {
  const text = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast('コピーしました');
  }).catch(() => {
    showToast('コピーに失敗しました');
  });
}

function downloadFromElement(elementId, filename) {
  const text = document.getElementById(elementId).innerText;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function copyConfig() { copyFromElement('config-output'); }
function downloadConfig() { downloadFromElement('config-output', 'starship.toml'); }

// ── tmux config generation ───────────────────────────
function generateTmuxConfig() {
  const lines = [];

  lines.push('# tmux Configuration');
  lines.push('# Generated by Dotfiles Config Generator');
  lines.push('');

  // Prefix key
  if (tmuxAnswers.prefix && tmuxAnswers.prefix !== 'C-b') {
    lines.push('# Change prefix key');
    lines.push('unbind C-b');
    lines.push(`set -g prefix ${tmuxAnswers.prefix}`);
    lines.push(`bind ${tmuxAnswers.prefix} send-prefix`);
    lines.push('');
  }

  // Basic settings
  lines.push('# Basic settings');
  if (tmuxAnswers.mouse) {
    lines.push('set -g mouse on');
  }
  if (tmuxAnswers.baseIndex) {
    lines.push('set -g base-index 1');
    lines.push('setw -g pane-base-index 1');
  }
  if (tmuxAnswers.renumber) {
    lines.push('set -g renumber-windows on');
  }
  if (!tmuxAnswers.autoRename) {
    lines.push('setw -g automatic-rename off');
    lines.push('setw -g allow-rename off');
  }
  if (tmuxAnswers.visualBell) {
    lines.push('set -g visual-bell on');
    lines.push('set -g bell-action any');
  }
  lines.push('set -g escape-time 10');
  lines.push(`set -g history-limit ${tmuxAnswers.historyLimit}`);
  if (tmuxAnswers.focusEvents) {
    lines.push('set -g focus-events on');
  }
  if (tmuxAnswers.clipboard) {
    lines.push('set -g set-clipboard on');
  }
  if (tmuxAnswers.aggressiveResize) {
    lines.push('setw -g aggressive-resize on');
  }
  lines.push(`set -g display-panes-time ${tmuxAnswers.displayPanesTime}`);
  lines.push(`set -g repeat-time ${tmuxAnswers.repeatTime}`);
  lines.push('');

  // Colors
  lines.push('# Colors');
  lines.push(`set -g default-terminal "${tmuxAnswers.terminalType}"`);
  lines.push('');

  // Theme
  const theme = tmuxAnswers.theme;
  if (theme && theme !== 'default') {
    lines.push(`# ${theme.charAt(0).toUpperCase() + theme.slice(1)} theme`);
    const themeColors = getThemeColors(theme);
    lines.push(`set -g status-style "bg=${themeColors.statusBg},fg=${themeColors.statusFg}"`);
    if (tmuxAnswers.activeBorder) {
      lines.push(`set -g pane-active-border-style "fg=${themeColors.activeBorder}"`);
    }
    lines.push(`set -g pane-border-style "fg=${themeColors.border}"`);
    lines.push(`set -g window-status-current-style "bg=${themeColors.activeBg},fg=${themeColors.activeFg}"`);
    lines.push('');
  } else if (tmuxAnswers.activeBorder) {
    lines.push('# Active pane border');
    lines.push('set -g pane-active-border-style "fg=green"');
    lines.push('');
  }

  // Status bar
  lines.push('# Status bar');
  lines.push(`set -g status-position ${tmuxAnswers.statusPosition || 'bottom'}`);
  lines.push(`set -g status-interval ${tmuxAnswers.statusInterval}`);
  lines.push(`set -g status-justify ${tmuxAnswers.statusJustify}`);
  lines.push(`set -g status-left-length ${tmuxAnswers.statusLeftLength}`);
  lines.push(`set -g status-right-length ${tmuxAnswers.statusRightLength}`);

  const leftParts = [];
  const rightParts = [];

  if (tmuxAnswers.statusModules.includes('session')) {
    leftParts.push('[#S]');
  }
  if (tmuxAnswers.statusModules.includes('pane-count')) {
    leftParts.push('[#{window_panes}P]');
  }
  if (tmuxAnswers.statusModules.includes('git')) {
    rightParts.push('#(cd #{pane_current_path}; git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "-")');
  }
  if (tmuxAnswers.statusModules.includes('hostname')) {
    rightParts.push('#H');
  }
  if (tmuxAnswers.statusModules.includes('battery')) {
    rightParts.push('#(cat /sys/class/power_supply/BAT0/capacity 2>/dev/null || pmset -g batt 2>/dev/null | grep -o "[0-9]*%" || echo "N/A")%%');
  }
  if (tmuxAnswers.statusModules.includes('datetime')) {
    rightParts.push('%Y-%m-%d %H:%M');
  }
  if (tmuxAnswers.statusModules.includes('load')) {
    rightParts.push('#(uptime | cut -d "," -f 3-)');
  }
  if (tmuxAnswers.statusModules.includes('uptime')) {
    rightParts.push('#(uptime | sed "s/.*up/up/" | sed "s/,.*user.*//" | xargs)');
  }

  if (leftParts.length > 0) {
    lines.push(`set -g status-left "${leftParts.join(' ')} "`);
  }
  if (rightParts.length > 0) {
    lines.push(`set -g status-right " ${rightParts.join(' | ')}"`);
  }
  lines.push('');

  // Split keys
  const splitKeys = tmuxAnswers.splitKeys;
  if (splitKeys && splitKeys !== 'default') {
    lines.push('# Pane splitting');
    if (splitKeys === 'vim') {
      lines.push('bind | split-window -h');
      lines.push('bind - split-window -v');
    } else if (splitKeys === 'intuitive') {
      lines.push('bind h split-window -h');
      lines.push('bind v split-window -v');
    } else if (splitKeys === 'terminal') {
      lines.push('bind d split-window -h');
      lines.push('bind D split-window -v');
    }
    lines.push('unbind \'"\'');
    lines.push('unbind %');
    lines.push('');
  }

  // Extra bindings
  const extraBindings = tmuxAnswers.extraBindings;
  if (extraBindings.length > 0) {
    lines.push('# Additional keybindings');

    if (extraBindings.includes('vim-navigation')) {
      lines.push('# Vim-style pane navigation');
      lines.push('bind h select-pane -L');
      lines.push('bind j select-pane -D');
      lines.push('bind k select-pane -U');
      lines.push('bind l select-pane -R');
    }

    if (extraBindings.includes('vim-resize')) {
      lines.push('# Vim-style pane resizing');
      lines.push('bind -r H resize-pane -L 5');
      lines.push('bind -r J resize-pane -D 5');
      lines.push('bind -r K resize-pane -U 5');
      lines.push('bind -r L resize-pane -R 5');
    }

    if (extraBindings.includes('reload')) {
      lines.push('# Reload configuration');
      lines.push('bind r source-file ~/.tmux.conf \\; display "Config reloaded!"');
    }

    if (extraBindings.includes('copy-mode-vi')) {
      lines.push('# Vi mode for copy');
      lines.push('setw -g mode-keys vi');
      lines.push('bind -T copy-mode-vi v send-keys -X begin-selection');
      lines.push('bind -T copy-mode-vi y send-keys -X copy-selection-and-cancel');
    }

    if (extraBindings.includes('swap-panes')) {
      lines.push('# Swap panes');
      lines.push('bind { swap-pane -U');
      lines.push('bind } swap-pane -D');
    }

    if (extraBindings.includes('synchronize')) {
      lines.push('# Synchronize panes');
      lines.push('bind S setw synchronize-panes');
    }

    if (extraBindings.includes('window-move')) {
      lines.push('# Window navigation with Shift+arrows');
      lines.push('bind -n S-Left previous-window');
      lines.push('bind -n S-Right next-window');
    }

    if (extraBindings.includes('new-window')) {
      lines.push('# New window (tab) with prefix + t');
      lines.push('bind t new-window');
    }

    if (extraBindings.includes('session-switch')) {
      lines.push('# Session switching');
      lines.push('bind ( switch-client -p');
      lines.push('bind ) switch-client -n');
    }

    if (extraBindings.includes('layout-cycle')) {
      lines.push('# Cycle through layouts');
      lines.push('bind Space next-layout');
    }

    if (extraBindings.includes('zoom-pane')) {
      lines.push('# Zoom pane toggle');
      lines.push('bind z resize-pane -Z');
    }

    if (extraBindings.includes('kill-pane')) {
      lines.push('# Kill pane/window without confirmation');
      lines.push('bind x kill-pane');
      lines.push('bind X kill-window');
    }

    if (extraBindings.includes('clear-history')) {
      lines.push('# Clear screen and scrollback');
      lines.push('bind C-l send-keys C-l \\; clear-history');
    }

    lines.push('');
  }

  // Plugins
  const plugins = tmuxAnswers.plugins;
  if (plugins.length > 0) {
    lines.push('# Plugins (tpm)');

    if (plugins.includes('tpm')) {
      lines.push('set -g @plugin \'tmux-plugins/tpm\'');
    }
    if (plugins.includes('sensible')) {
      lines.push('set -g @plugin \'tmux-plugins/tmux-sensible\'');
    }
    if (plugins.includes('resurrect')) {
      lines.push('set -g @plugin \'tmux-plugins/tmux-resurrect\'');
    }
    if (plugins.includes('continuum')) {
      lines.push('set -g @plugin \'tmux-plugins/tmux-continuum\'');
      lines.push('set -g @continuum-restore \'on\'');
    }
    if (plugins.includes('yank')) {
      lines.push('set -g @plugin \'tmux-plugins/tmux-yank\'');
    }
    lines.push('');

    if (plugins.includes('tpm')) {
      lines.push('# Initialize tpm (keep this line at the very bottom)');
      lines.push('run \'~/.tmux/plugins/tpm/tpm\'');
      lines.push('');
    }
  }

  return lines.join('\n');
}

function getThemeColors(theme) {
  const themes = {
    nord: {
      statusBg: '#2E3440',
      statusFg: '#D8DEE9',
      activeBorder: '#88C0D0',
      border: '#4C566A',
      activeBg: '#5E81AC',
      activeFg: '#ECEFF4',
    },
    dracula: {
      statusBg: '#282a36',
      statusFg: '#f8f8f2',
      activeBorder: '#bd93f9',
      border: '#44475a',
      activeBg: '#bd93f9',
      activeFg: '#282a36',
    },
    gruvbox: {
      statusBg: '#282828',
      statusFg: '#ebdbb2',
      activeBorder: '#fe8019',
      border: '#3c3836',
      activeBg: '#fe8019',
      activeFg: '#282828',
    },
    github: {
      statusBg: '#161b22',
      statusFg: '#e6edf3',
      activeBorder: '#dd6620',
      border: '#30363d',
      activeBg: '#dd6620',
      activeFg: '#ffffff',
    },
    tokyonight: {
      statusBg: '#1a1b26',
      statusFg: '#c0caf5',
      activeBorder: '#7aa2f7',
      border: '#3b4261',
      activeBg: '#7aa2f7',
      activeFg: '#1a1b26',
    },
    catppuccin: {
      statusBg: '#1e1e2e',
      statusFg: '#cdd6f4',
      activeBorder: '#cba6f7',
      border: '#45475a',
      activeBg: '#cba6f7',
      activeFg: '#1e1e2e',
    },
    solarized: {
      statusBg: '#002b36',
      statusFg: '#839496',
      activeBorder: '#268bd2',
      border: '#073642',
      activeBg: '#268bd2',
      activeFg: '#fdf6e3',
    },
  };
  return themes[theme] || themes.github;
}

// ── tmux status bar preview ───────────────────────────
function buildTmuxStatusPreview() {
  const theme = tmuxAnswers.theme;
  const themeColors = (theme && theme !== 'default') ? getThemeColors(theme) : {
    statusBg: '#333333', statusFg: '#ffffff', activeBg: '#00ff00', activeFg: '#000000',
  };

  const leftParts = [];
  const rightParts = [];

  if (tmuxAnswers.statusModules.includes('session')) leftParts.push('[main]');
  if (tmuxAnswers.statusModules.includes('pane-count')) leftParts.push('[2P]');

  if (tmuxAnswers.statusModules.includes('git')) rightParts.push('main');
  if (tmuxAnswers.statusModules.includes('hostname')) rightParts.push('myhost');
  if (tmuxAnswers.statusModules.includes('battery')) rightParts.push('85%');
  if (tmuxAnswers.statusModules.includes('datetime')) rightParts.push('2026-02-15 14:30');
  if (tmuxAnswers.statusModules.includes('load')) rightParts.push('0.42 0.38 0.35');
  if (tmuxAnswers.statusModules.includes('uptime')) rightParts.push('up 3d 2h');

  const windowHtml = `<span class="tmux-preview-window">1:zsh</span><span class="tmux-preview-window active" style="background:${themeColors.activeBg};color:${themeColors.activeFg};border-radius:2px">2:vim*</span><span class="tmux-preview-window">3:htop</span>`;

  const position = tmuxAnswers.statusPosition || 'bottom';
  const statusBar = `<div class="tmux-preview-status" style="background:${themeColors.statusBg};color:${themeColors.statusFg}">
    <span class="tmux-preview-status-left">${leftParts.join(' ')}</span>
    <span class="tmux-preview-status-center">${windowHtml}</span>
    <span class="tmux-preview-status-right">${rightParts.join(' | ')}</span>
  </div>`;

  const preview = document.getElementById('tmux-preview');
  if (!preview) return;

  const content = preview.querySelector('.tmux-preview-content');
  const existingStatus = preview.querySelector('.tmux-preview-status');
  if (existingStatus) existingStatus.remove();

  if (position === 'top') {
    content.insertAdjacentHTML('beforebegin', statusBar);
  } else {
    content.insertAdjacentHTML('afterend', statusBar);
  }
}

// ── tmux result rendering ─────────────────────────────
function renderTmuxResult() {
  const config = generateTmuxConfig();
  document.getElementById('tmux-config-output').innerHTML = highlightConf(config);
  buildTmuxStatusPreview();
}

function copyTmuxConfig() { copyFromElement('tmux-config-output'); }
function downloadTmuxConfig() { downloadFromElement('tmux-config-output', '.tmux.conf'); }

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

function copyZshConfig() { copyFromElement('zsh-config-output'); }
function downloadZshConfig() { downloadFromElement('zsh-config-output', '.zshrc'); }

// Neovim toggle/range listeners are now handled by the data-driven
// TOGGLE_BINDINGS, RANGE_BINDINGS, and setupToggleAndRangeListeners().

// ── Neovim plugins section (Step 2) ───────────────────
function buildNeovimPluginsSection() {
  const container = document.getElementById('neovim-plugins-container');
  if (!container) return;
  container.innerHTML = '';

  const pm = neovimAnswers.pluginManager;
  if (pm === 'none') {
    const note = document.createElement('p');
    note.className = 'detail-note';
    note.textContent = 'プラグインマネージャーを使用しないため、カラースキームは手動でインストールしてください。';
    container.appendChild(note);
    return;
  }

  const pluginsSection = document.createElement('div');
  pluginsSection.className = 'detail-section';
  pluginsSection.innerHTML = `
    <h3>プラグイン</h3>
    <div class="bulk-actions">
      <button class="bulk-btn" onclick="bulkSelect('neovim-plugins', true)">すべて選択</button>
      <button class="bulk-btn" onclick="bulkSelect('neovim-plugins', false)">すべて解除</button>
    </div>
    <div class="options" data-key="neovim-plugins" data-type="checkbox">
      <div class="option" data-value="treesitter">
        <div class="option-check"></div>
        <div class="option-label">nvim-treesitter<small>高速なシンタックスハイライト</small></div>
      </div>
      <div class="option" data-value="lsp">
        <div class="option-check"></div>
        <div class="option-label">nvim-lspconfig<small>LSP クライアントの設定</small></div>
      </div>
      <div class="option" data-value="cmp">
        <div class="option-check"></div>
        <div class="option-label">nvim-cmp<small>自動補完エンジン</small></div>
      </div>
      <div class="option" data-value="telescope">
        <div class="option-check"></div>
        <div class="option-label">telescope.nvim<small>ファジーファインダー</small></div>
      </div>
      <div class="option" data-value="nvim-tree">
        <div class="option-check"></div>
        <div class="option-label">nvim-tree<small>ファイルエクスプローラー</small></div>
      </div>
      <div class="option" data-value="lualine">
        <div class="option-check"></div>
        <div class="option-label">lualine.nvim<small>ステータスライン</small></div>
      </div>
      <div class="option" data-value="gitsigns">
        <div class="option-check"></div>
        <div class="option-label">gitsigns.nvim<small>Git の変更表示</small></div>
      </div>
      <div class="option" data-value="autopairs">
        <div class="option-check"></div>
        <div class="option-label">nvim-autopairs<small>括弧の自動補完</small></div>
      </div>
      <div class="option" data-value="comment">
        <div class="option-check"></div>
        <div class="option-label">Comment.nvim<small>コメントのトグル</small></div>
      </div>
      <div class="option" data-value="indent-blankline">
        <div class="option-check"></div>
        <div class="option-label">indent-blankline<small>インデントガイド表示</small></div>
      </div>
      <div class="option" data-value="bufferline">
        <div class="option-check"></div>
        <div class="option-label">bufferline.nvim<small>タブ風バッファライン</small></div>
      </div>
      <div class="option" data-value="which-key">
        <div class="option-check"></div>
        <div class="option-label">which-key.nvim<small>キーバインドのヘルプ表示</small></div>
      </div>
    </div>
  `;
  container.appendChild(pluginsSection);

  setupDynamicOptions(container);
}

// ── Neovim Lua syntax highlighting ────────────────────
function highlightLua(text) {
  return text.split('\n').map(line => {
    // Comments
    if (/^\s*--/.test(line)) {
      return `<span class="token-comment">${escapeHtml(line)}</span>`;
    }
    // Strings
    let result = escapeHtml(line);
    result = result.replace(/(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;)/g, '<span class="token-string">$1</span>');
    // Booleans
    result = result.replace(/\b(true|false|nil)\b/g, '<span class="token-boolean">$1</span>');
    // Numbers
    result = result.replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>');
    // Keywords
    result = result.replace(/\b(local|return|if|then|else|elseif|end|function|require|for|do|in)\b/g, '<span class="token-key">$1</span>');
    return result;
  }).join('\n');
}

// ── Neovim config generation ──────────────────────────
function generateNeovimConfig() {
  const lines = [];
  const pm = neovimAnswers.pluginManager;

  lines.push('-- Neovim Configuration');
  lines.push('-- Generated by Dotfiles Config Generator');
  lines.push('');

  // Leader key
  const leaderMap = { space: ' ', comma: ',', backslash: '\\\\' };
  const leaderKey = leaderMap[neovimAnswers.leader] || ' ';
  lines.push('-- Leader key');
  lines.push(`vim.g.mapleader = "${leaderKey}"`);
  lines.push(`vim.g.maplocalleader = "${leaderKey}"`);
  lines.push('');

  // Basic options
  lines.push('-- Basic options');
  const opt = neovimAnswers;
  if (opt.number) lines.push('vim.opt.number = true');
  if (opt.relativenumber) lines.push('vim.opt.relativenumber = true');
  if (opt.cursorline) lines.push('vim.opt.cursorline = true');
  if (opt.signcolumn) lines.push('vim.opt.signcolumn = "yes"');
  if (!opt.wrap) lines.push('vim.opt.wrap = false');
  if (opt.termguicolors) lines.push('vim.opt.termguicolors = true');
  lines.push(`vim.opt.scrolloff = ${opt.scrolloff}`);
  lines.push('');

  // Indent
  lines.push('-- Indent settings');
  lines.push(`vim.opt.tabstop = ${opt.tabWidth}`);
  lines.push(`vim.opt.shiftwidth = ${opt.tabWidth}`);
  lines.push(`vim.opt.softtabstop = ${opt.tabWidth}`);
  if (opt.expandtab) lines.push('vim.opt.expandtab = true');
  if (opt.smartindent) lines.push('vim.opt.smartindent = true');
  lines.push('');

  // Search
  lines.push('-- Search settings');
  if (opt.ignorecase) lines.push('vim.opt.ignorecase = true');
  if (opt.smartcase) lines.push('vim.opt.smartcase = true');
  if (opt.hlsearch) lines.push('vim.opt.hlsearch = true');
  lines.push('vim.opt.incsearch = true');
  lines.push('');

  // Misc
  lines.push('-- Misc settings');
  if (opt.clipboard) lines.push('vim.opt.clipboard = "unnamedplus"');
  if (opt.mouse) lines.push('vim.opt.mouse = "a"');
  if (opt.swapfile) lines.push('vim.opt.swapfile = false');
  if (opt.undofile) lines.push('vim.opt.undofile = true');
  if (opt.splitright) lines.push('vim.opt.splitright = true');
  if (opt.splitbelow) lines.push('vim.opt.splitbelow = true');
  lines.push('vim.opt.updatetime = 250');
  lines.push('vim.opt.timeoutlen = 300');
  lines.push('');

  // Plugin manager + plugins
  if (pm === 'lazy') {
    lines.push('-- Bootstrap lazy.nvim');
    lines.push('local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"');
    lines.push('if not vim.loop.fs_stat(lazypath) then');
    lines.push('  vim.fn.system({');
    lines.push('    "git", "clone", "--filter=blob:none",');
    lines.push('    "https://github.com/folke/lazy.nvim.git",');
    lines.push('    "--branch=stable", lazypath,');
    lines.push('  })');
    lines.push('end');
    lines.push('vim.opt.rtp:prepend(lazypath)');
    lines.push('');
    lines.push('require("lazy").setup({');
    appendLazyPlugins(lines);
    lines.push('})');
    lines.push('');
  } else if (pm === 'packer') {
    lines.push('-- Bootstrap packer.nvim');
    lines.push('local ensure_packer = function()');
    lines.push('  local fn = vim.fn');
    lines.push('  local install_path = fn.stdpath("data") .. "/site/pack/packer/start/packer.nvim"');
    lines.push('  if fn.empty(fn.glob(install_path)) > 0 then');
    lines.push('    fn.system({"git", "clone", "--depth", "1", "https://github.com/wbthomason/packer.nvim", install_path})');
    lines.push('    vim.cmd([[packadd packer.nvim]])');
    lines.push('    return true');
    lines.push('  end');
    lines.push('  return false');
    lines.push('end');
    lines.push('local packer_bootstrap = ensure_packer()');
    lines.push('');
    lines.push('require("packer").startup(function(use)');
    lines.push('  use "wbthomason/packer.nvim"');
    appendPackerPlugins(lines);
    lines.push('  if packer_bootstrap then');
    lines.push('    require("packer").sync()');
    lines.push('  end');
    lines.push('end)');
    lines.push('');
  }

  // Colorscheme
  if (neovimAnswers.colorscheme) {
    lines.push('-- Colorscheme');
    lines.push(`vim.cmd.colorscheme("${neovimAnswers.colorscheme}")`);
    lines.push('');
  }

  // Plugin setup calls
  if (pm !== 'none') {
    appendPluginSetup(lines);
  }

  // Keymaps
  const km = neovimAnswers.keymaps;
  if (km.length > 0) {
    lines.push('-- Keymaps');
    lines.push('local keymap = vim.keymap.set');
    lines.push('');

    if (km.includes('window-nav')) {
      lines.push('-- Window navigation');
      lines.push('keymap("n", "<C-h>", "<C-w>h", { desc = "Move to left window" })');
      lines.push('keymap("n", "<C-j>", "<C-w>j", { desc = "Move to lower window" })');
      lines.push('keymap("n", "<C-k>", "<C-w>k", { desc = "Move to upper window" })');
      lines.push('keymap("n", "<C-l>", "<C-w>l", { desc = "Move to right window" })');
      lines.push('');
    }

    if (km.includes('buffer-nav')) {
      lines.push('-- Buffer navigation');
      lines.push('keymap("n", "<S-h>", ":bprevious<CR>", { desc = "Previous buffer" })');
      lines.push('keymap("n", "<S-l>", ":bnext<CR>", { desc = "Next buffer" })');
      lines.push('');
    }

    if (km.includes('move-lines')) {
      lines.push('-- Move lines');
      lines.push('keymap("n", "<A-j>", ":m .+1<CR>==", { desc = "Move line down" })');
      lines.push('keymap("n", "<A-k>", ":m .-2<CR>==", { desc = "Move line up" })');
      lines.push('keymap("v", "<A-j>", ":m \'>+1<CR>gv=gv", { desc = "Move selection down" })');
      lines.push('keymap("v", "<A-k>", ":m \'<-2<CR>gv=gv", { desc = "Move selection up" })');
      lines.push('');
    }

    if (km.includes('clear-search')) {
      lines.push('-- Clear search highlight');
      lines.push('keymap("n", "<Esc>", ":nohlsearch<CR>", { desc = "Clear search highlight" })');
      lines.push('');
    }

    if (km.includes('better-indent')) {
      lines.push('-- Better indenting');
      lines.push('keymap("v", "<", "<gv", { desc = "Indent left and reselect" })');
      lines.push('keymap("v", ">", ">gv", { desc = "Indent right and reselect" })');
      lines.push('');
    }

    if (km.includes('save-file')) {
      lines.push('-- Save file');
      lines.push('keymap("n", "<C-s>", ":w<CR>", { desc = "Save file" })');
      lines.push('keymap("i", "<C-s>", "<Esc>:w<CR>", { desc = "Save file" })');
      lines.push('');
    }

    if (km.includes('quit')) {
      lines.push('-- Quit');
      lines.push('keymap("n", "<leader>q", ":q<CR>", { desc = "Quit" })');
      lines.push('');
    }

    if (km.includes('split-window')) {
      lines.push('-- Split window');
      lines.push('keymap("n", "<leader>|", ":vsplit<CR>", { desc = "Vertical split" })');
      lines.push('keymap("n", "<leader>-", ":split<CR>", { desc = "Horizontal split" })');
      lines.push('');
    }

    if (km.includes('diagnostic-nav')) {
      lines.push('-- Diagnostic navigation');
      lines.push('keymap("n", "[d", vim.diagnostic.goto_prev, { desc = "Previous diagnostic" })');
      lines.push('keymap("n", "]d", vim.diagnostic.goto_next, { desc = "Next diagnostic" })');
      lines.push('keymap("n", "<leader>d", vim.diagnostic.open_float, { desc = "Show diagnostic" })');
      lines.push('');
    }

    // Telescope keymaps
    if (neovimAnswers.plugins.includes('telescope')) {
      lines.push('-- Telescope keymaps');
      lines.push('keymap("n", "<leader>ff", ":Telescope find_files<CR>", { desc = "Find files" })');
      lines.push('keymap("n", "<leader>fg", ":Telescope live_grep<CR>", { desc = "Live grep" })');
      lines.push('keymap("n", "<leader>fb", ":Telescope buffers<CR>", { desc = "Buffers" })');
      lines.push('keymap("n", "<leader>fh", ":Telescope help_tags<CR>", { desc = "Help tags" })');
      lines.push('');
    }

    // Nvim-tree keymap
    if (neovimAnswers.plugins.includes('nvim-tree')) {
      lines.push('-- File explorer');
      lines.push('keymap("n", "<leader>e", ":NvimTreeToggle<CR>", { desc = "Toggle file explorer" })');
      lines.push('');
    }
  }

  return lines.join('\n');
}

function appendLazyPlugins(lines) {
  const cs = neovimAnswers.colorscheme;
  const csRepoMap = {
    catppuccin: '"catppuccin/nvim", name = "catppuccin", priority = 1000',
    tokyonight: '"folke/tokyonight.nvim", priority = 1000',
    gruvbox: '"ellisonleao/gruvbox.nvim", priority = 1000',
    nord: '"shaunsingh/nord.nvim", priority = 1000',
    dracula: '"Mofiqul/dracula.nvim", priority = 1000',
    onedark: '"navarasu/onedark.nvim", priority = 1000',
    'rose-pine': '"rose-pine/neovim", name = "rose-pine", priority = 1000',
    kanagawa: '"rebelot/kanagawa.nvim", priority = 1000',
  };
  if (cs && csRepoMap[cs]) {
    lines.push(`  { ${csRepoMap[cs]} },`);
  }

  const plugins = neovimAnswers.plugins;
  if (plugins.includes('treesitter')) {
    lines.push('  { "nvim-treesitter/nvim-treesitter", build = ":TSUpdate" },');
  }
  if (plugins.includes('lsp')) {
    lines.push('  { "neovim/nvim-lspconfig" },');
  }
  if (plugins.includes('cmp')) {
    lines.push('  { "hrsh7th/nvim-cmp", dependencies = { "hrsh7th/cmp-nvim-lsp", "hrsh7th/cmp-buffer", "hrsh7th/cmp-path", "L3MON4D3/LuaSnip", "saadparwaiz1/cmp_luasnip" } },');
  }
  if (plugins.includes('telescope')) {
    lines.push('  { "nvim-telescope/telescope.nvim", dependencies = { "nvim-lua/plenary.nvim" } },');
  }
  if (plugins.includes('nvim-tree')) {
    lines.push('  { "nvim-tree/nvim-tree.lua", dependencies = { "nvim-tree/nvim-web-devicons" } },');
  }
  if (plugins.includes('lualine')) {
    lines.push('  { "nvim-lualine/lualine.nvim", dependencies = { "nvim-tree/nvim-web-devicons" } },');
  }
  if (plugins.includes('gitsigns')) {
    lines.push('  { "lewis6991/gitsigns.nvim" },');
  }
  if (plugins.includes('autopairs')) {
    lines.push('  { "windwp/nvim-autopairs", event = "InsertEnter" },');
  }
  if (plugins.includes('comment')) {
    lines.push('  { "numToStr/Comment.nvim" },');
  }
  if (plugins.includes('indent-blankline')) {
    lines.push('  { "lukas-reineke/indent-blankline.nvim", main = "ibl" },');
  }
  if (plugins.includes('bufferline')) {
    lines.push('  { "akinsho/bufferline.nvim", dependencies = { "nvim-tree/nvim-web-devicons" } },');
  }
  if (plugins.includes('which-key')) {
    lines.push('  { "folke/which-key.nvim", event = "VeryLazy" },');
  }
}

function appendPackerPlugins(lines) {
  const cs = neovimAnswers.colorscheme;
  const csRepoMap = {
    catppuccin: 'catppuccin/nvim',
    tokyonight: 'folke/tokyonight.nvim',
    gruvbox: 'ellisonleao/gruvbox.nvim',
    nord: 'shaunsingh/nord.nvim',
    dracula: 'Mofiqul/dracula.nvim',
    onedark: 'navarasu/onedark.nvim',
    'rose-pine': 'rose-pine/neovim',
    kanagawa: 'rebelot/kanagawa.nvim',
  };
  if (cs && csRepoMap[cs]) {
    lines.push(`  use "${csRepoMap[cs]}"`);
  }

  const plugins = neovimAnswers.plugins;
  if (plugins.includes('treesitter')) {
    lines.push('  use { "nvim-treesitter/nvim-treesitter", run = ":TSUpdate" }');
  }
  if (plugins.includes('lsp')) {
    lines.push('  use "neovim/nvim-lspconfig"');
  }
  if (plugins.includes('cmp')) {
    lines.push('  use { "hrsh7th/nvim-cmp", requires = { "hrsh7th/cmp-nvim-lsp", "hrsh7th/cmp-buffer", "hrsh7th/cmp-path", "L3MON4D3/LuaSnip", "saadparwaiz1/cmp_luasnip" } }');
  }
  if (plugins.includes('telescope')) {
    lines.push('  use { "nvim-telescope/telescope.nvim", requires = { "nvim-lua/plenary.nvim" } }');
  }
  if (plugins.includes('nvim-tree')) {
    lines.push('  use { "nvim-tree/nvim-tree.lua", requires = { "nvim-tree/nvim-web-devicons" } }');
  }
  if (plugins.includes('lualine')) {
    lines.push('  use { "nvim-lualine/lualine.nvim", requires = { "nvim-tree/nvim-web-devicons" } }');
  }
  if (plugins.includes('gitsigns')) {
    lines.push('  use "lewis6991/gitsigns.nvim"');
  }
  if (plugins.includes('autopairs')) {
    lines.push('  use "windwp/nvim-autopairs"');
  }
  if (plugins.includes('comment')) {
    lines.push('  use "numToStr/Comment.nvim"');
  }
  if (plugins.includes('indent-blankline')) {
    lines.push('  use "lukas-reineke/indent-blankline.nvim"');
  }
  if (plugins.includes('bufferline')) {
    lines.push('  use { "akinsho/bufferline.nvim", requires = { "nvim-tree/nvim-web-devicons" } }');
  }
  if (plugins.includes('which-key')) {
    lines.push('  use "folke/which-key.nvim"');
  }
}

function appendPluginSetup(lines) {
  const plugins = neovimAnswers.plugins;

  if (plugins.includes('treesitter')) {
    lines.push('-- Treesitter');
    lines.push('require("nvim-treesitter.configs").setup({');
    lines.push('  ensure_installed = { "lua", "vim", "vimdoc", "javascript", "typescript", "python", "html", "css", "json", "yaml", "bash" },');
    lines.push('  highlight = { enable = true },');
    lines.push('  indent = { enable = true },');
    lines.push('})');
    lines.push('');
  }

  if (plugins.includes('lsp')) {
    lines.push('-- LSP');
    lines.push('local lspconfig = require("lspconfig")');
    lines.push('-- Add your language servers here, e.g.:');
    lines.push('-- lspconfig.lua_ls.setup({})');
    lines.push('-- lspconfig.ts_ls.setup({})');
    lines.push('-- lspconfig.pyright.setup({})');
    lines.push('');
  }

  if (plugins.includes('cmp')) {
    lines.push('-- Completion');
    lines.push('local cmp = require("cmp")');
    lines.push('local luasnip = require("luasnip")');
    lines.push('cmp.setup({');
    lines.push('  snippet = {');
    lines.push('    expand = function(args) luasnip.lsp_expand(args.body) end,');
    lines.push('  },');
    lines.push('  mapping = cmp.mapping.preset.insert({');
    lines.push('    ["<C-b>"] = cmp.mapping.scroll_docs(-4),');
    lines.push('    ["<C-f>"] = cmp.mapping.scroll_docs(4),');
    lines.push('    ["<C-Space>"] = cmp.mapping.complete(),');
    lines.push('    ["<C-e>"] = cmp.mapping.abort(),');
    lines.push('    ["<CR>"] = cmp.mapping.confirm({ select = true }),');
    lines.push('  }),');
    lines.push('  sources = cmp.config.sources({');
    lines.push('    { name = "nvim_lsp" },');
    lines.push('    { name = "luasnip" },');
    lines.push('  }, {');
    lines.push('    { name = "buffer" },');
    lines.push('    { name = "path" },');
    lines.push('  }),');
    lines.push('})');
    lines.push('');
  }

  if (plugins.includes('telescope')) {
    lines.push('-- Telescope');
    lines.push('require("telescope").setup({})');
    lines.push('');
  }

  if (plugins.includes('nvim-tree')) {
    lines.push('-- File explorer');
    lines.push('require("nvim-tree").setup({})');
    lines.push('');
  }

  if (plugins.includes('lualine')) {
    lines.push('-- Statusline');
    const cs = neovimAnswers.colorscheme;
    const lualineTheme = cs || 'auto';
    lines.push(`require("lualine").setup({ options = { theme = "${lualineTheme}" } })`);
    lines.push('');
  }

  if (plugins.includes('gitsigns')) {
    lines.push('-- Git signs');
    lines.push('require("gitsigns").setup({})');
    lines.push('');
  }

  if (plugins.includes('autopairs')) {
    lines.push('-- Autopairs');
    lines.push('require("nvim-autopairs").setup({})');
    lines.push('');
  }

  if (plugins.includes('comment')) {
    lines.push('-- Comment');
    lines.push('require("Comment").setup({})');
    lines.push('');
  }

  if (plugins.includes('indent-blankline')) {
    lines.push('-- Indent guides');
    lines.push('require("ibl").setup({})');
    lines.push('');
  }

  if (plugins.includes('bufferline')) {
    lines.push('-- Bufferline');
    lines.push('require("bufferline").setup({})');
    lines.push('');
  }

  if (plugins.includes('which-key')) {
    lines.push('-- Which-key');
    lines.push('require("which-key").setup({})');
    lines.push('');
  }
}

// ── Neovim theme colors for preview ───────────────────
function getNeovimThemeColors(theme) {
  const themes = {
    catppuccin: {
      bg: '#1e1e2e', fg: '#cdd6f4', lineNum: '#585b70', cursorLine: '#313244',
      accent: '#cba6f7', keyword: '#cba6f7', string: '#a6e3a1', comment: '#6c7086',
      func: '#89b4fa', type: '#f9e2af', statusBg: '#181825', statusFg: '#cdd6f4',
      sidebarBg: '#181825', border: '#313244', number: '#fab387',
    },
    tokyonight: {
      bg: '#1a1b26', fg: '#c0caf5', lineNum: '#3b4261', cursorLine: '#292e42',
      accent: '#7aa2f7', keyword: '#bb9af7', string: '#9ece6a', comment: '#565f89',
      func: '#7aa2f7', type: '#e0af68', statusBg: '#16161e', statusFg: '#c0caf5',
      sidebarBg: '#16161e', border: '#3b4261', number: '#ff9e64',
    },
    gruvbox: {
      bg: '#282828', fg: '#ebdbb2', lineNum: '#504945', cursorLine: '#3c3836',
      accent: '#fe8019', keyword: '#fb4934', string: '#b8bb26', comment: '#928374',
      func: '#fabd2f', type: '#8ec07c', statusBg: '#1d2021', statusFg: '#ebdbb2',
      sidebarBg: '#1d2021', border: '#3c3836', number: '#d3869b',
    },
    nord: {
      bg: '#2e3440', fg: '#d8dee9', lineNum: '#4c566a', cursorLine: '#3b4252',
      accent: '#88c0d0', keyword: '#81a1c1', string: '#a3be8c', comment: '#616e88',
      func: '#88c0d0', type: '#ebcb8b', statusBg: '#242933', statusFg: '#d8dee9',
      sidebarBg: '#242933', border: '#4c566a', number: '#b48ead',
    },
    dracula: {
      bg: '#282a36', fg: '#f8f8f2', lineNum: '#44475a', cursorLine: '#44475a',
      accent: '#bd93f9', keyword: '#ff79c6', string: '#f1fa8c', comment: '#6272a4',
      func: '#50fa7b', type: '#8be9fd', statusBg: '#21222c', statusFg: '#f8f8f2',
      sidebarBg: '#21222c', border: '#44475a', number: '#bd93f9',
    },
    onedark: {
      bg: '#282c34', fg: '#abb2bf', lineNum: '#4b5263', cursorLine: '#2c313c',
      accent: '#61afef', keyword: '#c678dd', string: '#98c379', comment: '#5c6370',
      func: '#61afef', type: '#e5c07b', statusBg: '#21252b', statusFg: '#abb2bf',
      sidebarBg: '#21252b', border: '#3e4452', number: '#d19a66',
    },
    'rose-pine': {
      bg: '#191724', fg: '#e0def4', lineNum: '#44415a', cursorLine: '#26233a',
      accent: '#c4a7e7', keyword: '#31748f', string: '#f6c177', comment: '#6e6a86',
      func: '#9ccfd8', type: '#c4a7e7', statusBg: '#1f1d2e', statusFg: '#e0def4',
      sidebarBg: '#1f1d2e', border: '#44415a', number: '#eb6f92',
    },
    kanagawa: {
      bg: '#1f1f28', fg: '#dcd7ba', lineNum: '#54546d', cursorLine: '#2a2a37',
      accent: '#7e9cd8', keyword: '#957fb8', string: '#98bb6c', comment: '#727169',
      func: '#7e9cd8', type: '#e6c384', statusBg: '#16161d', statusFg: '#dcd7ba',
      sidebarBg: '#16161d', border: '#54546d', number: '#d27e99',
    },
  };
  return themes[theme] || themes.catppuccin;
}

// ── Neovim preview simulation ─────────────────────────
function buildNeovimPreview() {
  const preview = document.getElementById('nvim-preview');
  if (!preview) return;

  const theme = neovimAnswers.colorscheme || 'catppuccin';
  const colors = getNeovimThemeColors(theme);
  const plugins = neovimAnswers.plugins;
  const hasTree = plugins.includes('nvim-tree');
  const hasLualine = plugins.includes('lualine');
  const hasBufferline = plugins.includes('bufferline');
  const hasGitsigns = plugins.includes('gitsigns');
  const hasIndent = plugins.includes('indent-blankline');

  // Sample code lines
  const codeLines = [
    { num: 1, text: '<span style="color:{{keyword}}">local</span> M = {}', git: '' },
    { num: 2, text: '', git: '' },
    { num: 3, text: '<span style="color:{{comment}}">-- Calculate the sum of numbers</span>', git: '' },
    { num: 4, text: '<span style="color:{{keyword}}">function</span> <span style="color:{{func}}">M.sum</span>(a, b)', git: '+' },
    { num: 5, text: '{{indent}}<span style="color:{{keyword}}">return</span> a + b', git: '+' },
    { num: 6, text: '<span style="color:{{keyword}}">end</span>', git: '+' },
    { num: 7, text: '', git: '' },
    { num: 8, text: '<span style="color:{{keyword}}">function</span> <span style="color:{{func}}">M.greet</span>(name)', git: '' },
    { num: 9, text: '{{indent}}<span style="color:{{keyword}}">local</span> msg = <span style="color:{{string}}">"Hello, "</span> .. name', git: '~' },
    { num: 10, text: '{{indent}}<span style="color:{{keyword}}">return</span> msg', git: '' },
    { num: 11, text: '<span style="color:{{keyword}}">end</span>', git: '' },
    { num: 12, text: '', git: '' },
    { num: 13, text: '<span style="color:{{keyword}}">return</span> M', git: '' },
  ];

  const indentGuide = hasIndent ? `<span style="color:${colors.border}">│</span> ` : '  ';

  let html = '';

  // Titlebar
  html += `<div class="nvim-preview-titlebar" style="background:${colors.sidebarBg};color:${colors.comment}">`;
  html += `<span>NVIM</span>`;
  html += `<span>init.lua</span>`;
  html += `</div>`;

  // Bufferline
  if (hasBufferline) {
    html += `<div style="background:${colors.sidebarBg};color:${colors.comment};padding:0.15rem 0.5rem;font-size:0.7rem;border-bottom:1px solid ${colors.border};display:flex;gap:0.75rem">`;
    html += `<span style="color:${colors.accent};font-weight:bold"> init.lua</span>`;
    html += `<span> utils.lua</span>`;
    html += `<span> README.md</span>`;
    html += `</div>`;
  }

  // Body
  html += `<div class="nvim-preview-body" style="background:${colors.bg};color:${colors.fg}">`;

  // Sidebar (nvim-tree)
  if (hasTree) {
    html += `<div class="nvim-preview-sidebar" style="background:${colors.sidebarBg};border-color:${colors.border};color:${colors.fg}">`;
    html += `<div class="nvim-preview-sidebar-title" style="color:${colors.accent}"> my-project</div>`;
    html += `<div class="nvim-preview-sidebar-item" style="color:${colors.comment}">  .git</div>`;
    html += `<div class="nvim-preview-sidebar-item" style="color:${colors.accent}">  lua</div>`;
    html += `<div class="nvim-preview-sidebar-item active" style="color:${colors.string}">   init.lua</div>`;
    html += `<div class="nvim-preview-sidebar-item" style="color:${colors.fg}">   utils.lua</div>`;
    html += `<div class="nvim-preview-sidebar-item" style="color:${colors.fg}">  README.md</div>`;
    html += `</div>`;
  }

  // Editor
  html += `<div class="nvim-preview-editor">`;
  const cursorLineNum = 4;
  codeLines.forEach(line => {
    const isCursor = line.num === cursorLineNum;
    const bgStyle = isCursor && neovimAnswers.cursorline ? `background:${colors.cursorLine};` : '';
    const lineNumColor = isCursor ? colors.accent : colors.lineNum;
    const lineNumText = neovimAnswers.relativenumber && neovimAnswers.number
      ? (isCursor ? String(line.num).padStart(2) : String(Math.abs(line.num - cursorLineNum)).padStart(2))
      : (neovimAnswers.number ? String(line.num).padStart(2) : '  ');

    let gitSign = '';
    if (hasGitsigns && line.git) {
      const gitColor = line.git === '+' ? colors.string : colors.accent;
      gitSign = `<span style="color:${gitColor}">│</span>`;
    } else if (hasGitsigns) {
      gitSign = ' ';
    }

    let text = line.text
      .replace(/\{\{keyword\}\}/g, colors.keyword)
      .replace(/\{\{func\}\}/g, colors.func)
      .replace(/\{\{string\}\}/g, colors.string)
      .replace(/\{\{comment\}\}/g, colors.comment)
      .replace(/\{\{number\}\}/g, colors.number)
      .replace(/\{\{indent\}\}/g, indentGuide);

    html += `<div class="nvim-preview-line" style="${bgStyle}">`;
    html += `<span class="nvim-preview-linenum" style="color:${lineNumColor}">${lineNumText}</span>`;
    html += `${gitSign}`;
    html += `<span class="nvim-preview-linecontent">${text || ' '}</span>`;
    html += `</div>`;
  });
  html += `</div>`;

  html += `</div>`; // end body

  // Lualine statusline
  if (hasLualine) {
    html += `<div class="nvim-preview-statusline" style="background:${colors.statusBg};color:${colors.statusFg};border-color:${colors.border}">`;
    html += `<span><span style="background:${colors.accent};color:${colors.bg};padding:0 0.4rem;border-radius:2px;font-weight:bold"> NORMAL </span> <span style="color:${colors.comment}"> main</span> <span style="color:${colors.fg}">init.lua</span></span>`;
    html += `<span><span style="color:${colors.comment}">lua</span> <span style="background:${colors.accent};color:${colors.bg};padding:0 0.4rem;border-radius:2px"> 4:1 </span></span>`;
    html += `</div>`;
  }

  // Command line
  html += `<div class="nvim-preview-cmdline" style="background:${colors.bg};color:${colors.comment};border-color:${colors.border}">:w init.lua</div>`;

  preview.innerHTML = html;
}

// ── Neovim result rendering ───────────────────────────
function renderNeovimResult() {
  const config = generateNeovimConfig();
  document.getElementById('neovim-config-output').innerHTML = highlightLua(config);
  buildNeovimPreview();
}

function copyNeovimConfig() { copyFromElement('neovim-config-output'); }
function downloadNeovimConfig() { downloadFromElement('neovim-config-output', 'init.lua'); }

// ── Keyboard navigation ───────────────────────────────
document.addEventListener('keydown', (e) => {
  // Ignore when typing in input fields
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

  if (e.key === 'Enter') {
    // Find the visible primary button and click it
    const visibleStep = document.querySelector('.step.visible');
    if (!visibleStep) return;
    const primaryBtn = visibleStep.querySelector('button.primary:not(:disabled)');
    if (primaryBtn) {
      e.preventDefault();
      primaryBtn.click();
    }
  } else if (e.key === 'Escape' || e.key === 'Backspace') {
    // Go back
    const visibleStep = document.querySelector('.step.visible');
    if (!visibleStep) return;
    const backBtn = visibleStep.querySelector('.nav button:not(.primary)');
    if (backBtn && backBtn.textContent.trim()) {
      e.preventDefault();
      backBtn.click();
    }
  }
});

// ── Init ──────────────────────────────────────────────
// Hide all tool-specific steps initially
document.querySelectorAll('.starship-step, .tmux-step, .zsh-step, .neovim-step').forEach(s => {
  s.style.display = 'none';
});

setupOptions();
