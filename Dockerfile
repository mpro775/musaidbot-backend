FROM mcr.microsoft.com/playwright:v1.43.1-jammy

WORKDIR /app

# نسخ الملفات
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

# تثبيت التبعيات
RUN npm ci

# تثبيت متصفحات Playwright
RUN npx playwright install chromium

# البناء
RUN npm run build -- --webpack=false

ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
