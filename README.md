# Starship Config Generator

対話形式のウィザードで [Starship](https://starship.rs) のシェルプロンプト設定（`starship.toml`）を生成する Web アプリケーションです。

## 特徴

- ブラウザ上で完結するクライアントサイドアプリ
- 依存関係・ビルドツール不要
- 5 ステップのウィザードで直感的に設定を作成
- 生成した設定をコピーまたはダウンロード

## 使い方

`index.html` をブラウザで開くだけで利用できます。

### ウィザードの流れ

1. **プロンプトスタイル** — レイアウトを選択（Plain / Nerd Font Icons / Bracketed / Multi-line）
2. **プロンプト記号** — カーソル記号を選択（❯ / $ / ➜ / λ）
3. **アクセントカラー** — 8 色のプリセットから選択
4. **モジュール** — 表示したい情報を複数選択
5. **生成結果** — TOML 設定のプレビュー・コピー・ダウンロード

### 対応モジュール

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

## 生成された設定の適用方法

1. ウィザードで設定を生成
2. 「クリップボードにコピー」または「starship.toml をダウンロード」
3. `~/.config/starship.toml` に保存
4. Starship がインストールされていない場合は [公式ドキュメント](https://starship.rs/guide/#%F0%9F%9A%80-installation) を参照

## 技術スタック

- HTML5 / CSS3 / Vanilla JavaScript (ES6+)
- フレームワーク・ライブラリなし
- ビルドステップなし

## ライセンス

MIT
