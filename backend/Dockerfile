# --- Build Stage ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./

# Installs only production dependencies to save space
RUN npm ci --omit=dev

# Copy compiled code from the build stage
COPY --from=build /app/dist ./dist

# CRITICAL FOR CLOUD RUN: Expose 8080 instead of 3000
EXPOSE 8080

CMD ["node", "dist/main.js"]
