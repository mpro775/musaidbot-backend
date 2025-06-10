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

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /usr/src/app

# نسخ كل الملفات قبل التثبيت والبناء
COPY . .

RUN npm ci
RUN npx playwright install
RUN npm run build

ENV NODE_ENV=production
ENV CHROMIUM_PATH=/usr/bin/chromium-browser

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
