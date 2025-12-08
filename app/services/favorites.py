from app.repositories.favorites import FavoritesRepository
from app.schemas.favorites import SFavoriteRentAdd, SFavoriteRentGet
from app.services.rents import RentService

class FavoritesService(RentService):
    async def get_all_rents(self) -> list[SFavoriteRentGet]:
        favorite_rents = await FavoritesRepository.get_all_favorite_rents()
        await self.db.commit()
        return favorite_rents
    
    async def add_rent(self, favorite_rent__data: SFavoriteRentAdd) -> SFavoriteRentGet:
        favorite_rent = await FavoritesRepository.add_favorite_rent(favorite_rent__data)
        await self.db.commit()
        return favorite_rent
    
    async def delete_rent(self, id: int) -> None:
        await FavoritesRepository.delete_favorite_rent(id)
        await self.db.commit()
        return {"message": f"Объявление с id={id} успешно удалено из избранного"} 
    