// バイオリンお悩み解決室: chapters/qNNN.json -> data/questions.js
// 原稿は chapters/ 直下のフラットな qNNN.json（persona無し・discussionは {speaker, text, plain}）。
// 任意フィールド steps[] を検証しつつ app に載せる（既存 violin-nayami-chat とは別アプリ）。
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const chaptersDir = join(root, "chapters");
const outputPath = join(root, "data", "questions.js");

const CHAPTERS = [
  { id: 1, title: "痛み・しびれ・疲れ" },
  { id: 2, title: "構え方・姿勢" },
  { id: 3, title: "弓・右手" },
  { id: 4, title: "音色・音量" },
  { id: 5, title: "左手・指" },
  { id: 6, title: "音程" },
  { id: 7, title: "ビブラート" },
  { id: 8, title: "ポジション移動" },
  { id: 9, title: "和音・リズム・速い所" },
  { id: 10, title: "練習のしかた・心" },
  { id: 11, title: "道具・楽器" },
  { id: 12, title: "子どもの生徒・保護者" },
];

const VALID_SPEAKERS = new Set(["バイオリニスト", "研究マニア", "身体専門家"]);
const BLOCK_LIMIT = 190;

// 内部資料のファイル名を読者向けラベルへ置き換える
const SOURCE_LABELS = [
  [/2026-05-30_バイオリン悩み図鑑\.md\s*/u, "【レッスン記録の分析】"],
  [/2026-05-30_バイオリン身体メソッド集\.md\s*/u, "【身体メソッド集】"],
  [/trouble_map\.md\s*/u, "【学習者の悩み調査】"],
  [/papers_local\.md\s*/u, "【研究論文】"],
  [/web_papers_\w+\.md\s*/u, "【研究論文】"],
  [/research_reports\.md\s*/u, "【研究レポート】"],
  [/books_ja\.md\s*/u, "【書籍】"],
  [/books_en\.md\s*/u, "【書籍】"],
  [/sweep_results\.json\s*/u, "【学習者の声】"],
  [/students_[A-D]\.md\s*/u, "【レッスン記録の分析】"],
];

function formatSource(raw) {
  let text = String(raw || "").trim();
  let labeled = false;
  for (const [pattern, label] of SOURCE_LABELS) {
    if (pattern.test(text)) {
      text = label + text.replace(pattern, "").trim();
      labeled = true;
      break;
    }
  }
  if (!labeled) {
    if (/違反|PMC|pubmed|Frontiers|SAGE|meta|Psychological/iu.test(text)) text = `【研究論文】${text}`;
    else if (/violinist\.com|reddit|r\/|知恵袋|Yahoo|フォーラム|掲示板|Maestronet|Strings Magazine/iu.test(text)) text = `【学習者の声】${text}`;
    else if (/教本|cursor-book|ボーイングの答え|左手の形の答え|ビブラートの答え/u.test(text)) text = `【教本】${text}`;
    else if (/^【/u.test(text) === false) text = `【資料】${text}`;
  }
  return text.replace(/\s+/gu, " ").trim();
}

function splitSentences(text) {
  return String(text || "")
    .replace(/\s+/gu, "")
    .match(/[^。！？!?]+[。！？!?]?/gu) || [];
}

function splitBlocks(text) {
  const sentences = splitSentences(text);
  const blocks = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && (current.length + sentence.length) > BLOCK_LIMIT) {
      blocks.push({ t: current });
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current) blocks.push({ t: current });
  return blocks;
}

const errors = [];
const questions = [];

