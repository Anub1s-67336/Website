import { useState, useEffect, useRef, useCallback } from "react";

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const T = {
  RU: {
    appName: "Smart-Sciences",
    appSub: "Химия внутри нас 🧬",
    nav: ["Карта", "Тело", "Лаборатория", "Достижения", "Карьера"],
    xpLabel: "очков",
    levelLabel: "Уровень",
    overallProgress: "Общий прогресс",
    juniorChem: "Юный химик",
    toNextLevel: "до след. уровня",
    topicsTitle: "🔬 Темы для изучения",
    openLab: "🧪 Открыть Лабораторию",
    contact: "📬 Связаться с разработчиками",
    back: "← Назад",
    practiceBtn: "🧪 Практика в Лаборатории",
    labTitle: "🧪 Химическая Лаборатория",
    labSub: "Собери молекулу перетаскивая атомы в зону сборки",
    assemblyZone: "Зона сборки",
    dropHere: "Перетащи атомы сюда",
    resetBtn: "🔄 Сначала",
    comboText: "🔥 COMBO x",
    xpBonus: "+15 XP за каждый",
    winTitle: "Молекула создана!",
    winSub: "Источник энергии для всех клеток твоего тела",
    bodyTitle: "🫀 Карта Тела",
    bodySub: "Нажми на орган, чтобы узнать его химию",
    medalTitle: "🏆 Мои Достижения",
    medalSub: "Выполняй задания — получай медали!",
    roadmapTitle: "🗺 Путь к Магистру Химии",
    roadmapSub: "Образовательная траектория Smart-Sciences",
    medalNames: ["Начинающий алхимик", "Мастер молекул", "Гений Smart-Sciences", "Покоритель лаборатории", "Знаток тела"],
    medalDescs: ["Первый шаг в мир химии", "Собрал 5 молекул", "Решил 20 задач", "Прошёл все опыты", "Изучил все органы"],
    contactTitle: "Связаться с командой",
    contactSub: "Мы открыты для партнёрства и инвестиций",
    closeBtn: "Закрыть",
    topics: [
      { title: "Почему мы двигаемся?", sub: "АТФ — топливо жизни", tag: "Энергетика" },
      { title: "Крепкие кости", sub: "Кальций и его роль", tag: "Биохимия" },
      { title: "Химия эмоций", sub: "Дофамин и серотонин", tag: "Нейрохимия" },
    ],
    profMsgs: {
      home: "Привет! Я Профессор Атом! 🧪 Готов исследовать химию внутри тебя?",
      lab: "Собери все атомы, чтобы создать молекулу глюкозы C₆H₁₂O₆! 🔬",
      win: "🎉 Глюкоза собрана! C₆H₁₂O₆ — источник энергии для каждой клетки!",
      body: "Нажми на любой орган — я расскажу о химических реакциях внутри него! ✨",
      medals: "Каждая медаль — это шаг к знаниям! Собери их все! 🏆",
      roadmap: "Вот твой путь от новичка до Магистра Химии! Это долгое, но увлекательное путешествие! 🌟",
    },
    organs: {
      heart: { name: "Сердце", reaction: "Кардиомиоциты используют АТФ для сокращения. 70 раз в минуту!", sound: "boom" },
      brain: { name: "Мозг", reaction: "Нейроны работают на глюкозе. Мозг потребляет 20% всей энергии тела!", sound: "think" },
      liver: { name: "Печень", reaction: "Гликолиз и синтез белков. Более 500 химических реакций одновременно!", sound: "process" },
      stomach: { name: "Желудок", reaction: "Соляная кислота HCl расщепляет белки. pH = 1.5–3.5!", sound: "digest" },
      lungs: { name: "Лёгкие", reaction: "O₂ + гемоглобин → оксигемоглобин. Газообмен за 0.25 сек!", sound: "breathe" },
      muscle: { name: "Мышцы", reaction: "АТФ → АДФ + энергия. Молочная кислота при усталости!", sound: "flex" },
    },
  },
  UZ: {
    appName: "Smart-Sciences",
    appSub: "Ичимиздаги кимё 🧬",
    nav: ["Xarita", "Tana", "Laboratoriya", "Yutuqlar", "Karyera"],
    xpLabel: "ball",
    levelLabel: "Daraja",
    overallProgress: "Umumiy rivojlanish",
    juniorChem: "Yosh kimyogar",
    toNextLevel: "keyingi darajagacha",
    topicsTitle: "🔬 O'rganish mavzulari",
    openLab: "🧪 Laboratoriyani ochish",
    contact: "📬 Ishlab chiquvchilar bilan bog'laning",
    back: "← Orqaga",
    practiceBtn: "🧪 Laboratoriyada mashq",
    labTitle: "🧪 Kimyo Laboratoriyasi",
    labSub: "Atomlarni tortib-tashlash orqali molekulani yig'ing",
    assemblyZone: "Yig'ish zonasi",
    dropHere: "Atomlarni shu yerga tashlang",
    resetBtn: "🔄 Qayta boshlash",
    comboText: "🔥 COMBO x",
    xpBonus: "+15 XP har biri uchun",
    winTitle: "Molekula yaratildi!",
    winSub: "Tana hujayralari uchun energiya manbai",
    bodyTitle: "🫀 Tana Xaritasi",
    bodySub: "Organ kimyosini bilish uchun bosing",
    medalTitle: "🏆 Mening Yutuqlarim",
    medalSub: "Topshiriqlarni bajaring — medallar oling!",
    roadmapTitle: "🗺 Kimyo Magistriga yo'l",
    roadmapSub: "Smart-Sciences ta'lim trayektoriyasi",
    medalNames: ["Boshlang'ich alkimyogar", "Molekula ustasi", "Smart-Sciences dahosi", "Laboratoriya fotihi", "Tana bilimdonи"],
    medalDescs: ["Kimyo dunyosiga birinchi qadam", "5 ta molekula yig'ildi", "20 ta masala yechildi", "Barcha tajribalar o'tildi", "Barcha organlar o'rganildi"],
    contactTitle: "Jamoa bilan bog'laning",
    contactSub: "Biz hamkorlik va investitsiyalarga ochiqmiz",
    closeBtn: "Yopish",
    topics: [
      { title: "Nima uchun harakatlanamiz?", sub: "ATF — hayot yoqilg'isi", tag: "Energetika" },
      { title: "Mustahkam suyaklar", sub: "Kaltsiy va uning roli", tag: "Biokimyo" },
      { title: "Hissiyotlar kimyosi", sub: "Dopamin va serotonin", tag: "Neyrokimyo" },
    ],
    profMsgs: {
      home: "Salom! Men Professor Atom! 🧪 Ichingizda kimyoni o'rganishga tayyormisiz?",
      lab: "Glyukoza C₆H₁₂O₆ molekulasini yaratish uchun atomlarni yig'ing! 🔬",
      win: "🎉 Glyukoza yaratildi! C₆H₁₂O₆ — har bir hujayra uchun energiya!",
      body: "Istalgan organni bosing — ichidagi kimyoviy reaktsiyalar haqida aytib beraman! ✨",
      medals: "Har bir medal — bilim sari qadam! Hammasini yig'ing! 🏆",
      roadmap: "Bu sizning yangi boshlovchidan Kimyo Magistriga yo'lingiz! 🌟",
    },
    organs: {
      heart: { name: "Yurak", reaction: "Kardiomiosittlar ATF dan qisqarish uchun foydalanadi. Minutiga 70 marta!", sound: "boom" },
      brain: { name: "Miya", reaction: "Neyronlar glyukozada ishlaydi. Miya tana energiyasining 20% ni sarflaydi!", sound: "think" },
      liver: { name: "Jigar", reaction: "Glikoliz va oqsil sintezi. Bir vaqtda 500 dan ortiq kimyoviy reaktsiyalar!", sound: "process" },
      stomach: { name: "Oshqozon", reaction: "HCl kislotasi oqsillarni parchalaydi. pH = 1.5–3.5!", sound: "digest" },
      lungs: { name: "O'pka", reaction: "O₂ + gemoglobin → oksigemolobin. 0.25 soniyada gaz almashinuvi!", sound: "breathe" },
      muscle: { name: "Muskullar", reaction: "ATF → ADF + energiya. Charchaganda sut kislotasi!", sound: "flex" },
    },
  },
};

