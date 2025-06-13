FROM mcr.microsoft.com/playwright/node18-alpine:latest

WORKDIR /app

# انسخ ملفات المشروع
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

# تثبيت التبعيات
RUN npm ci

# تثبيت المتصفحات
RUN npx playwright install chromium

# بناء المشروع
RUN npm run build -- --webpack=false

CMD ["node", "dist/main.js"]
