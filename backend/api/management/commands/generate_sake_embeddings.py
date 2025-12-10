import json
import time
from django.core.management.base import BaseCommand
from openai import OpenAI
from django.conf import settings
from api.models import Sake


class Command(BaseCommand):
    help = "Generate and save embedding vectors for all Sake records."

    def handle(self, *args, **options):
        api_key = settings.OPENAI_API_KEY
        base_url = settings.OPENAI_API_BASE_URL
        client = OpenAI(api_key=api_key, base_url=base_url)

        # embedding 生成対象（まだないものだけ）
        sakes = Sake.objects.filter(embedding__isnull=True)

        total = sakes.count()
        if total == 0:
            self.stdout.write(
                self.style.SUCCESS("すべてのSakeにEmbeddingが既に存在します。")
            )
            return

        self.stdout.write(f"Embedding 生成対象: {total} 件")

        for i, sake in enumerate(sakes, start=1):
            text = f"{sake.name}\n地域: {sake.region}\n説明: {sake.description}"

            time.sleep(1.5)
            try:
                response = client.embeddings.create(
                    model="text-embedding-3-small",
                    input=text,
                )

                vector = response.data[0].embedding

                # ベクトルを保存
                sake.emmbedding = vector
                sake.save()

                self.stdout.write(
                    self.style.SUCCESS(
                        f"[{i}/{total}] {sake.name} のEmbeddingを保存しました"
                    )
                )

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"[{i}/{total}] {sake.name} でエラー発生: {e}")
                )

        self.stdout.write(self.style.SUCCESS("Embedding生成が完了しました！"))
