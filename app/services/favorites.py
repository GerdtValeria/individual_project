from app.repositories.favorites import FavoritesRepository
from app.schemas.favorites import SFavoriteRentAdd, SFavoriteRentGet
from app.services.rents import RentService

class FavoritesService(RentService):
    async def get_all_favorite_rents(self) -> list[SFavoriteRentGet]:
        favorite_rents = await self.db.favorites.get_all_favorite_rents()
        return favorite_rents
    
    async def add_rent(self, favorite_rent__data: SFavoriteRentAdd) -> SFavoriteRentGet:
        favorite_rent = await self.db.favorites.add_favorite_rent(favorite_rent__data)
        await self.db.commit()
        return favorite_rent
    
    async def delete_rent(self, id: int) -> None:
        await self.db.favorites.delete_favorite_rent(id)
        await self.db.commit()
        return {"message": f"Объявление с id={id} успешно удалено из избранного"} 
    