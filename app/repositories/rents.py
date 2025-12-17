from sqlalchemy import or_, select, and_
from typing import Optional
from app.models.rents import RentsModel
from app.repositories.base import BaseRepository
from app.schemas.rents import SRentAdd, SRentGet
from app.database.database import engine
from sqlalchemy.orm import selectinload

class RentsRepository(BaseRepository):
    model = RentsModel
    schema = SRentGet

    async def get_filtered_rents(
        self,
        search_query: Optional[str] = None,
        title: Optional[str] = None,
        address: Optional[str] = None,  # Исправлено adress на address
        price: Optional[int] = None,
        description: Optional[str] = None,
        id_category: Optional[int] = None,
        id_user: Optional[int] = None,
        active: Optional[bool] = None,  # Добавлено
        limit: int = 100,
        offset: int = 0,
    ) -> list[RentsModel]:
        """
        Получение отфильтрованного списка аренд с отношениями
        """
        print(active)
        query = select(self.model).options(
            selectinload(self.model.category),
            selectinload(self.model.images),
            selectinload(self.model.user),
        )
        
        # Собираем условия
        conditions = []
        
        # Общий поисковый запрос
        if search_query:
            search_lower = f"%{search_query.lower()}%"
            search_conditions = [
                RentsModel.title.ilike(search_lower),
                RentsModel.description.ilike(search_lower),
                RentsModel.address.ilike(search_lower),
            ]
            conditions.append(or_(*search_conditions))
        
        # Отдельные фильтры
        if title:
            conditions.append(RentsModel.title.ilike(f"%{title}%"))
        
        if address:
            conditions.append(RentsModel.address.ilike(f"%{address}%"))
        
        if price is not None:
            conditions.append(RentsModel.price == price)
        
        if description:
            conditions.append(RentsModel.description.ilike(f"%{description}%"))
        
        if id_category is not None:
            conditions.append(RentsModel.id_category == id_category)
        
        if id_user is not None:
            conditions.append(RentsModel.id_user == id_user)
        
        if active is not None:
            conditions.append(RentsModel.active == active)
        
        # Применяем условия
        if conditions:
            query = query.where(and_(*conditions))
        
        # Сортировка и пагинация
        query = query.order_by(RentsModel.created_at.desc())
        query = query.limit(limit).offset(offset)
        
        result = await self.session.execute(query)
        return result.scalars().all()
    
    async def get_by_id_with_relations(self, id: int) -> Optional[RentsModel]:
        query = select(self.model).options(
            selectinload(self.model.category),
            selectinload(self.model.images),
            selectinload(self.model.user),
            selectinload(self.model.comments),
            selectinload(self.model.favorites),
        ).where(RentsModel.id == id)
        
        result = await self.session.execute(query)
        print(query.compile(bind=engine, compile_kwargs={"literal_binds": True}))
        return result.scalar_one_or_none()
    
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

