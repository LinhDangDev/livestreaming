FROM node:18

WORKDIR /usr/src/app

# Install MySQL client
RUN apt-get update && apt-get install -y default-mysql-client

COPY package*.json ./

RUN npm install

COPY . .
RUN chmod +x wait-for-it.sh

EXPOSE 3000

CMD ["./wait-for-it.sh", "mysql_db", "npm", "start"]
