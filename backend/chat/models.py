from django.db import models

class Message(models.Model):
    sender_id = models.CharField(max_length=255)
    receiver_id = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.sender_id} -> {self.receiver_id}: {self.content[:20]}'
