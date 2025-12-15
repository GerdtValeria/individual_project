// favorites-handler.js - обработчик событий для страницы favorites.html

document.addEventListener('DOMContentLoaded', function() {
    // ==================== ИНИЦИАЛИЗАЦИЯ ====================
    // Проверяем авторизацию пользователя
    checkUserAuth();
    
    // Слушаем событие авторизации
    window.addEventListener('ugol:login', function() {
        updateAuthUI();
    });

    // ==================== ПЕРЕХОД ПО ЛОГОТИПУ ====================
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/web/';
        });
    }

    // ==================== ОБРАБОТЧИКИ ВКЛАДОК ВЕРХНЕГО МЕНЮ ====================
    
    // Кнопка "Арендовать"
    const rentTab = document.querySelector('a.tab[href="/rent.html"]');
    if (rentTab) {
        rentTab.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/web/rents';
        });
    }

    // Кнопка "Сдать в аренду"
    const listTab = document.querySelector('a.tab[href="/list.html"]');
    if (listTab) {
        listTab.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/web/list';
        });
    }

    // Кнопка "Избранное"
    const favoritesTab = document.querySelector('a.tab[href="/favorites.html"]');
    if (favoritesTab) {
        favoritesTab.addEventListener('click', function(e) {
            e.preventDefault();
            // Текущая страница
        });
    }

    // Кнопка "Помощь"
    const helpTab = document.querySelector('.tab[data-tab="help"]');
    if (helpTab) {
        helpTab.addEventListener('click', function(e) {
            e.preventDefault();
            openHelpModal();
        });
    }

    // ==================== КНОПКА РЕГИСТРАЦИИ/ПРОФИЛЯ ====================
    const signupTab = document.querySelector('.tab[data-tab="signup"]');
    if (signupTab) {
        signupTab.addEventListener('click', function(e) {
            e.preventDefault();
            const user = getUserFromStorage();
            if (user) {
                // Если пользователь авторизован, переходим в профиль
                window.location.href = '/web/profile';
            } else {
                // Если не авторизован, открываем форму регистрации/входа
                openSigninModal();
            }
        });
    }

    // ==================== ПОИСКОВЫЙ ЗАПРОС ====================
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('q');
            const searchQuery = searchInput ? searchInput.value.trim() : '';
            
            if (searchQuery) {
                searchRents(searchQuery);
            }
        });
    }

    // ==================== КНОПКА "К СПИСКУ" ====================
    const backToListBtn = document.querySelector('a.btn[href="/rent.html"]');
    if (backToListBtn) {
        backToListBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/web/rents';
        });
    }

    // ==================== БЛОК ПОМОЩИ ====================
    // Инициализация блока помощи
    initHelpBlock();

    // ==================== ЗАГРУЗКА ИЗБРАННЫХ ОБЪЯВЛЕНИЙ ====================
    loadFavorites();

    // ==================== ФУНКЦИИ ДЛЯ РАБОТЫ С API ====================

    /**
     * Загрузка избранных объявлений
     */
    async function loadFavorites() {
        try {
            const response = await fetch('/comments/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const favorites = await response.json();
                console.log('Получены избранные объявления:', favorites);
                displayFavorites(favorites);
            } else {
                console.error('Ошибка при получении избранных объявлений');
                loadFavoritesFromLocalStorage();
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            loadFavoritesFromLocalStorage();
        }
    }

    /**
     * Удаление избранного объявления
     * @param {number} id - ID объявления
     */
    async function removeFavorite(id) {
        try {
            const response = await fetch(`/comments/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Объявление удалено из избранного:', result);
                showNotification('Объявление удалено из избранного', 'success');
                loadFavorites();
            } else {
                throw new Error('Ошибка при удалении из избранного');
            }
        } catch (error) {
            console.error('Ошибка при удалении из избранного:', error);
            removeFavoriteFromLocalStorage(id);
            showNotification('Объявление удалено из избранного (демо)', 'success');
            loadFavorites();
        }
    }

    /**
     * Поиск объявлений
     * @param {string} query - Поисковый запрос
     */
    async function searchRents(query) {
        try {
            const response = await fetch(`/rents/?q=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const rents = await response.json();
                console.log('Найдены объявления по запросу:', query, rents);
                window.location.href = `/web/rent?q=${encodeURIComponent(query)}`;
            } else {
                console.error('Ошибка при поиске объявлений');
                window.location.href = '/web/rents';
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            window.location.href = '/web/rents';
        }
    }

    /**
     * Отправка вопроса в помощь
     * @param {Object} helpData - Данные вопроса
     */
    async function sendHelpQuestion(helpData) {
        try {
            // Предполагаем, что есть роутер add_help в help.py
            const response = await fetch('/help/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(helpData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Вопрос отправлен в поддержку:', result);
                return { success: true, message: 'Ваш вопрос успешно отправлен в поддержку' };
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Ошибка при отправке вопроса');
            }
        } catch (error) {
            console.error('Ошибка при отправке вопроса:', error);
            // Для демо-версии имитируем успешную отправку
            return { 
                success: true, 
                message: 'Вопрос отправлен (демо-режим). В реальном приложении он будет отправлен в поддержку.' 
            };
        }
    }

    // ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

    /**
     * Проверка авторизации пользователя
     */
    function checkUserAuth() {
        const user = getUserFromStorage();
        updateAuthUI(user);
    }

    /**
     * Получение пользователя из localStorage
     */
    function getUserFromStorage() {
        try {
            const userData = localStorage.getItem('ugol_user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Ошибка при получении пользователя:', error);
            return null;
        }
    }

    /**
     * Обновление UI в зависимости от авторизации
     * @param {Object} user - Данные пользователя
     */
    function updateAuthUI(user = null) {
        if (!user) {
            user = getUserFromStorage();
        }
        
        const signupTab = document.querySelector('.tab[data-tab="signup"]');
        if (!signupTab) return;
        
        if (user) {
            // Меняем "Зарегистрироваться" на "Профиль"
            signupTab.textContent = 'Профиль';
            signupTab.classList.remove('primary');
            signupTab.classList.add('profile-tab');
            
            // Обновляем обработчик
            signupTab.onclick = function(e) {
                e.preventDefault();
                window.location.href = '/web/profile';
            };
        } else {
            // Возвращаем "Зарегистрироваться"
            signupTab.textContent = 'Зарегистрироваться';
            signupTab.classList.add('primary');
            signupTab.classList.remove('profile-tab');
            
            // Обновляем обработчик
            signupTab.onclick = function(e) {
                e.preventDefault();
                openSigninModal();
            };
        }
    }

    /**
     * Открытие модального окна помощи
     */
    function openHelpModal() {
        const helpBlock = document.getElementById('helpBlock');
        if (helpBlock) {
            helpBlock.setAttribute('aria-hidden', 'false');
            helpBlock.style.visibility = 'visible';
            helpBlock.style.opacity = '1';
            
            setTimeout(() => {
                const emailInput = helpBlock.querySelector('input[name="email"]');
                if (emailInput) emailInput.focus();
            }, 100);
        }
    }

    /**
     * Закрытие модального окна помощи
     */
    function closeHelpModal() {
        const helpBlock = document.getElementById('helpBlock');
        if (helpBlock) {
            helpBlock.setAttribute('aria-hidden', 'true');
            helpBlock.style.visibility = 'hidden';
            helpBlock.style.opacity = '0';
        }
    }

    /**
     * Инициализация блока помощи
     */
    function initHelpBlock() {
        const helpBlock = document.getElementById('helpBlock');
        if (!helpBlock) return;

        // Кнопка закрытия (cancel_17767265.png)
        const closeHelpBtn = document.getElementById('closeHelpBlock');
        if (closeHelpBtn) {
            closeHelpBtn.addEventListener('click', function(e) {
                e.preventDefault();
                closeHelpModal();
            });
        }

        // Закрытие при клике вне блока
        helpBlock.addEventListener('click', function(e) {
            if (e.target === helpBlock) {
                closeHelpModal();
            }
        });

        // Форма помощи
        const helpForm = document.getElementById('helpContactFormFavorites');
        if (helpForm) {
            helpForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(helpForm);
                const email = formData.get('email') || '';
                const message = formData.get('message') || '';
                
                // Получаем текущего пользователя
                const user = getUserFromStorage();
                const userName = user ? user.name : 'Гость';
                
                // Данные для отправки
                const helpData = {
                    email: email,
                    message: message,
                    user_name: userName,
                    page: 'favorites',
                    timestamp: new Date().toISOString()
                };
                
                // Отправляем вопрос через роутер add_help
                const submitBtn = helpForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                
                // Показываем индикатор загрузки
                submitBtn.textContent = 'Отправка...';
                submitBtn.disabled = true;
                
                try {
                    const result = await sendHelpQuestion(helpData);
                    
                    if (result.success) {
                        showNotification(result.message, 'success');
                        helpForm.reset();
                        closeHelpModal();
                    } else {
                        showNotification('Ошибка при отправке вопроса', 'error');
                    }
                } catch (error) {
                    console.error('Ошибка:', error);
                    showNotification('Ошибка при отправке вопроса', 'error');
                } finally {
                    // Восстанавливаем кнопку
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            });
        }
    }

    /**
     * Открытие модального окна регистрации/входа
     */
    function openSigninModal() {
        const signinBlock = document.getElementById('signin');
        if (signinBlock) {
            signinBlock.setAttribute('aria-hidden', 'false');
            signinBlock.style.visibility = 'visible';
            signinBlock.style.opacity = '1';
            
            setTimeout(() => {
                const nameInput = signinBlock.querySelector('input[name="name"]');
                if (nameInput) nameInput.focus();
            }, 100);
        }
    }

    /**
     * Отображение избранных объявлений
     * @param {Array} favorites - Массив избранных объявлений
     */
    function displayFavorites(favorites) {
        const container = document.getElementById('favoritesList');
        const emptyMsg = document.getElementById('favoritesEmptyMsg');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!favorites || favorites.length === 0) {
            if (emptyMsg) {
                emptyMsg.style.display = 'block';
                emptyMsg.textContent = 'У вас пока нет сохранённых объявлений.';
            }
            return;
        }
        
        if (emptyMsg) {
            emptyMsg.style.display = 'none';
        }
        
        favorites.forEach(favorite => {
            const card = createFavoriteCard(favorite);
            container.appendChild(card);
        });
    }

    /**
     * Создание карточки избранного объявления
     * @param {Object} favorite - Данные объявления
     */
    function createFavoriteCard(favorite) {
        const card = document.createElement('article');
        card.className = 'card';
        card.dataset.id = favorite.id;
        
        const photoUrl = favorite.photos && favorite.photos[0] 
            ? favorite.photos[0] 
            : '/1686570026_staisha-top-p-dizain-otdelki-kvartiri-v-sovremennom-stil-26.jpg';
        
        card.innerHTML = `
            <img class="thumb" src="${escapeHtml(photoUrl)}" alt="${escapeHtml(favorite.title || 'Объявление')}">
            <div class="card-body">
                <div class="card-top">
                    <h3 class="title">${escapeHtml(favorite.title || 'Без названия')}</h3>
                </div>
                <p class="meta">${escapeHtml(favorite.city || '')}${favorite.district ? ' · ' + escapeHtml(favorite.district) : ''}</p>
                <p class="desc-snippet">${escapeHtml(favorite.description ? 
                    (favorite.description.length > 120 ? 
                        favorite.description.substring(0, 117) + '...' : 
                        favorite.description) : 
                    '')}</p>
                <p class="price">₽${escapeHtml(favorite.price || 0)}/ночь</p>
                <div style="display: flex; gap: 8px; margin-top: auto;">
                    <button class="btn view-details" data-id="${favorite.id}">Подробнее</button>
                    <button class="fav favorite-btn active" data-id="${favorite.id}" aria-label="Удалить из избранного" aria-pressed="true"></button>
                </div>
            </div>
        `;
        
        // Обработчики событий для кнопок карточки
        const viewBtn = card.querySelector('.view-details');
        const favBtn = card.querySelector('.favorite-btn');
        
        if (viewBtn) {
            viewBtn.addEventListener('click', function() {
                const id = this.dataset.id;
                if (id) {
                    window.location.href = `/web/detail?id=${encodeURIComponent(id)}`;
                }
            });
        }
        
        if (favBtn) {
            favBtn.addEventListener('click', function() {
                const id = this.dataset.id;
                if (id) {
                    removeFavorite(parseInt(id));
                }
            });
        }
        
        return card;
    }

    /**
     * Загрузка избранных из localStorage (для демо-версии)
     */
    function loadFavoritesFromLocalStorage() {
        try {
            const favoritesData = localStorage.getItem('ugol_favorites');
            if (favoritesData) {
                const favorites = JSON.parse(favoritesData);
                console.log('Загружены избранные из localStorage:', favorites);
                displayFavorites(favorites);
            } else {
                displayDemoFavorites();
            }
        } catch (error) {
            console.error('Ошибка при загрузке избранных из localStorage:', error);
            displayDemoFavorites();
        }
    }

    /**
     * Удаление избранного из localStorage (для демо-версии)
     * @param {number} id - ID объявления
     */
    function removeFavoriteFromLocalStorage(id) {
        try {
            const favoritesData = localStorage.getItem('ugol_favorites');
            if (favoritesData) {
                let favorites = JSON.parse(favoritesData);
                favorites = favorites.filter(fav => fav.id !== id);
                localStorage.setItem('ugol_favorites', JSON.stringify(favorites));
                console.log('Удалено из избранного в localStorage:', id);
            }
        } catch (error) {
            console.error('Ошибка при удалении из избранного в localStorage:', error);
        }
    }

    /**
     * Отображение демо-избранных
     */
    function displayDemoFavorites() {
        const demoFavorites = [
            {
                id: 1,
                title: 'Уютная квартира в центре',
                city: 'Москва',
                district: 'Центральный',
                description: 'Просторная квартира с современным ремонтом в самом центре города. Рядом метро, магазины, кафе.',
                price: 3500,
                photos: ['/1686570026_staisha-top-p-dizain-otdelki-kvartiri-v-sovremennom-stil-26.jpg']
            },
            {
                id: 2,
                title: 'Студия с видом на парк',
                city: 'Санкт-Петербург',
                district: 'Василеостровский',
                description: 'Светлая студия с панорамным видом на парк. Современная техника, консьерж.',
                price: 2800,
                photos: ['/1686570026_staisha-top-p-dizain-otdelki-kvartiri-v-sovremennom-stil-26.jpg']
            },
            {
                id: 3,
                title: 'Дом у озера',
                city: 'Казань',
                district: 'Приозерный',
                description: 'Уютный дом для отдыха на берегу озера. Сауна, мангал, всё для комфортного отдыха.',
                price: 4500,
                photos: ['/1686570026_staisha-top-p-dizain-otdelki-kvartiri-v-sovremennom-stil-26.jpg']
            }
        ];
        
        displayFavorites(demoFavorites);
        
        try {
            localStorage.setItem('ugol_favorites', JSON.stringify(demoFavorites));
        } catch (error) {
            console.error('Ошибка при сохранении демо-данных в localStorage:', error);
        }
    }

    /**
     * Показ уведомления
     * @param {string} message - Текст уведомления
     * @param {string} type - Тип уведомления (success, error, info)
     */
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#cdebd4' : type === 'error' ? '#f8d7da' : '#fff3cd'};
            color: ${type === 'success' ? '#042018' : type === 'error' ? '#721c24' : '#856404'};
            border: 1px solid ${type === 'success' ? '#b8e0c4' : type === 'error' ? '#f5c6cb' : '#ffeaa7'};
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease;
            font-family: 'Noto Sans', sans-serif;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Экранирование HTML-символов
     * @param {string} text - Текст для экранирования
     */
    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // ==================== ИНИЦИАЛИЗАЦИЯ СТИЛЕЙ ДЛЯ АНИМАЦИЙ ====================
    if (!document.querySelector('#favorites-handler-styles')) {
        const style = document.createElement('style');
        style.id = 'favorites-handler-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .notification {
                transition: all 0.3s ease;
            }
            
            .favorite-btn.active {
                background-color: rgba(127,211,198,0.14) !important;
            }
            
            .profile-tab {
                background: #f1f9f7 !important;
                color: #044036 !important;
                border: 1px solid #e6f5f2 !important;
            }
            
            .profile-tab:hover,
            .profile-tab:focus {
                background: #e6f5f2 !important;
                transform: translateY(-2px) !important;
            }
            
            /* Стили для кнопки закрытия помощи */
            #closeHelpBlock {
                background-image: url('/cancel_17767265.png');
                background-repeat: no-repeat;
                background-position: center;
                background-size: 22px 22px;
                background-color: transparent;
                border: none;
                width: 44px;
                height: 44px;
                padding: 6px;
                border-radius: 8px;
                cursor: pointer;
                position: absolute;
                top: 10px;
                right: 10px;
                display: inline-block;
            }
            
            #closeHelpBlock i {
                display: none !important;
            }
            
            #closeHelpBlock:focus {
                outline: 2px solid rgba(4,64,54,0.16);
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    console.log('Обработчик событий для страницы "Избранное" загружен');
});