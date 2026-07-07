# Scanly — static PWA served by nginx. Build context is this iscanner/ folder.
#   docker build -t scanly ./iscanner
#   docker run -p 8080:80 scanly
FROM nginx:1.27-alpine

# App files (exclude deploy configs via .dockerignore).
COPY . /usr/share/nginx/html/
RUN rm -f /usr/share/nginx/html/Dockerfile \
          /usr/share/nginx/html/.dockerignore \
          /usr/share/nginx/html/docker-compose.yml \
          /usr/share/nginx/html/Caddyfile \
          /usr/share/nginx/html/serve.mjs \
          /usr/share/nginx/html/nginx.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null || exit 1
