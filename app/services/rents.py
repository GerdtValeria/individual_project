from datetime import date
from typing import List, Optional
from app.schemas.rents import SRentAdd, SRentGet
from app.services.base import BaseService
from app.repositories.rents import RentsRepository


class RentService(BaseService):

    async def get_filtered_rents(
        self,
        pagination: dict,
        id_category: Optional[int] = None,
        id_user: Optional[int] = None,
        price_from: Optional[int] = None,
        price_to: Optional[int] = None,
        title: Optional[str] = None,
        active: Optional[bool] = None,
        address: Optional[str] = None,
        city: Optional[str] = None,
        district: Optional[str] = None,
        search_query: Optional[str] = None, 
    ) -> List[SRentGet]:
        """
        Получить отфильтрованные объявления об аренде.
        
        Parameters:
        - pagination: словарь с параметрами пагинации (size, page)
        - search_query: общий поисковый запрос для поисковой строки
        - другие параметры фильтрации...
        
        Returns:
        - List[SRentGet]: список найденных объявлений
        """
        

        page_size = pagination.get('size', 20)
        page = pagination.get('page', 1)
        

        offset = page_size * (page - 1)
        

        rents = await self.repository.get_filtered_rents(
            id_category=id_category,
            id_user=id_user,
            price_from=price_from,
            price_to=price_to,
            title=title,
            active=active,
            address=address,
            city=city,
            district=district,
            search_query=search_query, 
            limit=page_size,
            offset=offset
        )

        return [SRentGet.from_orm(rent) for rent in rents]
    
    async def search_rents(
        self,
        q: str,
        pagination: dict,
        city: Optional[str] = None,
        district: Optional[str] = None,
        price_from: Optional[int] = None,
        price_to: Optional[int] = None,
        id_category: Optional[int] = None,
        beds: Optional[int] = None,  
    ) -> List[SRentGet]:
        """
        Специальный метод для поиска из поисковой строки.
        """
        
        page_size = pagination.get('size', 20)
        page = pagination.get('page', 1)
        offset = page_size * (page - 1)
        
        
        rents = await self.db.rents.get_filtered_rents(
            search_query=q,
            city=city,
            district=district,
            price_from=price_from,
            price_to=price_to,
            id_category=id_category,
            limit=page_size,
            offset=offset
        )
        
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