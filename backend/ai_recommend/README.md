# AIレコメンド機能 動作確認手順

## 前提条件

1. Supabaseデータベースに接続設定済み（`.env`に`DATABASE_URL`が設定されている）
2. OpenAI API キーが設定済み（`.env`に`OPENAI_API_KEY`が設定されている）
3. マイグレーションが適用済み

## 動作確認手順

### 1. サーバー起動

```bash
cd backend
python3 manage.py runserver
```

または、Docker Composeを使用する場合：
```bash
docker-compose up backend
```

### 2. APIエンドポイントの確認

#### A. レコメンド生成（POST）

```bash
curl -X POST http://localhost:8000/ai_recommend/recommend/ \
  -H "Content-Type: application/json" \
  -d '{
    "club12321": "123e4567-e89b-12d3-a456-426614174000",
    "preferred_sweetness": 3,
    "preferred_aroma": 4,
    "preferred_region": "新潟県",
    "budget_min": 1000,
    "budget_max": 5000,
    "additional_preferences": "フルーティーな香りが好き"
  }'
```

**注意**: 
- `user_supa_id`は実際のSupabaseのユーザーID（UUID）を指定してください
- Supabaseデータベースに`Sake`データが存在することが前提です

#### B. レコメンド一覧取得（GET）

```bash
curl http://localhost:8000/ai_recommend/recommendations/?user_supa_id=123e4567-e89b-12d3-a456-426614174000&limit=10
```

## データについて

### Supabaseデータベース上のデータ

- **既存データの確認**: Supabaseダッシュボードで`api_sake`テーブルを確認
- **新規データの追加**: SupabaseダッシュボードのSQL Editorから、またはDjango Adminから追加

### テストデータが必要な場合

テスト用のサンプルデータをSupabaseに追加する場合は、以下のいずれかの方法を使用：

1. **SupabaseダッシュボードのTable Editorから手動で追加**
2. **SQL EditorでINSERT文を実行**
3. **Django Adminから追加**（`/admin/`にアクセス）

**重要**: テストデータはSupabaseデータベースに直接追加されるため、チーム全体で共有されます。

## トラブルシューティング

### エラー: "OPENAI_API_KEY が環境変数に設定されていません"
→ `.env`ファイルに`OPENAI_API_KEY=your-api-key`を追加してください

### エラー: "No Sake objects found"
→ Supabaseデータベースに`Sake`データが存在することを確認してください

### エラー: データベース接続エラー
→ `.env`ファイルの`DATABASE_URL`が正しく設定されているか確認してください

## 次のステップ

- フロントエンドUI実装（React側）
- エラーハンドリングの改善
- ログ機能の追加