// ─── SOUND ENGINE ─────────────────────────────────────────────────────────────
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    const patterns = {
      click: [[440, 0, 0.05, "sine", 0.3], [660, 0.05, 0.1, "sine", 0.2]],
      win: [[523, 0, 0.1], [659, 0.1, 0.1], [784, 0.2, 0.1], [1047, 0.3, 0.3]],
      drop: [[200, 0, 0.05, "sine", 0.4], [300, 0.05, 0.05, "sine", 0.2]],
      boom: [[80, 0, 0.3, "sine", 0.6], [120, 0, 0.2, "sine", 0.3]],
      think: [[880, 0, 0.05, "sine", 0.2], [1100, 0.1, 0.1, "sine", 0.15]],
      process: [[440, 0, 0.05], [550, 0.1, 0.05], [660, 0.2, 0.1]],
      digest: [[200, 0, 0.15, "sawtooth", 0.1]],
      breathe: [[300, 0, 0.2, "sine", 0.15], [250, 0.2, 0.2, "sine", 0.1]],
      flex: [[150, 0, 0.1, "square", 0.1], [200, 0.1, 0.1, "square", 0.08]],
      medal: [[523, 0, 0.1], [784, 0.1, 0.1], [1047, 0.2, 0.2], [1319, 0.3, 0.3]],
      level: [[261, 0, 0.1], [329, 0.1, 0.1], [392, 0.2, 0.1], [523, 0.3, 0.4]],
    };

    const notes = patterns[type] || patterns.click;
    notes.forEach(([freq, delay, duration, wave = "sine", vol = 0.3]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(gain);
      osc.frequency.value = freq;
      osc.type = wave;
      g.gain.setValueAtTime(0, ctx.currentTime + delay);
      g.gain.linearRampToValueAtTime(vol * 0.3, ctx.currentTime + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration + 0.05);
    });
    setTimeout(() => ctx.close(), 2000);
  } catch (e) {}
}

// ─── PARTICLES ────────────────────────────────────────────────────────────────
function Particles({ particles }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: p.x, top: p.y,
          width: p.size || 8, height: p.size || 8,
          borderRadius: "50%", background: p.color,
          boxShadow: `0 0 ${(p.size || 8) * 2}px ${p.color}`,
          animation: `particleFloat ${p.life || 1.2}s ease-out forwards`,
          transform: `rotate(${p.angle || 0}deg)`,
        }} />
      ))}
    </div>
  );
}

function spawnBurst(x, y, color, count = 12) {
  return Array.from({ length: count }).map((_, i) => ({
    id: Date.now() + i + Math.random(),
    x: x + (Math.random() - 0.5) * 60,
    y: y + (Math.random() - 0.5) * 60,
    color, size: 4 + Math.random() * 8,
    life: 0.8 + Math.random() * 0.8,
    angle: Math.random() * 360,
  }));
}

