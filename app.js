const DATA = window.VIOLIN_QA_DATA;

const SPEAKERS = {
  "相談室": {
    key: "system",
    avatar: "assets/avatars/room.svg",
  },
  "バイオリニスト": {
    key: "violinist",
    avatar: "assets/avatars/violinist.png",
  },
  "研究マニア": {
    key: "researcher",
    avatar: "assets/avatars/researcher.png",
  },
  "身体専門家": {
    key: "body",
    avatar: "assets/avatars/body.png",
  },
};

const PROBLEM_GROUPS = [
  {
    id: "pain",
    label: "痛い・しびれる・疲れる",
    detail: "肩、首、腰、手首、歯、しびれ、すぐ疲れる",
    chapterHints: [1],
  },
  {
    id: "setup",
    label: "構え方・姿勢で迷う",
    detail: "楽器の高さ・向き、肩当て、顎当て、立ち方",
    chapterHints: [2],
  },
  {
    id: "bow",
    label: "弓・右手がうまくいかない",
    detail: "弓が曲がる、震える、跳ねる、持ち方",
    chapterHints: [3],
  },
  {
    id: "sound",
    label: "音色・音量に悩む",
    detail: "音が汚い、かすれる、キーキー、小さい",
    chapterHints: [4],
  },
  {
    id: "left-hand",
    label: "左手・指が動かない",
    detail: "届かない、力む、速く動かない、指の形",
    chapterHints: [5],
  },
  {
    id: "pitch",
    label: "音程が合わない",
    detail: "合わない、わからない、チューナー頼り",
    chapterHints: [6],
  },
  {
    id: "vibrato",
    label: "ビブラートができない",
    detail: "かからない、楽器ごと揺れる、ちりめん",
    chapterHints: [7],
  },
  {
    id: "shift",
    label: "ポジション移動が怖い",
    detail: "上がれない、降りられない、迷子になる",
    chapterHints: [8],
  },
  {
    id: "rhythm",
    label: "和音・リズム・速い所",
    detail: "重音、左右が合わない、走る、崩れる",
    chapterHints: [9],
  },
  {
    id: "practice",
    label: "練習のしかた・心",
    detail: "何をすれば、続かない、緊張、伸びない",
    chapterHints: [10],
  },
  {
    id: "gear",
    label: "道具・楽器のこと",
    detail: "ペグ、松脂、毛替え、買い替え",
    chapterHints: [11],
  },
  {
    id: "kids",
    label: "子どもの生徒・保護者",
    detail: "練習させ方、親子げんか、分数楽器",
    chapterHints: [12],
  },
];

const ANSWER_BLOCK_LENGTH = 170;
const STRUCTURED_MESSAGE_KINDS = new Set(["violinist", "researcher", "body", "prescription", "step"]);
const STRUCTURE_MARKER_PATTERN = /タイプ[ABC]=|失敗[①②③]|[①②③]|Day1:|Day[237]|まずこれ1個だけ:|今日やることは/gu;
const WELDED_LIST_PATTERN = /([^\n])(-\s*\*\*[^*]+?\*\*[：:])/gu;
const HARD_WORDS = [
  ["骨盤前傾", "骨盤が前に傾き、腰が反りやすい状態"],
  ["反り腰", "腰の後ろ側が強く反っている状態"],
  ["胸椎", "背中の上のほうの背骨"],
  ["頭部前方位", "頭が体より前に出ている姿勢"],
  ["後頭下筋群", "頭の後ろの付け根で、頭を支える小さい筋肉群"],
  ["ペルビックティルト", "寝たまま骨盤を丸めたり戻したりする体操"],
  ["上方回旋", "腕を上げる時に肩甲骨が上向きに回る動き"],
  ["挙上", "肩をすくめるように上へ持ち上げる動き"],
  ["固有受容感覚", "見なくても体の位置や力加減が分かる感覚"],
  ["外的焦点", "体の中ではなく、音や弓の道筋など外側の結果を見ること"],
  ["内的焦点", "指や腕など体の部位そのものを意識すること"],
  ["純正律", "和音が濁りにくいように合わせる音程の取り方"],
  ["ピタゴラス", "旋律が進む力を出しやすい音程の取り方"],
  ["平均律", "ピアノのように全調で使いやすく均等に割った音程"],
  ["弓圧", "弓が弦にかかる重さ"],
  ["弓速", "弓を動かす速さ"],
  ["接触点", "弓が弦に触れている場所"],
  ["可動域", "関節を無理なく動かせる範囲"],
  ["回内", "前腕を、手のひらが下を向く方向へひねる動き"],
  ["回外", "前腕を、手のひらが上を向く方向へひねる動き"],
  ["弓配分", "弓のどの部分をどれだけ使うかの割り振り"],
  ["移弦", "弓を隣の弦へ乗せ替えること"],
  ["倍音", "基の音に重なって響く高い成分。音の豊かさのもと"],
  ["重音", "2本以上の弦を同時に鳴らすこと"],
  ["サウンディングポイント", "駒と指板の間で、弓が弦に触れている場所"],
  ["スピッカート", "弓を弦の上で軽く弾ませる奏法"],
  ["デタシェ", "1音ずつ弓を返して弾く基本の奏法"],
  ["ポルタメント", "音から音へ滑って移る効果"],
  ["胸鎖関節", "鎖骨の胸側の付け根の関節。腕の本当の起点"],
  ["母指球", "手のひらの親指の付け根のふくらみ"],
];

