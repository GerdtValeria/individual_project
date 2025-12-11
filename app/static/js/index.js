// main.js - Главный JavaScript файл для работы с роутингом и взаимодействием

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация иконок
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    if (typeof basil !== 'undefined') {
        basil.replace();
    }
    
    // Обработчики для навигационных кнопок
    initNavigation();
    
    // Обработчики для поиска и фильтров
    initSearchHandlers();
    
    // Обработчики для модальных окон
    initModalHandlers();
    
    // Инициализация карточек объявлений (если есть на странице)
    initListings();
});

/**
 * Инициализация навигационных кнопок
 */
function initNavigation() {
    // Кнопка "Арендовать" - роутинг на get_rent_html
    const rentButton = document.querySelector('.top-tabs a[href="/rent.html"], .top-tabs a.tab:contains("Арендовать")');
    if (rentButton) {
        rentButton.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToRentPage();
        });
    }
    
    // Кнопка "Сдать в аренду" - роутинг на get_list_html
    const listButton = document.querySelector('.top-tabs a[href="/list.html"], .top-tabs .tab .two-line');
    if (listButton) {
        listButton.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToListPage();
        });
    }
    
    // Кнопка "Избранное" - роутинг на get_favorites_html
    const favoritesButton = document.querySelector('.top-tabs a[href="/favorites.html"], .top-tabs a:contains("Избранное")');
    if (favoritesButton) {
        favoritesButton.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToFavoritesPage();
        });
    }
    
    // Кнопка "Помощь" - открытие модального окна
    const helpButton = document.querySelector('.top-tabs button[onclick="openHelpModal()"], .top-tabs button:contains("Помощь")');
    if (helpButton) {
        helpButton.addEventListener('click', function(e) {
            e.preventDefault();
            openHelpModal();
        });
    }
    
    // Кнопка "Зарегистрироваться" - роутинг на get_registration_html
    const registerButton = document.querySelector('.top-tabs .tab.primary, .auth .tab.primary');
    if (registerButton) {
        registerButton.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToRegistrationPage();
        });
    }
}

/**
 * Инициализация обработчиков поиска
 */
function initSearchHandlers() {
    // Основная поисковая форма в хедере
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('q');
            if (searchInput) {
                const query = searchInput.value.trim();
                if (query) {
                    // Вызов роутера get_rents с параметром search
                    searchRents(query);
                }
            }
        });
    }
    
    // Форма быстрого поиска в блоке "Найдите идеальное жилье"
    const serviceFindForm = document.getElementById('serviceFindForm');
    if (serviceFindForm) {
        serviceFindForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performServiceSearch();
        });
    }
}

/**
 * Инициализация обработчиков модальных окон
 */
function initModalHandlers() {
    // Модальное окно помощи
    const helpModal = document.getElementById('helpModal');
    const closeHelpBtn = document.getElementById('closeHelp');
    
    if (closeHelpBtn && helpModal) {
        closeHelpBtn.addEventListener('click', function() {
            helpModal.setAttribute('aria-hidden', 'true');
        });
    }
    
    if (helpModal) {
        helpModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.setAttribute('aria-hidden', 'true');
            }
        });
    }
    
    // Модальное окно регистрации (если есть на странице)
    const registerModal = document.getElementById('registerModal');
    const closeRegisterBtn = document.getElementById('closeRegister');
    const cancelRegisterBtn = document.getElementById('cancelRegister');
    
    if (closeRegisterBtn && registerModal) {
        closeRegisterBtn.addEventListener('click', function() {
            registerModal.setAttribute('aria-hidden', 'true');
        });
    }
    
    if (cancelRegisterBtn && registerModal) {
        cancelRegisterBtn.addEventListener('click', function() {
            registerModal.setAttribute('aria-hidden', 'true');
        });
    }
    
    if (registerModal) {
        registerModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.setAttribute('aria-hidden', 'true');
            }
        });
    }
}

/**
 * Инициализация карточек объявлений
 */
function initListings() {
    const listingsContainer = document.getElementById('listings');
    if (!listingsContainer) return;
    
    // Загрузка объявлений при загрузке страницы
    loadInitialRents();
    
    // Обработчики для избранного
    document.addEventListener('click', function(e) {
        if (e.target.closest('.fav')) {
            const favButton = e.target.closest('.fav');
            toggleFavorite(favButton);
        }
        
        if (e.target.closest('.details')) {
            const detailsButton = e.target.closest('.details');
            const card = detailsButton.closest('.card');
            showRentDetails(card);
        }
    });
}

/**
 * Навигация на страницу аренды
 */
