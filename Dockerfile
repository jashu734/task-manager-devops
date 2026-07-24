# Step 1: Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install curl for Docker healthchecks
RUN apk add --no-cache curl

# Copy dependency manifests
COPY backend/package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY backend/ ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Environment variables defaults
ENV PORT=3000 \
    NODE_ENV=production

# Start application
CMD ["node", "server.js"]
