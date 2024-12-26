FROM node:18

WORKDIR /app

# Cài đặt các công cụ cần thiết
RUN apt-get update && \
  apt-get install -y \
  default-mysql-client && \
  rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# Chạy trực tiếp npm start
CMD ["npm", "start"]