const els = {
  body: document.body,
  chatBody: document.getElementById("chatBody"),
  chapterStrip: document.getElementById("chapterStrip"),
  questionList: document.getElementById("questionList"),
  questionCount: document.getElementById("questionCount"),
  searchInput: document.getElementById("searchInput"),
  roomTitle: document.getElementById("roomTitle"),
  roomSub: document.getElementById("roomSub"),
  menuButton: document.getElementById("menuButton"),
  drawerBackdrop: document.getElementById("drawerBackdrop"),
};

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* プライベートモード等では保存しない */
  }
}

const state = {
  chapter: "all",
  tier: "all",
  search: "",
  activeQuestion: null,
  sending: false,
};

function init() {
  if (!DATA || !Array.isArray(DATA.questions)) {
    addMessage("相談室", "データを読み込めませんでした。通信環境を確認して、ページを再読み込みしてください。", { kind: "system" });
    return;
  }

  renderChapters();
  bindEvents();
  renderQuestionList();

  const params = new URLSearchParams(window.location.search);
  const deepLinkId = params.get("q")?.toUpperCase();
  const deepLinked = deepLinkId && DATA.questions.find((q) => q.id === deepLinkId);
  if (deepLinked) {
    openQuestion(deepLinked);
    return;
  }

  startConversation();
}

function bindEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim();
    renderQuestionList();
  });

  document.querySelectorAll(".filter-chip").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.remove("active"));
      button.classList.add("active");
      state.tier = button.dataset.tier;
      renderQuestionList();
    });
  });

  els.menuButton.addEventListener("click", () => {
    const open = els.body.classList.toggle("drawer-open");
    els.menuButton.setAttribute("aria-expanded", String(open));
  });

  els.drawerBackdrop.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
  });

  window.matchMedia("(min-width: 841px)").addEventListener("change", (event) => {
    if (event.matches) closeDrawer();
  });
}

function closeDrawer() {
  els.body.classList.remove("drawer-open");
  els.menuButton.setAttribute("aria-expanded", "false");
}

function renderChapters() {
  const allButton = document.createElement("button");
  allButton.className = "chapter-tab active";
  allButton.type = "button";
  allButton.textContent = "全体";
  allButton.addEventListener("click", () => chooseChapterFilter("all"));
  els.chapterStrip.append(allButton);

  PROBLEM_GROUPS.forEach((group) => {
    const button = document.createElement("button");
    button.className = "chapter-tab";
    button.type = "button";
    button.textContent = group.label;
    button.addEventListener("click", () => chooseProblemFilter(group.id));
    els.chapterStrip.append(button);
  });
}

function chooseProblemFilter(groupId) {
  state.chapter = groupId;
  document.querySelectorAll(".chapter-tab").forEach((button, index) => {
    button.classList.toggle("active", index > 0 && PROBLEM_GROUPS[index - 1].id === groupId);
  });
  document.querySelector(".chapter-tab.active")?.scrollIntoView({ inline: "nearest", block: "nearest" });
  renderQuestionList();
}

function chooseChapterFilter(chapter) {
  state.chapter = chapter;
  document.querySelectorAll(".chapter-tab").forEach((button, index) => {
    button.classList.toggle("active", chapter === "all" && index === 0);
  });
  renderQuestionList();
}

