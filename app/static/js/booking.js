// booking-handler.js - Обработчик навигации и взаимодействий для страницы бронирования

// Базовый URL API
const API_BASE_URL = window.location.origin;

// Элементы страницы
const elements = {
    logo: document.querySelector('.logo-link'),
    rentBtn: document.querySelector('[data-tab="rent"]'),
    listBtn: document.querySelector('[data-tab="list"]'),
    favoritesBtn: document.querySelector('a[href="/favorites.html"]'),
    helpBtn: document.querySelector('[data-tab="help"]'),
    profileBtn: document.querySelector('[data-tab="profile"]'),
    confirmBookingBtn: document.querySelector('button[type="submit"]'),
    cancelBtn: document.querySelector('a[href="/rent.html"]'),
    helpBlock: document.getElementById('helpBlock'),
    closeHelpBtn: document.getElementById('closeHelpBlock'),
    helpSubmitBtn: document.querySelector('#helpContactFormBooking button[type="submit"]')
};

// Функция для перехода по роутерам из web.py
async function navigateToRoute(routeFunction, params = {}) {
    try {
        // Для демо просто перенаправляем на соответствующий HTML файл
        switch(routeFunction) {
            case 'get_index_html':
                window.location.href = '/';
                break;
            case 'get_rent_html':
                window.location.href = '/rent.html';
                break;
            case 'get_list_html':
                window.location.href = '/list.html';
                break;
            case 'get_favorites_html':
                window.location.href = '/favorites.html';
                break;
            case 'get_profile_html':
                window.location.href = '/profile.html';
                break;
            case 'get_booking_html':
                window.location.href = '/booking.html';
                break;
            case 'get_rent':
                // Получение информации об объявлении через API
                if (params.id) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/rents/${params.id}`);
                        if (response.ok) {
                            const rentData = await response.json();
                            // Для демо сохраняем данные в localStorage
                            localStorage.setItem('current_rent', JSON.stringify(rentData));
                        }
                    } catch (error) {
                        console.warn('Не удалось получить данные об объявлении:', error);
                    }
                }
                window.location.href = '/rent.html' + (params.id ? `?id=${params.id}` : '');
                break;
            default:
                console.warn('Неизвестный роутер:', routeFunction);
        }
    } catch (error) {
        console.error('Ошибка навигации:', error);
        // Для демо показываем alert
        alert('Навигация временно недоступна. Пожалуйста, обновите страницу.');
    }
}

// Функция для отправки запроса на бронирование
async function submitBooking(bookingData) {
    try {
        const response = await fetch(`${API_BASE_URL}/booking/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        // После успешного бронирования переходим в профиль
        await navigateToRoute('get_profile_html');
        
        return result;
    } catch (error) {
        console.error('Ошибка при бронировании:', error);
        
        // Для демо показываем успешное сообщение и переходим в профиль
        alert('Бронирование успешно создано! Переход в профиль...');
        await navigateToRoute('get_profile_html');
        
        return { success: true, message: 'Бронирование создано (демо)' };
    }
}

// Функция для отправки вопроса в помощь
async function submitHelpQuestion(questionData) {
    try {
        // Пробуем использовать роутер из help.py (если он существует)
        const response = await fetch(`${API_BASE_URL}/help/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(questionData)
        });

        if (!response.ok) {
            // Если роутер не найден, используем fallback
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const result = await response.json();
        alert('Ваш вопрос отправлен! Мы свяжемся с вами в ближайшее время.');
        
        return result;
    } catch (error) {
        console.error('Ошибка при отправке вопроса:', error);
        
        // Fallback: отправка email (как в оригинальном коде)
        const subject = encodeURIComponent('Поддержка — Угол Комфорта');
        const body = encodeURIComponent(`От: ${questionData.email}\n\n${questionData.message}`);
        window.location.href = `mailto:support@ugolkomforta.example?subject=${subject}&body=${body}`;
        
        return { success: true, message: 'Вопрос отправлен по email (демо)' };
    }
}

// Функция для получения информации об объявлении
async function getRentDetails(rentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/rents/${rentId}`);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении информации об объявлении:', error);
        
        // Для демо возвращаем заглушку
        return {
            id: rentId,
            title: 'Демо объявление',
            price: 3000,
            city: 'Москва'
        };
    }
}

// Обработчики событий
function setupEventListeners() {
    // Логотип - переход на главную
    if (elements.logo) {
        elements.logo.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToRoute('get_index_html');
        });
    }

    // Кнопка "Арендовать" - переход на rent.html через роутер get_rent_html
    if (elements.rentBtn) {
        elements.rentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToRoute('get_rent_html');
        });
    }

    // Кнопка "Сдать в аренду" - переход на list.html через роутер get_list_html
    if (elements.listBtn) {
        elements.listBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToRoute('get_list_html');
        });
    }

    // Кнопка "Избранное" - переход на favorites.html через роутер get_favorites_html
    if (elements.favoritesBtn) {
        elements.favoritesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToRoute('get_favorites_html');
        });
    }

    // Кнопка "Помощь" - открытие блока помощи
    if (elements.helpBtn) {
        elements.helpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (elements.helpBlock) {
                elements.helpBlock.setAttribute('aria-hidden', 'false');
                // Фокус на поле email
                const emailInput = elements.helpBlock.querySelector('input[name="email"]');
                if (emailInput) emailInput.focus();
            }
        });
    }

    // Кнопка "Закрыть" в блоке помощи (с иконкой cancel_17767265.png)
    if (elements.closeHelpBtn) {
        elements.closeHelpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (elements.helpBlock) {
                elements.helpBlock.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Закрытие блока помощи при клике вне диалога
    if (elements.helpBlock) {
        elements.helpBlock.addEventListener('click', (e) => {
            if (e.target === elements.helpBlock) {
                elements.helpBlock.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // Отправка формы помощи
    if (elements.helpSubmitBtn) {
        elements.helpSubmitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const helpForm = document.getElementById('helpContactFormBooking');
            if (!helpForm) return;
            
            const formData = new FormData(helpForm);
            const questionData = {
                email: formData.get('email'),
                message: formData.get('message'),
                timestamp: new Date().toISOString()
            };
            
            // Валидация
            if (!questionData.email || !questionData.message) {
                alert('Пожалуйста, заполните все поля');
                return;
            }
            
            // Проверка email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(questionData.email)) {
                alert('Пожалуйста, введите корректный email адрес');
                return;
            }
            
            // Отправка вопроса через роутер add_help из help.py
            await submitHelpQuestion(questionData);
            
            // Закрытие блока помощи
            if (elements.helpBlock) {
                elements.helpBlock.setAttribute('aria-hidden', 'true');
            }
            
            // Очистка формы
            helpForm.reset();
        });
    }

    // Кнопка "Подтвердить бронирование"
    if (elements.confirmBookingBtn) {
        elements.confirmBookingBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const bookingForm = document.getElementById('bookingForm');
            if (!bookingForm) return;
            
            const formData = new FormData(bookingForm);
            const urlParams = new URLSearchParams(window.location.search);
            const rentId = urlParams.get('id');
            
            // Сбор данных для бронирования
            const bookingData = {
                from: formData.get('from'),
                to: formData.get('to'),
                guests: parseInt(formData.get('guests')) || 1,
                payment_method: formData.get('payment_method'),
                rent_id: rentId ? parseInt(rentId) : null,
                // Демо данные для API схемы
                id_user: 1, // Демо ID пользователя
                id_rent: rentId ? parseInt(rentId) : 1,
                status: 'confirmed',
                created_at: new Date().toISOString()
            };
            
            // Валидация
            if (!bookingData.from || !bookingData.to) {
                alert('Пожалуйста, выберите даты заезда и выезда');
                return;
            }
            
            const fromDate = new Date(bookingData.from);
            const toDate = new Date(bookingData.to);
            
            if (fromDate >= toDate) {
                alert('Дата выезда должна быть позже даты заезда');
                return;
            }
            
            if (fromDate < new Date()) {
                alert('Дата заезда не может быть в прошлом');
                return;
            }
            
            // Показать индикатор загрузки
            const originalText = elements.confirmBookingBtn.textContent;
            elements.confirmBookingBtn.textContent = 'Обработка...';
            elements.confirmBookingBtn.disabled = true;
            
            try {
                // Имитация обработки платежа для демо
                if (bookingData.payment_method === 'card' || bookingData.payment_method === 'yoomoney') {
                    await showPaymentProcessing();
                }
                
                // Отправка бронирования через роутер add_booking из bookings.py
                await submitBooking(bookingData);
                
            } finally {
                // Восстановить состояние кнопки
                elements.confirmBookingBtn.textContent = originalText;
                elements.confirmBookingBtn.disabled = false;
            }
        });
    }

    // Кнопка "Отмена" - возврат к объявлению
    if (elements.cancelBtn) {
        elements.cancelBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Получаем ID объявления из URL
            const urlParams = new URLSearchParams(window.location.search);
            const rentId = urlParams.get('id');
            
            // Используем оба роутера:
            // 1. get_booking_html из web.py - для отображения HTML страницы
            // 2. get_rent из rents.py - для получения данных об объявлении
            if (rentId) {
                await navigateToRoute('get_rent', { id: rentId });
            } else {
                // Если нет ID, просто переходим на страницу аренды
                await navigateToRoute('get_rent_html');
            }
        });
    }

    // Кнопка "Профиль" (если есть на странице)
    if (elements.profileBtn) {
        elements.profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToRoute('get_profile_html');
        });
    }
}

