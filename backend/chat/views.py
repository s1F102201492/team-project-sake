from rest_framework import viewsets
from django.db.models import Q
from .models import Message
from users.models import Users
from .serializers import MessageSerializer

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def get_queryset(self):
        queryset = Message.objects.all()
        user1 = self.request.query_params.get('user1')
        user2 = self.request.query_params.get('user2')

        if user1 and user2:
            # Filter messages between two users (both directions)
            queryset = queryset.filter(
                (Q(sender_id=user1) & Q(receiver_id=user2)) |
                (Q(sender_id=user2) & Q(receiver_id=user1))
            ).order_by('created_at')
        
        return queryset

    def perform_create(self, serializer):
        sender_id = serializer.validated_data.get('sender_id')
        receiver_id = serializer.validated_data.get('receiver_id')

        # SupabaseのUsersテーブルを参照（存在しない場合はNoneのまま）
        sender = Users.objects.filter(id=sender_id).first()
        receiver = Users.objects.filter(id=receiver_id).first()

        # senderをメッセージ所有ユーザーとしても保存しておく
        serializer.save(sender_user=sender, receiver_user=receiver, user=sender)
