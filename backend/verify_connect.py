
import os
import django
import sys
import json
from dotenv import load_dotenv

# プロジェクトのルートディレクトリをパスに追加
sys.path.append('/app/backend')
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 環境設定の読み込み
load_dotenv()
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from ai_recommend.models import SakeProfile, RecommendedItem
from ai_recommend.services import AIRecommendationService

def verify_operation():
    print("=== 外部データベース接続確認 ===")
    
    # 1. データベース接続確認
    try:
        count = SakeProfile.objects.count()
        print(f"✅ データベース接続成功: SakeProfile件数 = {count}")
        
        if count == 0:
            print("⚠️ データが0件です。レコメンド機能の検証にはデータが必要です。")
            return
            
        first_sake = SakeProfile.objects.first()
        print(f"   データ例: {first_sake.name} (ID: {first_sake.id}, 酒蔵ID: {first_sake.brewery_id})")
        
    except Exception as e:
        print(f"❌ データベース接続失敗: {e}")
        return

    # 2. レコメンド生成ロジックの確認
    print("\n=== レコメンド生成ロジック確認 ===")
    
    dummy_preferences = {
        "preferred_sweetness": 3,
        "preferred_aroma": 4,
        "preferred_region": "新潟県",
        "budget_min": 1000,
        "budget_max": 5000,
        "additional_preferences": "フルーティーで飲みやすいお酒"
    }
    
    print(f"入力設定: {json.dumps(dummy_preferences, ensure_ascii=False, indent=2)}")
    
    try:
        service = AIRecommendationService()
        print("   GPTリクエスト送信中...")
        
        recommendations = service.get_recommendations(
            preferences=dummy_preferences,
            max_recommendations=2
        )
        
        if not recommendations:
            print("❌ レコメンド結果が空でした。")
            return
            
        print(f"✅ レコメンド成功: {len(recommendations)}件")
        for i, rec in enumerate(recommendations, 1):
            print(f"   {i}. {rec['sake_name']} (スコア: {rec['score']})")
            print(f"      理由: {rec['reason']}")
            
    except Exception as e:
        print(f"❌ レコメンド生成失敗: {e}")

if __name__ == "__main__":
    verify_operation()
