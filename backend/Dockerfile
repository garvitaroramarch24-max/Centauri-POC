# --- Build Stage ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./

# Switch from npm ci to npm install to bypass lockfile version mismatches
RUN npm install
COPY . .
RUN npm run build

# --- Production Stage ---
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./

# Installs production runtime tools safely
RUN npm install --omit=dev

# Copy compiled files from the build step
COPY --from=build /app/dist ./dist

# CRITICAL FOR CLOUD RUN
EXPOSE 8080

CMD ["node", "dist/main.js"]
