from sqlalchemy import select, and_
from typing import List, Optional
from app.models.rents import RentsModel
from app.repositories.base import BaseRepository
from app.schemas.rents import SRentAdd, SRentGet
from sqlalchemy.orm import selectinload

class RentsRepository(BaseRepository):
    model = RentsModel
    schema = SRentGet

    async def get_filtered_rents(
        self,
        id_category: Optional[int] = None,
        id_user: Optional[int] = None,
        price_from: Optional[int] = None,
        price_to: Optional[int] = None,
        title: Optional[str] = None,
        active: Optional[bool] = None,
        address: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[RentsModel]:
        """
        Получение отфильтрованного списка аренд с отношениями
        """
        # Сначала получаем ID отфильтрованных аренд
        rent_ids_to_get = await self._get_filtered_rent_ids(
            id_category=id_category,
            id_user=id_user,
            price_from=price_from,
            price_to=price_to,
            title=title,
            active=active,
            address=address,
        )
        
        if not rent_ids_to_get:
            return []
        
        # Получаем полные данные с отношениями
        query = (
            select(self.model)
            .options(
                selectinload(self.model.category),
                selectinload(self.model.images),
                selectinload(self.model.user),
                selectinload(self.model.comments),
                selectinload(self.model.favorites),
            )
            .filter(RentsModel.id.in_(rent_ids_to_get))
        )
        
        result = await self.session.execute(query)
        return result.scalars().all()

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