async function navigateToRentPage() {
    try {
        const response = await fetch('/web/', {
            method: 'GET',
            headers: {
                'Accept': 'text/html'
            }
        });
        
        if (response.ok) {
            const html = await response.text();
            document.open();
            document.write(html);
            document.close();
        } else {
            // Fallback на прямую ссылку
            window.location.href = '/rent.html';
        }
    } catch (error) {
        console.error('Ошибка при переходе на страницу аренды:', error);
        window.location.href = '/rent.html';
    }
}

/**
 * Навигация на страницу размещения объявления
 */
async function navigateToListPage() {
    try {
        const response = await fetch('/web/', {
            method: 'GET',
            headers: {
                'Accept': 'text/html'
            }
        });
        
        if (response.ok) {
            const html = await response.text();
            document.open();
            document.write(html);
            document.close();
        } else {
            window.location.href = '/list.html';
        }
    } catch (error) {
        console.error('Ошибка при переходе на страницу размещения:', error);
        window.location.href = '/list.html';
    }
}

/**
 * Навигация на страницу избранного
 */
async function navigateToFavoritesPage() {
    try {
        const response = await fetch('/web/', {
            method: 'GET',
            headers: {
                'Accept': 'text/html'
            }
        });
        
        if (response.ok) {
            const html = await response.text();
            document.open();
            document.write(html);
            document.close();
        } else {
            window.location.href = '/favorites.html';
        }
    } catch (error) {
        console.error('Ошибка при переходе на страницу избранного:', error);
        window.location.href = '/favorites.html';
    }
}

/**
 * Навигация на страницу регистрации
 */
async function navigateToRegistrationPage() {
    try {
        const response = await fetch('/web/auth', {
            method: 'GET',
            headers: {
                'Accept': 'text/html'
            }
        });
        
        if (response.ok) {
            const html = await response.text();
            document.open();
            document.write(html);
            document.close();
        } else {
            // Открываем модальное окно регистрации как fallback
            openRegisterModal();
        }
    } catch (error) {
        console.error('Ошибка при переходе на страницу регистрации:', error);
        openRegisterModal();
    }
}

/**
 * Поиск аренды по запросу
 */
