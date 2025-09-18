# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Remove devDependencies after build to reduce image size
RUN npm prune --production

# Create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs
RUN adduser -S tmdb -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R tmdb:nodejs /app
USER tmdb

# MCP servers communicate via stdin/stdout, no port needed
# EXPOSE directive removed as it's not applicable for MCP servers

# Define the command to run the MCP server
CMD ["npm", "run", "mcp"]