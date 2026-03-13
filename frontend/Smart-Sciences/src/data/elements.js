/**
 * Periodic table element data — periods 1–4 (elements 1–36)
 * Covers the full scope of 5–8th grade chemistry curriculum.
 *
 * Fields:
 *   z         — atomic number
 *   symbol    — chemical symbol
 *   nameRU    — Russian name
 *   nameUZ    — Uzbek name
 *   group     — column in standard 18-column table (1–18)
 *   period    — row (1–7)
 *   category  — colour group key (see CATEGORY_COLORS below)
 *   mass      — relative atomic mass (rounded)
 *   valence   — typical number of bonds (for MoleculeBuilder validator)
 *   shells    — electrons per shell [shell1, shell2, ...]  (for AtomModel)
 *   color     — accent hex color for atom model glow
 *   realLife  — tags: 'atmosphere' | 'biology' | 'tech' | 'medicine'
 *   lessonId  — backend lesson id (null until lessons are created)
 *   fact      — short interesting fact shown in element card
 */

export const ELEMENTS = [
  // ── Period 1 ──────────────────────────────────────────────────
  {
    z: 1,  symbol: 'H',  nameRU: 'Водород',   nameUZ: 'Vodorod',
    group: 1,  period: 1, category: 'nonmetal',
    mass: 1.008,  valence: 1, shells: [1], color: '#67e8f9',
    realLife: ['atmosphere', 'biology'],  lessonId: null,
    fact: 'Самый лёгкий и самый распространённый элемент во Вселенной — основа звёзд!',
  },
  {
    z: 2,  symbol: 'He', nameRU: 'Гелий',     nameUZ: 'Geliy',
    group: 18, period: 1, category: 'noble',
    mass: 4.003,  valence: 0, shells: [2], color: '#a5f3fc',
    realLife: ['tech'],  lessonId: null,
    fact: 'Инертный газ — не вступает ни в какие реакции. Наполняет воздушные шары!',
  },
  // ── Period 2 ──────────────────────────────────────────────────
  {
    z: 3,  symbol: 'Li', nameRU: 'Литий',     nameUZ: 'Litiy',
    group: 1,  period: 2, category: 'alkali',
    mass: 6.941,  valence: 1, shells: [2,1], color: '#bef264',
    realLife: ['tech'],  lessonId: null,
    fact: 'Металл легче воды! Используется в аккумуляторах телефонов и электромобилей.',
  },
  {
    z: 4,  symbol: 'Be', nameRU: 'Бериллий',  nameUZ: 'Berilliy',
    group: 2,  period: 2, category: 'alkaline',
    mass: 9.012,  valence: 2, shells: [2,2], color: '#d9f99d',
    realLife: ['tech'],  lessonId: null,
    fact: 'Очень лёгкий и прочный металл. Используется в авиации и ядерных реакторах.',
  },
  {
    z: 5,  symbol: 'B',  nameRU: 'Бор',       nameUZ: 'Bor',
    group: 13, period: 2, category: 'metalloid',
    mass: 10.81,  valence: 3, shells: [2,3], color: '#fde68a',
    realLife: ['tech', 'medicine'],  lessonId: null,
    fact: 'Бор встречается в стекловолокне и борной кислоте — антисептике.',
  },
  {
    z: 6,  symbol: 'C',  nameRU: 'Углерод',   nameUZ: 'Uglerod',
    group: 14, period: 2, category: 'nonmetal',
    mass: 12.011, valence: 4, shells: [2,4], color: '#f9a8d4',
    realLife: ['biology', 'tech'],  lessonId: null,
    fact: 'Основа всей жизни на Земле! Алмаз и графит — разные формы чистого углерода.',
  },
  {
    z: 7,  symbol: 'N',  nameRU: 'Азот',      nameUZ: 'Azot',
    group: 15, period: 2, category: 'nonmetal',
    mass: 14.007, valence: 3, shells: [2,5], color: '#c4b5fd',
    realLife: ['atmosphere', 'biology'],  lessonId: null,
    fact: 'Составляет 78% воздуха. Входит в состав аминокислот — строительных блоков белков.',
  },
  {
    z: 8,  symbol: 'O',  nameRU: 'Кислород',  nameUZ: 'Kislorod',
    group: 16, period: 2, category: 'nonmetal',
    mass: 15.999, valence: 2, shells: [2,6], color: '#a78bfa',
    realLife: ['atmosphere', 'biology'],  lessonId: null,
    fact: 'Составляет 21% воздуха. Без него невозможно дышать и гореть!',
  },
  {
    z: 9,  symbol: 'F',  nameRU: 'Фтор',      nameUZ: 'Ftor',
    group: 17, period: 2, category: 'halogen',
    mass: 18.998, valence: 1, shells: [2,7], color: '#fca5a5',
    realLife: ['medicine', 'tech'],  lessonId: null,
    fact: 'Самый активный неметалл. В зубной пасте — защищает зубы от кариеса!',
  },
  {
    z: 10, symbol: 'Ne', nameRU: 'Неон',      nameUZ: 'Neon',
    group: 18, period: 2, category: 'noble',
    mass: 20.180, valence: 0, shells: [2,8], color: '#fb7185',
    realLife: ['tech'],  lessonId: null,
    fact: 'Инертный газ, дающий яркое оранжево-красное свечение в неоновых лампах.',
  },
  // ── Period 3 ──────────────────────────────────────────────────
  {
    z: 11, symbol: 'Na', nameRU: 'Натрий',    nameUZ: 'Natriy',
    group: 1,  period: 3, category: 'alkali',
    mass: 22.990, valence: 1, shells: [2,8,1], color: '#4ade80',
    realLife: ['biology', 'medicine'],  lessonId: null,
    fact: 'Управляет нервными импульсами и водным балансом организма. Поваренная соль — NaCl!',
  },
  {
    z: 12, symbol: 'Mg', nameRU: 'Магний',    nameUZ: 'Magniy',
    group: 2,  period: 3, category: 'alkaline',
    mass: 24.305, valence: 2, shells: [2,8,2], color: '#86efac',
    realLife: ['biology', 'medicine'],  lessonId: null,
    fact: 'Входит в состав хлорофилла — зелёного пигмента растений. Нужен для мышц!',
  },
  {
    z: 13, symbol: 'Al', nameRU: 'Алюминий',  nameUZ: 'Alyuminiy',
    group: 13, period: 3, category: 'metal',
    mass: 26.982, valence: 3, shells: [2,8,3], color: '#94a3b8',
    realLife: ['tech'],  lessonId: null,
    fact: 'Самый распространённый металл в земной коре. Лёгкий и не ржавеет!',
  },
  {
    z: 14, symbol: 'Si', nameRU: 'Кремний',   nameUZ: 'Kremniy',
    group: 14, period: 3, category: 'metalloid',
    mass: 28.086, valence: 4, shells: [2,8,4], color: '#fbbf24',
    realLife: ['tech'],  lessonId: null,
    fact: 'Основа всей электроники! Процессоры и солнечные батареи сделаны из кремния.',
  },
  {
    z: 15, symbol: 'P',  nameRU: 'Фосфор',    nameUZ: 'Fosfor',
    group: 15, period: 3, category: 'nonmetal',
    mass: 30.974, valence: 3, shells: [2,8,5], color: '#f97316',
    realLife: ['biology', 'medicine'],  lessonId: null,
    fact: 'Входит в состав ДНК, РНК и АТФ — главной молекулы энергии клетки!',
  },
  {
    z: 16, symbol: 'S',  nameRU: 'Сера',      nameUZ: 'Oltingugurt',
    group: 16, period: 3, category: 'nonmetal',
    mass: 32.06,  valence: 2, shells: [2,8,6], color: '#eab308',
    realLife: ['biology', 'medicine'],  lessonId: null,
    fact: 'Входит в состав аминокислот — цистеина и метионина. Придаёт запах тухлым яйцам.',
  },
  {
    z: 17, symbol: 'Cl', nameRU: 'Хлор',      nameUZ: 'Xlor',
    group: 17, period: 3, category: 'halogen',
    mass: 35.453, valence: 1, shells: [2,8,7], color: '#a3e635',
    realLife: ['medicine', 'tech'],  lessonId: null,
    fact: 'Дезинфицирует воду в бассейнах. Поваренная соль NaCl — хлорид натрия!',
  },
  {
    z: 18, symbol: 'Ar', nameRU: 'Аргон',     nameUZ: 'Argon',
    group: 18, period: 3, category: 'noble',
    mass: 39.948, valence: 0, shells: [2,8,8], color: '#38bdf8',
    realLife: ['tech'],  lessonId: null,
    fact: 'Составляет 1% атмосферы Земли. Используется в сварке для защиты от окисления.',
  },
  // ── Period 4 ──────────────────────────────────────────────────
  {
    z: 19, symbol: 'K',  nameRU: 'Калий',     nameUZ: 'Kaliy',
    group: 1,  period: 4, category: 'alkali',
    mass: 39.098, valence: 1, shells: [2,8,8,1], color: '#4ade80',
    realLife: ['biology', 'medicine'],  lessonId: null,
    fact: 'Необходим для работы сердца и мышц. Много калия в бананах и картофеле!',
  },
  {
    z: 20, symbol: 'Ca', nameRU: 'Кальций',   nameUZ: 'Kaltsiy',
    group: 2,  period: 4, category: 'alkaline',
    mass: 40.078, valence: 2, shells: [2,8,8,2], color: '#fbbf24',
    realLife: ['biology', 'medicine'],  lessonId: null,
    fact: 'Строительный материал для костей и зубов! Содержится в молоке и твороге.',
  },
  {
    z: 21, symbol: 'Sc', nameRU: 'Скандий',   nameUZ: 'Skandiy',
    group: 3,  period: 4, category: 'transition',
    mass: 44.956, valence: 3, shells: [2,8,9,2], color: '#e2e8f0',
    realLife: ['tech'],  lessonId: null,
    fact: 'Редкоземельный металл. Добавляется в алюминиевые сплавы для прочности.',
  },
  {
    z: 22, symbol: 'Ti', nameRU: 'Титан',     nameUZ: 'Titan',
    group: 4,  period: 4, category: 'transition',
    mass: 47.867, valence: 4, shells: [2,8,10,2], color: '#cbd5e1',
    realLife: ['tech', 'medicine'],  lessonId: null,
    fact: 'Лёгкий и прочный металл. Используется в самолётах и медицинских имплантатах.',
  },
  {
    z: 23, symbol: 'V',  nameRU: 'Ванадий',   nameUZ: 'Vanadiy',
    group: 5,  period: 4, category: 'transition',
    mass: 50.942, valence: 5, shells: [2,8,11,2], color: '#94a3b8',
    realLife: ['tech'],  lessonId: null,
    fact: 'Добавляется в сталь для повышения прочности. Инструменты из ванадиевой стали!',
  },
  {
    z: 24, symbol: 'Cr', nameRU: 'Хром',      nameUZ: 'Xrom',
    group: 6,  period: 4, category: 'transition',
    mass: 51.996, valence: 3, shells: [2,8,13,1], color: '#c0c0c0',
    realLife: ['tech'],  lessonId: null,
    fact: 'Нержавеющая сталь содержит хром. Хромирование защищает металлы от ржавчины.',
  },
  {
    z: 25, symbol: 'Mn', nameRU: 'Марганец',  nameUZ: 'Marganets',
    group: 7,  period: 4, category: 'transition',
    mass: 54.938, valence: 2, shells: [2,8,13,2], color: '#f472b6',
    realLife: ['tech', 'biology'],  lessonId: null,
    fact: 'Нужен для работы ферментов в организме. Марганец обесцвечивает стекло.',
  },
  {
    z: 26, symbol: 'Fe', nameRU: 'Железо',    nameUZ: 'Temir',
    group: 8,  period: 4, category: 'transition',
    mass: 55.845, valence: 3, shells: [2,8,14,2], color: '#f87171',
    realLife: ['biology', 'tech'],  lessonId: null,
    fact: 'Входит в состав гемоглобина и переносит кислород в крови. Самый важный металл!',
  },
  {
    z: 27, symbol: 'Co', nameRU: 'Кобальт',   nameUZ: 'Kobalt',
    group: 9,  period: 4, category: 'transition',
    mass: 58.933, valence: 3, shells: [2,8,15,2], color: '#818cf8',
    realLife: ['tech', 'medicine'],  lessonId: null,
    fact: 'Входит в состав витамина B12. Кобальт даёт синий цвет керамике и стеклу!',
  },
  {
    z: 28, symbol: 'Ni', nameRU: 'Никель',    nameUZ: 'Nikel',
    group: 10, period: 4, category: 'transition',
    mass: 58.693, valence: 2, shells: [2,8,16,2], color: '#d1d5db',
    realLife: ['tech'],  lessonId: null,
    fact: 'Используется в монетах и аккумуляторах. Нержавеющая сталь содержит никель.',
  },
  {
    z: 29, symbol: 'Cu', nameRU: 'Медь',      nameUZ: 'Mis',
    group: 11, period: 4, category: 'transition',
    mass: 63.546, valence: 2, shells: [2,8,18,1], color: '#fb923c',
    realLife: ['tech', 'biology'],  lessonId: null,
    fact: 'Лучший проводник электричества после серебра. Все провода в доме из меди!',
  },
  {
    z: 30, symbol: 'Zn', nameRU: 'Цинк',      nameUZ: 'Rux',
    group: 12, period: 4, category: 'transition',
    mass: 65.38,  valence: 2, shells: [2,8,18,2], color: '#a8a29e',
    realLife: ['biology', 'medicine', 'tech'],  lessonId: null,
    fact: 'Необходим для иммунитета и заживления ран. Оцинкованные ворота не ржавеют.',
  },
  {
    z: 31, symbol: 'Ga', nameRU: 'Галлий',    nameUZ: 'Galliy',
    group: 13, period: 4, category: 'metal',
    mass: 69.723, valence: 3, shells: [2,8,18,3], color: '#e2e8f0',
    realLife: ['tech'],  lessonId: null,
    fact: 'Плавится в руке при 29°C! Используется в светодиодах и солнечных батареях.',
  },
  {
    z: 32, symbol: 'Ge', nameRU: 'Германий',  nameUZ: 'Germaniy',
    group: 14, period: 4, category: 'metalloid',
    mass: 72.630, valence: 4, shells: [2,8,18,4], color: '#fbbf24',
    realLife: ['tech'],  lessonId: null,
    fact: 'Полупроводник — использовался в первых транзисторах. Предсказан Менделеевым!',
  },
  {
    z: 33, symbol: 'As', nameRU: 'Мышьяк',    nameUZ: 'Mishyak',
    group: 15, period: 4, category: 'metalloid',
    mass: 74.922, valence: 3, shells: [2,8,18,5], color: '#84cc16',
    realLife: ['tech'],  lessonId: null,
    fact: 'Известен как яд, но в малых дозах используется в полупроводниках.',
  },
  {
    z: 34, symbol: 'Se', nameRU: 'Селен',     nameUZ: 'Selen',
    group: 16, period: 4, category: 'nonmetal',
    mass: 78.971, valence: 2, shells: [2,8,18,6], color: '#f59e0b',
    realLife: ['biology', 'medicine'],  lessonId: null,
    fact: 'Важный микроэлемент для организма. Участвует в защите клеток от окисления.',
  },
  {
    z: 35, symbol: 'Br', nameRU: 'Бром',      nameUZ: 'Brom',
    group: 17, period: 4, category: 'halogen',
    mass: 79.904, valence: 1, shells: [2,8,18,7], color: '#dc2626',
    realLife: ['tech', 'medicine'],  lessonId: null,
    fact: 'Единственный жидкий неметалл при комнатной температуре! Используется как дезинфектант.',
  },
  {
    z: 36, symbol: 'Kr', nameRU: 'Криптон',   nameUZ: 'Kripton',
    group: 18, period: 4, category: 'noble',
    mass: 83.798, valence: 0, shells: [2,8,18,8], color: '#22d3ee',
    realLife: ['tech'],  lessonId: null,
    fact: 'Инертный газ. Используется в лазерах и специальных осветительных приборах.',
  },
]

