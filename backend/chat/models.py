from django.db import models

from django.contrib.auth.models import User

class Message(models.Model):
    sender_id = models.CharField(max_length=255)
    sender_user = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE, null=True, blank=True)
    receiver_id = models.CharField(max_length=255)
    receiver_user = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE, null=True, blank=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.sender_id} -> {self.receiver_id}: {self.content[:20]}'
