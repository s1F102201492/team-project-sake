"""
Supabaseデータベースの状態を確認するスクリプト
"""
import os
import sys
import django

# Djangoの設定を読み込む
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from api.models import Sake, Brewery
from ai_recommend.models import UserPreference, RecommendedItem


def check_database():
    """データベースの状態を確認"""
    print("=" * 60)
    print("データベース確認")
    print("=" * 60)
    
    # Sakeデータの確認
    print("\n【Sake（日本酒）データ】")
    sake_count = Sake.objects.count()
    print(f"  登録数: {sake_count}件")
    
    if sake_count > 0:
        print("\n  登録されている日本酒:")
        for sake in Sake.objects.all()[:10]:  # 最大10件表示
            print(f"    - {sake.name} ({sake.category})")
            print(f"      地域: {sake.region or '未設定'}, "
                  f"甘さ: {sake.sweetness_level or '未設定'}, "
                  f"香り: {sake.aroma_level or '未設定'}")
        if sake_count > 10:
            print(f"    ... 他 {sake_count - 10}件")
    else:
        print("  ⚠️ データがありません")
    
    # Breweryデータの確認
    print("\n【Brewery（酒蔵）データ】")
    brewery_count = Brewery.objects.count()
    print(f"  登録数: {brewery_count}件")
    
    if brewery_count > 0:
        print("\n  登録されている酒蔵:")
        for brewery in Brewery.objects.all()[:5]:
            print(f"    - {brewery.name}")
    
    # UserPreferenceデータの確認
    print("\n【UserPreference（ユーザー嗜好）データ】")
    preference_count = UserPreference.objects.count()
    print(f"  登録数: {preference_count}件")
    
    # RecommendedItemデータの確認
    print("\n【RecommendedItem（レコメンド結果）データ】")
    recommendation_count = RecommendedItem.objects.count()
    print(f"  登録数: {recommendation_count}件")
    
    print("\n" + "=" * 60)
    
    # データベース接続の確認
    from django.db import connection
    print("\n【データベース接続情報】")
    db_settings = connection.settings_dict
    print(f"  データベース: {db_settings.get('NAME', 'N/A')}")
    print(f"  ホスト: {db_settings.get('HOST', 'N/A')}")
    print(f"  ポート: {db_settings.get('PORT', 'N/A')}")
    print(f"  ユーザー: {db_settings.get('USER', 'N/A')}")
    
    print("\n" + "=" * 60)


if __name__ == "__main__":
    try:
        check_database()
    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        print("\nデータベース接続を確認してください。")
        sys.exit(1)

