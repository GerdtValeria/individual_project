from app.schemas.rents import SRentAdd, SRentGet
from app.services.base import BaseService
from app.repositories.rents import RentsRepository


class RentService(BaseService):
    async def get_all_rents(self) -> list[SRentGet]:
        rents = await RentsRepository.get_all()
        await self.db.commit()
        return rents
    
    async def add_rent(self, rent_data: SRentAdd) -> SRentGet:
        rent = await RentsRepository.add_rent(rent_data)
        await self.db.commit()
        return rent
    
    async def edit_rent(self, rent_id: int, rent_data: SRentAdd) -> None:
        rent = await RentsRepository.edit_rent(rent_id, rent_data)
        await self.db.commit()
        return rent

    async def delete_rent(self, id: int) -> None:
        await RentsRepository.delete_rent(id)
        await self.db.commit()
        return {"message": f"Объявление с id={id} успешно удалено"} 