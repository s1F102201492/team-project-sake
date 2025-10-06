FROM python:3.11

# ベストプラクティスとして環境変数を設定
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# コンテナが8000番ポートをリッスンすることをDockerに伝える
EXPOSE 8000

# 開発サーバーを起動するコマンド
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]