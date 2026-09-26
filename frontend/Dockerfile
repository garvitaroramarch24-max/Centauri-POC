FROM node:26-alpine AS build
WORKDIR /app
ARG VITE_API_URL=https://centauri-poc-358045803121.asia-south1.run.app
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
