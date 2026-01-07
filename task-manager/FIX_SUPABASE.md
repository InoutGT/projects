# Исправление подключения к Supabase

## Проблема
Не удается подключиться к базе данных Supabase.

## Возможные причины и решения

### 1. База данных приостановлена (бесплатный план)

Бесплатные проекты Supabase могут приостанавливаться после периода неактивности.

**Решение:**
1. Зайдите в дашборд Supabase: https://supabase.com/dashboard
2. Найдите ваш проект `zvcjvtszyksmbofmhkrt`
3. Если проект приостановлен - нажмите "Resume" или "Restore"
4. Дождитесь запуска (1-2 минуты)

### 2. Неправильный формат строки подключения

Для Supabase есть несколько вариантов строк подключения:

#### Вариант A: Direct Connection (для миграций)
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### Вариант B: Connection Pooling (рекомендуется для приложений)
```
postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 3. Получить правильную строку подключения

1. Зайдите в Supabase Dashboard → ваш проект
2. Settings → Database
3. Найдите раздел "Connection string"
4. Выберите "URI" (для direct connection) или "Transaction" (для pooling)
5. Скопируйте строку и замените `[YOUR-PASSWORD]` на реальный пароль

### 4. Обновить .env файл

Откройте `.env` и обновите строки:

```env
# Для приложения (connection pooling - рекомендуется)
DATABASE_URL="postgres://postgres.zvcjvtszyksmbofmhkrt:gHjjk546_778@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Для миграций (direct connection)
DIRECT_URL="postgresql://postgres:gHjjk546_778@db.zvcjvtszyksmbofmhkrt.supabase.co:5432/postgres?sslmode=require"
```

**Важно:** Замените `[REGION]` на ваш регион (например, `us-east-1`, `eu-west-1` и т.д.)

### 5. Проверить пароль

Убедитесь, что пароль в строке подключения правильный:
- Без квадратных скобок `[]`
- Если пароль содержит специальные символы, они должны быть URL-encoded

### 6. Применить миграции

После исправления строки подключения:

```bash
npx prisma migrate deploy
```

Или для разработки:

```bash
npx prisma migrate dev --name init
```

### 7. Проверить подключение

```bash
npx prisma db pull
```

Если команда выполнилась успешно - подключение работает!

## Быстрая проверка

1. Проверьте, что проект Supabase запущен (не приостановлен)
2. Убедитесь, что используете правильный формат строки подключения
3. Проверьте, что пароль правильный (без квадратных скобок)
4. Попробуйте подключиться через `npx prisma db pull`

## Альтернатива: Использовать другой провайдер

Если проблемы с Supabase продолжаются, можно использовать:
- **Neon** (https://neon.tech) - бесплатно, 3 GB
- **Railway** (https://railway.app) - $5 кредитов в месяц
- **Render** (https://render.com) - 90 дней бесплатно
