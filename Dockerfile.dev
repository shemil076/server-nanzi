FROM node:20

WORKDIR /app

# Install only deps first (for caching)
COPY package*.json ./
RUN npm install

# Copy everything else
COPY . .

# Optional: Generate Prisma client if needed
RUN npx prisma generate

# Expose app port
EXPOSE 3000

# Start app using nodemon + ts-node
CMD ["npx", "nodemon", "--watch", "src", "--ext", "ts,json", "--exec", "ts-node", "src/main.ts"]
