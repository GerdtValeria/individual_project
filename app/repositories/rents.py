from sqlalchemy import select, and_
from typing import List, Optional
from app.models.rents import RentsModel
from app.repositories.base import BaseRepository
from app.schemas.rents import SRentAdd, SRentGet

class RentsRepository(BaseRepository):
    model = RentsModel
    schema = SRentGet

    async def get_active_rents(self):
        return await self.get_filtered(active=True)

    async def get_user_rents(self, user_id: int):
        return await self.get_filtered(id_user=user_id)

    async def get_category_rents(self, category_id: int):
        return await self.get_filtered(id_category=category_id)

    async def add_rent(self, data: SRentAdd) -> SRentGet:
        return await super().add(data)

    async def edit_rent(self, rent_id: int, data: SRentAdd) -> None:
        await super().edit(data, id=rent_id)

    async def delete_rent(self, rent_id: int) -> None:
        await super().delete(id=rent_id)

