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

WORKDIR /usr/src/app

COPY . .

RUN npm ci
RUN npx playwright install
RUN npm run build
RUN echo "✅ ملفات في dist:" && ls -l dist

ENV NODE_ENV=production
CMD ["node", "/usr/src/app/dist/main.js"]
