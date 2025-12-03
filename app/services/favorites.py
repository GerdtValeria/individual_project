from app.repositories.rents import RentsRepository
from app.services.rents import RentService

class FavoritesService(RentService):
    async def get_all_rents(self):
        return await RentsRepository.get_all_favorite_rents()
    
    async def add_rent(self):
        return await RentsRepository.add_favorite_rent()
    
    async def delete_rent(self):
        return await RentsRepository.delete_favorite_rent()
    