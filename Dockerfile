# Dùng image node
FROM node:20

# Tạo thư mục app trong container
WORKDIR /app

# Copy package
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source
COPY . .

# Expose port
EXPOSE 5173

# Chạy app
CMD ["npm", "run", "dev", "--", "--host"]