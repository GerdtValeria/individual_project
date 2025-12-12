from datetime import date
from typing import List, Optional
from app.schemas.rents import SRentAdd, SRentGet
from app.services.base import BaseService
from app.repositories.rents import RentsRepository


class RentService(BaseService):

    async def get_filtered_rents(
        self,
        pagination: dict,
        search_query: Optional[str] = None,
        title: Optional[str] = None,
        address: Optional[str] = None,  # Исправлено adress на address
        price: Optional[int] = None,
        description: Optional[str] = None,
        id_category: Optional[int] = None,
        id_user: Optional[int] = None,
        active: Optional[bool] = None,
    ) -> List[SRentGet]:
        """
        Получить отфильтрованные объявления об аренде.
        """
        # Извлекаем параметры пагинации
        page_size = pagination.get('size', 20)
        page = pagination.get('page', 1)
        
        # Вычисляем смещение
        offset = page_size * (page - 1)
        
        # Получаем данные из репозитория
        rents = await self.db.rents.get_filtered_rents(
            search_query=search_query,
            title=title,
            address=address,
            price=price,
            description=description,
            id_category=id_category,
            id_user=id_user,
            active=active,
            limit=page_size,
            offset=offset
        )
        
        # Конвертируем модели в схемы
        return [SRentGet.from_orm(rent) for rent in rents]
    

    async def get_all_rents(self) -> list[SRentGet]:
        rents = await self.db.rents.get_all()
        return rents
    
    async def get_category_rents(self) -> list[SRentGet]:
        rents = await self.db.rents.get_category_rents()
        return rents
    
    async def add_rent(self, rent_data: SRentAdd) -> SRentGet:
        rent = await self.db.rents.add_rent(rent_data)
        await self.db.commit()
        return rent
    
    async def edit_rent(self, rent_id: int, rent_data: SRentAdd) -> None:
        rent = await self.db.rents.edit_rent(rent_id, rent_data)
        await self.db.commit()
        return rent

    async def delete_rent(self, id: int) -> None:
        await self.db.rents.delete_rent(id)
        await self.db.commit()
        return {"message": f"Объявление с id={id} успешно удалено"} 