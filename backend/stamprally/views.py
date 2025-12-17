from django.shortcuts import render
from .models import Checkpoint, Stamp
from api.auth import require_supabase_auth

@require_supabase_auth
def index(request):
    checkpoints = Checkpoint.objects.all()
    stamps = Stamp.objects.filter(user_supa_id=request.user_supa_id)
    obtained_ids = [s.checkpoint.id for s in stamps]
    
    # ログインなしの場合は空リスト
    if request.user.is_authenticated:
        stamps = Stamp.objects.filter(user=request.user)
        obtained_ids = [s.checkpoint.id for s in stamps]
    else:
        obtained_ids = []  # ダミー: まだ何も押されていない状態

    context = {
        "checkpoints": checkpoints,
        "obtained_ids": obtained_ids,
    }
    return render(request, 'stamprally/index.html', context)
