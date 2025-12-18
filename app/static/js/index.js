document.addEventListener('DOMContentLoaded', function() {
  initIcons();
  initNavigation();
  initSearch();
  initFilters();
  initModals();
  checkUserAuth();
});


function initIcons() {
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    if (typeof basil !== 'undefined') {
        basil.replace();
    }
}

/**
 * Инициализация навигационных элементов
 */
function initNavigation() {
  // Кнопка "Арендовать" - роутинг на get_rent_html
  const rentTab = document.querySelector('.top-tabs a[href="/rent.html"]');
  if (rentTab) {
    rentTab.addEventListener('click', function(e) {
      e.preventDefault();
      navigateToRentPage();
    });
  }
  
  // Кнопка "Сдать в аренду" - роутинг на get_list_html
  const listTab = document.querySelector('.top-tabs a[href="/list.html"]');
  if (listTab) {
  listTab.addEventListener('click', function (e) {
    e.preventDefault();
    const user = getUserData();
    if (!user) {
      alert('Нужно войти в аккаунт');
      navigateToRegistrationPage(); // /web/auth
      return;
    }
    navigateToListPage();
  });
}
  
  // Кнопка "Избранное" - роутинг на get_favorites_html
  const favoritesTab = document.querySelector('.top-tabs a[href="/favorites.html"]');
  if (favoritesTab) {
  favoritesTab.addEventListener('click', function (e) {
    e.preventDefault();
    const user = getUserData();
    if (!user) {
      alert('Нужно войти в аккаунт');
      navigateToRegistrationPage();
      return;
    }
    navigateToFavoritesPage();
  });
}

  // Логотип - переход на главную
//   const logoLink = document.querySelector('.logo-link');
//   if (logoLink) {
//     logoLink.addEventListener('click', function(e) {
//       e.preventDefault();
//       navigateToIndexPage();
//     });
//   }

  // Ссылки в футере - ИСПРАВЛЕНО
  const footerLinks = document.querySelectorAll('.site-footer a');
  footerLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href !== '#') {
        e.preventDefault();
        
          navigateToRentPage();   // /web/rent
        if (href === '/list.html') {
            const user = getUserData();
            if (!user) {
                alert('Нужно войти в аккаунт');
                navigateToRegistrationPage();
                return;
            }
            navigateToListPage();
        } else if (href === '/favorites.html') {
            const user = getUserData();
            if (!user) {
                alert('Нужно войти в аккаунт');
                navigateToRegistrationPage();
                return;
            }
            navigateToFavoritesPage();
        } else if (href.startsWith('/signup')) {
          navigateToRegistrationPage(); // /web/auth
        } else if (href === '#team' || href === '#history' || href === '#mission') {
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        } else if (href === '#') {
          openHelpModal();
        }
      }
    });
  });
}

// Навигационные функции - все правильные
async function navigateToRentPage() { window.location.href = '/web/rents'; }
async function navigateToListPage() { window.location.href = '/web/list'; }
async function navigateToFavoritesPage() { window.location.href = '/web/favorites'; }
async function navigateToProfilePage() { window.location.href = '/web/profile'; }
async function navigateToRegistrationPage() { window.location.href = '/web/auth'; }
// async function navigateToIndexPage() { window.location.href = '/web/'; }
/**
 * Инициализация кнопки авторизации/профиля
 */
function initAuthButton() {
    const authContainer = document.querySelector('.top-tabs .auth');
    if (!authContainer) return;
    
    // Проверяем авторизацию
    const userData = getUserData();
    
    if (userData) {
        // Пользователь авторизован - показываем кнопку "Профиль"
        authContainer.innerHTML = `
            <button class="tab primary" id="profileBtn">
                Профиль
            </button>
        `;
        
        const profileBtn = document.getElementById('profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', function(e) {
                e.preventDefault();
                navigateToProfilePage();
            });
        }
    } else {
        // Пользователь не авторизован - показываем кнопку "Зарегистрироваться"
        authContainer.innerHTML = `
            <button class="tab primary" id="registerBtn">
                Зарегистрироваться
            </button>
        `;
        
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', function(e) {
                e.preventDefault();
                navigateToRegistrationPage();
            });
        }
    }
}

/**
 * Проверка авторизации пользователя
 */
