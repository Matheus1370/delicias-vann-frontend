FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Em Docker, API é servida pelo nginx proxy — URL relativa
ENV VITE_API_URL=/api/v1
ENV VITE_APP_NAME="Delicias da Vann"
ENV VITE_INSTAGRAM_HANDLE="@deliciasdavann"
ENV VITE_WHATSAPP_NUMBER="5511982813152"
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
