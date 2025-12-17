from sqlalchemy import select, desc
from typing import Optional
from app.schemas.help import SHelpAdd, SHelp
from app.models.help import HelpModel
from app.repositories.base import BaseRepository
from app.repositories.utils import rooms_ids_free

class HelpRepository(BaseRepository):
    model = HelpModel
    schema = SHelp

    async def get_all(self) -> list[SHelp]:
        return await super().get_all()

    async def get_user_help(self, user_id: int):
        return await self.get_filtered(id_user=user_id)

    async def add_help(self, data: SHelpAdd) -> SHelp:
        return await super().add(data)