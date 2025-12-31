from django.conf import settings
from django.http import JsonResponse

# Supabase Auth mock implementation
# In a real environment, you might verify the JWT signature using Supabase secret or public key
# or call Supabase Auth API to validate the token.

import base64
import json
from django.contrib.auth.models import User

def get_user_id_from_token(request):
    """
    Extracts Supabase User ID from the Authorization header (Bearer token).
    Returns None if token is missing or invalid.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        # 開発用: 特定のヘッダーなどでスキップ可能にするか？一旦なし
        return None
    
    try:
        # Example format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        token_prefix = "Bearer "
        if not auth_header.startswith(token_prefix):
            return None
        
        token = auth_header[len(token_prefix):]
        
        # 簡易的なJWTデコード（署名検証なし）
        # parts: [header, payload, signature]
        parts = token.split(".")
        if len(parts) != 3:
            # JWT形式でない場合は、そのまま返す（モックIDとして扱う）かNone
            # ここでは開発時の利便性のため、明らかにJWTでなければそのままIDとする
            return token if len(token) < 100 else None

        payload_b64 = parts[1]
        # Base64パディング補完
        padding = '=' * (4 - len(payload_b64) % 4)
        payload_b64 += padding
        
        payload_bytes = base64.urlsafe_b64decode(payload_b64)
        payload_data = json.loads(payload_bytes)
        
        # Supabase (GoTrue) は 'sub' にユーザーIDを入れる
        user_id = payload_data.get("sub")
        return user_id

    except Exception as e:
        print(f"Auth Error: {e}")
        return None

def require_supabase_auth(view_func):
    """
    Decorator to ensure the request has a valid Supabase token.
    Exposes `request.user_supa_id` AND `request.user` (Django User) to the view.
    """
    def _wrapped_view(request, *args, **kwargs):
        user_id = get_user_id_from_token(request)
        if not user_id:
            return JsonResponse({"error": "Unauthorized: Missing or Valid Supabase Token required"}, status=401)
        
        request.user_supa_id = user_id
        
        # User Sync Logic
        # Supabase IDに基づいてDjangoユーザーを取得・作成し、request.userにセットする
        try:
            user, created = User.objects.get_or_create(username=user_id)
            request.user = user
        except Exception as e:
            # DBエラー等が発生しても、最低限 user_supa_id は使えるようにする？
            # いや、Userリンクが要件なのでエラーにする方が安全
            print(f"User Sync Error: {e}")
            return JsonResponse({"error": "User synchronization failed"}, status=500)

        return view_func(request, *args, **kwargs)
        
    return _wrapped_view
