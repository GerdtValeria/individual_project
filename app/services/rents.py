from app.schemas.rents import SRentAdd, SRentGet
from app.services.base import BaseService
from app.repositories.rents import RentsRepository


class RentService(BaseService):

    async def get_filtered_free_hotels(
        self,
        pagination,
        date_from: date,
        date_to: date,
        location: str | None,
        title: str | None,
    ):
        hotels = await self.db.hotels.get_filtered_free_hotels(
            date_from=date_from,
            date_to=date_to,
            limit=pagination.per_page,
            offset=(pagination.per_page * (pagination.page - 1)),
            title=title,
            location=location,
        )
        return hotels

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