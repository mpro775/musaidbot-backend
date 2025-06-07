# Dockerfile
FROM node:18-alpine

# تثبيت المكتبات اللازمة لـ Playwright (Chromium)
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  nodejs \
  yarn

# تعيين متغيّرات بيئة لـ Playwright
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /usr/src/app

# نسخ package.json و package-lock.json أو yarn.lock
COPY package*.json ./

# تثبيت الاعتمادات
RUN npm ci

# نسخ بقية ملفات المشروع
COPY . .

# بناء المشروع (Nest)
RUN npm run build

# تعيين NODE_ENV لإنتاجيّة
ENV NODE_ENV=production

# تعيين المسار للكروم
ENV CHROMIUM_PATH=/usr/bin/chromium-browser

# تشغيل التطبيق
CMD ["node", "dist/main.js"]
