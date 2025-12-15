# seed.py
import asyncio
import random
from datetime import datetime, timedelta
from sqlalchemy import text
from pathlib import Path
from PIL import Image, ImageDraw

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
import generate_images


class DataSeeder:
    def __init__(self):
        self.first_names = ['Александр', 'Мария', 'Дмитрий', 'Анна', 'Иван', 'Елена', 'Сергей', 'Ольга', 'Андрей', 'Наталья']
        self.last_names = ['Иванов', 'Петрова', 'Сидоров', 'Смирнова', 'Кузнецов', 'Попова', 'Васильев', 'Новикова', 'Фёдоров', 'Морозова']
        self.cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск', 'Нижний Новгород', 'Сочи', 'Краснодар', 'Воронеж', 'Самара']
        
    async def initialize(self):
        """Основная функция заполнения данными"""
        print('Starting data seeding...')
        
        try:
            async with async_session_maker() as session:
                # Проверяем, не заполнена ли уже база данных
                if await self.is_database_seeded(session):
                    print("Database is already seeded. Skipping...")
                    return
                
                # Создаем данные в правильном порядке зависимостей
                await self.create_roles(session)
                await self.create_categories(session)
                await self.create_users(session)
                await self.create_images(session)
                await self.create_rents(session)
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
    
    async def is_database_seeded(self, session):
        """Проверяем, есть ли уже данные в базе"""
        # Проверяем по наличию пользователей
        result = await session.execute(text("SELECT COUNT(*) FROM users"))
        user_count = result.scalar()
        return user_count > 10  # Если уже есть более 10 пользователей, считаем что база заполнена
    
    async def create_roles(self, session):
        """Создание ролей, если их нет"""
        print('Checking and creating roles...')
        
        # Проверяем, существуют ли роли
        existing_roles = await session.execute(text("SELECT COUNT(*) FROM roles"))
        if existing_roles.scalar() == 0:
            roles = [
                RoleModel(name='user'),
                RoleModel(name='admin')
            ]
            session.add_all(roles)
            await session.flush()
            print("Roles created")
        else:
            print("Roles already exist")
    
    async def create_categories(self, session):
        """Создание категорий, если их нет"""
        print('Checking and creating categories...')
        
        # Проверяем, существуют ли категории
        existing_categories = await session.execute(text("SELECT COUNT(*) FROM categories"))
        if existing_categories.scalar() == 0:
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
        else:
            print("Categories already exist")
    
    async def create_users(self, session):
        """Создание пользователей, если их мало"""
        print('Creating users...')
        
        # Проверяем, есть ли уже админ
        admin_exists = await session.execute(
            text("SELECT COUNT(*) FROM users WHERE email = 'admin@example.com'")
        )
        
        if admin_exists.scalar() == 0:
            # Создаем админа
            admin_user = UserModel(
                name='admin',
                email='admin@example.com',
                hashed_password='$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',  # password123
                role_id=2
            )
            session.add(admin_user)
            await session.flush()
            print("Admin user created")
        else:
            print("Admin user already exists")
        
        # Проверяем сколько обычных пользователей уже есть
        regular_users_count = await session.execute(
            text("SELECT COUNT(*) FROM users WHERE email LIKE 'user%@example.com'")
        )
        count = regular_users_count.scalar()
        
        # Создаем недостающих пользователей (до 49)
        if count < 49:
            users_to_create = 49 - count
            print(f"Creating {users_to_create} regular users...")
            
            for i in range(count + 1, 50):
                # Проверяем, существует ли пользователь
                user_exists = await session.execute(
                    text(f"SELECT COUNT(*) FROM users WHERE email = 'user{i}@example.com'")
                )
                
                if user_exists.scalar() == 0:
                    first_name = random.choice(self.first_names)
                    last_name = random.choice(self.last_names)
                    
                    user = UserModel(
                        name=f'{first_name} {last_name}',
                        email=f'user{i}@example.com',
                        hashed_password='$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',  # password123
                        role_id=1
                    )
                    session.add(user)
            
            await session.flush()
            print(f"Regular users created (total: 49)")
        else:
            print("Regular users already exist (49 users)")
    
    async def create_rents(self, session):
        """Создание объявлений об аренде, если их нет"""
        print('Creating rents...')
        
        # Проверяем, есть ли уже объявления
        existing_rents = await session.execute(text("SELECT COUNT(*) FROM rents"))
        if existing_rents.scalar() == 0:
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
            
            # Получаем все ID изображений
            image_ids_result = await session.execute(text("SELECT id, image_url FROM images"))
            image_data = image_ids_result.fetchall()
            
            for i in range(1, 101):
                city = random.choice(self.cities)
                street = random.choice(['Тверская', 'Невский проспект', 'Баумана', 'Ленина',
                                      'Красный проспект', 'Большая Покровская', 'Курортный проспект',
                                      'Красная', 'Проспект Революции', 'Московская'])
                
                # Выбираем случайное изображение для аренды
                if image_data:
                    selected_image = random.choice(image_data)
                    image_url = selected_image.image_url
                else:
                    image_url = f"/static/img/rent_{i}_image_1.jpg"
                
                rent = RentsModel(
                    title=f"{random.choice(titles)} {random.randint(1, 100)}",
                    address=f"{city}, ул. {street}, д. {random.randint(1, 100)}",
                    description=random.choice(descriptions),
                    price=random.randint(1000, 10000),
                    id_category=random.randint(1, 10),
                    id_user=random.randint(1, 49),
                    image_url=image_url,
                    active=random.random() > 0.1
                )
                session.add(rent)
            
            await session.flush()
            print("100 rents created")
        else:
            print("Rents already exist")
    
    async def create_images(self, session):
        """Создание изображений, если их нет"""
        print('Creating images...')
        
        # Проверяем, есть ли уже изображения
        existing_images = await session.execute(text("SELECT COUNT(*) FROM images"))
        if existing_images.scalar() == 0:
            # Создаем изображения
            for rent_id in range(1, 101):
                image_count = random.randint(1, 5)
                for i in range(image_count):
                    image = ImagesModel(
                        image_url=f"/static/img/rent_{rent_id}_image_{i+1}.jpg"
                    )
                    session.add(image)
            
            await session.flush()
            print("Images created")
        else:
            print("Images already exist")
    
    async def create_comments(self, session):
        """Создание комментариев, если их нет"""
        print('Creating comments...')
        
        # Проверяем, есть ли уже комментарии
        existing_comments = await session.execute(text("SELECT COUNT(*) FROM comments"))
        if existing_comments.scalar() == 0:
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
                        id_user=random.randint(1, 49)
                    )
                    session.add(comment)
            
            await session.flush()
            print("Comments created")
        else:
            print("Comments already exist")
    
    async def create_bookings(self, session):
        """Создание бронирований, если их нет"""
        print('Creating bookings...')
        
        # Проверяем, есть ли уже бронирования
        existing_bookings = await session.execute(text("SELECT COUNT(*) FROM bookings"))
        if existing_bookings.scalar() == 0:
            for i in range(1, 51):
                date_start = datetime.now() + timedelta(days=random.randint(1, 30))
                date_end = date_start + timedelta(days=random.randint(1, 14))
                
                booking = BookingsModel(
                    id_user=random.randint(1, 49),
                    id_rents=random.randint(1, 100),
                    guests=random.randint(1, 6),
                    date_start=date_start.date(),
                    date_end=date_end.date(),
                    cost=random.randint(1000, 5000),
                )
                session.add(booking)
            
            await session.flush()
            print("50 bookings created")
        else:
            print("Bookings already exist")
    
    async def create_help_requests(self, session):
        """Создание обращений в поддержку, если их нет"""
        print('Creating help requests...')
        
        # Проверяем, есть ли уже обращения
        existing_help = await session.execute(text("SELECT COUNT(*) FROM help"))
        if existing_help.scalar() == 0:
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
                    id_user=random.randint(1, 49),
                    content=f"{random.choice(topics)} Подробное описание проблемы или вопроса...",
                )
                session.add(help_request)
            
            await session.flush()
            print("20 help requests created")
        else:
            print("Help requests already exist")
    
    async def create_favorites(self, session):
        """Создание избранного, если его нет"""
        print('Creating favorites...')
        
        # Проверяем, есть ли уже избранное
        existing_favorites = await session.execute(text("SELECT COUNT(*) FROM favorites"))
        if existing_favorites.scalar() == 0:
            # Каждый пользователь добавляет 3-10 объявлений в избранное
            for user_id in range(1, 50):
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
        else:
            print("Favorites already exist")

    def make_placeholder(path: Path, text: str, size=(800, 600)):
        img = Image.new("RGB", size, color=(230, 230, 230))
        draw = ImageDraw.Draw(img)
        w, h = draw.textsize(text)
        draw.text(((size[0]-w)//2, (size[1]-h)//2), text, fill=(50, 50, 50))
        img.save(path)

    def generate_images():
        base_dir = Path(__file__).resolve().parent
        img_dir = base_dir / "app" / "static" / "img"
        img_dir.mkdir(parents=True, exist_ok=True)
        for rent_id in range(1, 101):
            for i in range(1, 6):
                path = img_dir / f"rent_{rent_id}_image_{i}.jpg"
                if not path.exists():
                    generate_images.make_placeholder(path, f"Rent {rent_id} #{i}")

async def main():
    """Запуск заполнения данных"""
    seeder = DataSeeder()
    generate_images()
    await seeder.initialize()


if __name__ == "__main__":
    asyncio.run(main())