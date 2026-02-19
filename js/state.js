// ── State ──────────────────────────────────────────────
let selectedTool = null; // 'starship', 'tmux', 'zsh', or 'neovim'
const TOTAL_STEPS = 6;
const TMUX_TOTAL_STEPS = 5;
const ZSH_TOTAL_STEPS = 5;
const NEOVIM_TOTAL_STEPS = 5;
let currentStep = 0;

// Starship answers
const answers = {
  style: null,
  character: null,
  customCharacter: '',
  color: null,
  customColor: '',
  modules: [],
  // Detail settings
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

// tmux answers
const tmuxAnswers = {
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

// zsh answers
const zshAnswers = {
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

// Neovim answers
const neovimAnswers = {
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
