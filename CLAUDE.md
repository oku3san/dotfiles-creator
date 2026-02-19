# CLAUDE.md

## プロジェクト概要

**dotfiles-creator** は **Dotfiles Config Generator** です。[Starship](https://starship.rs) のシェルプロンプト設定、[tmux](https://github.com/tmux/tmux/wiki) のターミナルマルチプレクサ設定、[zsh](https://www.zsh.org/) のシェル設定、[Neovim](https://neovim.io/) のテキストエディタ設定を、対話形式のウィザードで生成するクライアントサイドのシングルページWebアプリケーションです。UIは日本語です。

- **オーナー:** oku3san
- **リポジトリ:** [oku3san/dotfiles-creator](https://github.com/oku3san/dotfiles-creator)
- **対応ツール:** Starship、tmux、zsh、Neovim

## リポジトリ構成

```
dotfiles-creator/
├── CLAUDE.md           # このファイル — AIアシスタント向けガイド
├── README.md           # プロジェクト紹介・使い方ガイド
├── .gitignore          # OS/エディタの一時ファイルを除外 (.DS_Store, Thumbs.db, *.swp)
├── run_tests.sh        # テスト実行スクリプト — node --test tests/*.test.mjs
├── index.html          # HTML のみ — Starship、tmux、zsh、Neovim のウィザードUI構造
├── css/
│   └── style.css       # 全スタイル — CSS変数、レイアウト、コンポーネント、シンタックスハイライト
├── js/
│   ├── state.js        # グローバル状態変数と定数（最初にロード）
│   ├── utils.js        # 共有ユーティリティ — シンタックスハイライト、showToast、setupDynamicOptions
│   ├── navigation.js   # ウィザードナビゲーション — showStep 系、nextStep、prevStep、goToStart、updateNextButton 系、bulkSelect
│   ├── starship.js     # Starship 設定生成・プレビュー・結果表示
│   ├── tmux.js         # tmux 設定生成・ステータスバープレビュー・結果表示
│   ├── zsh.js          # zsh プラグインUI生成・設定生成・結果表示
│   ├── neovim.js       # Neovim プラグインUI生成・設定生成・エディタプレビュー・結果表示
│   ├── handlers.js     # イベントハンドラ — setupOptions、setupTmuxListeners、setupZshListeners、setupNeovimListeners
│   └── init.js         # キーボードナビゲーションと初期化（最後にロード）
└── tests/
    ├── helpers.mjs     # テストヘルパー — Function コンストラクタでソースを独立スコープにロード
    ├── utils.test.mjs  # escapeHtml、highlightToml/Conf/Zsh/Lua、highlightValue のテスト
    ├── starship.test.mjs # generateConfig、buildFormatParts、getCharacter/Color のテスト
    ├── tmux.test.mjs   # generateTmuxConfig、getThemeColors のテスト
    ├── zsh.test.mjs    # generateZshConfig のテスト
    └── neovim.test.mjs # generateNeovimConfig、getNeovimThemeColors のテスト
```

**依存関係、ビルドツール、パッケージマネージャー、フレームワークは一切なし**。静的ファイルとしてそのまま配信されます。

> **スクリプトロード順序:** `state.js` が最初（グローバル変数を定義）、`init.js` が最後（`setupOptions()` と `renderProgress()` を呼び出す）。ES6 モジュールは `file://` プロトコルで動作しないため、通常の `<script>` タグを使用。

## 技術スタック

- **言語:** Vanilla JavaScript (ES6+)、HTML5、CSS3
- **フレームワーク/ライブラリ:** なし
- **ビルドシステム:** なし — ブラウザで `index.html` を直接開く
- **テスト:** Node.js 組み込みテストランナー (`node:test`) — `./run_tests.sh` で実行、npm 不要
- **リンター:** 未設定

## 開発環境セットアップ

インストール不要。ローカルで実行するには：

1. `index.html` をブラウザで開く

テストを実行するには（Node.js 18+ が必要）：

```bash
./run_tests.sh
# または
node --test tests/*.test.mjs
```

依存関係のインストール、環境変数、ビルドステップは不要です。

## アプリの動作

最初にツールを選択し、選択したツールに応じたウィザードが表示されます。

### ツール選択

1. **Starship:** シェルプロンプトの設定 (starship.toml)
2. **tmux:** ターミナルマルチプレクサの設定 (.tmux.conf)
3. **zsh:** Zシェルの設定 (.zshrc)
4. **Neovim:** テキストエディタの設定 (init.lua)

### Starship ウィザード（6ステップ）

1. **ツール選択:** Starship、tmux、zsh を選択
2. **Step 0 — プロンプトスタイル:** レイアウトを選択（plain、nerd font icons、bracketed、multi-line）
3. **Step 1 — プロンプト記号:** カーソル記号を選択（❯、$、➜、λ）
4. **Step 2 — アクセントカラー:** 8色のプリセットから選択（cyan、green、blue、purple、yellow、red、white、orange）
5. **Step 3 — モジュール:** 有効にする Starship モジュールを選択（複数選択可）
6. **Step 4 — 詳細設定:** ディレクトリ表示、Git ブランチ設定、Python 仮想環境、メモリ閾値、時刻フォーマット、右プロンプトなどの細かい設定
7. **Step 5 — 生成結果:** 生成された TOML 設定を表示、プロンプトのプレビュー、コピーまたはダウンロード

**対応 Starship モジュール:** Git、Node.js、Python、Go、Rust、Java、Ruby、PHP、Docker、AWS、Kubernetes、Terraform、Package、Hostname、Username、Jobs、Memory、Time、Battery、Command Duration

### tmux ウィザード（5ステップ）

1. **ツール選択:** Starship、tmux、zsh を選択
2. **Step 0 — 基本設定:** プレフィックスキー（Ctrl+b / Ctrl+a / Ctrl+Space）、マウス操作、ウィンドウ番号の設定、自動リネーム、ビジュアルベル、ヒストリー行数、ターミナルタイプ、フォーカスイベント、クリップボード連携、アグレッシブリサイズ、タイミング設定
3. **Step 1 — カラースキーム:** テーマ選択（Default / Nord / Dracula / Gruvbox / GitHub Dark / Tokyo Night / Catppuccin / Solarized Dark）、ペイン境界線の設定
4. **Step 2 — ステータスバー:** 位置、表示内容（セッション名、ホスト名、日時、CPU負荷、Git ブランチ、バッテリー、稼働時間、ペイン数）、更新間隔、左右の最大文字数、ウィンドウリストの位置
5. **Step 3 — キーバインド:** ペイン分割キー、Vim スタイルの操作、設定リロード、Vi モードコピー、ペイン同期、ウィンドウ移動、セッション管理、レイアウト切替、ズーム、画面クリアなど。プラグイン設定（tpm、tmux-resurrect、tmux-continuum、tmux-yank、tmux-sensible）
6. **Step 4 — 生成結果:** 生成された .tmux.conf を表示、コピーまたはダウンロード

### zsh ウィザード（5ステップ）

1. **ツール選択:** Starship、tmux、zsh を選択
2. **Step 0 — プラグイン管理システム:** Oh My Zsh、Zinit、なしから選択
3. **Step 1 — 基本設定:** ヒストリー設定（サイズ、共有、重複無視）、補完設定（自動メニュー、大文字小文字）、キーバインド（Emacs / Vi モード）
4. **Step 2 — プラグイン・テーマ:** プラグイン管理システムに応じた動的なプラグイン選択（Oh My Zsh: テーマ + プラグイン、Zinit: プラグインのみ）
5. **Step 3 — エイリアス設定:** ls 系、Git、Docker、ナビゲーション、安全性向上のエイリアス
6. **Step 4 — 生成結果:** 生成された .zshrc を表示、コピーまたはダウンロード

**対応プラグインマネージャー:**
- **Oh My Zsh:** robbyrussell、agnoster、powerlevel10k、bureau テーマ、git、zsh-autosuggestions、zsh-syntax-highlighting、autojump、docker、docker-compose、kubectl、npm、yarn プラグイン
- **Zinit:** zsh-autosuggestions、zsh-syntax-highlighting、fast-syntax-highlighting、zsh-completions、powerlevel10k プラグイン

### Neovim ウィザード（5ステップ）

1. **ツール選択:** Starship、tmux、zsh、Neovim を選択
2. **Step 0 — プラグインマネージャー:** lazy.nvim、packer.nvim、なしから選択
3. **Step 1 — 基本設定:** 表示設定（行番号、相対行番号、カーソルハイライト、サインカラム、折り返し、True Color、スクロールオフセット）、インデント設定（タブ幅、スペース変換、スマートインデント）、検索設定（大文字小文字、ハイライト）、その他（クリップボード、マウス、スワップファイル、永続アンドゥ、分割方向）
4. **Step 2 — カラースキーム・プラグイン:** カラースキーム選択（Catppuccin / Tokyo Night / Gruvbox / Nord / Dracula / One Dark / Rosé Pine / Kanagawa）、プラグイン選択（treesitter、lspconfig、nvim-cmp、telescope、nvim-tree、lualine、gitsigns、autopairs、Comment、indent-blankline、bufferline、which-key）
5. **Step 3 — キーマップ:** リーダーキー（Space / カンマ / バックスラッシュ）、ウィンドウ移動、バッファ移動、行移動、検索ハイライト解除、インデント改善、ファイル保存、終了、画面分割、診断ナビゲーション
6. **Step 4 — 生成結果:** 生成された init.lua を表示、Neovim のシミュレーションプレビュー（選択したテーマ・プラグインを反映）、コピーまたはダウンロード

**対応プラグインマネージャー:**
- **lazy.nvim:** モダンで高速なプラグインマネージャー（推奨）
- **packer.nvim:** Lua ベースの定番プラグインマネージャー

## コードアーキテクチャ

### `js/state.js`

グローバル状態変数と定数を定義。すべての JS ファイルよりも先にロードされる。

| 変数 | 役割 |
|---|---|
| `selectedTool` | 現在選択されているツール（`'starship'` / `'tmux'` / `'zsh'` / `'neovim'`） |
| `currentStep` | 現在のステップインデックス |
| `TOTAL_STEPS`, `TMUX_TOTAL_STEPS`, `ZSH_TOTAL_STEPS`, `NEOVIM_TOTAL_STEPS` | 各ツールのステップ数 |
| `answers` | Starship の選択状態 |
| `tmuxAnswers` | tmux の選択状態 |
| `zshAnswers` | zsh の選択状態 |
| `neovimAnswers` | Neovim の選択状態 |

### `js/utils.js`

共有ユーティリティ関数。

| 関数 | 役割 |
|---|---|
| `highlightToml()`, `highlightConf()`, `highlightZsh()`, `highlightLua()` | 各フォーマット用シンタックスハイライト |
| `highlightValue()`, `highlightConfArgs()`, `escapeHtml()` | ハイライト補助関数 |
| `setupDynamicOptions(root)` | 動的生成要素のイベントリスナーを設定 |
| `showToast(message)` | トースト通知を表示 |

### `js/navigation.js`

ウィザードのナビゲーションと状態リセット。

| 関数 | 役割 |
|---|---|
| `selectTool()`, `goBackToToolSelection()` | ツール選択と切り替え |
| `renderProgress()` | プログレスバーを描画 |
| `showStep()`, `showTmuxStep()`, `showZshStep()`, `showNeovimStep()` | 各ツールのステップ表示 |
| `nextStep()`, `prevStep()` | ステップ間の移動 |
| `goToStart()` | すべての状態と DOM をリセットしてツール選択に戻る |
| `updateNextButton()`, `updateTmuxNextButton()`, `updateZshNextButton()`, `updateNeovimNextButton()` | 次へボタンの有効/無効を更新 |
| `bulkSelect(dataKey, selectAll)` | チェックボックスの一括選択/解除 |

### `js/handlers.js`

イベントハンドラのセットアップ。

| 関数 | 役割 |
|---|---|
| `setupOptions()` | ラジオ、チェックボックス、カラースウォッチ、カスタム入力のクリックハンドラを設定 |
| `setupTmuxListeners()` | tmux のトグル・スライダー・セレクト入力を設定 |
| `setupZshListeners()` | zsh のトグル・スライダー入力を設定 |
| `setupNeovimListeners()` | Neovim のトグル・スライダー入力を設定 |

### `js/starship.js`

Starship 設定生成・プレビュー。

| 関数 | 役割 |
|---|---|
| `STARSHIP_PRESETS`, `applyStarshipPreset()` | プリセット定義と適用 |
| `buildDetailSettings()`, `setupDetailListeners()` | 詳細設定UIの動的生成 |
| `getCharacter()`, `getColor()` | 選択値からキャラクター・カラーを取得 |
| `generateConfig()`, `buildFormatParts()`, `addModuleVars()` | Starship TOML を生成 |
| `buildPromptPreview()` | プロンプトの HTML プレビューを作成 |
| `renderResult()`, `copyConfig()`, `downloadConfig()` | 結果表示、コピー、ダウンロード |

### `js/tmux.js`

tmux 設定生成・プレビュー。

| 関数 | 役割 |
|---|---|
| `generateTmuxConfig()` | .tmux.conf を生成 |
| `getThemeColors(theme)` | テーマのカラーパレットを返す |
| `buildTmuxStatusPreview()` | ステータスバーの HTML プレビューを作成 |
| `renderTmuxResult()`, `copyTmuxConfig()`, `downloadTmuxConfig()` | 結果表示、コピー、ダウンロード |

### `js/zsh.js`

zsh 設定生成。

| 関数 | 役割 |
|---|---|
| `buildZshPluginsSection()` | プラグインマネージャーに応じて動的にプラグイン選択UIを生成 |
| `generateZshConfig()` | .zshrc を生成 |
| `renderZshResult()`, `copyZshConfig()`, `downloadZshConfig()` | 結果表示、コピー、ダウンロード |

### `js/neovim.js`

Neovim 設定生成・プレビュー。

| 関数 | 役割 |
|---|---|
| `buildNeovimPluginsSection()` | プラグインマネージャーに応じて動的にプラグイン選択UIを生成 |
| `generateNeovimConfig()`, `appendLazyPlugins()`, `appendPackerPlugins()`, `appendPluginSetup()` | init.lua を生成 |
| `getNeovimThemeColors(theme)` | テーマのカラーを返す |
| `buildNeovimPreview()` | Neovim エディタのシミュレーションプレビューを作成 |
| `renderNeovimResult()`, `copyNeovimConfig()`, `downloadNeovimConfig()` | 結果表示、コピー、ダウンロード |

### `js/init.js`

キーボードナビゲーションのイベントリスナーと初期化処理。すべての JS ファイルの後にロードされる。

### `index.html`（約1260行）

HTML構造のみを含みます（CSS・JS は外部ファイル参照）。

- **ツール選択画面:** Starship / tmux / zsh / Neovim を選択
- **Starship ステップ（6ステップ）:** プロンプトスタイル、記号、カラー、モジュール、詳細設定、結果
- **tmux ステップ（5ステップ）:** 基本設定、カラースキーム、ステータスバー、キーバインド、結果
- **zsh ステップ（5ステップ）:** プラグイン管理システム、基本設定、プラグイン・テーマ、エイリアス、結果
- **Neovim ステップ（5ステップ）:** プラグインマネージャー、基本設定、カラースキーム・プラグイン、キーマップ、結果（シミュレーションプレビュー付き）

### `css/style.css`

カスタムプロパティによるテーマ設定（GitHub風ダークモード）。Neovim プレビュー用のエディタシミュレーション CSS を含む。主なCSS変数は `:root` で定義（例: `--bg`, `--surface`, `--accent`）。

## コーディング規約

- 変更は最小限にし、タスクに集中する
- 不要な抽象化や過剰な設計を避ける
- コミットメッセージは「何を」ではなく「なぜ」を説明する
- 巧妙なコードより読みやすいコードを優先する
- JS ファイルでは `// ── タイトル ──` スタイルのセクション区切りコメントを使用
- 外部依存なし — フレームワークを導入せず Vanilla JS を維持する
- UIテキストは日本語、コメントとコード識別子は英語
- ファイル追加、ツール導入、プロジェクト構成変更時にこの CLAUDE.md を更新する

## AIアシスタント向けガイドライン

- **編集前に読む:** 変更を提案する前に必ずファイルを読む
- **スコープ内に留まる:** 直接依頼されたか、明らかに必要な変更のみ行う
- **ブラウザで検証:** テストがないため、変更が正しく表示されることを可能な限り手動で確認する
- **ドキュメント更新:** ファイル追加、ツール導入、プロジェクト構成変更時にこのファイルを更新する
- **ブランチワークフロー:** `main` に直接コミットせず、フィーチャーブランチで開発する
- **シンプルに保つ:** このプロジェクトは意図的に依存関係ゼロ — 明示的に要求されない限りビルドツールやフレームワークを導入しない
