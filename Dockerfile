# Use Node.js 18 on Alpine
FROM node:18-alpine

# تثبيت تبعيات Playwright و Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    libgcc \
    libstdc++ \
    dumb-init

# تعطيل تنزيل Chromium المدمج في Puppeteer/Playwright
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# حيث يثبت Playwright المتصفحات
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /usr/src/app

# نسخ الحزم ثم تثبيتها
COPY package*.json ./
RUN npm ci

# تثبيت متصفحات Playwright مع تبعياتها
RUN npx playwright install

# نسخ باقي ملفات المشروع وبناءه
COPY . .
RUN npm run build

# إعداد بيئة الإنتاج ومسار Chromium
ENV NODE_ENV=production
ENV CHROMIUM_PATH=/usr/bin/chromium-browser

# نقطة دخول الحاوية
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