// ─── PROFESSOR ATOM ───────────────────────────────────────────────────────────
function ProfessorAtom({ message, happy = false }) {
  const [blink, setBlink] = useState(false);
  const [mood, setMood] = useState("normal");

  useEffect(() => {
    const t = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 120); }, 2800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (happy) { setMood("happy"); setTimeout(() => setMood("normal"), 2000); }
  }, [happy, message]);

  return (
    <div className="flex items-end gap-3">
      <div className="relative flex-shrink-0" style={{ animation: "atomFloat 3s ease-in-out infinite" }}>
        <div className="w-14 h-14 rounded-full relative" style={{
          background: "radial-gradient(circle at 35% 30%, #7c3aed, #4c1d95)",
          boxShadow: mood === "happy" ? "0 0 30px #a78bfa, 0 0 60px #7c3aed88" : "0 0 20px #7c3aed88",
          transition: "box-shadow 0.5s",
        }}>
          {/* Eyes */}
          <div className="absolute flex justify-between px-2" style={{ top: 14, left: 0, right: 0 }}>
            {[0,1].map(i => (
              <div key={i} className="w-3 h-3 rounded-full bg-white flex items-center justify-center">
                <div className="w-1.5 rounded-full bg-indigo-900" style={{
                  height: blink ? 1 : 6, transition: "height 0.08s",
                  transform: mood === "happy" ? "translateY(1px)" : "none"
                }} />
              </div>
            ))}
          </div>
          {/* Mouth */}
          <div className="absolute" style={{
            bottom: 10, left: "50%", transform: "translateX(-50%)",
            width: mood === "happy" ? 20 : 16, height: mood === "happy" ? 10 : 6,
            borderRadius: "0 0 50% 50%", border: "2px solid #c4b5fd", borderTop: "none",
            transition: "all 0.3s",
          }} />
          {/* Hat */}
          <div style={{
            position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)",
            width: 36, height: 18, borderRadius: "6px 6px 0 0",
            background: "linear-gradient(to top, #4c1d95, #7c3aed)",
          }} />
          <div style={{
            position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
            width: 52, height: 4, borderRadius: 2, background: "#7c3aed",
          }} />
          {/* Orbit */}
          <div style={{
            position: "absolute", inset: -12, borderRadius: "50%",
            border: "1px solid #a78bfa44",
            animation: "spinOrbit 3s linear infinite",
          }}>
            <div style={{
              position: "absolute", top: 0, left: "50%", transform: "translate(-50%,-50%)",
              width: 8, height: 8, borderRadius: "50%", background: "#22d3ee",
              boxShadow: "0 0 8px #22d3ee",
            }} />
          </div>
        </div>
      </div>
      {/* Bubble */}
      <div className="relative px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-white flex-1 max-w-xs" style={{
        background: "rgba(109,40,217,0.25)", border: "1px solid rgba(167,139,250,0.35)",
        backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(109,40,217,0.25)",
      }}>
        <p className="leading-relaxed font-semibold text-white/90">{message}</p>
        <div className="absolute -left-2 bottom-3 w-3 h-3 rotate-45" style={{
          background: "rgba(109,40,217,0.25)",
          borderBottom: "1px solid rgba(167,139,250,0.35)",
          borderLeft: "1px solid rgba(167,139,250,0.35)",
        }} />
      </div>
    </div>
  );
}

// ─── TOPIC CARD ───────────────────────────────────────────────────────────────
const TOPIC_META = [
  { icon: "⚡", color: "from-cyan-500 to-blue-600", progress: 65, molecules: "C₁₀H₁₆N₅O₁₃P₃", tagColor: "bg-cyan-400/20 text-cyan-300" },
  { icon: "🦴", color: "from-violet-500 to-purple-700", progress: 40, molecules: "Ca₁₀(PO₄)₆(OH)₂", tagColor: "bg-violet-400/20 text-violet-300" },
  { icon: "💫", color: "from-pink-500 to-rose-600", progress: 20, molecules: "C₈H₁₁NO₂", tagColor: "bg-pink-400/20 text-pink-300" },
];

