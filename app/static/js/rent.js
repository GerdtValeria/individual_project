// rent-handler.js
document.addEventListener('DOMContentLoaded', function() {
    // ==================== Глобальные переменные ====================
    let currentUser = null;
    let currentFavorites = new Set();
    let allRentListings = [];
    let isLoading = false;

    // ==================== Инициализация ====================
    initPage();

    async function initPage() {
        // Проверка авторизации
        await checkAuth();
        
        // Загрузка избранного
        await loadFavorites();
        
        // Загрузка объявлений
        await loadAllRents();
        
        // Загрузка недавно просмотренных
        loadRecentlyViewed();
        
        // Настройка обработчиков событий
        setupEventHandlers();
        
        // Инициализация карусели категорий
        initCategoryCarousel();
    }

    // ==================== Навигация ====================
    
    // Обработка клика на логотип
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', async function(e) {
            e.preventDefault();
            await navigateToHome();
        });
    }

    // Обработка навигационных кнопок в шапке
    const navButtons = {
        'rent': null,    // текущая страница
        'list': '/web/list', // роутер get_list_html
        'help': null,    // открытие модального окна
        'favorites': '/web/favorites', // роутер get_favorites_html
        'signup': '/web/auth' // роутер get_registration_html
    };

    // Обработка кликов по кнопкам в top-tabs
    document.querySelectorAll('.top-tabs .tab[data-tab]').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const tab = this.dataset.tab;
            
            if (tab === 'help') {
                openHelpBlock();
                return;
            }
            
            if (navButtons[tab]) {
                try {
                    window.location.href = navButtons[tab];
                } catch (error) {
                    console.error('Ошибка сети:', error);
                    fallbackNavigation(tab);
                }
            }
        });
    });

    // Обработка кнопки "Избранное" (ссылка)
    const favoritesLink = document.querySelector('a[href="/favorites.html"]');
    if (favoritesLink) {
        favoritesLink.addEventListener('click', async function(e) {
            e.preventDefault();
            await navigateToFavorites();
        });
    }

    // Обработка кнопки "Зарегистрироваться"
    const registerLink = document.querySelector('a[href="/signup.html"]');
    if (registerLink) {
        registerLink.addEventListener('click', async function(e) {
            e.preventDefault();
            await navigateToRegistration();
        });
    }

    // Обновление кнопки профиля при авторизации
    function updateProfileButton() {
        const authDiv = document.querySelector('.auth');
        if (!authDiv) return;
        
        if (currentUser) {
            // Меняем кнопку на "Профиль"
            authDiv.innerHTML = `<button class="tab primary" id="profileBtn">Профиль</button>`;
            
            // Добавляем обработчик для кнопки "Профиль"
            const profileBtn = document.getElementById('profileBtn');
            if (profileBtn) {
                profileBtn.addEventListener('click', async function(e) {
                    e.preventDefault();
                    await navigateToProfile();
                });
            }
        } else {
            // Оставляем кнопку "Зарегистрироваться"
            authDiv.innerHTML = `<a class="tab primary" href="/signup.html" id="registerBtn">Зарегистрироваться</a>`;
            
            const registerBtn = document.getElementById('registerBtn');
            if (registerBtn) {
                registerBtn.addEventListener('click', async function(e) {
                    e.preventDefault();
                    await navigateToRegistration();
                });
            }
        }
    }

    // ==================== ФУНКЦИЯ ДЛЯ ПЕРЕХОДА В ПРОФИЛЬ ====================
    async function navigateToProfile() {
        console.log('Переход в профиль...');
        
        try {
            window.location.href = '/web/profile';
        } catch (error) {
            console.error('Ошибка сети при переходе в профиль:', error);
            // Fallback на стандартный путь
            window.location.href = '/web/profile';
        }
    }

    async function navigateToRegistration() {
        try {
            window.location.href = '/web/auth';
        } catch (error) {
            window.location.href = '/web/auth';
        }
    }

    // Обработка поиска
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await performSearch();
        });
    }

    // ==================== Основные функции ====================

    async function checkAuth() {
        try {
            const response = await fetch('/auth/me', {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                currentUser = await response.json();
                console.log('Пользователь авторизован:', currentUser);
                updateProfileButton();
            }
        } catch (error) {
            console.log('Пользователь не авторизован');
        }
    }

    async function loadFavorites() {
        if (!currentUser) return;
        
        try {
            // Используем роутер из favorites.py
            const response = await fetch('/comments/', {
                method: 'GET',
                credentials: 'include'
            });
            
            if (response.ok) {
                const favorites = await response.json();
                currentFavorites = new Set(favorites.map(fav => fav.rent_id));
                console.log('Избранное загружено:', currentFavorites);
            }
        } catch (error) {
            console.error('Ошибка при загрузке избранного:', error);
        }
    }

    async function loadAllRents() {
        if (isLoading) return;
        isLoading = true;
        
        try {
            // Используем роутер get_rents из rents.py
            const response = await fetch('/rents/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                allRentListings = await response.json();
                renderRentListings(allRentListings);
            } else {
                showError('Не удалось загрузить объявления');
            }
        } catch (error) {
            console.error('Ошибка при загрузке объявлений:', error);
            showError('Ошибка сети при загрузке объявлений');
        } finally {
            isLoading = false;
        }
    }

    async function loadRentsByCategory(categoryId) {
        if (isLoading) return;
        isLoading = true;
        
        try {
            // Используем роутер get_rents из rents.py с параметром id_category
            const response = await fetch(`/rents/?id_category=${categoryId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const categoryRents = await response.json();
                renderRentListings(categoryRents);
            } else {
                showError('Не удалось загрузить объявления по категории');
            }
        } catch (error) {
            console.error('Ошибка при загрузке категории:', error);
            showError('Ошибка сети');
        } finally {
            isLoading = false;
        }
    }

    function renderRentListings(rents) {
        const container = document.getElementById('rentListings');
        if (!container) return;
        
        if (rents.length === 0) {
            container.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1">Объявлений не найдено</p>';
            return;
        }
        
        container.innerHTML = rents.map(rent => renderRentCard(rent)).join('');
        
        // Добавляем обработчики для кнопок
        rents.forEach(rent => {
            // Кнопка "Подробнее"
            const detailsBtn = document.getElementById(`details_${rent.id}`);
            if (detailsBtn) {
                detailsBtn.addEventListener('click', () => navigateToRentDetail(rent.id));
            }
            
            // Кнопка "Открыть" (если есть)
            const openBtn = document.getElementById(`open_${rent.id}`);
            if (openBtn) {
                openBtn.addEventListener('click', () => navigateToRentDetail(rent.id));
            }
            
            // Кнопка избранного
            const favoriteBtn = document.getElementById(`favorite_${rent.id}`);
            if (favoriteBtn) {
                favoriteBtn.addEventListener('click', () => toggleFavorite(rent.id));
            }
        });
    }

    function renderRentCard(rent) {
        const isFavorite = currentFavorites.has(rent.id);
        const mainPhoto = rent.photos && rent.photos.length > 0 ? rent.photos[0] : 
                         rent.img || '/default-image.jpg';
        
        return `
            <article class="card" data-id="${rent.id}">
                <img class="thumb" src="${mainPhoto}" alt="${rent.title || 'Объявление'}">
                <div class="card-body">
                    <div class="card-top">
                        <h3 class="title">${rent.title || 'Без названия'}</h3>
                        <button id="favorite_${rent.id}" class="fav" aria-pressed="${isFavorite}" title="${isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}">
                            <i></i>
                        </button>
                    </div>
                    <p class="meta">${rent.city || ''} · ${rent.beds === 0 ? 'Студия' : rent.beds + 'к'}</p>
                    <p class="price">₽${rent.price || 0}/ночь</p>
                    <div class="tags">
                        ${rent.category ? `<span class="tag-pill">${rent.category}</span>` : ''}
                    </div>
                    <button id="details_${rent.id}" class="btn small">Подробнее</button>
                </div>
            </article>
        `;
    }

    async function toggleFavorite(rentId) {
        if (!currentUser) {
            alert('Для добавления в избранное необходимо войти в систему');
            return;
        }

        const favoriteBtn = document.getElementById(`favorite_${rentId}`);
        const isFavorite = currentFavorites.has(rentId);

        try {
            if (isFavorite) {
                // Удаление из избранного - роутер delete_favorite_rent из favorites.py
                const response = await fetch(`/comments/${rentId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                
                if (response.ok) {
                    currentFavorites.delete(rentId);
                    favoriteBtn.setAttribute('aria-pressed', 'false');
                    favoriteBtn.title = 'Добавить в избранное';
                    console.log('Удалено из избранного');
                } else {
                    showError('Не удалось удалить из избранного');
                }
            } else {
                // Добавление в избранное - роутер add_favorite_rent из favorites.py
                const favoriteData = {
                    rent_id: rentId
                };
                
                const response = await fetch('/comments/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(favoriteData)
                });
                
                if (response.ok) {
                    currentFavorites.add(rentId);
                    favoriteBtn.setAttribute('aria-pressed', 'true');
                    favoriteBtn.title = 'Удалить из избранного';
                    console.log('Добавлено в избранное');
                } else {
                    showError('Не удалось добавить в избранное');
                }
            }
        } catch (error) {
            console.error('Ошибка при работе с избранным:', error);
            showError('Ошибка сети');
        }
    }

    function loadRecentlyViewed() {
        try {
            const recentlyViewed = JSON.parse(localStorage.getItem('ugol_recent') || '[]');
            const container = document.getElementById('recentlyViewed');
            
            if (!container || recentlyViewed.length === 0) {
                const wrapper = document.getElementById('recentlyViewedWrap');
                if (wrapper) wrapper.style.display = 'none';
                return;
            }
            
            container.innerHTML = recentlyViewed.slice(0, 4).map(item => `
                <article class="ad-card" style="min-height:120px">
                    <div class="ad-media" role="img" aria-hidden="true" 
                         style="background-image:url('${item.img || '/default-image.jpg'}')"></div>
                    <div class="ad-body">
                        <h4 class="ad-title">${item.title || 'Объявление'}</h4>
                        <p class="ad-desc">₽${item.price || 0}/ночь</p>
                        <div class="ad-actions">
                            <button class="btn ad-cta" data-id="${item.id}">Смотреть</button>
                        </div>
                    </div>
                </article>
            `).join('');
            
            // Добавляем обработчики для кнопок "Смотреть"
            container.querySelectorAll('.ad-cta').forEach(btn => {
                btn.addEventListener('click', () => {
                    const rentId = btn.dataset.id;
                    if (rentId) navigateToRentDetail(rentId);
                });
            });
        } catch (error) {
            console.error('Ошибка при загрузке недавно просмотренных:', error);
        }
    }

    // ==================== Обработка категорий ====================

    function initCategoryCarousel() {
        const scrollContainer = document.querySelector('.feed-scroll');
        const leftArrow = document.querySelector('.feed-arrow.left');
        const rightArrow = document.querySelector('.feed-arrow.right');
        
        if (!scrollContainer || !leftArrow || !rightArrow) return;
        
        const scrollAmount = 200;
        
        leftArrow.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        
        rightArrow.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
        
        // Обработка кликов по категориям
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', async function(e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                const query = href.split('?q=')[1];
                
                if (query) {
                    // Определяем ID категории по тексту запроса
                    const categoryId = getCategoryIdByQuery(query);
                    if (categoryId) {
                        await loadRentsByCategory(categoryId);
                    }
                }
            });
        });
    }

    function getCategoryIdByQuery(query) {
        // Маппинг запросов на ID категорий
        const categoryMap = {
            'Студии': 1,
            '1+комната': 2,
            '2+комнаты': 3,
            'Дома': 4,
            'Апартаменты+с+видом': 5
        };
        
        return categoryMap[query] || null;
    }

    // ==================== Обработка помощи ====================

    function openHelpBlock() {
        let helpBlock = document.getElementById('helpBlock');
        if (!helpBlock) {
            helpBlock = document.createElement('div');
            helpBlock.id = 'helpBlock';
            helpBlock.className = 'overlay-block';
            helpBlock.setAttribute('aria-hidden', 'true');
            helpBlock.innerHTML = `
                <div class="overlay-dialog" role="dialog" aria-label="Помощь">
                    <header class="modal-header">
                        <h3>Помощь</h3>
                        <button id="closeHelpBlock" class="help-close" aria-label="Закрыть">
                            <i></i>
                        </button>
                    </header>
                    <div class="post-form" style="max-width:520px;">
                        <p style="margin:0 0 8px;color:var(--muted)">Здесь вы найдёте ответы на частые вопросы, инструкции по бронированию и контакты службы поддержки.</p>
                        <ul style="margin:0 0 8px;color:var(--muted);line-height:1.5">
                            <li>Как забронировать жильё?</li>
                            <li>Как отменить бронирование?</li>
                            <li>Как разместить объявление?</li>
                        </ul>
                        <hr style="border:0;height:1px;background:rgba(0,0,0,0.06);margin:8px 0">
                        <form id="helpContactFormRent" class="help-contact-form" style="display:flex;flex-direction:column;gap:8px;">
                            <label style="font-size:13px">Ваш e-mail
                                <input type="email" name="email" placeholder="you@example.com" required style="padding:8px;border-radius:8px;border:1px solid rgba(0,0,0,0.08)">
                            </label>
                            <label style="font-size:13px">Сообщение
                                <textarea name="message" rows="3" placeholder="Опишите проблему или вопрос" required style="padding:8px;border-radius:8px;border:1px solid rgba(0,0,0,0.08)"></textarea>
                            </label>
                            <div style="display:flex;justify-content:flex-end;gap:8px">
                                <button type="submit" class="btn">Отправить</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.appendChild(helpBlock);
            
            // Обработчик закрытия
            const closeBtn = document.getElementById('closeHelpBlock');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    helpBlock.setAttribute('aria-hidden', 'true');
                });
            }
            
            // Закрытие по клику на фон
            helpBlock.addEventListener('click', (e) => {
                if (e.target === helpBlock) {
                    helpBlock.setAttribute('aria-hidden', 'true');
                }
            });
            
            // Обработчик формы помощи
            const helpForm = document.getElementById('helpContactFormRent');
            if (helpForm) {
                helpForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await sendHelpRequest(helpForm);
                });
            }
        }
        
        helpBlock.setAttribute('aria-hidden', 'false');
        setTimeout(() => {
            const emailInput = helpBlock.querySelector('input[name="email"]');
            if (emailInput) emailInput.focus();
        }, 100);
    }

    async function sendHelpRequest(form) {
        const formData = new FormData(form);
        const helpData = {
            email: formData.get('email'),
            message: formData.get('message')
        };
        
        if (!helpData.email || !helpData.message) {
            alert('Заполните все поля');
            return;
        }
        
        if (!isValidEmail(helpData.email)) {
            alert('Введите корректный email');
            return;
        }
        
        try {
            // Используем роутер add_help из help.py
            const response = await fetch('/help/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    content: helpData.message,
                    email: helpData.email
                })
            });
            
            if (response.ok) {
                alert('Ваш вопрос отправлен. Мы ответим вам на указанный email.');
                form.reset();
                
                const helpBlock = document.getElementById('helpBlock');
                if (helpBlock) helpBlock.setAttribute('aria-hidden', 'true');
            } else {
                showError('Не удалось отправить вопрос');
            }
        } catch (error) {
            console.error('Ошибка при отправке вопроса:', error);
            showError('Ошибка сети');
        }
    }

    // ==================== Функции навигации ====================

    async function navigateToHome() {
        try {
            window.location.href = '/web/index';
        } catch (error) {
            fallbackNavigation('home');
        }
    }

    async function navigateToFavorites() {
        try {
            window.location.href = '/web/favorites';
        } catch (error) {
            fallbackNavigation('favorites');
        }
    }

    async function navigateToRentDetail(rentId) {
        try {
            window.location.href = `/web/detail?id=${rentId}`;
        } catch (error) {
            window.location.href = `/web/detail?id=${rentId}`;
        }
    }

    async function performSearch() {
        const searchInput = document.getElementById('q');
        const query = searchInput ? searchInput.value.trim() : '';
        
        if (!query) {
            // Если запрос пустой, загружаем все объявления
            await loadAllRents();
            return;
        }

        try {
            // Используем роутер get_rents из rents.py с параметром поиска
            const response = await fetch(`/rents/?q=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const searchResults = await response.json();
                renderRentListings(searchResults);
            } else {
                showError('Ошибка при поиске');
            }
        } catch (error) {
            console.error('Ошибка поиска:', error);
            showError('Ошибка сети при поиске');
        }
    }

    // ==================== Вспомогательные функции ====================

    function setupEventHandlers() {
        // Дополнительные обработчики, если нужны
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function fallbackNavigation(tab) {
        const routes = {
            'list': '/web/list',
            'favorites': '/web/favorites',
            'signup': '/web/auth',
            'home': '/web/index',
            'profile': '/web/profile'
        };
        
        if (routes[tab]) {
            window.location.href = routes[tab];
        } else {
            window.location.href = '/web/index';
        }
    }

    function showError(message) {
        console.error(message);
        // Можно добавить красивый вывод ошибки
        alert(message);
    }

    // ==================== Инициализация Feather Icons ====================
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    console.log('Rent handler initialized');
});