// ── Category colour mapping ──────────────────────────────────────
export const CATEGORY_COLORS = {
  nonmetal:   { bg: '#1a3a5c', border: '#3b82f6', label: 'Неметалл',        labelUZ: 'Nometall'      },
  metal:      { bg: '#2a1a3a', border: '#a78bfa', label: 'Металл',          labelUZ: 'Metall'        },
  alkali:     { bg: '#1a3a2a', border: '#4ade80', label: 'Щелочной металл', labelUZ: 'Ishqoriy metall'},
  alkaline:   { bg: '#2a2a1a', border: '#fbbf24', label: 'Щёлочноземельный',labelUZ: 'Ishqoriy-yer'  },
  noble:      { bg: '#1a2a3a', border: '#22d3ee', label: 'Инертный газ',    labelUZ: 'Inert gaz'     },
  halogen:    { bg: '#3a1a1a', border: '#f87171', label: 'Галоген',         labelUZ: 'Galogen'       },
  metalloid:  { bg: '#2a2a1a', border: '#fbbf24', label: 'Металлоид',       labelUZ: 'Metalloid'     },
  transition: { bg: '#1a1a2a', border: '#94a3b8', label: 'Переходный металл',labelUZ: 'O\'tish metall'},
}

// ── Real-life filter tags ────────────────────────────────────────
export const REAL_LIFE_TAGS = [
  { id: 'atmosphere', icon: '🌍', labelRU: 'Атмосфера',  labelUZ: 'Atmosfera'  },
  { id: 'biology',    icon: '🧬', labelRU: 'Организм',   labelUZ: 'Organizm'   },
  { id: 'tech',       icon: '📱', labelRU: 'Технологии', labelUZ: 'Texnologiya'},
  { id: 'medicine',   icon: '💊', labelRU: 'Медицина',   labelUZ: 'Tibbiyot'   },
]
