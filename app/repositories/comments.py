from sqlalchemy import select, desc
from typing import List, Optional
from app.schemas.comments import SCommentAdd, SComment
from exceptions.bookings import RealtyNotAvailableException
from app.models.comments import CommentsModel
from app.repositories.base import BaseRepository
from app.repositories.utils import rooms_ids_free
from app.schemas.bookings import SBookingAdd

class CommentsRepository(BaseRepository):
    model = CommentsModel
    schema = SComment

    async def get_rent_comments(self, rent_id: int):
        return await self.get_filtered(id_rent=rent_id)

    async def get_user_comments(self, user_id: int):
        return await self.get_filtered(id_user=user_id)

    async def add_comment(self, data: SCommentAdd) -> SComment:
        return await super().add(data)

    async def edit_comment(self, comment_id: int, data: SCommentAdd) -> None:
        await super().edit(data, id=comment_id)

    async def delete_comment(self, comment_id: int) -> None:
        await super().delete(id=comment_id)