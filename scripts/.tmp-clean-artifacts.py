#!/usr/bin/env python3
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def clean(value: str) -> str:
    value = re.sub(r"切り(?:切り)+分け", "切り分け", value)
    value = re.sub(r"見(?:見)+直", "見直", value)
    value = value.replace("ただ、、", "ただ、")
    value = value.replace("切り見直します", "切り直します")
    value = value.replace("やり見直します", "やり直します")
    value = value.replace("を取り組みます", "に取り組みます")
    value = value.replace("を先に取り組みます", "から取り組みます")
    value = value.replace("A/Cに取り組みます", "A/Cへ取り組みます")
    value = value.replace("使うこれに対して", "使いますが")
    value = value.replace("使うそれに対して", "使いますが")
    value = value.replace("切り切り", "切り")
    value = value.replace("見見", "見")
    value = re.sub(r"\n\nという悩みは、[^。]*。\s*", "\n\n", value)
    value = re.sub(r"^という悩みは、[^。]*。\s*", "", value)
    value = re.sub(r"、{2,}", "、", value)
    return value


def main() -> None:
    changed = []
    for question_number in range(58, 114):
        path = ROOT / "chapters" / f"q{question_number:03d}.json"
        data = json.loads(path.read_text())
        dirty = False
        for index, turn in enumerate(data["discussion"]):
            text = turn["text"]
            if index == 0:
                text = re.sub(
                    r"^「[^」]+」という悩みは、レッスンでも珍しくありません。",
                    "",
                    text,
                )
                text = re.sub(
                    r"^(「[^」]+」)という悩みは、レッスンでもよく出てきます。",
                    r"\1。",
                    text,
                )
            plain = clean(turn["plain"])
            if text != turn["text"]:
                turn["text"] = text
                dirty = True
            if plain != turn["plain"]:
                turn["plain"] = plain
                dirty = True
        prescriptions = [
            item.replace("不一区切り", "未達") for item in data["prescription"]
        ]
        if prescriptions != data["prescription"]:
            data["prescription"] = prescriptions
            dirty = True
        if dirty:
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
            changed.append(path.name)
    print(json.dumps(changed, ensure_ascii=False))


if __name__ == "__main__":
    main()
