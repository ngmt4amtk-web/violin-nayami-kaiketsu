#!/usr/bin/env python3
import difflib
import argparse
import json
import re
import subprocess
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def normalized_numbers(value: str) -> str:
    replacements = {
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
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    return value


def number_tokens(value: str) -> set[str]:
    return set(re.findall(r"\d+(?:\.\d+)?", normalized_numbers(value)))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fast", action="store_true")
    args = parser.parse_args()
    errors = []
    warnings = []
    opening_counter = Counter()
    closing_counter = Counter()
    high_similarity = []

    for question_number in range(58, 114):
        relative = f"chapters/q{question_number:03d}.json"
        current = json.loads((ROOT / relative).read_text())
        if not args.fast:
            original = json.loads(
                subprocess.check_output(
                    ["git", "show", f"HEAD:{relative}"], cwd=ROOT, text=True
                )
            )
            if len(current["prescription"]) != len(original["prescription"]):
                errors.append(
                    f"Q{question_number:03d} prescription "
                    f"{len(original['prescription'])}->{len(current['prescription'])}"
                )
            if len(current["discussion"]) != len(original["discussion"]):
                errors.append(f"Q{question_number:03d} discussion count changed")

        opening_counter[current["discussion"][0]["text"].split("。", 1)[0]] += 1
        closing_counter[current["discussion"][-1]["text"].split("。", 1)[0]] += 1

        for turn_index, turn in enumerate(current["discussion"], start=1):
            text = turn["text"]
            plain = turn["plain"]
            if not plain.strip():
                errors.append(f"Q{question_number:03d}.{turn_index} empty plain")
                continue
            ratio = len(plain) / max(1, len(text))
            similarity = difflib.SequenceMatcher(None, text, plain).ratio()
            if ratio < 0.48:
                warnings.append(
                    f"Q{question_number:03d}.{turn_index} load ratio {ratio:.2f}"
                )
            if similarity >= 0.90:
                high_similarity.append(
                    f"Q{question_number:03d}.{turn_index}:{similarity:.2f}"
                )
            missing_numbers = sorted(number_tokens(text) - number_tokens(plain))
            if missing_numbers:
                warnings.append(
                    f"Q{question_number:03d}.{turn_index} missing numbers "
                    + ",".join(missing_numbers)
                )
        joined_plain = "\n".join(t["plain"] for t in current["discussion"])
        if "肩甲骨" in joined_plain or "脱力" in joined_plain:
            errors.append(f"Q{question_number:03d} forbidden plain term")
        joined_prescription = "\n".join(current["prescription"])
        if re.search(r"【量】|【頻度】|【合格】|れば合格|なら合格", joined_prescription):
            errors.append(f"Q{question_number:03d} inspection prescription remains")

    repeated_openings = [key for key, count in opening_counter.items() if count > 1]
    repeated_closings = [key for key, count in closing_counter.items() if count > 1]
    print(
        json.dumps(
            {
                "questions": 56,
                "errors": errors,
                "warnings": warnings,
                "high_similarity": high_similarity,
                "repeated_opening_stems": repeated_openings,
                "repeated_closing_stems": repeated_closings,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
