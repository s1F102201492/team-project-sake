from django.shortcuts import render
from .models import Checkpoint, Stamp
from django.contrib.auth.decorators import login_required

@login_required
def index(request):
    checkpoints = Checkpoint.objects.all()
    stamps = Stamp.objects.filter(user=request.user)
    obtained_ids = [s.checkpoint.id for s in stamps]
    
    context = {
        "checkpoints": checkpoints,
        "obtained_ids": obtained_ids,
    }
    return render(request, 'stamprally/index.html', context)