function getFilteredQuestions() {
  const query = normalize(state.search);
  return DATA.questions.filter((q) => {
    // 検索中はタブ・深さの絞り込みを外し、常に全体から探す
    if (query) {
      const haystack = normalize([
        q.id,
        q.chapter_title,
        q.app.title,
        q.app.question,
        q.app.profile,
        (q.app.discussion || []).map((turn) => (turn.blocks || []).map((block) => block.t).join(" ")).join(" "),
        (q.app.prescription || []).join(" "),
        (q.app.secrets || []).map((secret) => `${secret.title} ${secret.text}`).join(" "),
      ].join(" "));
      return haystack.includes(query);
    }
    const group = PROBLEM_GROUPS.find((item) => item.id === state.chapter);
    const chapterMatch = state.chapter === "all" || (group && groupMatchesQuestion(group, q));
    const tierMatch = state.tier === "all" || q.tier === Number(state.tier);
    return chapterMatch && tierMatch;
  });
}

function renderQuestionList() {
  const questions = getFilteredQuestions();
  els.questionCount.textContent = state.search ? `全体から${questions.length}件` : `${questions.length}件`;
  els.questionList.innerHTML = "";

  if (questions.length === 0) {
    els.questionList.innerHTML = `<div class="empty-state">近い悩みが見つかりません。<br>言葉を短くして探すと見つかりやすいです。</div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  questions.forEach((q) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `question-card ${state.activeQuestion?.id === q.id ? "active" : ""}`;
    button.innerHTML = `
      <div class="meta"><span>${escapeHtml(`${q.id}・${q.chapter_title}`)}</span><span>${tierLabel(q.tier)}</span></div>
      <div class="title">${escapeHtml(q.app.title)}</div>
      <div class="persona">${escapeHtml(shorten(q.app.question, 72))}</div>
    `;
    button.addEventListener("click", () => {
      if (state.sending) return;
      if (state.activeQuestion?.id === q.id) {
        closeDrawer();
        return;
      }
      openQuestion(q);
    });
    frag.append(button);
  });

  els.questionList.append(frag);
}

function startConversation() {
  state.activeQuestion = null;
  els.chatBody.innerHTML = "";
  els.roomTitle.textContent = "バイオリンお悩み解決室";
  els.roomSub.textContent = "近い悩みを選んでください";
  renderQuestionList();
  addMessage("相談室", "こんにちは。バイオリンの悩みに、3人の専門家が答える解決室です。\nぴったりじゃなくて大丈夫なので、近いものを選んでください。", { kind: "system" });

  const choices = PROBLEM_GROUPS.map((group) => ({
    label: group.label,
    detail: group.detail,
    action: () => chooseProblem(group),
  }));

  const lastId = safeStorageGet("violin-nayami-last-id");
  const lastQuestion = lastId && DATA.questions.find((q) => q.id === lastId);
  if (lastQuestion) {
    choices.unshift({
      label: "前回の相談をもう一度ひらく",
      detail: shorten(lastQuestion.app.title, 40),
      silent: true,
      action: () => openQuestion(lastQuestion),
    });
  }

  addChoiceMessage("相談室", "まず大きく分けると、どれに近いですか？", choices);
}

function chooseProblem(group) {
  chooseProblemFilter(group.id);
  addMessage("相談室", "では、もう少し具体的にはどれに近いですか？", { kind: "system" });
  showQuestionChoices(group, 0);
}

function showQuestionChoices(group, page) {
  const questions = questionsForGroup(group);
  const pageSize = 8;
  const start = page * pageSize;
  const slice = questions.slice(start, start + pageSize);
  const choices = slice.map((q) => ({
    label: q.app.title,
    detail: shorten(q.app.question, 54),
    silent: true,
    action: () => openQuestion(q),
  }));

  if (start + pageSize < questions.length) {
    choices.push({
      label: "もっと見る",
      detail: `この悩みの候補は全部で${questions.length}件`,
      action: () => showQuestionChoices(group, page + 1),
    });
  }
  if (page > 0) {
    choices.push({
      label: "前に戻る",
      detail: "前の候補を見る",
      action: () => showQuestionChoices(group, page - 1),
    });
  }
  choices.push({
    label: "大分類から選び直す",
    detail: "悩みの大分類に戻る",
    action: () => startConversation(),
  });

  addChoiceMessage("相談室", "この中なら、どれが一番近いですか？", choices);
}

function openQuestion(question) {
  if (state.sending) return;
  disableStaleChoices();
  state.activeQuestion = question;
  safeStorageSet("violin-nayami-last-id", question.id);
  closeDrawer();
  const currentGroup = PROBLEM_GROUPS.find((group) => group.id === state.chapter);
  if (state.chapter !== "all" && !(currentGroup && groupMatchesQuestion(currentGroup, question))) {
    chooseProblemFilter(groupForQuestion(question).id);
  } else {
    renderQuestionList();
  }
  els.roomTitle.textContent = question.app.title;
  els.roomSub.textContent = `${question.id}・${question.chapter_title}`;

  addUserMessage(makeAskText(question));
  startDiscussion(question);
}

async function startDiscussion(question) {
  if (state.sending) return;
  disableStaleChoices();
  const segments = buildDiscussionSegments(question);
  if (!segments.length) {
    addMessage("相談室", "この相談の答えがまだ入っていません。別の悩みを選んでください。", { kind: "system" });
    addChoiceMessage("相談室", "次はどうしますか？", [
      {
        label: "近い悩みをもう一度選ぶ",
        detail: groupLabelForQuestion(question),
        action: () => chooseProblem(groupForQuestion(question)),
      },
      {
        label: "別の悩みを選ぶ",
        detail: "悩みの大分類に戻る",
        action: () => startConversation(),
      },
    ]);
    return;
  }
  showDiscussionBlock(question, segments, 0);
}

async function showDiscussionBlock(question, segments, index) {
  if (state.sending) return;
  const segment = segments[index];
  if (!segment) {
    finishDiscussion(question);
    return;
  }
  await sendPacedMessages([{
    speaker: segment.speaker,
    text: segment.text,
    options: { showName: segment.showName },
  }]);
  showDiscussionCheckpoint(question, segments, index);
}

function showDiscussionCheckpoint(question, segments, index) {
  const next = segments[index + 1];

  addChoiceMessage("相談室", "", [
    {
      label: "続ける",
      detail: next ? "続きを読む" : "読み終える",
      action: () => (next ? showDiscussionBlock(question, segments, index + 1) : finishDiscussion(question)),
    },
    {
      label: "やさしく読む",
      detail: "いまの部分をやさしく",
      action: () => showSegmentClarification(question, segments, index),
    },
  ], { compact: true });
}

async function showSegmentClarification(question, segments, index) {
  if (state.sending) return;
  const segment = segments[index];
  const messages = segment.plain
    ? [{
        speaker: "相談室",
        text: `かみ砕くと、こうです。\n${segment.plain}`,
        options: { kind: "system", showName: false },
      }]
    : segmentClarificationMessages(segment.text);
  await sendPacedMessages(messages);
  showDiscussionCheckpoint(question, segments, index);
}

function finishDiscussion(question) {
  maybeShowScoreAsset(question);
  showFollowupChoices(question, { exclude: "discussion" });
}

function showPrescription(question) {
  if (state.sending) return;
  addMessage("相談室", "今週やることは、この通りです。全部を一度にやらなくて大丈夫です。", { kind: "system" });
  question.app.prescription.forEach((item, index) => {
    addMessage("相談室", `${index + 1}. ${item}`, { kind: "prescription", showName: false });
  });
  maybeShowScoreAsset(question);
  showFollowupChoices(question, { exclude: "prescription" });
}

function stepsOf(question) {
  return Array.isArray(question.app.steps) ? question.app.steps : [];
}

function showSteps(question) {
  if (state.sending) return;
  const steps = stepsOf(question);
  if (!steps.length) return;
  addMessage("相談室", "一段ずつ登ります。合格の目安が出たら進んでください。", { kind: "system" });
  showStepAt(question, 0);
}

function showStepAt(question, index) {
  if (state.sending) return;
  const steps = stepsOf(question);
  const step = steps[index];
  if (!step) {
    showFollowupChoices(question, { exclude: "steps" });
    return;
  }
  const time = step.time ? `（${step.time}）` : "";
  const text = `【${index + 1}/${steps.length}】${step.title}${time}\nやること: ${step.action}\n合格: ${step.pass}`;
  addMessage("相談室", text, { kind: "step", showName: false });
  presentStepChoices(question, index);
}

function presentStepChoices(question, index, options = {}) {
  const steps = stepsOf(question);
  const step = steps[index];
  if (!step) {
    showFollowupChoices(question, { exclude: "steps" });
    return;
  }
  const isLast = index + 1 >= steps.length;
  const choices = [];

  if (isLast) {
    choices.push({
      label: "この手順はできた",
      action: () => finishStepsClimb(question),
    });
  } else {
    choices.push({
      label: "できた・次へ",
      action: () => showStepAt(question, index + 1),
    });
  }

  if (step.if_stuck && !options.stuckShown) {
    choices.push({
      label: "できない・もっと刻む",
      detail: "行き詰まったときの一段細かいやり方",
      action: () => showStepStuck(question, index),
    });
  }

  choices.push({
    label: "ここでやめる",
    action: () => showFollowupChoices(question, { exclude: "steps" }),
  });

  addChoiceMessage("相談室", "", choices, { compact: true });
}

function showStepStuck(question, index) {
  if (state.sending) return;
  const step = stepsOf(question)[index];
  if (!step?.if_stuck) {
    presentStepChoices(question, index, { stuckShown: true });
    return;
  }
  addMessage("相談室", step.if_stuck, { kind: "step", showName: false });
  presentStepChoices(question, index, { stuckShown: true });
}

function finishStepsClimb(question) {
  if (state.sending) return;
  addMessage("相談室", "一段ずつ登り切りました。よくやりました。", { kind: "system" });
  addChoiceMessage("相談室", "", [
    {
      label: "ひとまずこれで進める",
      detail: "登り切ったところで一区切り",
      action: () => showFollowupChoices(question, { exclude: "steps" }),
    },
    {
      label: "効果がまだ弱い",
      detail: "タイプ判定やくわしく聞くへ",
      action: () => showStepsNoEffectPath(question),
    },
  ], { compact: true });
}

function showStepsNoEffectPath(question) {
  if (state.sending) return;
  addMessage("相談室", "効果が薄いときは、自分の型を見極めるか、説明を聞き直すのが近道です。", { kind: "system" });
  addChoiceMessage("相談室", "", [
    {
      label: "くわしく聞く",
      detail: "タイプ判定から見直す",
      action: () => startDiscussion(question),
    },
    {
      label: "今週やることを見る",
      detail: "型ごとのメニューを確認",
      action: () => showPrescription(question),
    },
    {
      label: "別の悩みを選ぶ",
      detail: "悩みの大分類に戻る",
      action: () => startConversation(),
    },
  ], { compact: true });
}

function showSources(question) {
  if (state.sending) return;
  const text = question.sources.length
    ? question.sources.map((source) => `・${source}`).join("\n")
    : "出典情報は未登録です。";
  addMessage("相談室", text, { kind: "sources", showName: false });
  showFollowupChoices(question, { exclude: "sources" });
}

function secretsOf(question) {
  return Array.isArray(question.app.secrets) ? question.app.secrets : [];
}

async function showSecrets(question) {
  if (state.sending) return;
  const secrets = secretsOf(question);
  addMessage("相談室", "ここからは、教本に載りにくいコツ、プロの証言、研究の小ネタです。合う合わないがあるので、ピンときたものだけ持ち帰ってください。", { kind: "system" });
  state.sending = true;
  try {
    for (const secret of secrets) {
      showTyping("相談室");
      await wait(messageDelay(secret.text));
      removeTyping();
      addSecretMessage(secret);
    }
  } finally {
    state.sending = false;
  }
  showFollowupChoices(question, { exclude: "secrets" });
}

function addSecretMessage(secret) {
  const info = SPEAKERS["相談室"];
  const row = document.createElement("div");
  row.className = "message-row";
  row.innerHTML = `
    <img class="avatar" src="${info.avatar}" alt="">
    <div class="message-stack">
      <div class="bubble secret">${escapeHtml(`【${secret.title}】\n${secret.text}`)}<span class="secret-source">${escapeHtml(secret.source)}</span></div>
    </div>
  `;
  appendChatRow(row);
  scrollToBottom();
}

function showFollowupChoices(question, options = {}) {
  const choices = [];
  if (options.exclude !== "discussion") {
    choices.push({
      label: "くわしく聞く",
      detail: `${speakerCountOf(question)}人の専門家が順番に回答`,
      action: () => startDiscussion(question),
    });
  }
  if (options.exclude !== "prescription") {
    choices.push({
      label: "今週やることを見る",
      detail: "具体的な練習メニュー",
      action: () => showPrescription(question),
    });
  }
  if (options.exclude !== "steps" && stepsOf(question).length) {
    choices.push({
      label: "一段ずつやる",
      detail: "小さい手順で進める",
      action: () => showSteps(question),
    });
  }
  if (options.exclude !== "secrets" && secretsOf(question).length) {
    choices.push({
      label: "コツと根拠を見る",
      detail: "教本に載りにくいコツと現場の声",
      action: () => showSecrets(question),
    });
  }
  if (options.exclude !== "sources" && question.sources.length) {
    choices.push({
      label: "出典を見る",
      detail: "元になった本や論文",
      action: () => showSources(question),
    });
  }
  choices.push(
    {
      label: "近い悩みをもう一度選ぶ",
      detail: groupLabelForQuestion(question),
      action: () => chooseProblem(groupForQuestion(question)),
    },
    {
      label: "別の悩みを選ぶ",
      detail: "悩みの大分類に戻る",
      action: () => startConversation(),
    },
  );
  addChoiceMessage("相談室", "次はどうしますか？", choices);
}

function addMessage(speaker, text, options = {}) {
  const info = SPEAKERS[speaker] || SPEAKERS["相談室"];
  const row = document.createElement("div");
  row.className = "message-row";
  const kind = options.kind || info.key;
  const displayText = formatMessageForDisplay(text, kind);
  const name = options.showName === false ? "" : `<div class="speaker">${escapeHtml(speaker)}</div>`;
  row.innerHTML = `
    <img class="avatar" src="${info.avatar}" alt="">
    <div class="message-stack">
      ${name}
      <div class="bubble ${kind}">${renderBubbleHtml(displayText)}</div>
    </div>
  `;
  appendChatRow(row);
  scrollToBottom();
  return row;
}

function addChoiceMessage(speaker, text, choices, options = {}) {
  const info = SPEAKERS[speaker] || SPEAKERS["相談室"];
  const row = document.createElement("div");
  row.className = "message-row";
  const bubble = text
    ? `<div class="bubble system">${escapeHtml(text)}</div>`
    : "";
  row.innerHTML = `
    <img class="avatar" src="${info.avatar}" alt="">
    <div class="message-stack">
      ${bubble}
    </div>
  `;
  appendChatRow(row);
  const stack = row.querySelector(".message-stack");
  const grid = document.createElement("div");
  grid.className = `choice-grid${options.compact ? " compact" : ""}`;
  choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `choice-button${options.compact ? " compact" : ""}`;
    button.innerHTML = `<strong>${escapeHtml(choice.label)}</strong>${choice.detail ? `<small>${escapeHtml(choice.detail)}</small>` : ""}`;
    button.addEventListener("click", (event) => {
      if (state.sending) return;
      state.focusNextGrid = event.detail === 0;
      grid.querySelectorAll("button").forEach((item) => item.disabled = true);
      button.classList.add("chosen");
      if (!choice.silent) addUserMessage(choice.label);
      choice.action();
    });
    grid.append(button);
  });
  stack.append(grid);
  if (state.focusNextGrid) {
    state.focusNextGrid = false;
    grid.querySelector("button")?.focus({ preventScroll: true });
  }
  scrollToBottom();
}

function disableStaleChoices() {
  els.chatBody.querySelectorAll(".choice-button:not(:disabled)").forEach((button) => {
    button.disabled = true;
  });
}

async function sendPacedMessages(messages) {
  state.sending = true;
  try {
    for (const item of messages) {
      showTyping(item.speaker);
      await wait(messageDelay(item.text));
      removeTyping();
      addMessage(item.speaker, item.text, item.options || {});
    }
  } finally {
    state.sending = false;
  }
}

function showTyping(speaker) {
  removeTyping();
  const info = SPEAKERS[speaker] || SPEAKERS["相談室"];
  const row = document.createElement("div");
  row.className = "message-row typing-row";
  row.innerHTML = `
    <img class="avatar" src="${info.avatar}" alt="">
    <div class="message-stack">
      <div class="bubble typing"><i></i><i></i><i></i></div>
    </div>
  `;
  els.chatBody.append(row);
  scrollToBottom();
}

function removeTyping() {
  els.chatBody.querySelectorAll(".typing-row").forEach((node) => node.remove());
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function messageDelay(text) {
  const length = String(text || "").length;
  return Math.max(420, Math.min(1100, 320 + length * 7));
}

function addUserMessage(text) {
  const row = document.createElement("div");
  row.className = "message-row user";
  row.innerHTML = `<div class="bubble user">${escapeHtml(text)}</div>`;
  appendChatRow(row);
  scrollToBottom(true);
}

// チャットDOMの無限成長を防ぐ（長いセッションでも描画を軽く保つ）
function appendChatRow(row) {
  els.chatBody.append(row);
  if (els.chatBody.children.length > 600) {
    [...els.chatBody.children].slice(0, 200).forEach((node) => node.remove());
  }
}

function maybeShowScoreAsset(question) {
  if (!question.assetPath) return;
  const rows = [...els.chatBody.children];
  const existing = rows.findIndex((row) => row.dataset && row.dataset.assetId === question.id);
  if (existing >= 0 && rows.length - existing <= 40) return;
  const info = SPEAKERS["相談室"];
  const row = document.createElement("div");
  row.className = "message-row";
  row.dataset.assetId = question.id;
  row.innerHTML = `
    <img class="avatar" src="${info.avatar}" alt="">
    <div class="message-stack">
      <div class="bubble image-bubble">
        <img src="${escapeAttribute(question.assetPath)}" alt="${escapeAttribute(question.score_caption || "関連図版")}">
        <div class="caption">${escapeHtml(question.score_caption || "関連図版")}</div>
      </div>
    </div>
  `;
  els.chatBody.append(row);
  const image = row.querySelector(".image-bubble img");
  if (image && !image.complete) {
    image.addEventListener("load", () => scrollToBottom(), { once: true });
  }
  scrollToBottom();
}

function speakerCountOf(question) {
  return new Set((question.app.discussion || []).map((turn) => turn.speaker)).size || 3;
}

function speakerDetail(speaker) {
  if (speaker === "バイオリニスト") return "現場でどう直すか";
  if (speaker === "研究マニア") return "理由、データ、仕組み";
  if (speaker === "身体専門家") return "体の使い方、具体的な動き";
  return "";
}

function buildDiscussionSegments(question) {
  const segments = [];
  let lastSpeaker = null;
  question.app.discussion.forEach((turn) => {
    (turn.blocks || []).forEach((block) => {
      segments.push({
        speaker: turn.speaker,
        text: block.t,
        plain: block.p || null,
        showName: turn.speaker !== lastSpeaker,
      });
      lastSpeaker = turn.speaker;
    });
  });
  return segments;
}

function segmentClarificationMessages(text) {
  const glossary = glossaryFor(text);
  const core = coreSentence(text);
  const rest = splitForClarification(text).filter((sentence) => sentence !== core);
  const lines = rest.map((sentence) => `・${sentenceLabel(sentence)}: ${simplifySentence(sentence)}`);
  const messages = [
    {
      speaker: "相談室",
      text: `この部分の言いたいことはこれです。\n${core}`,
      options: { kind: "system", showName: false },
    },
  ];
  if (glossary.length) {
    messages.push({
      speaker: "相談室",
      text: `言葉の意味はこうです。\n${glossary.map(([term, plain]) => `${term} = ${plain}`).join("\n")}`,
      options: { kind: "system", showName: false },
    });
  }
  if (lines.length >= 2) {
    messages.push({
      speaker: "相談室",
      text: `残りの部分をほどくと、こうです。\n${lines.join("\n")}`,
      options: { kind: "system", showName: false },
    });
  }
  return messages;
}

function glossaryFor(text) {
  return HARD_WORDS.filter(([term]) => text.includes(term)).slice(0, 6);
}

function coreSentence(text) {
  const sentences = splitForClarification(text);
  return sentences.find((sentence) => /まず|つまり|原因|大事|今日|必要|してください/u.test(sentence)) || sentences[0] || "";
}

function sentenceLabel(sentence) {
  if (/ただし|目安|週間|毎日|無理|できれば|範囲/u.test(sentence)) return "条件";
  if (/理由|原因|ので|から|ため/u.test(sentence)) return "理由";
  if (/してください|やる|練習|置き|戻|見る|組み込|意識/u.test(sentence)) return "やること";
  if (/まず|つまり|要は|大事|必要/u.test(sentence)) return "結論";
  return "説明";
}

function splitForClarification(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .match(/[^。！？!?]+[。！？!?]?/g)
    ?.map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 18) || [];
}

function simplifySentence(sentence) {
  let result = sentence;
  HARD_WORDS.forEach(([term, plain]) => {
    result = result.replaceAll(term, `${term}（${plain}）`);
  });
  return result.trim();
}

function makeAskText(question) {
  const profile = question.app.profile;
  return `これで困っています。\n${question.app.question}${profile ? `\n\n${profile}` : ""}`;
}

function formatMessageForDisplay(text, kind) {
  let result = String(text ?? "");
  if (!STRUCTURED_MESSAGE_KINDS.has(kind)) return result;

  result = result
    .replace(/^(?:先に結論を言います。|先に結論を言うと、|先に結論です。|先に結論を。|先に結論から言うと、|先に結論から。|結論から言うと、|結論から。)/u, "")
    .replaceAll("一つの病気ではなく", "一つの原因ではなく")
    .replaceAll("直し方は一つ", "入口は一つ")
    .replaceAll("勝手に手に入ります", "後からついてきます");

  result = replacePrescriptionTerms(result)
    .replace(/\r\n?/gu, "\n")
    .replace(/\n{3,}/gu, "\n\n")
    // 旧ビルドで溶接された `- **ラベル**：` を行頭へ戻す
    .replace(WELDED_LIST_PATTERN, "$1\n$2")
    .replace(/([。！？!?])-(\*\*)/gu, "$1\n- $2");

  if (result.length < 80) return result;

  let lineBreaks = (result.match(/\n/gu) || []).length;
  return result.replace(STRUCTURE_MARKER_PATTERN, (marker, offset, source) => {
    if (lineBreaks >= 4 || offset === 0 || source[offset - 1] === "\n") return marker;
    if (/^[①②③]$/u.test(marker) && !/[。：:\s]/u.test(source[offset - 1])) return marker;
    if (marker.startsWith("タイプ") && (offset < 20 || source[offset - 1] !== "。")) return marker;
    lineBreaks += 1;
    return `\n${marker}`;
  });
}

// 吹き出し用の軽いMarkdown（**太字** と行頭 `- `）。HTMLはescapeしてからだけ変換する。
function renderBubbleHtml(text) {
  let html = escapeHtml(text);
  html = html.replace(/\*\*([^*\n]+)\*\*/gu, "<strong>$1</strong>");
  html = html.replace(/(^|\n)- /gu, "$1・");
  return html;
}

function replacePrescriptionTerms(text) {
  return text
    .replace(/処方され/gu, "直し方が示され")
    .replace(/処方させ/gu, "直し方を示させ")
    .replace(/処方でき/gu, "直し方を示せ")
    .replace(/処方せず/gu, "直し方を示さず")
    .replace(/処方する/gu, "直し方を示す")
    .replace(/処方す/gu, "直し方を示す")
    .replace(/処方せ/gu, "直し方を示せ")
    .replace(/処方し/gu, "直し方を示し")
    .replace(/処方(?!(?:値|箋))/gu, "直し方");
}


function questionsForGroup(group) {
  return DATA.questions.filter((question) => groupMatchesQuestion(group, question));
}

function groupMatchesQuestion(group, question) {
  return group.chapterHints.includes(question.chapter);
}

function groupForQuestion(question) {
  return PROBLEM_GROUPS.find((group) => group.chapterHints.includes(question.chapter))
    || PROBLEM_GROUPS[0];
}

function groupLabelForQuestion(question) {
  return groupForQuestion(question).label;
}

function shorten(text, limit) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  return value.length > limit ? `${value.slice(0, limit)}...` : value;
}

function scrollToBottom(force = false) {
  const nearBottom = els.chatBody.scrollHeight - els.chatBody.scrollTop - els.chatBody.clientHeight < 180;
  if (!force && !nearBottom) return;
  requestAnimationFrame(() => {
    els.chatBody.scrollTop = els.chatBody.scrollHeight;
  });
}

function tierLabel(tier) {
  if (tier === 1) return "ど定番";
  if (tier === 2) return "よくある";
  if (tier === 3) return "ニッチ";
  return "未分類";
}

function normalize(text) {
  return String(text || "").toLowerCase().normalize("NFKC");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

init();
