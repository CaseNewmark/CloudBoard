# Multi-stage build for CloudBoard Angular Frontend
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies needed for build)
RUN npm ci

# Install Angular CLI globally and fix permissions
RUN npm install -g @angular/cli && chmod +x node_modules/.bin/ng

# Copy source code
COPY . .

# Build the Angular application for production
RUN npx ng build --configuration=production

# Production stage
FROM nginx:alpine AS final

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/dist/cloud-board.angular /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
