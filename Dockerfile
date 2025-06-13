FROM node:18-alpine AS builder

# تثبيت التبعيات الأساسية لـ Playwright + Chromium
RUN apk add --no-cache \
    bash \
    curl \
    wget \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    libstdc++ \
    libgcc \
    chromium \
    dumb-init \
    udev \
    mesa-gl \
    && rm -rf /var/cache/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PLAYWRIGHT_BROWSERS_PATH=/usr/lib/chromium

WORKDIR /usr/src/app

# نسخ الملفات
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src/ ./src/

# تثبيت التبعيات
RUN npm ci

# تثبيت المتصفحات بدون `--with-deps`
RUN npx playwright install chromium

# فحص التكوين
RUN echo "🔍 فحص ملفات التكوين:"
RUN cat tsconfig.json || echo "لا يوجد tsconfig.json"
RUN cat tsconfig.build.json || echo "لا يوجد tsconfig.build.json"
RUN cat nest-cli.json || echo "لا يوجد nest-cli.json"
RUN ls -la /root/.cache/ms-playwright/chromium* || echo "لم يتم العثور على Chromium"

# البناء
RUN npm run build -- --webpack=false

# محتويات البناء
RUN echo "✅ محتويات dist:" && ls -l dist
RUN echo "🔎 البحث عن main.js:" && find . -name main.js

ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
