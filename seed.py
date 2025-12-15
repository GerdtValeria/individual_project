import asyncio
import random
from datetime import datetime, timedelta
from sqlalchemy import text

from app.database.database import async_session_maker
from app.models.roles import RoleModel
from app.models.users import UserModel
from app.models.categories import CategoriesModel
from app.models.rents import RentsModel
from app.models.images import ImagesModel
from app.models.comments import CommentsModel
from app.models.bookings import BookingsModel
from app.models.help import HelpModel
from app.models.favorites import FavoritesModel


class DataSeeder:
    def __init__(self):
        self.first_names = ['Александр', 'Мария', 'Дмитрий', 'Анна', 'Иван', 'Елена', 'Сергей', 'Ольга', 'Андрей', 'Наталья']
        self.last_names = ['Иванов', 'Петрова', 'Сидоров', 'Смирнова', 'Кузнецов', 'Попова', 'Васильев', 'Новикова', 'Фёдоров', 'Морозова']
        self.cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск', 'Нижний Новгород', 'Сочи', 'Краснодар', 'Воронеж', 'Самара']
        
    async def initialize(self):
        """Основная функция инициализации данных"""
        print('Starting data seeding...')
        
        try:
            async with async_session_maker() as session:
                # Очищаем таблицы (в обратном порядке из-за foreign keys)
                await self.clear_tables(session)
                
                # Создаем данные в правильном порядке зависимостей
                await self.create_roles(session)
                await self.create_categories(session)
                await self.create_users(session)
                await self.create_rents(session)
                await self.create_images(session)
                await self.create_comments(session)
                await self.create_bookings(session)
                await self.create_help_requests(session)
                await self.create_favorites(session)
                
                await session.commit()
                print('Data seeding completed successfully!')
                
        except Exception as error:
            print(f'Failed to seed data: {error}')
            await session.rollback()
            raise
    
    async def clear_tables(self, session):
        """Очистка всех таблиц"""
        # Удаляем данные в обратном порядке зависимостей
        tables = [
            'favorites', 'help', 'bookings', 'comments', 
            'images', 'rents', 'users', 'categories', 'roles'
        ]
        
        for table in tables:
            await session.execute(text(f"DELETE FROM {table}"))
            # Проверяем существование таблицы sqlite_sequence перед очисткой
            try:
                await session.execute(text(f"DELETE FROM sqlite_sequence WHERE name='{table}'"))
            except:
                # Игнорируем ошибку, если таблица sqlite_sequence не существует
                pass
        print("Tables cleared")
    
    async def create_roles(self, session):
        """Создание ролей"""
        print('Creating roles...')
        
        # Проверяем, существуют ли роли
        existing_roles = await session.execute(text("SELECT COUNT(*) FROM roles"))
        if existing_roles.scalar() > 0:
            print("Roles already exist, skipping creation")
            return
        
        roles = [
            RoleModel(name='user'),
            RoleModel(name='admin')
        ]
        
        session.add_all(roles)
        await session.flush()
        print("Roles created")
    
    async def create_categories(self, session):
        """Создание категорий"""
        print('Creating categories...')
        
        # Проверяем, существуют ли категории
        existing_categories = await session.execute(text("SELECT COUNT(*) FROM categories"))
        if existing_categories.scalar() > 0:
            print("Categories already exist, skipping creation")
            return
        
        categories_data = [
            'Квартиры',
            'Дома',
            'Студии',
            'Апартаменты',
            'Уникальное жильё',
            'Глэмпинг',
            'Лофты',
            'Вилли',
            'Пентхаусы',
            'Гостевые дома'
        ]
        
        categories = [
            CategoriesModel(name=name)
            for name in categories_data
        ]
        
        session.add_all(categories)
        await session.flush()
        print("Categories created")
    
    async def create_users(self, session):
        """Создание пользователей"""
        print('Creating users...')
        
        # Создаем админа
        admin_user = UserModel(
            name='admin',
            email='admin@example.com',
            hashed_password='$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',  # password123
            role_id=2
        )
        session.add(admin_user)
        await session.flush()  # Для получения ID админа
        
        # Создаем обычных пользователей
        for i in range(1, 50):
            first_name = random.choice(self.first_names)
            last_name = random.choice(self.last_names)
            city = random.choice(self.cities)
            
            user = UserModel(
                name=f'{first_name} {last_name}',
                email=f'user{i}@example.com',
                hashed_password='$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',  # password123
                role_id=1
            )
            session.add(user)
        
        await session.flush()
        print("Users created")
    
    async def create_rents(self, session):
        """Создание объявлений об аренде"""
        print('Creating rents...')
        
        titles = [
            'Уютная квартира в центре',
            'Современная студия с видом на парк',
            'Просторный дом у озера',
            'Апартаменты в историческом центре',
            'Светлый лофт с панорамными окнами',
            'Коттедж с камином в лесу',
            'Квартира в новостройке',
            'Дом с бассейном и садом',
            'Студия рядом с метро',
            'Апартаменты с террасой'
        ]
        
        descriptions = [
            'Прекрасное жилье в центре города с современным ремонтом и всей необходимой техникой.',
            'Уютное и светлое помещение с панорамными окнами и красивым видом.',
            'Идеальное место для отдыха всей семьей или компании друзей.',
            'Современный дизайн, удобное расположение и все необходимое для комфортного проживания.',
            'Просторные помещения, высокие потолки и много естественного света.',
            'Тихий и спокойный район, идеально подходит для отдыха от городской суеты.',
            'Новый ремонт, современная техника и удобная планировка.',
            'Большой участок с фруктовыми деревьями, зона для барбекю и детская площадка.',
            'Удобное расположение в шаговой доступности от метро и основных достопримечательностей.',
            'Просторная терраса с видом на город, идеальное место для вечерних посиделок.'
        ]
        
        for i in range(1, 101):
            city = random.choice(self.cities)
            street = random.choice(['Тверская', 'Невский проспект', 'Баумана', 'Ленина', 
                                  'Красный проспект', 'Большая Покровская', 'Курортный проспект', 
                                  'Красная', 'Проспект Революции', 'Московская'])
            
            rent = RentsModel(
                title=f"{random.choice(titles)} {random.randint(1, 100)}",
                address=f"{city}, ул. {street}, д. {random.randint(1, 100)}",
                description=random.choice(descriptions),
                price=random.randint(1000, 10000),
                id_category=random.randint(1, 10),
                id_user=random.randint(1, 49),  # ID пользователей от 1 до 49
                active=random.random() > 0.1
            )
            session.add(rent)
        
        await session.flush()
        print("Rents created")
    
    async def create_images(self, session):
        """Создание изображений"""
        print('Creating images...')
        
        # Создаем изображения
        images = []
        for rent_id in range(1, 101):
            image_count = random.randint(1, 5)
            for i in range(image_count):
                image = ImagesModel(
                    image_url=f"/static/rent_{rent_id}_image_{i+1}.jpg"
                )
                session.add(image)
                images.append(image)
        
        await session.flush()  # Чтобы получить ID изображений
        
        # Теперь обновим записи в таблице rents, чтобы связать их с изображениями
        # Каждому объявлению присвоим одно из созданных изображений
        rents_result = await session.execute(text("SELECT id FROM rents ORDER BY id"))
        rent_ids = [row[0] for row in rents_result.fetchall()]
        
        for i, rent_id in enumerate(rent_ids):
            # Присваиваем каждому объявлению одно изображение (циклически)
            image_id = (i % len(images)) + 1  # ID изображений начинаются с 1
            await session.execute(
                text("UPDATE rents SET id_image = :image_id WHERE id = :rent_id"),
                {"image_id": image_id, "rent_id": rent_id}
            )
        
        print("Images created and linked to rents")
    
    async def create_comments(self, session):
        """Создание комментариев"""
        print('Creating comments...')
        
        comment_texts = [
            'Отличное жилье! Все было чисто и аккуратно.',
            'Хозяева очень отзывчивые, помогли со всеми вопросами.',
            'Прекрасное расположение, рядом все необходимое.',
            'Уютная квартира, чувствуешь себя как дома.',
            'Небольшие недочеты, но в целом все понравилось.',
            'Идеально для семейного отдыха.',
            'Современный ремонт, вся техника новая.',
            'Тихо и спокойно, отлично отдохнули.',
            'Рекомендую это жилье для отдыха.',
            'Небольшая, но очень уютная квартира.'
        ]
        
        for rent_id in range(1, 101):
            comment_count = random.randint(2, 5)
            for _ in range(comment_count):
                comment = CommentsModel(
                    content=random.choice(comment_texts),
                    id_rent=rent_id,
                    id_user=random.randint(1, 49)  # ID пользователей от 1 до 49
                )
                session.add(comment)
        
        await session.flush()
        print("Comments created")
    
    async def create_bookings(self, session):
        """Создание бронирований"""
        print('Creating bookings...')
        
        for i in range(1, 51):
            date_start = datetime.now() + timedelta(days=random.randint(1, 30))
            date_end = date_start + timedelta(days=random.randint(1, 14))
            
            booking = BookingsModel(
                id_user=random.randint(1, 49),  # ID пользователей от 1 до 49
                id_rents=random.randint(1, 100),  # ID аренд от 1 до 100
                guests=random.randint(1, 6),
                date_start=date_start.date(),
                date_end=date_end.date(),
                cost=random.randint(1000, 5000),
            )
            session.add(booking)
        
        await session.flush()
        print("Bookings created")
    
    async def create_help_requests(self, session):
        """Создание обращений в поддержку"""
        print('Creating help requests...')
        
        topics = [
            'Как отменить бронирование?',
            'Не приходит подтверждение на email',
            'Как изменить даты бронирования?',
            'Проблемы с оплатой',
            'Вопрос по возврату средств',
            'Как связаться с хозяином?',
            'Не работает Wi-Fi в жилье',
            'Проблемы с заселением',
            'Вопрос по условиям отмены',
            'Как оставить отзыв?'
        ]
        
        for i in range(1, 21):
            help_request = HelpModel(
                id_user=random.randint(1, 49),  # ID пользователей от 1 до 49
                content=f"{random.choice(topics)} Подробное описание проблемы или вопроса...",
            )
            session.add(help_request)
        
        await session.flush()
        print("Help requests created")
    
    async def create_favorites(self, session):
        """Создание избранного"""
        print('Creating favorites...')
        
        # Каждый пользователь добавляет 3-10 объявлений в избранное
        for user_id in range(1, 50):  # пользователи с 1 по 49
            fav_count = random.randint(3, 10)
            rent_ids = random.sample(range(1, 101), fav_count)
            
            for rent_id in rent_ids:
                favorite = FavoritesModel(
                    id_user=user_id,
                    id_rent=rent_id
                )
                session.add(favorite)
        
        await session.flush()
        print("Favorites created")


async def main():
    """Запуск сидирования данных"""
    seeder = DataSeeder()
    await seeder.initialize()


if __name__ == "__main__":
    asyncio.run(main())