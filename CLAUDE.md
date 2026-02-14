# CLAUDE.md

## プロジェクト概要

**dotfiles-creator** は **Dotfiles Config Generator** です。[Starship](https://starship.rs) のシェルプロンプト設定と [tmux](https://github.com/tmux/tmux/wiki) のターミナルマルチプレクサ設定を、対話形式のウィザードで生成するクライアントサイドのシングルページWebアプリケーションです。UIは日本語です。

- **オーナー:** oku3san
- **リポジトリ:** [oku3san/dotfiles-creator](https://github.com/oku3san/dotfiles-creator)
- **対応ツール:** Starship、tmux

## リポジトリ構成

```
dotfiles-creator/
├── CLAUDE.md       # このファイル — AIアシスタント向けガイド
├── README.md       # プロジェクト紹介・使い方ガイド
├── .gitignore      # OS/エディタの一時ファイルを除外 (.DS_Store, Thumbs.db, *.swp)
├── index.html      # HTML + 埋め込みCSS — Starship と tmux のウィザードUI全体
└── app.js          # Vanilla JavaScript — 状態管理、ナビゲーション、Starship/tmux 設定生成
```

**依存関係、ビルドツール、パッケージマネージャー、フレームワークは一切なし**。静的ファイルとしてそのまま配信されます。

## 技術スタック

- **言語:** Vanilla JavaScript (ES6+)、HTML5、CSS3
- **フレームワーク/ライブラリ:** なし
- **ビルドシステム:** なし — ブラウザで `index.html` を直接開く
- **テスト:** 未設定
- **リンター:** 未設定

## 開発環境セットアップ

インストール不要。ローカルで実行するには：

1. `index.html` をブラウザで開く

依存関係のインストール、環境変数、ビルドステップは不要です。

## アプリの動作

最初にツールを選択し、選択したツールに応じたウィザードが表示されます。

### Starship ウィザード（6ステップ）

1. **ツール選択:** Starship または tmux を選択
2. **Step 0 — プロンプトスタイル:** レイアウトを選択（plain、nerd font icons、bracketed、multi-line）
3. **Step 1 — プロンプト記号:** カーソル記号を選択（❯、$、➜、λ）
4. **Step 2 — アクセントカラー:** 8色のプリセットから選択（cyan、green、blue、purple、yellow、red、white、orange）
5. **Step 3 — モジュール:** 有効にする Starship モジュールを選択（複数選択可）
6. **Step 4 — 詳細設定:** ディレクトリ表示、時刻フォーマット、右プロンプトなどの細かい設定
7. **Step 5 — 生成結果:** 生成された TOML 設定を表示、プロンプトのプレビュー、コピーまたはダウンロード

**対応 Starship モジュール:** Git、Node.js、Python、Go、Rust、Docker、AWS、Kubernetes、Terraform、Time、Battery、Command Duration

### tmux ウィザード（5ステップ）

1. **ツール選択:** Starship または tmux を選択
2. **Step 0 — 基本設定:** プレフィックスキー（Ctrl+b / Ctrl+a / Ctrl+Space）、マウス操作、ウィンドウ番号の設定
3. **Step 1 — カラースキーム:** テーマ選択（Default / Nord / Dracula / Gruvbox / GitHub Dark）、ペイン境界線の設定
4. **Step 2 — ステータスバー:** 位置、表示内容（セッション名、ホスト名、日時、CPU負荷）、更新間隔
5. **Step 3 — キーバインド:** ペイン分割キー、Vim スタイルの操作、設定リロードなど
6. **Step 4 — 生成結果:** 生成された .tmux.conf を表示、コピーまたはダウンロード

## コードアーキテクチャ

### `app.js`（約1000行）

| セクション | 関数 | 役割 |
|---|---|---|
| 状態管理 | `selectedTool`, `answers`, `tmuxAnswers`, `TOTAL_STEPS`, `TMUX_TOTAL_STEPS` | 選択されたツールとユーザーの選択を保持 |
| ツール選択 | `selectTool()`, `goBackToToolSelection()` | Starship / tmux の選択と切り替え |
| プログレスバー | `renderProgress()` | ステップインジケーターを描画 |
| ナビゲーション | `showStep()`, `showTmuxStep()`, `nextStep()`, `prevStep()`, `goToStart()` | ウィザードのステップ間を移動 |
| 入力ハンドラ | `setupOptions()`, `setupTmuxListeners()`, `updateNextButton()`, `updateTmuxNextButton()` | ラジオボタン、チェックボックス、カラースウォッチ、トグルスイッチのクリック処理 |
| Starship 設定生成 | `generateConfig()`, `buildFormatParts()`, `addModuleVars()` | 選択内容から Starship TOML を生成 |
| Starship プレビュー | `buildPromptPreview()` | プロンプトの HTML プレビューを作成 |
| Starship 結果表示 | `renderResult()`, `copyConfig()`, `downloadConfig()` | 出力表示、クリップボードコピー、ファイルダウンロード |
| tmux 設定生成 | `generateTmuxConfig()`, `getThemeColors()` | 選択内容から .tmux.conf を生成 |
| tmux 結果表示 | `renderTmuxResult()`, `copyTmuxConfig()`, `downloadTmuxConfig()` | 出力表示、クリップボードコピー、ファイルダウンロード |

### `index.html`（約1100行）

HTML構造と埋め込みCSSをすべて含みます。

- **ツール選択画面:** Starship / tmux を選択
- **Starship ステップ（6ステップ）:** プロンプトスタイル、記号、カラー、モジュール、詳細設定、結果
- **tmux ステップ（5ステップ）:** 基本設定、カラースキーム、ステータスバー、キーバインド、結果
- **CSS:** カスタムプロパティによるテーマ設定（GitHub風ダークモード）。主なCSS変数は `:root` で定義（例: `--bg`, `--surface`, `--accent`）

## コーディング規約

- 変更は最小限にし、タスクに集中する
- 不要な抽象化や過剰な設計を避ける
- コミットメッセージは「何を」ではなく「なぜ」を説明する
- 巧妙なコードより読みやすいコードを優先する
- `app.js` では `// ── タイトル ──` スタイルのセクション区切りコメントを使用
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