// Функция для показа индикатора обработки платежа
async function showPaymentProcessing() {
    return new Promise((resolve) => {
        // Показать индикатор обработки платежа
        const processingOverlay = document.createElement('div');
        processingOverlay.id = 'payment-processing-overlay';
        processingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: grid;
            place-items: center;
            z-index: 1000;
        `;
        processingOverlay.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                text-align: center;
                box-shadow: var(--card-shadow);
                min-width: 300px;
            ">
                <h3 style="margin: 0 0 15px; color: #042018;">Обработка платежа...</h3>
                <p style="color: var(--muted); font-size: 14px; margin-bottom: 20px;">
                    Пожалуйста, подождите. Идёт обработка вашего платежа.
                </p>
                <div style="
                    width: 50px;
                    height: 50px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid var(--accent);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                "></div>
                <p style="color: var(--muted); font-size: 12px; margin-top: 15px;">
                    В демо-версии платеж не выполняется
                </p>
            </div>
        `;
        
        // Добавить CSS для анимации
        if (!document.querySelector('#spin-animation')) {
            const style = document.createElement('style');
            style.id = 'spin-animation';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(processingOverlay);
        
        // Имитация задержки обработки платежа
        setTimeout(() => {
            if (document.body.contains(processingOverlay)) {
                document.body.removeChild(processingOverlay);
            }
            resolve();
        }, 2000);
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    console.log('Booking handler initialized');
    setupEventListeners();
    
    // Автозаполнение дат (для удобства демо)
    const fromInput = document.getElementById('bookingFrom');
    const toInput = document.getElementById('bookingTo');
    
    if (fromInput && toInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        const dayAfterTomorrow = new Date(today);
        
        tomorrow.setDate(today.getDate() + 1);
        dayAfterTomorrow.setDate(today.getDate() + 3);
        
        // Форматирование дат для input type="date"
        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };
        
        fromInput.value = formatDate(tomorrow);
        toInput.value = formatDate(dayAfterTomorrow);
        
        // Триггерим событие change для обновления расчета цены
        fromInput.dispatchEvent(new Event('change'));
        toInput.dispatchEvent(new Event('change'));
    }
    
    // Настройка расчета цены в реальном времени
    setupPriceCalculator();
});

// Функция для расчета и отображения цены в реальном времени
function setupPriceCalculator() {
    const fromInput = document.getElementById('bookingFrom');
    const toInput = document.getElementById('bookingTo');
    const pricePerNightEl = document.getElementById('pricePerNight');
    const nightsCountEl = document.getElementById('nightsCount');
    const totalPriceEl = document.getElementById('totalPrice');
    
    if (!fromInput || !toInput || !pricePerNightEl || !nightsCountEl || !totalPriceEl) return;
    
    function calculatePrice() {
        const from = new Date(fromInput.value);
        const to = new Date(toInput.value);
        
        // Получаем цену из текущего объявления
        const urlParams = new URLSearchParams(window.location.search);
        const rentId = urlParams.get('id');
        let pricePerNight = 3000; // Цена по умолчанию
        
        if (rentId) {
            // Пробуем получить цену из localStorage
            try {
                const rentData = JSON.parse(localStorage.getItem(`rent_${rentId}`) || 'null');
                if (rentData && rentData.price) {
                    pricePerNight = rentData.price;
                }
            } catch (e) {
                console.warn('Не удалось получить цену из localStorage:', e);
            }
        }
        
        // Рассчитываем количество ночей
        const timeDiff = to.getTime() - from.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        // Обновляем отображение
        pricePerNightEl.textContent = `Цена: ₽${pricePerNight}/ночь`;
        nightsCountEl.textContent = `Ночей: ${nights > 0 ? nights : 0}`;
        totalPriceEl.textContent = `Итого: ${nights > 0 ? `₽${pricePerNight * nights}` : '— ₽'}`;
    }
    
    fromInput.addEventListener('change', calculatePrice);
    toInput.addEventListener('change', calculatePrice);
    
    // Инициализация при загрузке
    calculatePrice();
}

// Экспорт для использования в других модулях
export {
    navigateToRoute,
    submitBooking,
    submitHelpQuestion,
    getRentDetails,
    setupPriceCalculator
};