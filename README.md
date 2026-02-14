# Dotfiles Config Generator

対話形式のウィザードで [Starship](https://starship.rs) と [tmux](https://github.com/tmux/tmux/wiki) の設定ファイルを生成する Web アプリケーションです。

## 特徴

- ブラウザ上で完結するクライアントサイドアプリ
- 依存関係・ビルドツール不要
- ステップバイステップのウィザードで直感的に設定を作成
- 生成した設定をコピーまたはダウンロード
- Starship と tmux の両方に対応

## 使い方

`index.html` をブラウザで開くだけで利用できます。

### Starship ウィザードの流れ

1. **ツール選択** — Starship または tmux を選択
2. **プロンプトスタイル** — レイアウトを選択（Plain / Nerd Font Icons / Bracketed / Multi-line）
3. **プロンプト記号** — カーソル記号を選択（❯ / $ / ➜ / λ）
4. **アクセントカラー** — 8 色のプリセットから選択
5. **モジュール** — 表示したい情報を複数選択
6. **詳細設定** — 各モジュールの細かい設定
7. **生成結果** — TOML 設定のプレビュー・コピー・ダウンロード

### tmux ウィザードの流れ

1. **ツール選択** — Starship または tmux を選択
2. **基本設定** — プレフィックスキー、マウス操作などの基本オプション
3. **カラースキーム** — テーマとペインの外観を選択（Nord / Dracula / Gruvbox / GitHub Dark）
4. **ステータスバー** — 位置、表示内容、更新間隔を設定
5. **キーバインド** — ペイン操作とその他の便利なキーバインド
6. **生成結果** — 設定ファイルのプレビュー・コピー・ダウンロード

### Starship 対応モジュール

| モジュール | 表示内容 |
|---|---|
| Git | ブランチ名と変更状態 |
| Node.js | バージョン |
| Python | バージョンと仮想環境 |
| Go | バージョン |
| Rust | バージョン |
| Docker | コンテキスト |
| AWS | プロファイル / リージョン |
| Kubernetes | context / namespace |
| Terraform | workspace |
| 時刻 | 現在時刻 |
| バッテリー | バッテリー残量 |
| コマンド実行時間 | 長いコマンドの実行時間 |

### tmux 設定項目

- **プレフィックスキー**: Ctrl+b / Ctrl+a / Ctrl+Space
- **カラーテーマ**: Nord / Dracula / Gruvbox / GitHub Dark
- **ステータスバー**: セッション名、ホスト名、日時、CPU負荷
- **キーバインド**: Vim スタイルのペイン操作、直感的な分割キーなど

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

## 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript (ES6+)
- フレームワーク・ライブラリなし
- ビルドステップなし

## ライセンス

MIT