async function searchRents(searchQuery, filters = {}) {
    try {
        // Сбор параметров запроса
        const params = new URLSearchParams();
        
        if (searchQuery) {
            params.append('search', searchQuery);
        }
        
        // Добавление дополнительных фильтров
        if (filters.city) params.append('city', filters.city);
        if (filters.adress) params.append('adress', filters.adress);
        if (filters.category_id) params.append('category_id', filters.category_id);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.offset) params.append('offset', filters.offset);
        
        // Вызов API роута get_rents
        const response = await fetch(`/rents/?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const rents = await response.json();
            displayRents(rents);
        } else {
            console.error('Ошибка при поиске объявлений:', response.status);
            alert('Произошла ошибка при поиске. Попробуйте еще раз.');
        }
    } catch (error) {
        console.error('Ошибка при поиске аренды:', error);
        alert('Сетевая ошибка. Проверьте подключение к интернету.');
    }
}

/**
 * Поиск через блок "Найдите идеальное жилье"
 */
function performServiceSearch() {
    const locationInput = document.getElementById('serviceLocation');
    const arriveInput = document.getElementById('serviceArrive');
    const departInput = document.getElementById('serviceDepart');
    const guestsInput = document.getElementById('serviceGuests');
    
    const searchParams = {};
    
    // Используем местоположение как поисковый запрос
    if (locationInput && locationInput.value.trim()) {
        searchParams.search = locationInput.value.trim();
    }
    
    // Дополнительные фильтры могут быть добавлены в будущем
    // Например, фильтрация по датам и количеству гостей
    
    // Вызов поиска
    searchRents(searchParams.search || '', searchParams);
}

/**
 * Загрузка начальных объявлений
 */
async function loadInitialRents() {
    try {
        const response = await fetch('/rents/?limit=6', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const rents = await response.json();
            displayRents(rents);
        }
    } catch (error) {
        console.error('Ошибка при загрузке объявлений:', error);
    }
}

/**
 * Отображение списка объявлений
 */
function displayRents(rents) {
    const listingsContainer = document.getElementById('listings');
    if (!listingsContainer) return;
    
    // Очищаем контейнер
    listingsContainer.innerHTML = '';
    
    if (!rents || rents.length === 0) {
        listingsContainer.innerHTML = '<p style="text-align: center; color: var(--muted);">Объявления не найдены</p>';
        return;
    }
    
    // Шаблон карточки
    const cardTemplate = document.getElementById('cardTpl');
    if (!cardTemplate) return;
    
    rents.forEach(rent => {
        const cardClone = cardTemplate.content.cloneNode(true);
        const card = cardClone.querySelector('.card');
        
        // Заполнение данных
        const thumb = card.querySelector('.thumb');
        const title = card.querySelector('.title');
        const meta = card.querySelector('.meta');
        const price = card.querySelector('.price');
        const tags = card.querySelector('.tags');
        
        // Изображение (берем первое фото, если есть)
        if (rent.photos && rent.photos.length > 0) {
            thumb.src = rent.photos[0];
            thumb.alt = rent.title || 'Фото аренды';
        }
        
        // Заголовок
        if (title) {
            title.textContent = rent.title || 'Без названия';
        }
        
        // Мета-информация
        if (meta) {
            let metaText = '';
            if (rent.city) metaText += rent.city;
            if (rent.adress) metaText += `, ${rent.adress}`;
            if (rent.beds) metaText += ` · ${rent.beds} спален`;
            meta.textContent = metaText;
        }
        
        // Цена
        if (price) {
            price.textContent = rent.price ? `${rent.price} ₽/ночь` : 'Цена не указана';
        }
        
        // Теги (опции)
        if (tags) {
            const tagPill = document.createElement('span');
            tagPill.className = 'tag-pill';
            
            const options = [];
            if (rent.pet_friendly) options.push('Питомцы');
            if (rent.has_parking) options.push('Парковка');
            if (rent.has_wifi) options.push('Wi-Fi');
            
            tagPill.textContent = options.join(', ');
            tags.appendChild(tagPill);
        }
        
        // Добавляем data-id для идентификации
        if (rent.id) {
            card.dataset.id = rent.id;
        }
        
        listingsContainer.appendChild(cardClone);
    });
    
    // Обновляем иконки после добавления новых элементов
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

/**
 * Переключение избранного
 */
function toggleFavorite(button) {
    const isPressed = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', !isPressed);
    
    // Сохраняем в localStorage
    const card = button.closest('.card');
    if (card && card.dataset.id) {
        const rentId = card.dataset.id;
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (isPressed) {
            favorites = favorites.filter(id => id !== rentId);
        } else {
            if (!favorites.includes(rentId)) {
                favorites.push(rentId);
            }
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

/**
 * Показать детали объявления
 */
function showRentDetails(card) {
    const rentId = card.dataset.id;
    if (!rentId) return;
    
    // Загрузка деталей объявления
    fetch(`/rents/${rentId}`)
        .then(response => {
            if (response.ok) return response.json();
            throw new Error('Ошибка загрузки данных');
        })
        .then(rent => {
            // Заполнение модального окна деталями
            const viewModal = document.getElementById('viewModal');
            const viewTitle = document.getElementById('viewTitle');
            const viewImg = document.getElementById('viewImg');
            const viewDesc = document.getElementById('viewDesc');
            const viewMeta = document.getElementById('viewMeta');
            const viewTags = document.getElementById('viewTags');
            
            if (viewTitle) viewTitle.textContent = rent.title || 'Объявление';
            if (viewDesc) viewDesc.textContent = rent.description || 'Описание отсутствует';
            
            // Мета-информация
            if (viewMeta) {
                let metaHTML = '';
                if (rent.city) metaHTML += `<span>${rent.city}</span>`;
                if (rent.adress) metaHTML += ` · <span>${rent.adress}</span>`;
                if (rent.beds) metaHTML += ` · <span>${rent.beds} спален</span>`;
                if (rent.price) metaHTML += ` · <span><strong>${rent.price} ₽/ночь</strong></span>`;
                viewMeta.innerHTML = metaHTML;
            }
            
            // Теги
            if (viewTags) {
                viewTags.innerHTML = '';
                const options = [];
                if (rent.pet_friendly) options.push('Можно с питомцами');
                if (rent.has_parking) options.push('Есть парковка');
                if (rent.has_wifi) options.push('Wi-Fi');
                
                options.forEach(option => {
                    const tag = document.createElement('span');
                    tag.className = 'tag-pill';
                    tag.textContent = option;
                    viewTags.appendChild(tag);
                });
            }
            
            // Изображение
            if (viewImg && rent.photos && rent.photos.length > 0) {
                viewImg.src = rent.photos[0];
                viewImg.alt = rent.title || 'Фото аренды';
            }
            
            // Показываем модальное окно
            if (viewModal) {
                viewModal.setAttribute('aria-hidden', 'false');
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке деталей:', error);
            alert('Не удалось загрузить детали объявления');
        });
}

/**
 * Открытие модального окна помощи
 */
function openHelpModal() {
    const helpModal = document.getElementById('helpModal');
    if (helpModal) {
        helpModal.setAttribute('aria-hidden', 'false');
    }
}

/**
 * Открытие модального окна регистрации
 */
function openRegisterModal() {
    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
        registerModal.setAttribute('aria-hidden', 'false');
    }
}

/**
 * Вспомогательная функция для поиска элементов по тексту
 */
function contains(selector, text) {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).filter(element => {
        return element.textContent.includes(text);
    });
}

// Экспортируем функции для глобального использования
window.openHelpModal = openHelpModal;
window.openRegisterModal = openRegisterModal;
window.searchRents = searchRents;