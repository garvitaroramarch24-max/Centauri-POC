FROM node:26-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:26-alpine
WORKDIR /app
COPY package*.json ./
# Installs only production dependencies to save space
RUN npm ci --omit=dev
# COPY EVERYTHING compiled from the build stage instead of just dist
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
