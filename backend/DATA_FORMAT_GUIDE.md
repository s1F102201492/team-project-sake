# Supabaseデータベース 手動追加ガイド

## テーブル名
Djangoのモデル名は、データベースでは以下のテーブル名になります：
- `Sake` モデル → **`api_sake`** テーブル
- `Brewery` モデル → **`api_brewery`** テーブル

---

## 1. Brewery（酒蔵）テーブル: `api_brewery`

### フィールド一覧

| フィールド名 | データ型 | 必須 | 説明 | 例 |
|------------|---------|------|------|-----|
| `id` | bigint | 自動 | 主キー（自動採番） | - |
| `name` | varchar(200) | **必須** | 酒蔵名 | `新政酒造` |

### 追加手順
1. Supabaseダッシュボード → Table Editor → `api_brewery` を開く
2. "Insert row" をクリック
3. `name` フィールドに酒蔵名を入力
4. Save をクリック

### サンプルデータ
```
name: 新政酒造
name: 十四代
name: 獺祭
name: 久保田
name: 八海山
```

---

## 2. Sake（日本酒）テーブル: `api_sake`

### フィールド一覧

| フィールド名 | データ型 | 必須 | 説明 | 例 |
|------------|---------|------|------|-----|
| `id` | bigint | 自動 | 主キー（自動採番） | - |
| `name` | varchar(100) | **必須** | 日本酒名 | `新政 No.6 X-type` |
| `category` | varchar(50) | **必須** | カテゴリー | `純米大吟醸` |
| `description` | text | **必須** | 説明文 | `フルーティーで華やかな香りが特徴` |
| `region` | varchar(100) | 任意 | 産地・地域 | `秋田県` |
| `brewery_id` | bigint | 任意 | 酒蔵ID（外部キー） | `1`（api_breweryのidを参照） |
| `sweetness_level` | integer | 任意 | 甘さの度合い（1:辛口 〜 5:甘口） | `2` |
| `aroma_level` | integer | 任意 | 香りの強さ（1:控えめ 〜 5:芳醇） | `5` |
| `alcohol_content` | double precision | 任意 | アルコール度数 | `15.0` |
| `price_range` | varchar(50) | 任意 | 価格帯 | `3000-5000円` |
| `created_at` | timestamp with time zone | 自動 | 作成日時（自動） | - |

### 追加手順
1. Supabaseダッシュボード → Table Editor → `api_sake` を開く
2. "Insert row" をクリック
3. 必須フィールドを入力：
   - `name`: 日本酒名
   - `category`: カテゴリー
   - `description`: 説明文
4. 任意フィールドを入力：
   - `region`: 産地
   - `brewery_id`: 酒蔵ID（`api_brewery`テーブルの`id`を参照）
   - `sweetness_level`: 甘さ（1-5）
   - `aroma_level`: 香り（1-5）
   - `alcohol_content`: アルコール度数
   - `price_range`: 価格帯
5. Save をクリック

### サンプルデータ例

#### 例1: 全フィールドを入力
```
name: 新政 No.6 X-type
category: 純米大吟醸
description: フルーティーで華やかな香りが特徴の純米大吟醸酒。芳醇な香りと上品な味わいが楽しめます。
region: 秋田県
brewery_id: 1  （api_breweryテーブルで「新政酒造」のID）
sweetness_level: 2
aroma_level: 5
alcohol_content: 15.0
price_range: 3000-5000円
```

#### 例2: 最小限の必須フィールドのみ
```
name: 久保田 万寿
category: 純米大吟醸
description: 芳醇な香りと上品な味わいが特徴。
```

#### 例3: 地域と嗜好情報を含む
```
name: 獺祭 純米大吟醸50
category: 純米大吟醸
description: すっきりとした飲み口で、フルーティーな香りが楽しめる。
region: 山口県
sweetness_level: 2
aroma_level: 4
alcohol_content: 16.0
price_range: 2000-4000円
```

---

## データ入力時の注意点

### ✅ 必須項目
- `name`, `category`, `description` は必ず入力してください

### ⚠️ 外部キー
- `brewery_id` を入力する場合は、先に `api_brewery` テーブルに該当する酒蔵を作成してください
- または、`brewery_id` は `NULL` のままでも問題ありません

### 📝 数値フィールド
- `sweetness_level`: 1（辛口）〜 5（甘口）
- `aroma_level`: 1（控えめ）〜 5（芳醇）
- `alcohol_content`: 数値（例: 15.0, 16.5）

### 🕐 自動フィールド
- `id`: 自動採番（入力不要）
- `created_at`: 自動設定（入力不要）

---

## 動作確認のための推奨データ数

最低でも **3〜5件** のSakeデータがあると、AIレコメンド機能の動作確認ができます。

テスト用に以下のようなバリエーションを用意すると良いでしょう：
- 異なる地域の日本酒
- 異なる甘さレベル（辛口〜甘口）
- 異なる香りレベル（控えめ〜芳醇）
- 異なる価格帯

