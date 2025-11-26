# Generated manually to add AI recommend fields to Sake model

from django.db import migrations, models
import django.utils.timezone
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='sake',
            name='region',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='sake',
            name='brewery',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sakes', to='api.brewery'),
        ),
        migrations.AddField(
            model_name='sake',
            name='sweetness_level',
            field=models.IntegerField(blank=True, help_text='甘さの度合い（1:辛口 〜 5:甘口）', null=True),
        ),
        migrations.AddField(
            model_name='sake',
            name='aroma_level',
            field=models.IntegerField(blank=True, help_text='香りの強さ（1:控えめ 〜 5:芳醇）', null=True),
        ),
        migrations.AddField(
            model_name='sake',
            name='alcohol_content',
            field=models.FloatField(blank=True, help_text='アルコール度数', null=True),
        ),
        migrations.AddField(
            model_name='sake',
            name='price_range',
            field=models.CharField(blank=True, help_text='価格帯（例: 1000-2000円）', max_length=50),
        ),
        migrations.AddField(
            model_name='sake',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]