function TopicCard({ meta, lang, topic, onClick }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={() => { playSound("click"); onClick(); }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 bg-gradient-to-br ${meta.color}`}
      style={{
        transform: h ? "translateY(-4px) scale(1.02)" : "translateY(0)",
        boxShadow: h ? "0 20px 40px rgba(0,0,0,0.45)" : "0 4px 16px rgba(0,0,0,0.25)",
      }}>
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl">{meta.icon}</span>
          <span className={`text-xs px-2 py-1 rounded-full font-bold ${meta.tagColor}`}>{topic.tag}</span>
        </div>
        <h3 className="text-white font-black text-base">{topic.title}</h3>
        <p className="text-white/70 text-xs mt-0.5">{topic.sub}</p>
        <p className="text-white/40 text-xs mt-1 font-mono">{meta.molecules}</p>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-white/70 mb-1">
            <span>{lang === "RU" ? "Прогресс" : "Rivojlanish"}</span>
            <span className="font-black text-white">{meta.progress}%</span>
          </div>
          <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-white/80" style={{ width: `${meta.progress}%`, boxShadow: "0 0 8px rgba(255,255,255,0.6)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROADMAP / MERMAID-LIKE DIAGRAM ──────────────────────────────────────────
function RoadmapScreen({ lang, setProf }) {
  const t = T[lang];
  useEffect(() => setProf(t.profMsgs.roadmap), []);

  const levels = [
    { level: 1, icon: "🌱", name: lang === "RU" ? "Новичок" : "Yangi boshluvchi", color: "#22d3ee", games: ["Собери молекулу", "Угадай элемент"], xp: "0–200 XP" },
    { level: 2, icon: "⚗️", name: lang === "RU" ? "Алхимик" : "Alkimyogar", color: "#a78bfa", games: ["Реакции в теле", "Карта органов"], xp: "200–500 XP" },
    { level: 3, icon: "🔬", name: lang === "RU" ? "Химик" : "Kimyogar", color: "#f472b6", games: ["Синтез белков", "Цикл Кребса"], xp: "500–1000 XP" },
    { level: 4, icon: "🧬", name: lang === "RU" ? "Биохимик" : "Biokimyogar", color: "#4ade80", games: ["ДНК и РНК", "Ферменты"], xp: "1000–2000 XP" },
    { level: 5, icon: "🏆", name: lang === "RU" ? "Магистр химии" : "Kimyo Magistri", color: "#fbbf24", games: ["Финальный экзамен", "Создай лекарство"], xp: "2000+ XP" },
  ];

  return (
    <div className="p-5 pb-8">
      <h2 className="text-xl font-black text-white mb-1">{t.roadmapTitle}</h2>
      <p className="text-white/40 text-sm mb-5">{t.roadmapSub}</p>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5" style={{ background: "linear-gradient(to bottom, #22d3ee, #a78bfa, #f472b6, #4ade80, #fbbf24)" }} />

        <div className="space-y-4">
          {levels.map((lv, i) => (
            <div key={i} className="flex gap-4 items-start">
              {/* Node */}
              <div className="relative z-10 w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 font-black text-xl"
                style={{ background: `${lv.color}22`, border: `2px solid ${lv.color}`, boxShadow: `0 0 20px ${lv.color}44` }}>
                <span>{lv.icon}</span>
                <span className="text-xs font-black" style={{ color: lv.color }}>Lv{lv.level}</span>
              </div>

              {/* Card */}
              <div className="flex-1 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-white">{lv.name}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ color: lv.color, background: `${lv.color}20` }}>{lv.xp}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {lv.games.map((g, j) => (
                    <span key={j} className="text-xs px-2.5 py-1 rounded-full text-white/70"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      🎮 {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── BODY MAP ─────────────────────────────────────────────────────────────────
function BodyScreen({ lang, setProf, onOrganClick, addParticles, addMedal, medals }) {
  const t = T[lang];
  const [selected, setSelected] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => setProf(t.profMsgs.body), [lang]);

  const organs = [
    { id: "brain", emoji: "🧠", x: 48, y: 4, w: 12, h: 10 },
    { id: "heart", emoji: "❤️", x: 44, y: 28, w: 10, h: 10 },
    { id: "lungs", emoji: "🫁", x: 28, y: 26, w: 40, h: 14 },
    { id: "liver", emoji: "🟤", x: 52, y: 44, w: 14, h: 10 },
    { id: "stomach", emoji: "🟡", x: 38, y: 44, w: 12, h: 10 },
    { id: "muscle", emoji: "💪", x: 28, y: 60, w: 44, h: 14 },
  ];

  const handleOrgan = (organ, e) => {
    const r = e.currentTarget.getBoundingClientRect();
    addParticles(r.left + r.width / 2, r.top + r.height / 2, "#f472b6");
    playSound(t.organs[organ.id].sound);
    setSelected(organ.id);
    setSpeaking(true);
    setProf(`${t.organs[organ.id].name}: ${t.organs[organ.id].reaction}`);
    if (!medals.includes("body_1")) addMedal("body_1");
    setTimeout(() => setSpeaking(false), 3000);
  };

  const info = selected ? t.organs[selected] : null;

  return (
    <div className="p-5 pb-8">
      <h2 className="text-xl font-black text-white mb-1">{t.bodyTitle}</h2>
      <p className="text-white/40 text-sm mb-4">{t.bodySub}</p>

      {/* Body silhouette */}
      <div className="relative mx-auto rounded-3xl overflow-hidden mb-4" style={{
        width: "100%", maxWidth: 320, height: 320,
        background: "linear-gradient(135deg, rgba(30,10,60,0.8), rgba(10,20,60,0.8))",
        border: "1px solid rgba(167,139,250,0.2)",
      }}>
        {/* Human outline SVG */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-20">
          <ellipse cx="50" cy="10" rx="8" ry="9" fill="#a78bfa" />
          <rect x="40" y="18" width="20" height="30" rx="4" fill="#7c3aed" />
          <rect x="20" y="18" width="10" height="22" rx="4" fill="#7c3aed" />
          <rect x="70" y="18" width="10" height="22" rx="4" fill="#7c3aed" />
          <rect x="38" y="48" width="10" height="28" rx="4" fill="#7c3aed" />
          <rect x="52" y="48" width="10" height="28" rx="4" fill="#7c3aed" />
          <rect x="30" y="76" width="10" height="18" rx="4" fill="#7c3aed" />
          <rect x="60" y="76" width="10" height="18" rx="4" fill="#7c3aed" />
        </svg>

        {/* Clickable organs */}
        {organs.map(organ => (
          <button key={organ.id} onClick={e => handleOrgan(organ, e)}
            className="absolute flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90"
            style={{
              left: `${organ.x}%`, top: `${organ.y}%`,
              width: `${organ.w}%`, height: `${organ.h}%`,
              background: selected === organ.id ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${selected === organ.id ? "#a78bfa" : "rgba(255,255,255,0.1)"}`,
              boxShadow: selected === organ.id ? "0 0 15px #a78bfa88" : "none",
              fontSize: "clamp(12px, 2.5vw, 18px)",
              animation: selected === organ.id ? "pulse 1s ease-in-out infinite" : "none",
            }}>
            {organ.emoji}
          </button>
        ))}
      </div>

      {/* Info panel */}
      {info && (
        <div className="p-4 rounded-2xl" style={{
          background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)",
          animation: "fadeSlideIn 0.4s ease",
        }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{organs.find(o => o.id === selected)?.emoji}</span>
            <h3 className="text-white font-black">{info.name}</h3>
            {speaking && <div className="flex gap-0.5 ml-auto">
              {[0,1,2].map(i => (
                <div key={i} className="w-1 rounded-full bg-violet-400" style={{
                  height: 12, animation: `soundBar 0.6s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }} />
              ))}
            </div>}
          </div>
          <p className="text-white/80 text-sm leading-relaxed">{info.reaction}</p>
        </div>
      )}
    </div>
  );
}

// ─── DRAG & DROP LAB ──────────────────────────────────────────────────────────
const MOLECULES = {
  glucose: { formula: "C₆H₁₂O₆", name: "Глюкоза", nameUZ: "Glyukoza", atoms: { C: 6, H: 12, O: 6 }, color: "#4fc3f7" },
  water: { formula: "H₂O", name: "Вода", nameUZ: "Suv", atoms: { H: 2, O: 1 }, color: "#22d3ee" },
  co2: { formula: "CO₂", name: "Углекислый газ", nameUZ: "Karbonat angidrid", atoms: { C: 1, O: 2 }, color: "#f472b6" },
};

const ATOM_COLORS = { C: { bg: "#1a1a2e", glow: "#4fc3f7" }, H: { bg: "#0d47a1", glow: "#80d8ff" }, O: { bg: "#880e4f", glow: "#f48fb1" } };

function LabScreen({ lang, setProf, addParticles, xp, setXp, addMedal, medals }) {
  const t = T[lang];
  const [targetKey, setTargetKey] = useState("water");
  const [zone, setZone] = useState([]);
  const [dragAtom, setDragAtom] = useState(null);
  const [won, setWon] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [profHappy, setProfHappy] = useState(false);
  const dropRef = useRef(null);
  const [combo, setCombo] = useState(0);

  const target = MOLECULES[targetKey];
  const needed = target.atoms;

  const zoneCounts = zone.reduce((a, c) => { a[c] = (a[c] || 0) + 1; return a; }, {});

  useEffect(() => { setProf(t.profMsgs.lab); setZone([]); setWon(false); setCombo(0); }, [lang, targetKey]);

  const checkWin = (newZone) => {
    const counts = newZone.reduce((a, c) => { a[c] = (a[c] || 0) + 1; return a; }, {});
    const keys = Object.keys(needed);
    return keys.every(k => counts[k] === needed[k]) && newZone.length === keys.reduce((a, k) => a + needed[k], 0);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (won || !dragAtom) return;
    const r = dropRef.current?.getBoundingClientRect();
    if (r) addParticles(r.left + r.width / 2, r.top + r.height / 2, ATOM_COLORS[dragAtom].glow);
    playSound("drop");

    const newZone = [...zone, dragAtom];
    // Check if over-adding
    const counts = newZone.reduce((a, c) => { a[c] = (a[c] || 0) + 1; return a; }, {});
    const anyOver = Object.keys(counts).some(k => counts[k] > (needed[k] || 0));
    if (anyOver) {
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 500);
      setCombo(0);
      return;
    }

    setZone(newZone);
    const newCombo = combo + 1;
    setCombo(newCombo);
    setXp(x => x + (newCombo >= 3 ? 15 : 5));

    if (checkWin(newZone)) {
      setTimeout(() => {
        setWon(true);
        setProfHappy(true);
        setProf(t.profMsgs.win);
        setXp(x => x + 100);
        playSound("win");
        if (!medals.includes("lab_1")) addMedal("lab_1");
        if (!medals.includes("lab_2") && medals.filter(m => m.startsWith("lab")).length >= 2) addMedal("lab_2");
        setTimeout(() => setProfHappy(false), 2500);
      }, 300);
    }
  };

  const availableAtoms = ["C", "H", "O"].filter(a => needed[a]);

  return (
    <div className="p-5 pb-8">
      <h2 className="text-xl font-black text-white mb-1">{t.labTitle}</h2>
      <p className="text-white/40 text-sm mb-4">{t.labSub}</p>

      <ProfessorAtom message={t.profMsgs.lab} happy={profHappy} />

      {/* Target selector */}
      <div className="flex gap-2 mt-4 mb-4">
        {Object.entries(MOLECULES).map(([k, m]) => (
          <button key={k} onClick={() => { setTargetKey(k); setZone([]); setWon(false); playSound("click"); }}
            className="flex-1 py-2 px-2 rounded-xl text-xs font-black transition-all"
            style={{
              background: targetKey === k ? `${m.color}33` : "rgba(255,255,255,0.05)",
              border: `1px solid ${targetKey === k ? m.color : "rgba(255,255,255,0.1)"}`,
              color: targetKey === k ? m.color : "#ffffff99",
            }}>
            {m.formula}
          </button>
        ))}
      </div>

      {/* Drop zone */}
      <div ref={dropRef}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        className="rounded-2xl min-h-28 flex flex-wrap gap-2 items-center justify-center p-4 mb-4 transition-all duration-300"
        style={{
          background: won ? "rgba(74,222,128,0.1)" : wrongFlash ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
          border: `2px dashed ${won ? "#4ade80" : wrongFlash ? "#ef4444" : "rgba(255,255,255,0.15)"}`,
          boxShadow: won ? "0 0 30px rgba(74,222,128,0.3)" : "none",
        }}>
        {zone.length === 0
          ? <p className="text-white/30 text-sm">{t.dropHere}</p>
          : zone.map((atom, i) => (
            <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm"
              style={{
                background: ATOM_COLORS[atom].bg,
                border: `2px solid ${ATOM_COLORS[atom].glow}`,
                boxShadow: `0 0 12px ${ATOM_COLORS[atom].glow}66`,
              }}>
              {atom}
            </div>
          ))
        }
      </div>

      {/* Progress bars */}
      <div className="space-y-1.5 mb-4">
        {Object.entries(needed).map(([atom, count]) => (
          <div key={atom} className="flex items-center gap-2">
            <span className="w-4 text-xs font-black font-mono" style={{ color: ATOM_COLORS[atom].glow }}>{atom}</span>
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-400" style={{
                width: `${Math.min(100, ((zoneCounts[atom] || 0) / count) * 100)}%`,
                background: ATOM_COLORS[atom].glow, boxShadow: `0 0 6px ${ATOM_COLORS[atom].glow}`,
              }} />
            </div>
            <span className="text-xs font-mono text-white/50 w-8">{zoneCounts[atom] || 0}/{count}</span>
          </div>
        ))}
      </div>

      {/* Win banner */}
      {won && (
        <div className="mb-4 p-4 rounded-2xl text-center" style={{
          background: "rgba(74,222,128,0.1)", border: "1px solid #4ade8088",
          animation: "winPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275)",
        }}>
          <div className="text-4xl mb-1">🎉</div>
          <h3 className="text-white font-black">{t.winTitle}</h3>
          <p className="text-white/60 text-xs mt-1">{t.winSub}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-black text-white"
            style={{ background: "linear-gradient(90deg, #4fc3f7, #a78bfa)" }}>+100 XP 🌟</span>
        </div>
      )}

      {/* Draggable atoms */}
      <div className="grid grid-cols-3 gap-3">
        {availableAtoms.map(atom => {
          const info = ATOM_COLORS[atom];
          const atomNames = { C: "Углеродик", H: "Водородик", O: "Кислородик" };
          const atomNamesUZ = { C: "Uglerodcha", H: "Vodorodcha", O: "Kislorodcha" };
          return (
            <div key={atom}
              draggable onDragStart={() => setDragAtom(atom)}
              onClick={() => {
                setDragAtom(atom);
                // simulate drop on click too
                if (won) return;
                const newZone = [...zone, atom];
                const counts = newZone.reduce((a, c) => { a[c] = (a[c] || 0) + 1; return a; }, {});
                const anyOver = Object.keys(counts).some(k => counts[k] > (needed[k] || 0));
                if (anyOver) { setWrongFlash(true); setTimeout(() => setWrongFlash(false), 500); return; }
                setZone(newZone);
                playSound("click");
                const newCombo = combo + 1;
                setCombo(newCombo);
                setXp(x => x + (newCombo >= 3 ? 15 : 5));
                if (checkWin(newZone)) {
                  setTimeout(() => {
                    setWon(true); setProfHappy(true); setProf(t.profMsgs.win);
                    setXp(x => x + 100); playSound("win");
                    if (!medals.includes("lab_1")) addMedal("lab_1");
                    setTimeout(() => setProfHappy(false), 2500);
                  }, 300);
                }
              }}
              className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing select-none">
              <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-white text-xl transition-all duration-200 active:scale-90"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${info.glow}44, ${info.bg})`,
                  border: `2px solid ${info.glow}88`, boxShadow: `0 0 20px ${info.glow}44`,
                }}>
                {atom}
              </div>
              <span className="text-xs text-white/60 font-semibold">
                {lang === "RU" ? atomNames[atom] : atomNamesUZ[atom]}
              </span>
            </div>
          );
        })}
      </div>

      {combo >= 3 && !won && (
        <div className="mt-3 text-center">
          <span className="px-3 py-1.5 rounded-full text-xs font-black text-white"
            style={{ background: "linear-gradient(90deg, #f59e0b, #ef4444)" }}>
            {t.comboText}{combo}! {t.xpBonus}
          </span>
        </div>
      )}

      <button onClick={() => { setZone([]); setWon(false); setCombo(0); playSound("click"); }}
        className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold text-white/50 hover:text-white transition-colors"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        {t.resetBtn}
      </button>
    </div>
  );
}

