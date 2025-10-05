# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build  # produz dist/webapp/browser

# ---- serve estático via nginx ----
FROM nginx:alpine
COPY --from=build /app/dist/webapp/browser /usr/share/nginx/html
# Angular SPA fallback
RUN printf "server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    location / { try_files \$uri /index.html; } \
    }\n" > /etc/nginx/conf.d/default.conf
EXPOSE 80
