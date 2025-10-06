# Node.jsの公式イメージ(バージョン18)をベースにする
FROM node:18

# コンテナ内の作業ディレクトリを指定
WORKDIR /app

# 最初にpackage.jsonをコピーして、依存関係をインストールする
# (ソースコードの変更時に毎回npm installが走るのを防ぐため)
COPY package*.json ./
RUN npm install

# プロジェクトの全てのファイルをコピーする
COPY . .

# Reactの開発サーバーが使用する3000番ポートを開放
EXPOSE 3000

# コンテナ起動時に実行するコマンド
CMD ["npm", "start"]