function checkUserAuth() {
    const userData = getUserData();
    
    // Обновляем кнопку в зависимости от статуса авторизации
    initAuthButton();
    
    // Можно добавить дополнительные действия при проверке авторизации
    if (userData) {
        console.log('Пользователь авторизован:', userData.name || userData.email);
    }
}

/**
 * Получение данных пользователя из localStorage
 */
function getUserData() {
    try {
        const userData = localStorage.getItem('ugol_user');
        if (userData) {
            return JSON.parse(userData);
        }
    } catch (error) {
        console.error('Ошибка при чтении данных пользователя:', error);
    }
    return null;
}

/**
 * Инициализация поиска
 */
function initSearch() {
    // Основная поисковая форма в хедере
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('q');
            if (searchInput) {
                const query = searchInput.value.trim();
                if (query) {
                    // Вызов роутера get_rents с методом get_filtered_rents
                    searchRents(query);
                } else {
                    alert('Введите поисковый запрос');
                }
            }
        });
    }
}

/**
 * Инициализация фильтров в блоке "Найдите идеальное жилье"
 */
function initFilters() {
    const serviceFindForm = document.getElementById('serviceFindForm');
    if (serviceFindForm) {
        serviceFindForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performServiceSearch();
        });
        
        // Установка минимальной даты для полей дат
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const arriveInput = document.getElementById('serviceArrive');
        const departInput = document.getElementById('serviceDepart');
        
        if (arriveInput) {
            arriveInput.setAttribute('min', today);
            if (!arriveInput.value) {
                arriveInput.value = today;
            }
        }
        
        if (departInput) {
            departInput.setAttribute('min', tomorrowStr);
            if (!departInput.value) {
                departInput.value = tomorrowStr;
            }
        }
    }
}

/**
 * Инициализация модальных окон
 */
function initModals() {
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
    
    // Обработчик кнопки закрытия помощи (изображение cancel_17767265.png)
    const helpCloseImage = document.querySelector('#helpModal .modal-header button[aria-label="Закрыть"]');
    if (helpCloseImage) {
        helpCloseImage.addEventListener('click', function() {
            helpModal.setAttribute('aria-hidden', 'true');
        });
    }
    
    // Форма помощи
    const helpForm = helpModal ? helpModal.querySelector('form') : null;
    if (helpForm) {
        helpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitHelpRequest();
        });
    }
    
    // Модальное окно регистрации
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
    
    // Обработчик кнопки закрытия регистрации (изображение cancel_17767265.png)
    const registerCloseImage = document.querySelector('#registerModal .modal-header button[aria-label="Закрыть"]');
    if (registerCloseImage) {
        registerCloseImage.addEventListener('click', function() {
            registerModal.setAttribute('aria-hidden', 'true');
        });
    }
    
    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegistration();
        });
    }
    
    // Ссылка "Войти" в форме регистрации
    const openLoginFromRegister = document.getElementById('openLoginFromRegister');
    if (openLoginFromRegister) {
        openLoginFromRegister.addEventListener('click', function(e) {
            e.preventDefault();
            if (registerModal) {
                registerModal.setAttribute('aria-hidden', 'true');
            }
            // Здесь можно открыть модальное окно входа
            alert('Функция входа будет реализована позже. Для демо используйте форму регистрации.');
        });
    }
    
    // Другие модальные окна
    initOtherModals();
}

/**
 * Инициализация других модальных окон
 */
