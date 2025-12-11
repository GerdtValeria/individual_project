// signup-handler.js
document.addEventListener('DOMContentLoaded', function() {
    // ==================== Навигация по логотипу и кнопкам ====================
    
    // Обработка клика на логотип (переход на главную)
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                const response = await fetch('/web/', {
                    method: 'GET'
                });
                if (response.ok) {
                    window.location.href = '/web/';
                } else {
                    console.error('Ошибка при переходе на главную');
                    window.location.href = '/web/'; // fallback
                }
            } catch (error) {
                console.error('Ошибка сети:', error);
                window.location.href = '/web/'; // fallback
            }
        });
    }

    // Обработка навигационных кнопок в шапке
    const navButtons = {
        'rent': '/web/', // роутер get_rent_html
        'list': '/web/', // роутер get_list_html
        'help': null,    // открытие модального окна
        'favorites': '/web/', // роутер get_favorites_html
        'signup': null   // текущая страница
    };

    // Обработка кликов по кнопкам в top-tabs
    document.querySelectorAll('.top-tabs .tab[data-tab]').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const tab = this.dataset.tab;
            
            if (tab === 'help') {
                // Открытие блока "Помощь"
                openHelpBlock();
                return;
            }
            
            if (navButtons[tab]) {
                try {
                    const response = await fetch(navButtons[tab], {
                        method: 'GET'
                    });
                    if (response.ok) {
                        window.location.href = navButtons[tab];
                    } else {
                        console.error(`Ошибка при переходе на ${tab}`);
                        // Fallback навигация
                        fallbackNavigation(tab);
                    }
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
            try {
                const response = await fetch('/web/', { // роутер get_favorites_html
                    method: 'GET'
                });
                if (response.ok) {
                    window.location.href = '/web/';
                } else {
                    console.error('Ошибка при переходе в избранное');
                    window.location.href = '/web/';
                }
            } catch (error) {
                console.error('Ошибка сети:', error);
                window.location.href = '/web/';
            }
        });
    }

    // ==================== Форма регистрации ====================
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            // Валидация
            if (!userData.name || !userData.email || !userData.password) {
                alert('Пожалуйста, заполните все поля');
                return;
            }
            
            if (!isValidEmail(userData.email)) {
                alert('Пожалуйста, введите корректный email');
                return;
            }
            
            if (userData.password.length < 6) {
                alert('Пароль должен содержать не менее 6 символов');
                return;
            }
            
            try {
                // Отправка запроса на регистрацию
                const response = await fetch('/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('Регистрация успешна:', result);
                    
                    // Автоматический вход после регистрации
                    await loginAfterRegistration(userData.email, userData.password);
                    
                } else if (response.status === 409) {
                    alert('Пользователь с таким email уже существует');
                } else {
                    const error = await response.json();
                    alert('Ошибка регистрации: ' + (error.detail || 'Неизвестная ошибка'));
                }
            } catch (error) {
                console.error('Ошибка при регистрации:', error);
                alert('Ошибка сети. Попробуйте позже.');
            }
        });
    }

    // ==================== Модальное окно входа ====================
    const openLoginBtn = document.getElementById('openLogin');
    const loginModal = document.getElementById('loginModal');
    const cancelLoginBtn = document.getElementById('cancelLogin');
    const loginForm = document.getElementById('loginForm');

    // Открытие модального окна входа
    if (openLoginBtn) {
        openLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginModal) {
                loginModal.setAttribute('aria-hidden', 'false');
                // Фокус на поле email
                setTimeout(() => {
                    const emailInput = loginModal.querySelector('input[name="email"]');
                    if (emailInput) emailInput.focus();
                }, 100);
            }
        });
    }

    // Закрытие модального окна входа
    if (cancelLoginBtn) {
        cancelLoginBtn.addEventListener('click', function() {
            if (loginModal) loginModal.setAttribute('aria-hidden', 'true');
        });
    }

    // Закрытие по клику на фон
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Форма входа
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const authData = {
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            // Валидация
            if (!authData.email || !authData.password) {
                alert('Пожалуйста, заполните все поля');
                return;
            }
            
            if (!isValidEmail(authData.email)) {
                alert('Пожалуйста, введите корректный email');
                return;
            }
            
            try {
                // Отправка запроса на авторизацию
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(authData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('Вход успешен:', result);
                    
                    // Закрытие модального окна
                    if (loginModal) loginModal.setAttribute('aria-hidden', 'true');
                    
                    // Переход в профиль
                    await navigateToProfile();
                    
                } else if (response.status === 404) {
                    alert('Пользователь не найден');
                } else if (response.status === 401) {
                    alert('Неверный пароль');
                } else {
                    const error = await response.json();
                    alert('Ошибка входа: ' + (error.detail || 'Неизвестная ошибка'));
                }
            } catch (error) {
                console.error('Ошибка при входе:', error);
                alert('Ошибка сети. Попробуйте позже.');
            }
        });
    }

    // ==================== Вспомогательные функции ====================
    
    // Функция открытия блока "Помощь"
    function openHelpBlock() {
        // Создаем блок помощи, если его нет
        let helpBlock = document.getElementById('helpBlock');
        if (!helpBlock) {
            helpBlock = document.createElement('div');
            helpBlock.id = 'helpBlock';
            helpBlock.className = 'overlay-block';
            helpBlock.setAttribute('aria-hidden', 'true');
            helpBlock.innerHTML = `
                <div class="overlay-dialog" role="dialog" aria-label="Помощь">
                    <button class="help-close" id="closeHelpBlock" aria-label="Закрыть">
                        <i></i>
                    </button>
                    <header class="modal-header">
                        <h3>Помощь</h3>
                    </header>
                    <div class="post-form" style="padding:20px; max-width:500px;">
                        <p>Здесь будет информация о помощи пользователям.</p>
                        <p>В демонстрационной версии этот блок показывает макет окна помощи.</p>
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
        }
        
        // Показываем блок
        helpBlock.setAttribute('aria-hidden', 'false');
        
        // Фокус на кнопке закрытия для доступности
        setTimeout(() => {
            const closeBtn = document.getElementById('closeHelpBlock');
            if (closeBtn) closeBtn.focus();
        }, 100);
    }

    // Функция для автоматического входа после регистрации
    async function loginAfterRegistration(email, password) {
        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Автоматический вход после регистрации:', result);
                
                // Переход в профиль
                await navigateToProfile();
            } else {
                // Если автоматический вход не удался, переходим на страницу входа
                alert('Регистрация прошла успешно! Теперь войдите в систему.');
                if (loginModal) {
                    loginModal.setAttribute('aria-hidden', 'false');
                    const emailInput = loginModal.querySelector('input[name="email"]');
                    if (emailInput) {
                        emailInput.value = email;
                        emailInput.focus();
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка автоматического входа:', error);
            alert('Регистрация прошла успешно! Теперь войдите в систему.');
            if (loginModal) {
                loginModal.setAttribute('aria-hidden', 'false');
                const emailInput = loginModal.querySelector('input[name="email"]');
                if (emailInput) {
                    emailInput.value = email;
                    emailInput.focus();
                }
            }
        }
    }

    // Функция перехода в профиль
    async function navigateToProfile() {
        try {
            const response = await fetch('/web/', { // роутер get_profile_html
                method: 'GET'
            });
            if (response.ok) {
                window.location.href = '/web/';
            } else {
                console.error('Ошибка при переходе в профиль');
                alert('Вход выполнен успешно!');
                window.location.href = '/web/'; // fallback на главную
            }
        } catch (error) {
            console.error('Ошибка сети при переходе в профиль:', error);
            alert('Вход выполнен успешно!');
            window.location.href = '/web/';
        }
    }

    // Функция валидации email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Fallback навигация для случаев ошибок сети
    function fallbackNavigation(tab) {
        const routes = {
            'rent': '/web/',
            'list': '/web/',
            'favorites': '/web/'
        };
        
        if (routes[tab]) {
            window.location.href = routes[tab];
        } else {
            window.location.href = '/web/';
        }
    }

    // ==================== Инициализация ====================
    console.log('Signup handler initialized');
});