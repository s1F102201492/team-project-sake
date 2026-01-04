from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Event
from .serializers import EventSerializer


def _get_user_id(request):
    """
    ヘッダー優先でユーザーIDを取得。無ければクエリ/ボディも見る。
    """
    return (
        request.headers.get("X-User-Id")
        or request.query_params.get("user_id")
        or request.data.get("user_id")
    )


@api_view(["GET"])
def events_list(request):
    """
    イベント一覧取得。
    - reserved_user_id を指定すると、そのユーザーが予約済みのイベントのみ返す。
    - すべてのカラムを返す（EventSerializer fields='__all__'）
    """
    reserved_user_id = request.query_params.get("reserved_user_id")

    if reserved_user_id:
        events = Event.objects.filter(reserved_user_ids__contains=[reserved_user_id])
    else:
        events = Event.objects.all()

    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def reserve_event(request, pk):
    """
    イベントを予約済みにする。
    - ヘッダー X-User-Id もしくは body.user_id でユーザーIDを受け取る。
    - 既に含まれている場合は 200 で already_reserved=True を返す。
    """
    user_id = _get_user_id(request)
    if not user_id:
        return Response(
            {"detail": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    event = get_object_or_404(Event, pk=pk)
    current_list = event.reserved_user_ids or []

    if user_id in current_list:
        serializer = EventSerializer(event)
        return Response(
            {"already_reserved": True, "event": serializer.data},
            status=status.HTTP_200_OK,
        )

    event.reserved_user_ids = [*current_list, user_id]
    event.save(update_fields=["reserved_user_ids", "update_at"])

    serializer = EventSerializer(event)
    return Response(
        {"already_reserved": False, "event": serializer.data},
        status=status.HTTP_200_OK,
    )