function initOtherModals() {
    const postModal = document.getElementById('postModal');
    const closePostBtn = document.getElementById('closePost');
    const cancelPostBtn = document.getElementById('cancelPost');
    
    if (closePostBtn && postModal) {
        closePostBtn.addEventListener('click', function() {
            postModal.setAttribute('aria-hidden', 'true');
        });
    }
    
    if (cancelPostBtn && postModal) {
        cancelPostBtn.addEventListener('click', function() {
            postModal.setAttribute('aria-hidden', 'true');
        });
    }
    
    if (postModal) {
        postModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.setAttribute('aria-hidden', 'true');
            }
        });
    }
    
    const viewModal = document.getElementById('viewModal');
    const closeViewBtn = document.getElementById('closeView');
    
    if (closeViewBtn && viewModal) {
        closeViewBtn.addEventListener('click', function() {
            viewModal.setAttribute('aria-hidden', 'true');
        });
    }
    
    if (viewModal) {
        viewModal.addEventListener('click', function(e) {
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
 * Навигация на страницу аренды через get_rent_html
 */
async function navigateToRentPage() {
    try {
        window.location.href = '/web/rents';
    } catch (error) {
        console.error('Ошибка при переходе на страницу аренды:', error);
        window.location.href = '/web/rents';
    }
}

/**
 * Навигация на страницу "Сдать в аренду" через get_list_html
 */
async function navigateToListPage() {
    try {
        window.location.href = '/web/list';
    } catch (error) {
        console.error('Ошибка при переходе на страницу сдачи:', error);
        window.location.href = '/web/list';
    }
}

/**
 * Навигация на страницу избранного через get_favorites_html
 */
async function navigateToFavoritesPage() {
    try {
        window.location.href = '/web/favorites';
    } catch (error) {
        console.error('Ошибка при переходе на страницу избранного:', error);
        window.location.href = '/web/favorites';
    }
}

/**
 * Навигация на страницу профиля через get_profile_html
 */
async function navigateToProfilePage() {
    try {
        window.location.href = '/web/profile';
    } catch (error) {
        console.error('Ошибка при переходе на страницу профиля:', error);
        window.location.href = '/web/profile';
    }
}

/**
 * Навигация на страницу регистрации через get_registration_html
 */
async function navigateToRegistrationPage() {
    try {
        window.location.href = '/web/auth';
    } catch (error) {
        console.error('Ошибка при переходе на страницу регистрации:', error);
        openRegisterModal();
    }
}

/**
 * Навигация на главную страницу через get_index_html
 */
// async function navigateToIndexPage() {
//     try {
//         window.location.href = '/web/index';
//     } catch (error) {
//         console.error('Ошибка при переходе на главную страницу:', error);
//         window.location.href = '/web/index';
//     }
// }

/**
 * Поиск аренды по запросу через роутер get_rents с методом get_filtered_rents
 */
async function searchRents(searchQuery, additionalFilters = {}) {
    try {
        // Сбор параметров запроса для get_filtered_rents
        const params = new URLSearchParams();
        
        if (searchQuery) {
            // Используем параметр q как поисковый запрос
            params.append('q', searchQuery);
        }
        
        // Добавление дополнительных фильтров
        if (additionalFilters.city) params.append('city', additionalFilters.city);
        if (additionalFilters.district) params.append('district', additionalFilters.district);
        if (additionalFilters.price_from) params.append('price_from', additionalFilters.price_from);
        if (additionalFilters.price_to) params.append('price_to', additionalFilters.price_to);
        if (additionalFilters.id_category) params.append('id_category', additionalFilters.id_category);
        
        // Параметры пагинации
        params.append('page', '1');
        params.append('size', '20');
        
        // Вызов API роута get_rents с методом get_filtered_rents
        const response = await fetch(`/rents/?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const rents = await response.json();
            displayRents(rents);
            
            // Показываем сообщение о количестве найденных результатов
            if (rents && rents.length > 0) {
                showSearchResultsMessage(rents.length, searchQuery);
            } else {
                showNoResultsMessage(searchQuery);
            }
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
 * Поиск через блок "Найдите идеальное жилье" с использованием get_filtered_rents
 */
async function performServiceSearch() {
    const locationInput = document.getElementById('serviceLocation');
    const arriveInput = document.getElementById('serviceArrive');
    const departInput = document.getElementById('serviceDepart');
    const guestsInput = document.getElementById('serviceGuests');
    
    const filters = {};
    
    // Основной поисковый запрос - местоположение
    let searchQuery = '';
    if (locationInput && locationInput.value.trim()) {
        searchQuery = locationInput.value.trim();
    }
    
    // Дополнительные фильтры
    if (arriveInput && arriveInput.value) {
        filters.available_from = arriveInput.value;
    }
    
    if (departInput && departInput.value) {
        filters.available_to = departInput.value;
    }
    
    if (guestsInput && guestsInput.value) {
        filters.guests = guestsInput.value;
    }
    
    // Вызов поиска с использованием get_filtered_rents
    if (searchQuery) {
        searchRents(searchQuery, filters);
    } else {
        alert('Введите местоположение для поиска');
    }
}

/**
 * Загрузка начальных объявлений через get_filtered_rents
 */
async function loadInitialRents() {
    try {
        const params = new URLSearchParams({
            page: '1',
            size: '6',
            active: 'true'  // Только активные объявления
        });
        
        const response = await fetch(`/rents/?${params.toString()}`, {
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
        listingsContainer.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p style="color: var(--muted); font-size: 16px;">Объявления не найдены</p>
                <p style="color: var(--muted); font-size: 14px; margin-top: 10px;">
                    Попробуйте изменить параметры поиска
                </p>
            </div>
        `;
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
        const detailsBtn = card.querySelector('.details');
        
        // Изображение
        if (rent.photos && rent.photos.length > 0) {
            thumb.src = rent.photos[0];
            thumb.alt = rent.title || 'Фото аренды';
        } else {
            thumb.src = '/default-rent.jpg';
            thumb.alt = 'Фото отсутствует';
        }
        
        // Заголовок
        if (title) {
            title.textContent = rent.title || 'Без названия';
        }
        
        // Мета-информация
        if (meta) {
            let metaText = '';
            if (rent.city) metaText += rent.city;
            if (rent.district || rent.address) metaText += `, ${rent.district || rent.address || ''}`;
            if (rent.beds) metaText += ` · ${rent.beds} ${getBedWord(rent.beds)}`;
            meta.textContent = metaText;
        }
        
        // Цена
        if (price) {
            price.textContent = rent.price ? `${formatPrice(rent.price)} ₽/ночь` : 'Цена не указана';
        }
        
        // Теги (опции)
        if (tags) {
            const options = [];
            if (rent.pet_friendly || rent.pet) options.push('Питомцы');
            if (rent.has_parking || rent.parking) options.push('Парковка');
            if (rent.has_wifi || rent.wifi) options.push('Wi-Fi');
            
            if (options.length > 0) {
                const tagPill = document.createElement('span');
                tagPill.className = 'tag-pill';
                tagPill.textContent = options.join(', ');
                tags.appendChild(tagPill);
            }
        }
        
        // Добавляем data-id для идентификации
        if (rent.id) {
            card.dataset.id = rent.id;
            if (detailsBtn) {
                detailsBtn.addEventListener('click', function() {
                    showRentDetails(card);
                });
            }
        }
        
        // Обработчик для кнопки избранного
        const favButton = card.querySelector('.fav');
        if (favButton) {
            // Проверяем, есть ли это объявление в избранном
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            if (rent.id && favorites.includes(rent.id.toString())) {
                favButton.setAttribute('aria-pressed', 'true');
            }
            
            favButton.addEventListener('click', function() {
                toggleFavorite(this);
            });
        }
        
        listingsContainer.appendChild(cardClone);
    });
    
    // Обновляем иконки после добавления новых элементов
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

/**
 * Показать сообщение о результатах поиска
 */
function showSearchResultsMessage(count, query) {
    // Создаем или обновляем сообщение о результатах
    let resultsMessage = document.getElementById('searchResultsMessage');
    if (!resultsMessage) {
        resultsMessage = document.createElement('div');
        resultsMessage.id = 'searchResultsMessage';
        resultsMessage.style.cssText = `
            margin: 10px 0 20px;
            padding: 12px;
            background: rgba(127, 211, 198, 0.1);
            border-radius: 8px;
            border-left: 4px solid var(--accent);
        `;
        
        const listingsContainer = document.getElementById('listings');
        if (listingsContainer && listingsContainer.parentNode) {
            listingsContainer.parentNode.insertBefore(resultsMessage, listingsContainer);
        }
    }
    
    resultsMessage.innerHTML = `
        <p style="margin: 0; color: #042018; font-size: 14px;">
            <strong>Найдено ${count} ${getResultWord(count)}</strong> по запросу: "${escapeHtml(query)}"
        </p>
        <button id="clearSearchBtn" style="
            margin-top: 8px;
            padding: 6px 12px;
            background: transparent;
            border: 1px solid var(--accent);
            border-radius: 6px;
            color: var(--accent);
            font-size: 13px;
            cursor: pointer;
        ">Очистить поиск</button>
    `;
    
    // Обработчик кнопки очистки поиска
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            // Очищаем поисковую строку
            const searchInput = document.getElementById('q');
            if (searchInput) {
                searchInput.value = '';
            }
            
            // Удаляем сообщение о результатах
            resultsMessage.remove();
            
            // Загружаем начальные объявления
            loadInitialRents();
        });
    }
}

/**
 * Показать сообщение об отсутствии результатов
 */
function showNoResultsMessage(query) {
    const listingsContainer = document.getElementById('listings');
    if (!listingsContainer) return;
    
    listingsContainer.innerHTML = `
        <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
            <p style="color: var(--muted); font-size: 16px; margin-bottom: 10px;">
                По запросу "${escapeHtml(query)}" ничего не найдено
            </p>
            <p style="color: var(--muted); font-size: 14px; margin-bottom: 20px;">
                Попробуйте изменить параметры поиска
            </p>
            <button id="tryOtherSearchBtn" class="btn" style="margin-top: 10px;">
                Попробовать другой запрос
            </button>
        </div>
    `;
    
    // Обработчик кнопки поиска другого запроса
    const tryOtherSearchBtn = document.getElementById('tryOtherSearchBtn');
    if (tryOtherSearchBtn) {
        tryOtherSearchBtn.addEventListener('click', function() {
            const searchInput = document.getElementById('q');
            if (searchInput) {
                searchInput.focus();
            }
        });
    }
}

/**
 * Получить правильное склонение слова "результат"
 */
function getResultWord(count) {
    if (count % 10 === 1 && count % 100 !== 11) {
        return 'результат';
    } else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) {
        return 'результата';
    } else {
        return 'результатов';
    }
}

