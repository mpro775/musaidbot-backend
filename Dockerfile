FROM node:18-alpine

# تثبيت التبعيات اللازمة لـ Playwright
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

WORKDIR /app

COPY . .

RUN npm ci
RUN npx playwright install
RUN npm run build

ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
