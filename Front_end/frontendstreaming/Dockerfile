FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Add environment variables
ENV VITE_API_URL=http://backend:3000
ENV VITE_RTMP_URL=rtmp://nginx:1935
ENV VITE_HLS_URL=http://nginx:8080

# Build the application
RUN npm run build

# Install serve to serve the static files
RUN npm install -g serve

EXPOSE 5173

# Serve the built application
CMD ["serve", "-s", "dist", "-l", "5173"]
