from sqlalchemy import or_, select, and_
from typing import List, Optional
from app.models.rents import RentsModel
from app.repositories.base import BaseRepository
from app.schemas.rents import SRentAdd, SRentGet
from sqlalchemy.orm import selectinload

class RentsRepository(BaseRepository):
    model = RentsModel
    schema = SRentGet

    async def _get_filtered_rent_ids(
        self,
        id_category: Optional[int] = None,
        id_user: Optional[int] = None,
        price: Optional[int] = None,
        guests: Optional[int] = None,
        title: Optional[str] = None,
        active: Optional[bool] = None,
        adress: Optional[str] = None,    
        description: Optional[str] = None,      
        search_query: Optional[str] = None,   
    ) -> List[int]:
        """
        Получение ID отфильтрованных аренд с учетом всех параметров
        """
        query = select(RentsModel.id)
        
        conditions = []

        if id_category is not None:
            conditions.append(RentsModel.id_category == id_category)


        if price is not None:
            conditions.append(RentsModel.price == price)
        
        if guests is not None:
            conditions.append(RentsModel.guests == guests)
    
        if title:
            conditions.append(RentsModel.title.ilike(f"%{title}%"))
        

        if active is not None:
            conditions.append(RentsModel.active == active)
        
        if adress:
            conditions.append(RentsModel.adress.ilike(f"%{adress}%"))
        
        if description:
            conditions.append(RentsModel.description.ilike(f"%{description}%"))
        
    
        if search_query:
            search_lower = f"%{search_query.lower()}%"
            search_conditions = [
                RentsModel.title.ilike(search_lower),
                RentsModel.description.ilike(search_lower),
                RentsModel.city.ilike(search_lower),
                RentsModel.district.ilike(search_lower),
                RentsModel.address.ilike(search_lower)
            ]
            conditions.append(or_(*search_conditions))
        
        if conditions:
            query = query.where(and_(*conditions))
        
        query = query.order_by(RentsModel.created_at.desc())
  
        result = await self.session.execute(query)
        rent_ids = result.scalars().all()
        
        return rent_ids

    async def get_filtered_rents(
        self,
        id_category: Optional[int] = None,
        id_user: Optional[int] = None,
        id_image: Optional[int] = None,
        price: Optional[int] = None,
        guests: Optional[int] = None,
        title: Optional[str] = None,
        active: Optional[bool] = None,
        adress: Optional[str] = None,    
        description: Optional[str] = None,       
        search_query: Optional[str] = None,   
        limit: int = 100,
        offset: int = 0,
    ) -> List[RentsModel]:

        rent_ids_to_get = await self._get_filtered_rent_ids(
            id_category=id_category,
            id_user=id_user,
            id_image=id_image,
            price=price,
            guests=guests,
            title=title,
            active=active,
            adress=adress,
            district=description,
            search_query=search_query,
        )
        
        if not rent_ids_to_get:
            return []
        
        # Применяем пагинацию к списку ID
        paginated_ids = rent_ids_to_get[offset:offset + limit]
        
        if not paginated_ids:
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
            .filter(RentsModel.id.in_(paginated_ids))
            .order_by(RentsModel.created_at.desc())  # Сохраняем сортировку
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

