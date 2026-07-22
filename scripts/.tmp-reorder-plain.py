#!/usr/bin/env python3
import argparse
import difflib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def split_sentences(value: str) -> list[str]:
    value = value.strip()
    if not value:
        return []
    if value.startswith("- "):
        return [value]
    return [
        part.strip()
        for part in re.split(r"(?<=[。！？])(?=\S)", value)
        if part.strip()
    ]


def units(value: str) -> list[dict]:
    result = []
    for paragraph_index, paragraph in enumerate(value.split("\n\n")):
        for line in paragraph.splitlines():
            for sentence in split_sentences(line):
                result.append(
                    {
                        "text": sentence,
                        "paragraph": paragraph_index,
                        "bullet": sentence.startswith("- "),
                    }
                )
    return result


def normalized(value: str) -> str:
    substitutions = {
        "一": "1",
        "二": "2",
        "三": "3",
        "四": "4",
        "五": "5",
        "六": "6",
        "七": "7",
        "八": "8",
        "九": "9",
        "十": "10",
        "開放弦": "指で押さえない弦",
        "音程": "音の高さ",
        "判定": "見分け",
        "診断": "原因調べ",
        "記録": "書き残し",
        "比較": "見比べ",
        "処方": "やり方",
    }
    for old, new in substitutions.items():
        value = value.replace(old, new)
    return re.sub(r"[\s、。・「」『』（）()：:＝=→\-*#]", "", value)


def reorder_plain(text: str, plain: str) -> str:
    source = units(text)
    target = units(plain)
    if len(source) < 2 or len(target) < 2:
        return plain

    mapped = []
    for original_index, item in enumerate(target):
        scores = [
            difflib.SequenceMatcher(
                None, normalized(item["text"]), normalized(candidate["text"])
            ).ratio()
            for candidate in source
        ]
        source_index = max(range(len(scores)), key=scores.__getitem__)
        mapped.append(
            {
                **item,
                "source_index": source_index,
                "source_paragraph": source[source_index]["paragraph"],
                "score": scores[source_index],
                "original_index": original_index,
            }
        )

    # Do not touch prose that is no longer sentence-aligned with the discussion.
    if sum(item["score"] for item in mapped) / len(mapped) < 0.48:
        return plain

    mapped.sort(key=lambda item: (item["source_index"], item["original_index"]))
    paragraphs: list[list[str]] = []
    paragraph_ids: list[int] = []
    for item in mapped:
        paragraph_id = item["source_paragraph"]
        if not paragraph_ids or paragraph_ids[-1] != paragraph_id:
            paragraph_ids.append(paragraph_id)
            paragraphs.append([])
        paragraphs[-1].append(item["text"])

    rendered = []
    for paragraph in paragraphs:
        if all(item.startswith("- ") for item in paragraph):
            rendered.append("\n".join(paragraph))
        else:
            rendered.append("".join(paragraph))
    return "\n\n".join(rendered)


def clean_artifacts(value: str) -> str:
    replacements = {
        "指で押さえない2本の弦": "2本の開放弦",
        "指で押さえない弦": "開放弦",
        "弦を押す力時": "指を置いた時",
        "弦を押す力": "押弦",
        "原因を原因分けられません": "原因を切り分けられません",
        "原因分け": "切り分け",
        "原因調べ": "確認",
        "再原因調べ": "もう一度切り分け",
        "3手でやり方します": "3手で進めます",
        "サイズ見分け": "サイズ判定",
        "専門家の見分け": "専門家の判断",
        "確定見分け": "確定診断",
        "見分け法": "確認法",
        "合否見分け": "合否判定",
        "効果を見分け": "効果を確かめ",
        "効き目を見分け": "効き目を確かめ",
        "音の出始めする": "音が出始める",
        "届きにくさが多くなります": "届きにくさが増します",
        "一度の成功より同じようにできる回数": "一度の成功より再現できる回数",
        "同じようにできる": "再現できる",
        "同じようにできた": "再現できた",
        "何も変わらない": "変化がない",
        "何も変わらなければ": "変化がなければ",
        "音の高さの見分け": "音程の判定",
        "音の高さ差": "音程差",
        "音の高さが": "音程が",
        "音の高さを": "音程を",
        "音の高さへ": "音程へ",
        "音の高さや": "音程や",
        "音の高さ・": "音程・",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    value = re.sub(r"ここから7日間は、1週間は、", "ここから1週間は、", value)
    value = re.sub(r"この悩みの入口は、これは", "この悩みは", value)
    value = re.sub(r"([。、])\1+", r"\1", value)
    return value


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()

    changed = []
    for question_number in range(86, 114):
        path = ROOT / "chapters" / f"q{question_number:03d}.json"
        data = json.loads(path.read_text())
        question_changed = 0
        for turn in data["discussion"]:
            before = turn["plain"]
            after = clean_artifacts(reorder_plain(turn["text"], before))
            if after != before:
                turn["plain"] = after
                question_changed += 1
        if question_changed:
            changed.append((path.name, question_changed))
            if args.write:
                path.write_text(
                    json.dumps(data, ensure_ascii=False, indent=2) + "\n"
                )

    print(json.dumps(changed, ensure_ascii=False))


if __name__ == "__main__":
    main()
