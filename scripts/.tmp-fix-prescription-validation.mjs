import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migratedQuestions = new Set([96, 101, 102, 103, 104, 106, 110]);
const passPattern =
  /【合格】|合格|(?:=|→|なら)(?:主)?タイプ[A-C]|=[A-C](?:[、/]|$)|A\/B\/Cを選ぶ|判定(?:でき|する|完了|不能)|診断完了|でき(?:る|れば|た)|(?:つなが|通|鳴|澄|届|収ま|聞け)れば|減(?:る|れば)|増えない|残らない|出ない|消え(?:る|たら)|変わらない|短くなる|縮む|聞き分け|見分け|丸がつく|一致|以内|以下|以上|未満|ゼロ|そろ(?:う|えば|った)|揃(?:う|えば|った)|保て(?:る|れば|た)|続けて成功|成功(?:数|回)|改善|悪化しない|持ち越さない|再現|採用|卒業|完了|決まる/u;
const tails = [
  "そこまで確認できれば、その日は十分です。",
  "ここまでできれば、回数を足さず終えてかまいません。",
  "できた所までを残せれば、次回も同じ入口から始められます。",
  "この目安までできれば、その日の前進として残します。",
  "ここまでそろえられれば、そこで切り上げてかまいません。",
  "結果を記録できれば、その日はそれ以上足しません。",
];

function restoreMarkers(questionNumber, current) {
  const relative = `chapters/q${String(questionNumber).padStart(3, "0")}.json`;
  const original = JSON.parse(
    execFileSync("git", ["show", `HEAD:${relative}`], {
      cwd: root,
      encoding: "utf8",
    }),
  );
  current.prescription = original.prescription.map((item, index) => {
    const match = item.match(
      /^【量】(?<amount>.*?)【頻度】(?<frequency>.*?)【合格】(?<criterion>.*)$/su,
    );
    if (!match) {
      throw new Error(`${relative} prescription[${index}] marker parse failed`);
    }
    const amount = match.groups.amount.trim().replace(/。$/u, "");
    const frequency = match.groups.frequency.trim().replace(/。$/u, "");
    const criterion = match.groups.criterion.trim().replace(/。$/u, "");
    return `【量】${amount}。【頻度】${frequency}。【合格】${criterion}。${
      tails[(questionNumber + index) % tails.length]
    }`;
  });
}

for (let questionNumber = 58; questionNumber <= 113; questionNumber += 1) {
  const filename = `q${String(questionNumber).padStart(3, "0")}.json`;
  const path = join(root, "chapters", filename);
  const data = JSON.parse(await readFile(path, "utf8"));

  if (migratedQuestions.has(questionNumber)) {
    restoreMarkers(questionNumber, data);
  }

  data.prescription = data.prescription.map((item, index) => {
    if (passPattern.test(item)) return item;
    return `${item.replace(/。?$/u, "。")}${
      tails[(questionNumber * 3 + index) % tails.length]
    }`;
  });

  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`);
}

console.log("prescriptions normalized for q058-q113");
