from django.shortcuts import render
from .models import Checkpoint, Stamp
from api.auth import require_supabase_auth

@require_supabase_auth
def index(request):
    checkpoints = Checkpoint.objects.all()
    
    # decoratorがrequest.userをセットしてくれるため、常にUserが存在する前提で書ける
    # ただし、decorator無しでの呼び出し考慮など安全策をとるなら以下
    if request.user.is_authenticated:
        stamps = Stamp.objects.filter(user=request.user)
    else:
        # Fallback for mock/test if needed, or just use supa_id
        stamps = Stamp.objects.filter(user_supa_id=request.user_supa_id)

    obtained_ids = [s.checkpoint.id for s in stamps]

    context = {
        "checkpoints": checkpoints,
        "obtained_ids": obtained_ids,
    }
    return render(request, 'stamprally/index.html', context)
