#!/usr/bin/env python3
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


OPENING_CLONES = [
    "これもレッスンで本当によくいただく相談です。",
    "これは、レッスンでも本当によくいただく相談です。",
    "これは、レッスンで繰り返し出てくる悩みです。",
    "これは、レッスンでも珍しくありません。",
    "これはレッスンでも珍しくありません。",
    "そう感じている方は、決して少なくありません。",
    "そう感じる方は少なくありません。",
    "よく分かる悩みです。",
]


def remove_text_clones(value: str, title: str, is_first: bool, is_last: bool) -> str:
    if is_first:
        for clone in OPENING_CLONES:
            value = value.replace(clone, "")
        value = re.sub(r"\n{3,}", "\n\n", value)
        value = re.sub(r"([。！？])\s+([」』])", r"\1\2", value)

    if is_last:
        escaped = re.escape(title)
        patterns = [
            rf"今週の練習では、「{escaped}」が出る瞬間だけを取り出します。",
            rf"今週は「{escaped}」が出る1か所だけを使います。",
            rf"明日からは「{escaped}」を、短い確認と練習に分けます。",
            rf"「{escaped}」は、曲を通して直す前に、最初の数分だけをそろえます。",
            rf"「{escaped}」は、今週いじる条件を1つに絞って確かめます。",
            rf"「{escaped}」を一度に仕上げず、今週は入口の練習だけをそろえます。",
            rf"今日は「{escaped}」の最初の一手だけでかまいません。",
            rf"「{escaped}」を今日だけで仕上げる必要はありません。",
            rf"「{escaped}」は、うまくいかない回も原因を教える記録になります。",
            rf"「{escaped}」は、一度の成功より再現できる回数を増やしていきましょう。",
            rf"「{escaped}」は、一度の成功より同じようにできる回数を増やしていきましょう。",
        ]
        for pattern in patterns:
            value = re.sub(pattern, "", value)
        value = re.sub(r"\n{3,}", "\n\n", value).strip()
    return value


def marker_prescription(value: str, variant: int) -> str:
    match = re.fullmatch(
        r"【量】(?P<amount>.*?)【頻度】(?P<frequency>.*?)【合格】(?P<criterion>.*)",
        value,
        re.S,
    )
    if not match:
        return value
    amount = match.group("amount").strip().rstrip("。")
    frequency = match.group("frequency").strip().rstrip("。")
    criterion = match.group("criterion").strip().rstrip("。")
    tails = [
        "そこまでできたら、このセットは終わりです。",
        "その状態が作れたら、回数を足さず次へ進みます。",
        "ここまで確認できれば、その日は十分です。",
        "その結果を残せたら、できた形を持って終えます。",
        "この目安に届いたら、その日はそこで切り上げます。",
        "そこまでそろえば、次回も同じ入口から始めます。",
    ]
    return f"{frequency}、{amount}。{criterion}。{tails[variant % len(tails)]}"


