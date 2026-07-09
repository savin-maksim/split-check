# Split Check

[Service](https://splitcheck-adaa6.web.app/)

Split Check - веб-приложение для разделения совместного чека между участниками. Приложение помогает завести несколько чеков, добавить людей и позиции расходов, указать кто платил и на кого делится каждая позиция, а затем рассчитать итоговые переводы.

Данные хранятся локально в браузере. Для распознавания чека по фото используется Supabase Edge Function, которая проксирует запросы к Google Gemini API.

## Возможности

- создание, переименование, открытие и удаление нескольких чеков;
- добавление участников вручную, включая массовый ввод имен;
- добавление, редактирование, дублирование и удаление позиций расходов;
- два режима оплаты: один плательщик за весь чек или отдельный плательщик у каждой позиции;
- разделение позиции между выбранными участниками;
- поддержка весов/долей при неравном разделении позиции;
- расчет балансов и списка переводов между участниками;
- объединение переводов к одному получателю в статистике;
- персональная статистика по каждому участнику;
- экспорт и отправка выбранных секций статистики как PNG-изображений;
- поиск по позициям расходов;
- распознавание позиций чека по фото через Gemini;
- адаптивный интерфейс с нижней навигацией.

## Стек

- React 19
- TypeScript
- Vite
- React Router
- Zustand с persist-хранилищем
- SCSS
- Framer Motion
- Lucide React
- html-to-image
- react-hot-toast
- Supabase Edge Functions
- Firebase Hosting

## Структура проекта

```txt
src/
  app/        инициализация приложения, роутер, layout, глобальные стили
  pages/      страницы: список чеков, участники, расходы, статистика
  widgets/    крупные UI-блоки страниц
  features/   пользовательские действия и сценарии
  entities/   доменная модель чека и расчетная логика
  shared/     общие UI-компоненты, утилиты, константы и типы

public/       статические файлы, manifest, robots, sitemap, icons
supabase/     Edge Function для распознавания чека
scripts/      вспомогательные release/deploy-скрипты
```

## Маршруты

```txt
/                         список чеков
/check/:checkId/people    участники выбранного чека
/check/:checkId/items     расходы выбранного чека
/check/:checkId/stats     статистика и переводы
```

## Локальный запуск

Установите зависимости:

```bash
npm install
```

Запустите dev-сервер:

```bash
npm run dev
```

Сборка production-версии:

```bash
npm run build
```

Локальный preview production-сборки:

```bash
npm run preview
```

## Переменные окружения

Для работы распознавания чека нужен URL Supabase Edge Function. Создайте `.env` по примеру `.env.example`:

```env
VITE_RECEIPT_SCAN_FUNCTION_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/analyze-receipt
```

Если переменная не задана, приложение продолжит работать, но распознавание чека будет недоступно.

## Распознавание чека

Фронтенд отправляет изображение в Supabase Edge Function `analyze-receipt`. Функция читает секрет `GEMINI_API_KEY` и вызывает Google Gemini API.

Настройте секрет:

```bash
supabase secrets set GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Задеплойте функцию:

```bash
supabase functions deploy analyze-receipt
```

Код функции находится в `supabase/functions/analyze-receipt/index.ts`.

## Данные

Основное состояние хранится в `localStorage` через Zustand persist.

Ключи хранилища:

```txt
split-check-storage
statsCache
transfer-merge-ui
paidByExpanded
```

Это значит, что чеки остаются в браузере пользователя и не синхронизируются между устройствами.

## Скрипты

```bash
npm run dev           запуск Vite dev-сервера
npm run build         typecheck и production-сборка
npm run typecheck     проверка TypeScript без сборки
npm run lint          проверка ESLint
npm run format        форматирование Prettier
npm run format:check  проверка форматирования
npm run preview       preview production-сборки
npm run sc:patch      release/deploy patch-версии
npm run sc:minor      release/deploy minor-версии
npm run sc:major      release/deploy major-версии
```

## Деплой

Проект настроен на Firebase Hosting. Production-сборка попадает в `dist`, а все маршруты SPA переписываются на `index.html`.

Ручной деплой:

```bash
npm run build
firebase deploy --only hosting
```

Автоматизированные release-скрипты `sc:patch`, `sc:minor` и `sc:major` повышают версию, запускают проверки, коммитят изменения, пушат `main`, собирают проект и деплоят hosting.

## SEO и PWA

Статические файлы находятся в `public`:

- `site.webmanifest` - manifest приложения;
- `robots.txt` - правила индексации;
- `sitemap.xml` - sitemap публичных страниц;
- `icons/` - favicon и PWA-иконки.

Динамические страницы вида `/check/:checkId/...` содержат пользовательские данные, поэтому их обычно не стоит добавлять в sitemap.
