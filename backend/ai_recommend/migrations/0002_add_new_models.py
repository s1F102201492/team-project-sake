# Generated manually to add UserPreference and update RecommendedItem

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_add_ai_recommend_fields'),
        ('ai_recommend', '0001_initial'),
    ]

    operations = [
        # UserPreferenceモデルを作成
        migrations.CreateModel(
            name='UserPreference',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_supa_id', models.UUIDField(db_index=True, help_text='SupabaseのUser ID')),
                ('preferred_sweetness', models.IntegerField(blank=True, help_text='好みの甘さ（1:辛口 〜 5:甘口）', null=True)),
                ('preferred_aroma', models.IntegerField(blank=True, help_text='好みの香り（1:控えめ 〜 5:芳醇）', null=True)),
                ('preferred_region', models.CharField(blank=True, help_text='好みの地域', max_length=100)),
                ('budget_min', models.IntegerField(blank=True, help_text='予算の下限（円）', null=True)),
                ('budget_max', models.IntegerField(blank=True, help_text='予算の上限（円）', null=True)),
                ('additional_preferences', models.TextField(blank=True, help_text='その他の希望やコメント')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-updated_at'],
            },
        ),
        # RecommendedItemに新しいフィールドを追加（null=Trueで追加し、後で必須にする）
        migrations.AddField(
            model_name='recommendeditem',
            name='sake',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='recommendations', to='api.sake'),
        ),
        migrations.AddField(
            model_name='recommendeditem',
            name='user_supa_id',
            field=models.UUIDField(blank=True, db_index=True, help_text='このレコメンドを受け取ったユーザー', null=True),
        ),
        migrations.AddField(
            model_name='recommendeditem',
            name='user_preference',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='recommendations', to='ai_recommend.userpreference'),
        ),
        migrations.AddField(
            model_name='recommendeditem',
            name='gpt_reason',
            field=models.TextField(blank=True, help_text='GPTがこのお酒を選んだ理由'),
        ),
        migrations.AlterField(
            model_name='recommendeditem',
            name='description',
            field=models.TextField(blank=True, help_text='GPTが生成したレコメンド理由・説明'),
        ),
        migrations.AlterField(
            model_name='recommendeditem',
            name='title',
            field=models.CharField(help_text='酒の名前（sakeから取得可能だが、GPT生成時にも保持）', max_length=200),
        ),
        migrations.AlterModelOptions(
            name='recommendeditem',
            options={'ordering': ['-score', '-created_at']},
        ),
    ]

