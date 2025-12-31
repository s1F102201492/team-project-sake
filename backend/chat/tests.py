from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Message

class MessageTests(APITestCase):
    def setUp(self):
        self.url = '/chat/messages/'
        
        # Create some initial messages
        Message.objects.create(sender_id='userA', receiver_id='userB', content='Hello form A to B')
        Message.objects.create(sender_id='userB', receiver_id='userA', content='Reply from B to A')
        
        # Message unrelated to A and B interaction
        Message.objects.create(sender_id='userC', receiver_id='userD', content='Hello form C to D')

    def test_create_message(self):
        """
        Ensure we can create a new message object.
        """
        data = {'sender_id': 'userA', 'receiver_id': 'userB', 'content': 'New Message'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Message.objects.count(), 4)
        self.assertEqual(Message.objects.latest('created_at').content, 'New Message')

    def test_get_messages_filtered(self):
        """
        Ensure we can retrieve messages filtered by user pair.
        """
        # Filter for conversation between userA and userB
        response = self.client.get(self.url, {'user1': 'userA', 'user2': 'userB'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2) # Should find 2 messages
        
        # Verify content to ensure correct messages are returned
        contents = [msg['content'] for msg in response.data]
        self.assertIn('Hello form A to B', contents)
        self.assertIn('Reply from B to A', contents)
        self.assertNotIn('Hello form C to D', contents)

    def test_get_messages_no_filter(self):
        """
        Ensure getting messages without filter returns everything (or pagination default).
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Assuming pagination default might return all if small number, or page size.
        # But we just created 3, so should be 3.
        self.assertEqual(len(response.data), 3)

    def test_create_message_invalid_data(self):
        """
        Ensure sending incomplete data fails.
        """
        data = {'sender_id': 'userA', 'content': 'Missing receiver'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
