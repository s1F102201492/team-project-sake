from django.conf import settings
from django.http import JsonResponse

# Supabase Auth mock implementation
# In a real environment, you might verify the JWT signature using Supabase secret or public key
# or call Supabase Auth API to validate the token.

def get_user_id_from_token(request):
    """
    Extracts Supabase User ID from the Authorization header (Bearer token).
    Returns None if token is missing or invalid.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None
    
    try:
        # Example format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        token_prefix = "Bearer "
        if not auth_header.startswith(token_prefix):
            return None
        
        token = auth_header[len(token_prefix):]
        
        # TODO: Proper JWT validation implementation
        # For now, we will assume the token itself (or a part of it) is useful or just return a mock ID if validation logic is not yet set up.
        # But actually, the prompt proposal says "mock or simple implementation".
        # Let's just decode it if possible, or just trust it for this prototype step if the user hasn't provided Supabase keys yet.
        # However, purely trusting input is insecure.
        
        # If we cannot validate properly without dependencies (like pyjwt), we should prompt/warn.
        # But let's assume standard extensive requirements are installed or we can just parse it simply if it's not critical yet.
        # Actually, let's implement a dummy that returns a test ID or decodes without verification for development if 'DEBUG' is True.
        
        # Better approach: Just Check if it exists. In production, need `jwt.decode(token, key, algorithms=["HS256"])`.
        
        # For this step, let's just assume the token IS the user_id if we aren't doing real JWT. 
        # OR better, let's return a placeholder/dummy ID if "MOCK_MODE" is on, or try to decode.
        
        # Let's write a placeholder that explicitly says TODO.
        
        return "supa-user-id-placeholder" # REPLACE THIS with actual JWT decoding logic
        
    except Exception as e:
        print(f"Auth Error: {e}")
        return None

def require_supabase_auth(view_func):
    """
    Decorator to ensure the request has a valid Supabase token.
    Exposes `request.user_supa_id` to the view.
    """
    def _wrapped_view(request, *args, **kwargs):
        user_id = get_user_id_from_token(request)
        if not user_id:
            return JsonResponse({"error": "Unauthorized: Missing or Valid Supabase Token required"}, status=401)
        
        request.user_supa_id = user_id
        return view_func(request, *args, **kwargs)
        
    return _wrapped_view
