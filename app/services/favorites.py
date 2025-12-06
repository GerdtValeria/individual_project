from app.repositories.favorites import FavoritesRepository
from app.services.rents import RentService

class FavoritesService(RentService):
    async def get_all_rents(self):
        return await FavoritesRepository.get_all_favorite_rents()
    
    async def add_rent(self):
        return await FavoritesRepository.add_favorite_rent()
    
    async def delete_rent(self):
        return await FavoritesRepository.delete_favorite_rent()
    