/**
 * Получить правильное склонение слова "спальня"
 */
function getBedWord(count) {
    if (count === 1) {
        return 'спальня';
    } else if (count >= 2 && count <= 4) {
        return 'спальни';
    } else {
        return 'спален';
    }
}

/**
 * Форматирование цены
 */
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Переключение избранного
 */
function toggleFavorite(button) {
    const card = button.closest('.card');
    if (!card || !card.dataset.id) return;
    
    const rentId = card.dataset.id;
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const isPressed = button.getAttribute('aria-pressed') === 'true';
    
    if (isPressed) {
        // Удаляем из избранного
        favorites = favorites.filter(id => id !== rentId);
        button.setAttribute('aria-pressed', 'false');
        showNotification('Удалено из избранного', 'info');
    } else {
        // Добавляем в избранное
        if (!favorites.includes(rentId)) {
            favorites.push(rentId);
        }
        button.setAttribute('aria-pressed', 'true');
        showNotification('Добавлено в избранное', 'success');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

/**
 * Показать уведомление
 */
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        background: ${type === 'success' ? 'var(--accent)' : '#ff6b6b'};
        color: white;
        border-radius: 8px;
        box-shadow: var(--card-shadow);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
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
                if (rent.city) metaHTML += `<span>${escapeHtml(rent.city)}</span>`;
                if (rent.district || rent.address) metaHTML += ` · <span>${escapeHtml(rent.district || rent.address || '')}</span>`;
                if (rent.beds) metaHTML += ` · <span>${escapeHtml(rent.beds)} ${getBedWord(rent.beds)}</span>`;
                if (rent.price) metaHTML += ` · <span><strong>${formatPrice(rent.price)} ₽/ночь</strong></span>`;
                viewMeta.innerHTML = metaHTML;
            }
            
            // Теги
            if (viewTags) {
                viewTags.innerHTML = '';
                const options = [];
                if (rent.pet_friendly || rent.pet) options.push('Можно с питомцами');
                if (rent.has_parking || rent.parking) options.push('Есть парковка');
                if (rent.has_wifi || rent.wifi) options.push('Wi-Fi');
                
                options.forEach(option => {
                    const tag = document.createElement('span');
                    tag.className = 'tag-pill';
                    tag.textContent = option;
                    viewTags.appendChild(tag);
                });
            }
            
            // Изображение
            if (viewImg) {
                if (rent.photos && rent.photos.length > 0) {
                    viewImg.src = rent.photos[0];
                    viewImg.alt = rent.title || 'Фото аренды';
                } else {
                    viewImg.src = '/default-rent.jpg';
                    viewImg.alt = 'Фото отсутствует';
                }
            }
            
            // Показываем модальное окно
            if (viewModal) {
                viewModal.setAttribute('aria-hidden', 'false');
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке деталей:', error);
            showNotification('Не удалось загрузить детали объявления', 'error');
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
 * Отправка запроса помощи через роутер add_help
 */
async function submitHelpRequest() {
    const helpModal = document.getElementById('helpModal');
    if (!helpModal) return;
    
    const emailInput = helpModal.querySelector('input[type="email"]');
    const messageInput = helpModal.querySelector('textarea[name="message"]');
    
    if (!emailInput || !messageInput) {
        alert('Форма помощи не найдена');
        return;
    }
    
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    
    if (!email || !message) {
        alert('Заполните все поля формы');
        return;
    }
    
    if (!validateEmail(email)) {
        alert('Введите корректный email');
        return;
    }
    
    try {
        // Создаем данные для отправки
        const helpData = {
            email: email,
            message: message,
            created_at: new Date().toISOString()
        };
        
        // Вызов роутера add_help (предполагаем, что есть файл help.py)
        const response = await fetch('/help/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(helpData)
        });
        
        if (response.ok) {
            showNotification('Ваш вопрос отправлен. Мы свяжемся с вами в ближайшее время.', 'success');
            helpModal.setAttribute('aria-hidden', 'true');
            
            // Очищаем форму
            emailInput.value = '';
            messageInput.value = '';
        } else {
            // Если роутер не доступен, показываем демо-сообщение
            showNotification('Демо: Ваш вопрос отправлен. Мы свяжемся с вами в ближайшее время.', 'success');
            helpModal.setAttribute('aria-hidden', 'true');
            
            // Очищаем форму
            emailInput.value = '';
            messageInput.value = '';
        }
    } catch (error) {
        console.error('Ошибка при отправке вопроса:', error);
        showNotification('Демо: Ваш вопрос отправлен. Мы свяжемся с вами в ближайшее время.', 'success');
        helpModal.setAttribute('aria-hidden', 'true');
        
        // Очищаем форму
        emailInput.value = '';
        messageInput.value = '';
    }
}

/**
 * Обработка регистрации пользователя
 */
async function handleRegistration() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;
    
    const formData = new FormData(registerForm);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const password = formData.get('password');
    
    if (!name || !email || !password) {
        alert('Заполните все поля');
        return;
    }
    
    if (!validateEmail(email)) {
        alert('Введите корректный email');
        return;
    }
    
    if (password.length < 6) {
        alert('Пароль должен содержать не менее 6 символов');
        return;
    }
    
    try {
        // Создаем данные для отправки
        const userData = {
            name: name,
            email: email,
            password: password
        };
        
        // В демо-версии сохраняем в localStorage
        localStorage.setItem('ugol_user', JSON.stringify({
            name: name,
            email: email,
            registered_at: new Date().toISOString()
        }));
        
        showNotification(`Регистрация успешна! Добро пожаловать, ${name}!`, 'success');
        
        // Закрываем модальное окно
        const registerModal = document.getElementById('registerModal');
        if (registerModal) {
            registerModal.setAttribute('aria-hidden', 'true');
        }
        
        // Очищаем форму
        registerForm.reset();
        
        // Обновляем кнопку в навигации (теперь будет "Профиль")
        checkUserAuth();
        
        // Генерируем событие об изменении авторизации
        window.dispatchEvent(new CustomEvent('ugol:auth-change'));
        
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        showNotification('Ошибка при регистрации. Попробуйте еще раз.', 'error');
    }
}

/**
 * Валидация email
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Экранирование HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Глобальные функции для доступа из HTML
window.openHelpModal = openHelpModal;
window.openRegisterModal = openRegisterModal;
window.searchRents = searchRents;
window.performServiceSearch = performServiceSearch;

// Добавляем событие для обновления интерфейса при авторизации
window.addEventListener('storage', function(e) {
    if (e.key === 'ugol_user') {
        checkUserAuth();
    }
});

// Также обновляем при изменении localStorage из того же окна
window.addEventListener('ugol:auth-change', function() {
    checkUserAuth();
});

// Добавляем CSS анимации для уведомлений
const style = document.createElement('style');
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
`;
document.head.appendChild(style);