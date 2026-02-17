# Dotfiles Config Generator

対話形式のウィザードで [Starship](https://starship.rs)、[tmux](https://github.com/tmux/tmux/wiki)、[zsh](https://www.zsh.org/)、[Neovim](https://neovim.io/) の設定ファイルを生成する Web アプリケーションです。

## 特徴

- ブラウザ上で完結するクライアントサイドアプリ
- 依存関係・ビルドツール不要
- ステップバイステップのウィザードで直感的に設定を作成
- 生成した設定をコピーまたはダウンロード
- Starship / tmux / zsh / Neovim の 4 ツールに対応

## 使い方

`index.html` をブラウザで開くだけで利用できます。

### Starship ウィザードの流れ

1. **ツール選択** — Starship を選択
2. **プロンプトスタイル** — レイアウトを選択（Plain / Nerd Font Icons / Bracketed / Multi-line）
3. **プロンプト記号** — カーソル記号を選択（❯ / $ / ➜ / λ）
4. **アクセントカラー** — 8 色のプリセットから選択
5. **モジュール** — 表示したい情報を複数選択
6. **詳細設定** — 各モジュールの細かい設定
7. **生成結果** — TOML 設定のプレビュー・コピー・ダウンロード

### tmux ウィザードの流れ

1. **ツール選択** — tmux を選択
2. **基本設定** — プレフィックスキー、マウス操作などの基本オプション
3. **カラースキーム** — テーマとペインの外観を選択（Default / Nord / Dracula / Gruvbox / GitHub Dark / Tokyo Night / Catppuccin / Solarized Dark）
4. **ステータスバー** — 位置、表示内容、更新間隔を設定
5. **キーバインド** — ペイン操作とその他の便利なキーバインド
6. **生成結果** — 設定ファイルのプレビュー・コピー・ダウンロード

### zsh ウィザードの流れ

1. **ツール選択** — zsh を選択
2. **プラグイン管理システム** — Oh My Zsh / Zinit / なしから選択
3. **基本設定** — ヒストリー設定、補完設定、キーバインド
4. **プラグイン・テーマ** — プラグイン管理システムに応じたプラグイン・テーマを選択
5. **エイリアス設定** — ls 系、Git、Docker、ナビゲーションなどのエイリアスを選択
6. **生成結果** — .zshrc のプレビュー・コピー・ダウンロード

### Neovim ウィザードの流れ

1. **ツール選択** — Neovim を選択
2. **プラグインマネージャー** — lazy.nvim / packer.nvim / なしから選択
3. **基本設定** — 表示設定、インデント設定、検索設定など
4. **カラースキーム・プラグイン** — テーマとプラグインを選択
5. **キーマップ** — リーダーキーや各種キーマップを設定
6. **生成結果** — init.lua のプレビュー（エディタシミュレーション付き）・コピー・ダウンロード

## 対応ツール詳細

### Starship 対応モジュール

| モジュール | 表示内容 |
|---|---|
| Git | ブランチ名と変更状態 |
| Node.js | バージョン |
| Python | バージョンと仮想環境 |
| Go | バージョン |
| Rust | バージョン |
| Java | バージョン |
| Ruby | バージョン |
| PHP | バージョン |
| Docker | コンテキスト |
| AWS | プロファイル / リージョン |
| Kubernetes | context / namespace |
| Terraform | workspace |
| Package | パッケージバージョン |
| Hostname | ホスト名 |
| Username | ユーザー名 |
| Jobs | バックグラウンドジョブ数 |
| Memory | メモリ使用量 |
| 時刻 | 現在時刻 |
| バッテリー | バッテリー残量 |
| コマンド実行時間 | 長いコマンドの実行時間 |

### tmux 設定項目

#### 基本設定
- **プレフィックスキー**: Ctrl+b / Ctrl+a / Ctrl+Space
- **マウス操作**: マウスでペイン選択・リサイズ・スクロール
- **ウィンドウ番号**: 1から開始、削除時に番号を詰める
- **自動リネーム**: ウィンドウ名の自動更新
- **ヒストリー**: スクロールバック行数（1,000〜50,000行）

#### カラースキーム
- **テーマ**: Default / Nord / Dracula / Gruvbox / GitHub Dark / Tokyo Night / Catppuccin / Solarized Dark
- **ペイン境界線**: 太さとアクティブペインの強調表示

#### ステータスバー
- **位置**: 上 / 下
- **表示内容**: セッション名、ホスト名、日時、CPU負荷、Git ブランチ、バッテリー、稼働時間、ペイン数
- **カスタマイズ**: 更新間隔、左右の最大文字数、ウィンドウリストの位置

#### キーバインド
- **ペイン分割**: デフォルト / Vim スタイル / 直感的
- **Vim スタイル操作**: h/j/k/l でペイン移動、H/J/K/L でリサイズ
- **便利機能**: 設定リロード、Vi モードコピー、ペイン同期、ウィンドウ移動など
- **プラグイン**: tpm / tmux-resurrect / tmux-continuum / tmux-yank / tmux-sensible

### zsh 設定項目

#### プラグイン管理システム
- **Oh My Zsh**: robbyrussell / agnoster / powerlevel10k / bureau テーマ + 各種プラグイン
- **Zinit**: zsh-autosuggestions / zsh-syntax-highlighting / fast-syntax-highlighting / zsh-completions / powerlevel10k
- **なし**: プラグインマネージャーなしのシンプルな設定

#### 対応プラグイン（Oh My Zsh）
git / zsh-autosuggestions / zsh-syntax-highlighting / autojump / docker / docker-compose / kubectl / npm / yarn

### Neovim 設定項目

#### カラースキーム
Catppuccin / Tokyo Night / Gruvbox / Nord / Dracula / One Dark / Rosé Pine / Kanagawa

#### 対応プラグイン
treesitter / lspconfig / nvim-cmp / telescope / nvim-tree / lualine / gitsigns / autopairs / Comment / indent-blankline / bufferline / which-key

## 生成された設定の適用方法

### Starship

1. ウィザードで設定を生成
2. 「クリップボードにコピー」または「starship.toml をダウンロード」
3. `~/.config/starship.toml` に保存
4. Starship がインストールされていない場合は [公式ドキュメント](https://starship.rs/guide/#%F0%9F%9A%80-installation) を参照

### tmux

1. ウィザードで設定を生成
2. 「クリップボードにコピー」または「.tmux.conf をダウンロード」
3. `~/.tmux.conf` に保存
4. tmux を再起動するか、`tmux source-file ~/.tmux.conf` で設定を再読み込み

### zsh

1. ウィザードで設定を生成
2. 「クリップボードにコピー」または「.zshrc をダウンロード」
3. `~/.zshrc` に保存
4. `source ~/.zshrc` で設定を再読み込み
5. Oh My Zsh / Zinit を選択した場合は各ツールの [インストール手順](https://ohmyz.sh/#install) に従ってインストール

### Neovim

1. ウィザードで設定を生成
2. 「クリップボードにコピー」または「init.lua をダウンロード」
3. `~/.config/nvim/init.lua` に保存
4. Neovim を起動するとプラグインが自動インストールされる（lazy.nvim / packer.nvim 選択時）
5. Neovim がインストールされていない場合は [公式ドキュメント](https://neovim.io/doc/user/) を参照

## 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript (ES6+)
- フレームワーク・ライブラリなし
- ビルドステップなし

## ライセンス

MIT
