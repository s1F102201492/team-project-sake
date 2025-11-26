# user_supa_idを必須フィールドにする

from django.db import migrations, models


def delete_null_user_recommendations(apps, schema_editor):
    """user_supa_idがnullのRecommendedItemを削除"""
    RecommendedItem = apps.get_model('ai_recommend', 'RecommendedItem')
    RecommendedItem.objects.filter(user_supa_id__isnull=True).delete()


def reverse_delete(apps, schema_editor):
    """ロールバック時は何もしない"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('ai_recommend', '0002_add_new_models'),
    ]

    operations = [
        migrations.RunPython(delete_null_user_recommendations, reverse_delete),
        migrations.AlterField(
            model_name='recommendeditem',
            name='user_supa_id',
            field=models.UUIDField(db_index=True, help_text='このレコメンドを受け取ったユーザー'),
        ),
    ]

