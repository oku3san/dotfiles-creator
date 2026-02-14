# CLAUDE.md

## プロジェクト概要

**dotfiles-creator** は **Starship Config Generator** です。[Starship](https://starship.rs) のシェルプロンプト設定を、対話形式のウィザードで生成するクライアントサイドのシングルページWebアプリケーションです。UIは日本語です。

- **オーナー:** oku3san
- **リポジトリ:** [oku3san/dotfiles-creator](https://github.com/oku3san/dotfiles-creator)

## リポジトリ構成

```
dotfiles-creator/
├── CLAUDE.md       # このファイル — AIアシスタント向けガイド
├── .gitignore      # OS/エディタの一時ファイルを除外 (.DS_Store, Thumbs.db, *.swp)
├── index.html      # HTML + 埋め込みCSS — 5ステップウィザードのUI全体
└── app.js          # Vanilla JavaScript — 状態管理、ナビゲーション、設定生成
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

ウィザードは5つのステップでユーザーを案内します：

1. **Step 0 — プロンプトスタイル:** レイアウトを選択（plain、nerd font icons、bracketed、multi-line）
2. **Step 1 — プロンプト記号:** カーソル記号を選択（❯、$、➜、λ）
3. **Step 2 — アクセントカラー:** 8色のプリセットから選択（cyan、green、blue、purple、yellow、red、white、orange）
4. **Step 3 — モジュール:** 有効にする Starship モジュールを選択（複数選択可）
5. **Step 4 — 生成結果:** 生成された TOML 設定を表示、プロンプトのプレビュー、コピーまたはダウンロード

### 対応 Starship モジュール

Git、Node.js、Python、Go、Rust、Docker、AWS、Kubernetes、Terraform、Time、Battery、Command Duration

## コードアーキテクチャ

### `app.js`（421行）

| セクション | 関数 | 役割 |
|---|---|---|
| 状態管理 | `answers`, `TOTAL_STEPS` | ユーザーの選択を保持（style, character, color, modules） |
| プログレスバー | `renderProgress()` | ステップインジケーターを描画 |
| ナビゲーション | `showStep()`, `nextStep()`, `prevStep()`, `goToStart()` | ウィザードのステップ間を移動 |
| 入力ハンドラ | `setupOptions()`, `updateNextButton()` | ラジオボタン、チェックボックス、カラースウォッチのクリック処理 |
| 設定生成 | `generateConfig()`, `buildFormatParts()`, `addModuleVars()` | 選択内容から Starship TOML を生成 |
| プレビュー | `buildPromptPreview()` | プロンプトの HTML プレビューを作成 |
| 結果表示 | `renderResult()`, `copyConfig()`, `downloadConfig()` | 出力表示、クリップボードコピー、ファイルダウンロード |

### `index.html`（510行）

HTML構造と埋め込みCSSをすべて含みます。CSSカスタムプロパティによるテーマ設定（GitHub風ダークモード）を使用。主なCSS変数は `:root` で定義されています（例: `--bg`, `--surface`, `--accent`）。

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
