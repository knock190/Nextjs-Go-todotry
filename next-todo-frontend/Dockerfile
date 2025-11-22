FROM node:20

WORKDIR /app

# 依存関係を先に入れる
COPY package.json package-lock.json* ./
RUN npm install

# 残りのソースをコピー
COPY . .

# Next dev がコンテナ外からアクセスできるように
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

CMD ["npm", "run", "dev"]
