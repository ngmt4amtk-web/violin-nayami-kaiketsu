# バイオリンお悩み解決室

「弓が曲がる」「音程が合わない」「左手が痛い」——生徒が実際に口にする言い回しそのままの悩み113問に、3人の専門家（バイオリニスト・研究マニア・身体専門家）の座談会で答えるLINE風チャットアプリ。

既存の [バイオリンおなやみ相談室（violin-nayami-chat）](https://github.com/ngmt4amtk-web/violin-nayami-chat) とは別リポジトリ・別公開先の v2。UI骨格は近いが、ナビ文言の廃止・一段ずつやる steps・原稿スキーマ拡張を含む別アプリ。既存 chat 側は触らない。

## v1（violin-nayami-chat）との違い

- アプリ名: おなやみ相談室 → お悩み解決室（別URLで公開）
- 話者進行ナビ（「ここまで」「次は◯◯」）を本文・UIから廃止。進行は「続ける／かみ砕く／まとめへ」ボタンのみ
- 任意フィールド `steps[]`（3〜7段）を追加。まとめ後に「一段ずつやる」で1段ずつ表示（pass付き）
- 質問はレッスン現場の生の悩みベース（persona廃止・一人称の症状描写）
- 回答は全問リサーチし直し（レッスン文字起こし・身体メソッド集・研究論文・学習者フォーラムに接地）
- カテゴリは症状ベースの12章

## データの流れ

- 原稿: `chapters/qNNN.json`（フラット構造・これが真実源）
  - 必須: `{id, chapter, title, persona: null, question, discussion:[{speaker, text, plain}], prescription:[], sources:[], tier}`
  - 任意: `secrets[]` / `steps[{title, action, pass, time?, if_stuck?}]`
  - 話者は「バイオリニスト」「研究マニア」「身体専門家」の3人のみ
- 質問リストの設計: `research/master_questions.json`（113問・12章・出典refs付き）
- リサーチ素材: `research/sweep_results.json` ほか

## 更新

原稿JSONを更新したら:

```bash
node scripts/build-data.mjs
```

検証（スキーマ・話者・件数・stepsがある場合は3〜7段と title/action/pass）を通過すると `data/questions.js` が生成される。キャッシュ対策として `index.html` の `?v=` を更新してからコミットする。

## 公開

GitHub Pages で `main` ブランチのルートを公開する（リモート想定: `ngmt4amtk-web/violin-nayami-kaiketsu`）。手順の詳細は Cursor成果物の公開手順メモを参照:

`~/Shortcuts/Cursor成果物/2026-07-22_バイオリンお悩み解決室_v2_公開手順.md`

```bash
# ビルド
node scripts/build-data.mjs

# 初回（remote未設定のとき）
gh repo create ngmt4amtk-web/violin-nayami-kaiketsu --public \
  --source . --remote origin --push \
  --description "バイオリンお悩み解決室 — 生の悩み113問に3人がチャットで答える"

gh api repos/ngmt4amtk-web/violin-nayami-kaiketsu/pages \
  -X POST -f "source[branch]=main" -f "source[path]=/"

# 以後
# 原稿修正 → build → ?v= 更新 → commit + push
```

公開URL（想定）: `https://ngmt4amtk-web.github.io/violin-nayami-kaiketsu/`