const files = readdirSync(chaptersDir).filter((name) => /^q\d{3}\.json$/u.test(name)).sort();
for (const name of files) {
  const path = join(chaptersDir, name);
  let raw;
  try {
    raw = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(`${name}: JSONが読めない (${error.message})`);
    continue;
  }
  const chapter = CHAPTERS.find((item) => item.id === raw.chapter);
  if (!chapter) errors.push(`${name}: chapterが不正 (${raw.chapter})`);
  if (!raw.id || !raw.title || !raw.question) errors.push(`${name}: id/title/questionが欠落`);
  if (!Array.isArray(raw.discussion) || raw.discussion.length < 4) errors.push(`${name}: discussionが4発言未満`);
  if (!Array.isArray(raw.prescription) || raw.prescription.length < 3) errors.push(`${name}: prescriptionが3項目未満`);
  for (const [i, turn] of (raw.discussion || []).entries()) {
    if (!VALID_SPEAKERS.has(turn.speaker)) errors.push(`${name}: 不正な話者 (${turn.speaker})`);
    if (!turn.plain || String(turn.plain).trim().length < 40) {
      errors.push(`${name}: discussion[${i}]のplain（噛み砕き文）が欠落または短すぎ`);
    }
  }
  if (raw.secrets !== undefined) {
    if (!Array.isArray(raw.secrets) || raw.secrets.length < 2 || raw.secrets.length > 6) {
      errors.push(`${name}: secretsは2〜6件の配列であること`);
    } else {
      for (const [i, secret] of raw.secrets.entries()) {
        if (!secret.title || !secret.text || !secret.source) errors.push(`${name}: secrets[${i}]にtitle/text/sourceが必要`);
      }
    }
  }
  if (raw.steps !== undefined) {
    if (!Array.isArray(raw.steps) || raw.steps.length < 3 || raw.steps.length > 7) {
      errors.push(`${name}: stepsは3〜7段の配列であること`);
    } else {
      for (const [i, step] of raw.steps.entries()) {
        if (!step.title || !step.action || !step.pass) {
          errors.push(`${name}: steps[${i}]にtitle/action/passが必要`);
        }
      }
    }
  }
  questions.push({
    id: raw.id,
    chapter: raw.chapter,
    chapter_title: chapter ? chapter.title : "",
    score_caption: null,
    assetPath: null,
    sources: (raw.sources || []).map(formatSource),
    tier: raw.tier ?? 2,
    app: {
      title: raw.title,
      question: raw.question,
      profile: null,
      discussion: (raw.discussion || []).map((turn) => ({
        speaker: turn.speaker,
        // plainは発言(turn)単位。複数ブロックに割れた発言では全ブロックに同じ噛み砕きを付ける
        // （どのブロックで「わからない」を押しても発言全体を例え話で説明し直す）
        blocks: splitBlocks(turn.text).map((block) => ({ ...block, p: String(turn.plain || "").trim() || undefined })),
      })),
      prescription: raw.prescription || [],
      secrets: (raw.secrets || []).map((secret) => ({
        title: String(secret.title).trim(),
        text: String(secret.text).trim(),
        source: String(secret.source).trim(),
      })),
      steps: Array.isArray(raw.steps)
        ? raw.steps.map((step) => ({
            title: String(step.title).trim(),
            action: String(step.action).trim(),
            pass: String(step.pass).trim(),
            ...(step.time ? { time: String(step.time).trim() } : {}),
            ...(step.if_stuck ? { if_stuck: String(step.if_stuck).trim() } : {}),
          }))
        : [],
    },
  });
}

if (errors.length) {
  console.error(`検証エラー ${errors.length}件:`);
  for (const line of errors) console.error(`  - ${line}`);
  process.exit(1);
}

questions.sort((a, b) => a.id.localeCompare(b.id));

const payload = {
  source: {
    path: "violin-nayami-kaiketsu/chapters",
    generated_at: new Date().toISOString(),
    count: questions.length,
  },
  chapters: CHAPTERS,
  questions,
};

writeFileSync(outputPath, `window.VIOLIN_QA_DATA = ${JSON.stringify(payload, null, 2)};\n`, "utf8");
const withSecrets = questions.filter((q) => q.app.secrets.length).length;
const withSteps = questions.filter((q) => q.app.steps.length).length;
console.log(`OK: ${questions.length}問 (裏技あり${withSecrets}問 / stepsあり${withSteps}問) -> data/questions.js`);
