# 日本酒データ作成用フォーマット（ai_recommend専用）

## Supabaseテーブル名
- **日本酒プロフィール**: `ai_recommend_sakeprofile`

（酒蔵テーブルは使用せず、酒蔵名は文字列で保持します）

---

## SakeProfile テーブル: `ai_recommend_sakeprofile`

### フィールド一覧

| フィールド名 | 型 | 必須 | 説明 | 例 |
|------------|----|------|------|-----|
| `id` | bigint | 自動 | 主キー | - |
| `name` | varchar(100) | **必須** | 日本酒名 | `新政 No.6 X-type` |
| `category` | varchar(50) | 任意 | カテゴリー | `純米大吟醸` |
| `description` | text | 任意 | 説明文 | `フルーティーで華やかな香りが特徴` |
| `region` | varchar(100) | 任意 | 産地・地域 | `秋田県` |
| `brewery_name` | varchar(200) | 任意 | 酒蔵名 | `新政酒造` |
| `sweetness_level` | integer | 任意 | 甘さ（1:辛口 〜 5:甘口） | `2` |
| `aroma_level` | integer | 任意 | 香りの強さ（1:控えめ 〜 5:芳醇） | `5` |
| `alcohol_content` | double | 任意 | アルコール度数 | `15.0` |
| `price_range` | varchar(50) | 任意 | 価格帯 | `3000-5000円` |
| `created_at` | timestamp | 自動 | 作成日時 | - |
| `updated_at` | timestamp | 自動 | 更新日時 | - |

### CSV形式（インポート用）

```csv
name,category,description,region,brewery_name,sweetness_level,aroma_level,alcohol_content,price_range
新政 No.6 X-type,純米大吟醸,フルーティーで華やかな香りが特徴の純米大吟醸酒。芳醇な香りと上品な味わいが楽しめます。,秋田県,新政酒造,2,5,15.0,3000-5000円
十四代 本丸,純米吟醸,上品な甘味と奥深い旨味が調和した逸品。,山形県,高木酒造,4,4,16.0,5000-8000円
獺祭 純米大吟醸50,純米大吟醸,すっきりとした飲み口で、フルーティーな香りが楽しめる。,山口県,旭酒造,2,4,16.0,2000-4000円
久保田 万寿,純米大吟醸,芳醇な香りと上品な味わいが特徴。,新潟県,朝日酒造,3,5,15.5,4000-6000円
出羽桜 純米酒,純米酒,米の旨味をしっかり感じられる、飲みやすい純米酒。,山形県,出羽桜酒造,3,2,15.0,1000-2000円
```

### JSON形式（API経由で追加する場合）

```json
[
  {
    "name": "新政 No.6 X-type",
    "category": "純米大吟醸",
    "description": "フルーティーで華やかな香りが特徴の純米大吟醸酒。芳醇な香りと上品な味わいが楽しめます。",
    "region": "秋田県",
    "brewery_name": "新政酒造",
    "sweetness_level": 2,
    "aroma_level": 5,
    "alcohol_content": 15.0,
    "price_range": "3000-5000円"
  },
  {
    "name": "十四代 本丸",
    "category": "純米吟醸",
    "description": "上品な甘味と奥深い旨味が調和した逸品。",
    "region": "山形県",
    "brewery_name": "高木酒造",
    "sweetness_level": 4,
    "aroma_level": 4,
    "alcohol_content": 16.0,
    "price_range": "5000-8000円"
  }
]
```

### SQL形式（SupabaseのSQL Editorで実行）

```sql
INSERT INTO ai_recommend_sakeprofile (
  name,
  category,
  description,
  region,
  brewery_name,
  sweetness_level,
  aroma_level,
  alcohol_content,
  price_range,
  created_at,
  updated_at
) VALUES
  (
    '新政 No.6 X-type',
    '純米大吟醸',
    'フルーティーで華やかな香りが特徴の純米大吟醸酒。芳醇な香りと上品な味わいが楽しめます。',
    '秋田県',
    '新政酒造',
    2,
    5,
    15.0,
    '3000-5000円',
    NOW(),
    NOW()
  ),
  (
    '十四代 本丸',
    '純米吟醸',
    '上品な甘味と奥深い旨味が調和した逸品。',
    '山形県',
    '高木酒造',
    4,
    4,
    16.0,
    '5000-8000円',
    NOW(),
    NOW()
  ),
  (
    '獺祭 純米大吟醸50',
    '純米大吟醸',
    'すっきりとした飲み口で、フルーティーな香りが楽しめる。',
    '山口県',
    '旭酒造',
    2,
    4,
    16.0,
    '2000-4000円',
    NOW(),
    NOW()
  );
```

---

## データ作成時の注意点

### ✅ 必須項目
- `name`: 日本酒名（必須）

### 📝 カテゴリーの例
- `純米大吟醸`
- `純米吟醸`
- `純米酒`
- `大吟醸`
- `吟醸`
- `本醸造` など

### 🎯 数値範囲
- `sweetness_level`: **1（辛口）〜 5（甘口）**
- `aroma_level`: **1（控えめ）〜 5（芳醇）**
- `alcohol_content`: **数値**（例: 15.0, 16.5）

### 🌍 地域情報
- 産地は都道府県名で統一すると検索しやすい（例: `新潟県`, `秋田県`）

### 🏷 酒蔵名
- `brewery_name` は文字列で入力（外部キー不要）
- 不明な場合は空欄でも可

---

## 推奨データ数

AIレコメンド機能の動作確認には最低 **3〜5件** のSakeProfileデータが必要です。以下のようなバリエーションを用意すると良いです。

- 異なる地域の日本酒
- 異なる甘さレベル（辛口〜甘口）
- 異なる香りレベル（控えめ〜芳醇）
- 異なる価格帯
- 異なるカテゴリー


