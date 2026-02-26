# Smart-Sciences — Химия внутри нас

> Интерактивное обучение химии тела для школьников. MVP-прототип для инвесторов.

## Быстрый старт

```bash
npm install
npm run dev
# открыть http://localhost:5173
```

## Структура проекта

```
smart-sciences/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx              # Точка входа, рендер <AuthProvider><App/>
    ├── App.jsx               # Роутинг + layout shell (только навигация)
    ├── index.css             # Глобальные стили + @keyframes
    │
    ├── api/
    │   └── api.js            # Все fetch-функции для FastAPI бекенда
    │                         # Измени API_URL для смены окружения
    │
    ├── context/
    │   └── AuthContext.jsx   # user, xp, medals, lang — глобальный стейт
    │                         # login(), register(), logout(), addXP(), addMedal()
    │
    ├── data/
    │   ├── translations.js   # Все строки RU / UZ Latin
    │   └── constants.js      # Молекулы, атомы, органы, медали, навигация
    │                         # Логика уровней: xpToLevel(), xpToNextLevel()
    │
    ├── utils/
    │   └── sound.js          # Web Audio API движок, snd(type)
    │
    ├── components/           # Переиспользуемые UI компоненты
    │   ├── Prof.jsx          # Профессор Атом (анимированный персонаж)
    │   ├── Particles.jsx     # Частицы-взрывы + makeBurst()
    │   ├── Stars.jsx         # Звёздный фон
    │   ├── Sidebar.jsx       # Desktop боковое меню
    │   ├── MobileNav.jsx     # Нижняя навигация (мобильная)
    │   ├── MobileTopbar.jsx  # Верхняя полоса (мобильная)
    │   └── ContactModal.jsx  # Модальное окно контактов
    │
    └── screens/              # Экраны приложения
        ├── LoginScreen.jsx   # Форма входа (Email + Password)
        ├── RegisterScreen.jsx# Регистрация + индикатор силы пароля
        ├── HomeScreen.jsx    # Главный экран, карточки тем, XP-бар
        ├── BodyScreen.jsx    # Интерактивная карта тела
        ├── LabScreen.jsx     # Drag-and-drop лаборатория молекул
        ├── MedalsScreen.jsx  # Достижения / медали
        └── RoadmapScreen.jsx # Карьерная карта (от Новичка до Магистра)
```

## Подключение к FastAPI бекенду

Файл `src/api/api.js` содержит все функции. Измените одну константу:

```js
// src/api/api.js
export const API_URL = 'https://api.smart-sciences.uz'  // production
// export const API_URL = 'http://localhost:8000'        // dev
```

### Ожидаемые эндпоинты (github.com/Anub1s-67336/Website)

| Функция в api.js | Метод | Путь | Описание |
|---|---|---|---|
| `register`     | POST  | `/auth/register`        | `{ username, email, password }` |
| `login`        | POST  | `/auth/login`           | OAuth2 form, возвращает `access_token` |
| `getUserData`  | GET   | `/users/me`             | Требует Bearer token |
| `updateProgress` | PATCH | `/users/me/progress`  | `{ xp_delta, medals }` |
| `getLeaderboard` | GET  | `/leaderboard?limit=N` | Топ пользователей |

JWT токен хранится в `localStorage` под ключом `ss_token`.

## Система уровней

Логика в `src/data/constants.js`:

```
Уровень = floor(XP / 200) + 1
Прогресс внутри уровня = (XP % 200) / 200 * 100%
```

| XP | Уровень | Название |
|---|---|---|
| 0–199   | 1 | Новичок / Yangi boshluvchi |
| 200–499 | 2 | Алхимик / Alkimyogar |
| 500–999 | 3 | Химик / Kimyogar |
| 1000–1999 | 4 | Биохимик / Biokimyogar |
| 2000+   | 5 | Магистр химии / Kimyo Magistri |

## Медали

| ID | Условие |
|---|---|
| `first`  | Любой XP > 0 |
| `lab1`   | Собрана первая молекула |
| `lab2`   | Собрано 3 молекулы |
| `body1`  | Кликнут любой орган |
| `genius` | Собраны 4+ других медали |
