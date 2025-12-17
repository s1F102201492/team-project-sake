from django.shortcuts import render
from .models import Checkpoint, Stamp
from api.auth import require_supabase_auth

@require_supabase_auth
def index(request):
    checkpoints = Checkpoint.objects.all()
    stamps = Stamp.objects.filter(user_supa_id=request.user_supa_id)
    obtained_ids = [s.checkpoint.id for s in stamps]
    
    context = {
        "checkpoints": checkpoints,
        "obtained_ids": obtained_ids,
    }
    return render(request, 'stamprally/index.html', context)
