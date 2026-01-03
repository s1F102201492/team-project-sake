import json
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from users.models import Users
from .models import Checkpoint, Stamp
from .serializers import CheckpointSerializer, StampSerializer
from api.auth import require_supabase_auth, safe_get_user


def _extract_request_user_id(request, body_data=None):
    """
    フロントから渡されるユーザーIDを取り出す優先順位:
    1. ヘッダー: X-User-Id
    2. クエリパラメータ: ?userid=
    3. ボディ: {"userid": "..."}（body_data が渡された場合のみ）
    """
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        user_id = request.GET.get("userid")
    if not user_id and body_data:
        user_id = body_data.get("userid")
    print('user_id', user_id)
    return user_id


def _resolve_user(request, body_data=None):
    """
    優先順位:
    - フロントから明示されたユーザーID（X-User-Id / userid）を使用
      - Supabaseトークンの sub と異なる場合は 403 を返却
    - 上記が無ければ、require_supabase_auth がセットした request.user / request.user_supa_id
    """
    explicit_user_id = _extract_request_user_id(request, body_data)
    token_user_id = getattr(request, "user_supa_id", None)
    print('explicit_user_id', explicit_user_id)
    print('token_user_id', token_user_id)

    if explicit_user_id and token_user_id and explicit_user_id != token_user_id:
        return None, None, JsonResponse({"error": "user mismatch"}, status=403)

    if explicit_user_id:
        user_obj = safe_get_user(explicit_user_id)
        if user_obj:
            setattr(user_obj, "is_authenticated", True)
        return user_obj, explicit_user_id, None

    if getattr(request, "user", None) and getattr(request.user, "is_authenticated", False):
        return request.user, getattr(request.user, "id", None), None

    print('token_user_id', token_user_id)
    return None, token_user_id, None


@require_supabase_auth
def index(request):
    user_obj, user_id, err = _resolve_user(request)
    if err:
        return err

    checkpoints = Checkpoint.objects.all()
    if user_obj:
        stamps = Stamp.objects.filter(user=user_obj)
    else:
        stamps = Stamp.objects.filter(user_supa_id=user_id)

    obtained_ids = [s.checkpoint.id for s in stamps]

    context = {
        "checkpoints": checkpoints,
        "obtained_ids": obtained_ids,
    }
    print('context', context)
    return render(request, 'stamprally/index.html', context)


@require_supabase_auth
@require_GET
def checkpoints_list(request):
    user_obj, user_id, err = _resolve_user(request)
    if err:
        return err

    qs = Checkpoint.objects.all()
    data = CheckpointSerializer(qs, many=True).data
    print('checkpoints_list data', data)
    return JsonResponse(data, safe=False)


@require_supabase_auth
@require_GET
def stamps_list(request):
    user_obj, user_id, err = _resolve_user(request)
    if err:
        return err

    if user_obj:
        stamps = Stamp.objects.filter(user=user_obj)
    else:
        stamps = Stamp.objects.filter(user_supa_id=user_id)
    data = StampSerializer(stamps, many=True).data
    print('stamps_list data', data)
    return JsonResponse(data, safe=False)


@csrf_exempt  # Supabase JWT を使うため CSRF を免除
@require_supabase_auth
@require_POST
def stamps_create(request):
    try:
        body = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    user_obj, user_id, err = _resolve_user(request, body)
    if err:
        return err
    if not user_obj and not user_id:
        return JsonResponse({"error": "user not resolved"}, status=401)

    checkpoint_id = body.get("checkpoint")
    if not checkpoint_id:
        return JsonResponse({"error": "checkpoint is required"}, status=400)

    filters = {"checkpoint_id": checkpoint_id}
    if user_obj:
        filters["user"] = user_obj
    else:
        filters["user_supa_id"] = user_id

    if Stamp.objects.filter(**filters).exists():
        return JsonResponse({"error": "already obtained"}, status=409)

    stamp = Stamp.objects.create(**filters)
    data = StampSerializer(stamp).data
    print('stamps_create data', data)
    return JsonResponse(data, status=201)