def polish_prescription(value: str, variant: int) -> str:
    value = marker_prescription(value, variant)
    replacements = {
        "次の日も同じ条件で確かめます、翌日は": "その日の記録を残し、翌日は",
        "なら、そこまでを今週の前進として数えますとし、": "なら、その結果を今週の前進として残し、",
        "自己調整を不一区切りとし": "自己調整では未達とし",
        "2日続けて一区切りしてから": "2日続けてできてから",
        "ここまでできた日は、翌日も同じ条件から始めます。": "そこで終え、次回も同じ条件から始めます。",
        "ここまでできた日は、その日の練習を終えてかまいません。": "そこまでできたら、その日は終えてかまいません。",
        "ここまでできたことを、その日の前進として数えます。": "その結果を、その日の前進として残します。",
        "ここまでできたら、無理に回数を足さず終えます。": "そこで回数を足さず終えます。",
        "そのやり方を翌日の入口にも残します。": "そのやり方を次回の入口にも残します。",
        "次の日も同じ条件で確かめます": "次回も同じ条件から始めます",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    value = value.replace("合格", "目安")
    value = re.sub(r"。{2,}", "。", value)
    return value


def polish_plain(value: str) -> str:
    replacements = {
        "この悩みの入口は、": "",
        "音の高さ": "音程",
        "見分けなし型": "採点なし型",
        "前日の最後と同じ見分けを通れば": "前日の最後と同じ基準を満たせば",
        "最初に、届く途中で": "まず、届く途中で",
        "ればその感覚を一度残せれば十分です": "れば、その感覚を一度確かめて終えます",
        "調弦しても音程が取りにくい2つ目は": "調弦しても音程が取りにくい、2つ目は",
        "余韻が沈む3つ目は": "余韻が沈む、3つ目は",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    return value


SPECIAL_PLAIN = {
    95: (
        "まとまった1時間が取れない日にも、練習を切らさない方法はあります。まず分けたいのは、1時間未満を失敗と数える**最低時間型（A）**、ケースや肩当ての準備で止まる**開始摩擦型（B）**、短い時間に何をするか決められない**課題未定型（C）**の3つです。\n\n"
        "1時間の総合練習と、2分の保守練習は役割が違います。保守日は、ケースを開け、昨日と同じ課題を1回だけ再現し、次の一手を1行残せば成立です。質問の状態では、まず「1時間できなければゼロ」というAの採点を外します。\n\n"
        "最初の目標は、7日中5日、2分だけ接続を保つことです。"
    ),
    104: (
        "読譜が遅いのは、向き不向きよりも、音符を1個ずつドレミへ訳してから指を探しているためです。線と間を毎回下から数える方法では、1音ごとに処理が止まります。\n\n"
        "慣れた読み手は、音符を1個ずつではなく、隣へ進む、飛ぶ、上がる、下がる、といった形のまとまりで先読みします。文章を1文字ずつではなく単語で読むのと同じです。練習では、速く数えるのではなく、読む単位を1音から音型へ広げます。\n\n"
        "ただし、細かい音符そのものがぼやける場合は別です。認知の遅さと、老眼などで像が見えていない問題を分け、後者なら譜面の大きさ・距離・眼鏡を先に整えます。"
    ),
    107: (
        "弓の毛は、ネジを何回回したかではなく、弓の中央にできる毛と竿の隙間で合わせます。最初の目安は、いちばん広い中央の隙間が竿1本分ほどになる位置です。\n\n"
        "この時、毛はまっすぐ張りますが、竿には毛の側へ曲がる弧が残ります。中央で最も離れ、両端へ向かって隙間が狭くなる形です。湿度で毛の長さが変わるため、回転数は日によって同じになりません。\n\n"
        "竿がまっすぐを越えて毛と反対側へ反る、または普通に弦へ置いた時に竿が弦へ当たるなら、自分で追い込まず先生か弓職人へ見せます。反りや毛量には個体差があるので、最初の1回は専門家と基準位置を決め、横写真を見本にしてください。"
    ),
}


def main() -> None:
    touched = []
    for question_number in range(58, 114):
        path = ROOT / "chapters" / f"q{question_number:03d}.json"
        data = json.loads(path.read_text())
        changed = False

        discussions = data["discussion"]
        for index, turn in enumerate(discussions):
            text = remove_text_clones(
                turn["text"],
                data["title"],
                is_first=index == 0,
                is_last=index == len(discussions) - 1,
            )
            text = text.replace("この悩みの入口は、これは", "この悩みは")
            text = text.replace("この悩みの入口は、このけんかは", "このけんかは")
            text = text.replace("ここから7日間は、1週間は、", "ここから1週間は、")
            text = text.replace("原因分け", "切り分け")
            text = text.replace("何も変わらなければ", "変化がなければ")
            plain = remove_text_clones(
                turn["plain"],
                data["title"],
                is_first=index == 0,
                is_last=index == len(discussions) - 1,
            )
            plain = polish_plain(plain)
            if index == 0 and question_number in SPECIAL_PLAIN:
                plain = SPECIAL_PLAIN[question_number]
            if text != turn["text"]:
                turn["text"] = text
                changed = True
            if plain != turn["plain"]:
                turn["plain"] = plain
                changed = True

        prescriptions = []
        for index, item in enumerate(data["prescription"]):
            polished = polish_prescription(item, question_number + index)
            prescriptions.append(polished)
            changed = changed or polished != item
        data["prescription"] = prescriptions

        if changed:
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
            touched.append(path.name)
    print(json.dumps(touched, ensure_ascii=False))


if __name__ == "__main__":
    main()
