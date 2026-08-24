# HDC大阪 仮想ショールーム

## プロジェクト概要
ハウジング・デザイン・センター大阪（HDC大阪）の認知拡大を目的とした、WebVR技術を活用した仮想ショールームプロジェクトです。

## HDC大阪について
グランフロント大阪北館5階に位置する、キッチン・インテリア関連の9つのショールーム・ショップが集まる住まいづくりの総合施設です。

**公式サイト**: [HDC大阪](https://hdc.asahi.co.jp/osaka/)

## デモサイト
🔗 **[https://hdc-showroom.vercel.app](https://hdc-showroom.vercel.app)**

- カタログページ: [index.html](https://hdc-showroom.vercel.app/index.html)
- 配置シミュレーション: [simulator.html](https://hdc-showroom.vercel.app/simulator.html)
- 雰囲気シミュレーション: [atmosphere.html](https://hdc-showroom.vercel.app/atmosphere.html)

## 機能
- **カタログページ**: 家具カテゴリ別の閲覧と3Dプレビュー
- **配置シミュレーション**: 仮想空間での家具の配置・回転・削除
- **雰囲気シミュレーション**: 家具付きの部屋モデルで空間の雰囲気を体験

## 使い方

### デモサイトで試す
上記のデモサイトにアクセスするだけで利用できます。

### ローカルで動かす
GLBモデルの読み込みにはHTTPサーバーが必要なため、`index.html` を直接ブラウザで開いても3Dモデルは表示されません。

```bash
node server.js
```

起動後、以下にアクセスしてください。
- カタログ: http://localhost:8080/
- 配置シミュレーション: http://localhost:8080/simulator.html
- 雰囲気シミュレーション: http://localhost:8080/atmosphere.html

## 技術スタック
- A-Frame 1.4.0
- Three.js
- WebVR
- Node.js（ローカル開発サーバー）
- Vercel（ホスティング）

## 動作環境
- モダンブラウザ（Chrome, Firefox, Edge推奨）
- WebGL対応デバイス

## プロジェクト情報
- **種別**: 産学連携プロジェクト
- **目的**: HDC大阪施設の認知拡大
- **制作**: 2025年

## 注意事項
本プロジェクトは産学連携案件のため、各ショールーム・ショップの個別ロゴ・名称は使用しておりません。

---

© 2025 HDC Osaka Virtual Showroom Project