// ─── MEDALS ───────────────────────────────────────────────────────────────────
const MEDAL_DEFS = [
  { id: "first", icon: "⚗️", color: "#fbbf24" },
  { id: "lab_1", icon: "🧪", color: "#4fc3f7" },
  { id: "lab_2", icon: "🧬", color: "#a78bfa" },
  { id: "body_1", icon: "🫀", color: "#f472b6" },
  { id: "genius", icon: "🏆", color: "#fbbf24" },
];

function MedalsScreen({ lang, medals, xp, setProf }) {
  const t = T[lang];
  useEffect(() => setProf(t.profMsgs.medals), [lang]);

  return (
    <div className="p-5 pb-8">
      <h2 className="text-xl font-black text-white mb-1">{t.medalTitle}</h2>
      <p className="text-white/40 text-sm mb-5">{t.medalSub}</p>

      <div className="grid grid-cols-1 gap-3">
        {MEDAL_DEFS.map((m, i) => {
          const unlocked = medals.includes(m.id) || (m.id === "first" && xp > 0) || (m.id === "genius" && medals.length >= 4);
          return (
            <div key={m.id} className="flex items-center gap-4 p-4 rounded-2xl transition-all"
              style={{
                background: unlocked ? `${m.color}15` : "rgba(255,255,255,0.03)",
                border: `1px solid ${unlocked ? m.color + "44" : "rgba(255,255,255,0.06)"}`,
                opacity: unlocked ? 1 : 0.5,
                animation: unlocked ? "none" : "none",
              }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  background: unlocked ? `${m.color}22` : "rgba(255,255,255,0.05)",
                  border: `2px solid ${unlocked ? m.color : "rgba(255,255,255,0.1)"}`,
                  boxShadow: unlocked ? `0 0 20px ${m.color}44` : "none",
                  filter: unlocked ? "none" : "grayscale(1)",
                }}>
                {unlocked ? m.icon : "🔒"}
              </div>
              <div>
                <h3 className="text-white font-black text-sm">{t.medalNames[i]}</h3>
                <p className="text-white/50 text-xs mt-0.5">{t.medalDescs[i]}</p>
                {unlocked && <span className="text-xs font-bold mt-1 inline-block" style={{ color: m.color }}>✓ Получена!</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CONTACT MODAL ────────────────────────────────────────────────────────────
function ContactModal({ lang, onClose }) {
  const t = T[lang];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden" style={{
        background: "linear-gradient(135deg, #0d0d2b, #12062a)",
        border: "1px solid rgba(167,139,250,0.3)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(124,58,237,0.2)",
        animation: "winPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275)",
      }}>
        {/* Header */}
        <div className="p-6 text-center" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,195,247,0.2))" }}>
          <div className="text-5xl mb-3">⚗️</div>
          <h2 className="text-xl font-black text-white">{t.contactTitle}</h2>
          <p className="text-white/60 text-sm mt-1">{t.contactSub}</p>
        </div>

        <div className="p-5 space-y-4">
          {/* QR placeholder */}
          <div className="flex justify-center">
            <div className="relative w-36 h-36 rounded-2xl overflow-hidden" style={{ border: "2px solid rgba(167,139,250,0.4)" }}>
              <div className="absolute inset-0 grid grid-cols-7 grid-rows-7 p-2 gap-0.5">
                {Array.from({length: 49}).map((_, i) => (
                  <div key={i} className="rounded-sm" style={{
                    background: [0,1,2,3,4,5,7,11,12,13,14,15,16,21,42,43,44,45,46,47,48,35,36,37,38,39,40,28,29,30,23,25,27].includes(i)
                      ? "rgba(167,139,250,0.9)" : "transparent",
                  }} />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: "linear-gradient(135deg, #4fc3f7, #7c3aed)" }}>⚛</div>
              </div>
            </div>
          </div>

          {/* Contacts */}
          {[
            { icon: "📧", label: "Email", value: "hello@smart-sciences.uz" },
            { icon: "📱", label: "Telegram", value: "@smart_sciences_uz" },
            { icon: "🌐", label: "Website", value: "smart-sciences.uz" },
            { icon: "📍", label: lang === "RU" ? "Адрес" : "Manzil", value: lang === "RU" ? "Ташкент, Узбекистан" : "Toshkent, O'zbekiston" },
          ].map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-lg">{c.icon}</span>
              <div>
                <p className="text-white/40 text-xs">{c.label}</p>
                <p className="text-white font-semibold text-sm">{c.value}</p>
              </div>
            </div>
          ))}

          <button onClick={onClose} className="w-full py-3 rounded-xl font-black text-white transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #0891b2, #7c3aed)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
function HomeScreen({ lang, xp, setXp, setScreen, setProf, addMedal, medals }) {
  const t = T[lang];
  const level = Math.floor(xp / 200) + 1;
  const nextLevelXp = level * 200;
  const totalProgress = 42;
  const [showContact, setShowContact] = useState(false);

  useEffect(() => setProf(t.profMsgs.home), [lang]);

  return (
    <div className="p-5 pb-8 space-y-5">
      {/* XP / Level */}
      <div className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="text-white/60 text-xs">{t.levelLabel} {level} • {t.juniorChem}</span>
            <div className="text-white font-black text-lg">{xp} {t.xpLabel}</div>
          </div>
          <div className="text-right">
            <div className="text-white/40 text-xs">{t.toNextLevel}</div>
            <div className="text-cyan-400 font-black mono">{nextLevelXp - xp} XP</div>
          </div>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${((xp % 200) / 200) * 100}%`,
              background: "linear-gradient(90deg, #4fc3f7, #a78bfa, #f472b6)",
              boxShadow: "0 0 10px #a78bfa88",
            }} />
        </div>
      </div>

      <ProfessorAtom message={t.profMsgs.home} />

      <div>
        <h2 className="text-white font-black text-base mb-3">{t.topicsTitle}</h2>
        <div className="space-y-3">
          {t.topics.map((topic, i) => (
            <TopicCard key={i} meta={TOPIC_META[i]} lang={lang} topic={topic}
              onClick={() => { setScreen("roadmap"); }} />
          ))}
        </div>
      </div>

      <button onClick={() => { setScreen("lab"); playSound("click"); }}
        className="w-full py-4 rounded-2xl font-black text-white text-base transition-all active:scale-95"
        style={{ background: "linear-gradient(135deg, #0891b2, #7c3aed)", boxShadow: "0 8px 30px rgba(124,58,237,0.4)" }}>
        {t.openLab}
      </button>

      <button onClick={() => setShowContact(true)}
        className="w-full py-3 rounded-2xl font-bold text-white/70 text-sm transition-all hover:text-white"
        style={{ border: "1px solid rgba(167,139,250,0.25)", background: "rgba(167,139,250,0.05)" }}>
        {t.contact}
      </button>

      {showContact && <ContactModal lang={lang} onClose={() => setShowContact(false)} />}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("RU");
  const [screen, setScreen] = useState("home");
  const [xp, setXp] = useState(340);
  const [particles, setParticles] = useState([]);
  const [profMsg, setProfMsg] = useState("");
  const [medals, setMedals] = useState(["first"]);

  const t = T[lang];
  const level = Math.floor(xp / 200) + 1;

  const addParticles = useCallback((x, y, color, count = 12) => {
    const newPs = spawnBurst(x, y, color, count);
    setParticles(p => [...p, ...newPs]);
    setTimeout(() => setParticles(p => p.filter(pt => !newPs.find(n => n.id === pt.id))), 2000);
  }, []);

  const addMedal = useCallback((id) => {
    setMedals(m => m.includes(id) ? m : [...m, id]);
    playSound("medal");
  }, []);

  const navItems = [
    { id: "home", icon: "🏠" },
    { id: "body", icon: "🫀" },
    { id: "lab", icon: "🧪" },
    { id: "medals", icon: "🏆" },
    { id: "roadmap", icon: "🗺" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        * { font-family: 'Nunito', sans-serif; box-sizing: border-box; }
        .mono { font-family: 'Space Mono', monospace; }

        @keyframes atomFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes spinOrbit { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes particleFloat { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-80px) scale(0);opacity:0} }
        @keyframes winPop { 0%{transform:scale(0) rotate(-10deg);opacity:0} 70%{transform:scale(1.05) rotate(1deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,0.4)} 50%{box-shadow:0 0 0 8px rgba(167,139,250,0)} }
        @keyframes soundBar { 0%,100%{height:4px} 50%{height:14px} }
        @keyframes shimmer { 0%{background-position:-200%} 100%{background-position:200%} }
        @keyframes glow { 0%,100%{opacity:0.7} 50%{opacity:1} }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #4fc3f744; border-radius: 2px; }
      `}</style>

      {/* Particles layer */}
      <Particles particles={particles} />

      <div className="min-h-screen w-full" style={{
        background: "linear-gradient(135deg, #060713 0%, #0b0b25 50%, #100524 100%)",
        fontFamily: "'Nunito', sans-serif",
      }}>
        {/* Stars */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          {[...Array(40)].map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: Math.random() * 2 + 1, height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              background: `rgba(255,255,255,${Math.random() * 0.4 + 0.1})`,
              animation: `glow ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }} />
          ))}
        </div>

        {/* Layout: sidebar on desktop, bottom nav on mobile */}
        <div className="relative z-10 flex flex-col md:flex-row min-h-screen max-w-6xl mx-auto">

          {/* ── DESKTOP SIDEBAR ── */}
          <aside className="hidden md:flex flex-col w-64 min-h-screen p-5 gap-4 flex-shrink-0"
            style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Logo */}
            <div className="pt-2 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                  style={{ background: "linear-gradient(135deg, #4fc3f7, #7c3aed)" }}>⚛</div>
                <div>
                  <div className="font-black text-white leading-tight">{t.appName}</div>
                  <div className="text-white/40 text-xs">{t.appSub}</div>
                </div>
              </div>

              {/* Language switcher */}
              <div className="flex gap-1.5 mt-3">
                {["RU", "UZ"].map(l => (
                  <button key={l} onClick={() => { setLang(l); playSound("click"); }}
                    className="flex-1 py-1.5 rounded-lg text-xs font-black transition-all"
                    style={{
                      background: lang === l ? "linear-gradient(135deg, #4fc3f7, #7c3aed)" : "rgba(255,255,255,0.05)",
                      color: lang === l ? "#fff" : "rgba(255,255,255,0.4)",
                    }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* XP bar */}
            <div className="p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/60">{t.levelLabel} {level}</span>
                <span className="text-cyan-400 font-black mono">{xp} XP</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${((xp % 200) / 200) * 100}%`,
                    background: "linear-gradient(90deg, #4fc3f7, #a78bfa)",
                  }} />
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1">
              {navItems.map((item, i) => (
                <button key={item.id} onClick={() => { setScreen(item.id); playSound("click"); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all"
                  style={{
                    background: screen === item.id ? "rgba(167,139,250,0.15)" : "transparent",
                    border: `1px solid ${screen === item.id ? "rgba(167,139,250,0.3)" : "transparent"}`,
                    color: screen === item.id ? "#a78bfa" : "rgba(255,255,255,0.5)",
                  }}>
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-bold text-sm">{t.nav[i]}</span>
                  {item.id === "medals" && medals.length > 0 && (
                    <span className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-xs font-black"
                      style={{ background: "#fbbf24", color: "#000" }}>{medals.length}</span>
                  )}
                </button>
              ))}
            </nav>

            {/* Professor in sidebar */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16 }}>
              <ProfessorAtom message={profMsg || t.profMsgs.home} />
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 overflow-y-auto" style={{ minHeight: "100svh", paddingBottom: 80 }}>

            {/* Mobile header */}
            <div className="md:hidden sticky top-0 z-20 px-4 pt-4 pb-3 flex items-center justify-between"
              style={{ background: "rgba(6,7,19,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: "linear-gradient(135deg, #4fc3f7, #7c3aed)" }}>⚛</div>
                <div>
                  <span className="font-black text-sm" style={{
                    background: "linear-gradient(90deg, #4fc3f7, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                  }}>{t.appName}</span>
                  <p className="text-white/30 text-xs leading-none">{t.appSub}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language */}
                <div className="flex gap-1">
                  {["RU","UZ"].map(l => (
                    <button key={l} onClick={() => { setLang(l); playSound("click"); }}
                      className="px-2 py-1 rounded-lg text-xs font-black"
                      style={{
                        background: lang === l ? "linear-gradient(135deg, #4fc3f7, #7c3aed)" : "rgba(255,255,255,0.07)",
                        color: lang === l ? "#fff" : "rgba(255,255,255,0.4)",
                      }}>{l}</button>
                  ))}
                </div>
                <div className="px-2 py-1 rounded-xl text-xs font-black mono text-cyan-400"
                  style={{ background: "rgba(79,195,247,0.1)" }}>{xp}</div>
              </div>
            </div>

            {/* Screen content */}
            {screen === "home" && <HomeScreen lang={lang} xp={xp} setXp={setXp} setScreen={setScreen} setProf={setProfMsg} addMedal={addMedal} medals={medals} />}
            {screen === "body" && <BodyScreen lang={lang} setProf={setProfMsg} onOrganClick={() => {}} addParticles={addParticles} addMedal={addMedal} medals={medals} />}
            {screen === "lab" && <LabScreen lang={lang} setProf={setProfMsg} addParticles={addParticles} xp={xp} setXp={setXp} addMedal={addMedal} medals={medals} />}
            {screen === "medals" && <MedalsScreen lang={lang} medals={medals} xp={xp} setProf={setProfMsg} />}
            {screen === "roadmap" && <RoadmapScreen lang={lang} setProf={setProfMsg} />}
          </main>
        </div>

        {/* ── MOBILE BOTTOM NAV ── */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex"
          style={{ background: "rgba(6,7,19,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {navItems.map((item, i) => (
            <button key={item.id} onClick={() => { setScreen(item.id); playSound("click"); }}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all relative"
              style={{ color: screen === item.id ? "#a78bfa" : "rgba(255,255,255,0.35)" }}>
              <span className="text-xl" style={{ filter: screen === item.id ? "drop-shadow(0 0 6px #a78bfa)" : "none" }}>{item.icon}</span>
              <span className="text-xs font-bold">{t.nav[i]}</span>
              {screen === item.id && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b"
                  style={{ background: "linear-gradient(90deg, #4fc3f7, #a78bfa)" }} />
              )}
              {item.id === "medals" && medals.length > 0 && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-xs font-black"
                  style={{ background: "#fbbf24", color: "#000", fontSize: 9 }}>{medals.length}</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
