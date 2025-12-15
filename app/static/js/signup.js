// signup-handler.js
document.addEventListener('DOMContentLoaded', function () {
  // ==================== Навигация по логотипу и кнопкам ====================

  // Логотип -> главная
  const logoLink = document.querySelector('.logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', function (e) {
      e.preventDefault();
      try {
        window.location.href = '/web/';
      } catch (error) {
        console.error('Ошибка сети:', error);
        window.location.href = '/web/';
      }
    });
  }

  // ==================== Кнопка "Отмена" в форме регистрации ====================

  const cancelBtn = document.querySelector('a.btn[href="/web/"], a.btn[href="/"]');
  if (cancelBtn && cancelBtn.textContent.includes('Отмена')) {
    cancelBtn.addEventListener('click', function (e) {
      e.preventDefault();
      console.log('Кнопка "Отмена" нажата - переход на главную страницу');
      try {
        window.location.href = '/web/';
      } catch (error) {
        console.error('Ошибка сети:', error);
        window.location.href = '/web/';
      }
    });
  }

  // ==================== Навигационные кнопки в шапке ====================

  const navButtons = {
    rent: '/web/rent',
    list: '/web/list',
    help: null,
    favorites: '/web/favorites',
    signup: '/web/auth' // страница регистрации
  };

  document.querySelectorAll('.top-tabs .tab[data-tab]').forEach((button) => {
    button.addEventListener('click', function (e) {
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

  // Кнопка "Избранное" как ссылка
  const favoritesLink = document.querySelector('a[href="/web/favorites"]');
  if (favoritesLink) {
    favoritesLink.addEventListener('click', function (e) {
      e.preventDefault();
      console.log('Кнопка "Избранное" нажата - переход на страницу избранного');
      try {
        window.location.href = '/web/favorites';
      } catch (error) {
        console.error('Ошибка сети:', error);
        window.location.href = '/web/favorites';
      }
    });
  }

  // ==================== Форма регистрации ====================

  const signupForm = document.getElementById('signupForm');

  if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role_id: 1   // или другой id роли, которая у тебя считается дефолтной
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
        // Регистрация пользователя
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
          let errorText = 'Неизвестная ошибка';
          try {
            const error = await response.json();
            if (error && error.detail) {
              errorText = error.detail;
            }
          } catch (_) {}
          alert('Ошибка регистрации: ' + errorText);
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

  // Открыть модал входа
  if (openLoginBtn) {
    openLoginBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (loginModal) {
        loginModal.setAttribute('aria-hidden', 'false');
        setTimeout(() => {
          const emailInput = loginModal.querySelector('input[name="email"]');
          if (emailInput) emailInput.focus();
        }, 100);
      }
    });
  }

  // Закрыть модал по кнопке "Отмена"
  if (cancelLoginBtn) {
    cancelLoginBtn.addEventListener('click', function () {
      console.log('Кнопка "Отмена" в блоке входа нажата - закрытие модального окна');
      if (loginModal) loginModal.setAttribute('aria-hidden', 'true');
    });
  }

  // Закрыть модал по клику на фон
  if (loginModal) {
    loginModal.addEventListener('click', function (e) {
      if (e.target === loginModal) {
        loginModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Отправка формы входа
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const authData = {
        email: formData.get('email'),
        password: formData.get('password')
      };

      if (!authData.email || !authData.password) {
        alert('Пожалуйста, заполните все поля');
        return;
      }

      if (!isValidEmail(authData.email)) {
        alert('Пожалуйста, введите корректный email');
        return;
      }

      try {
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
          if (loginModal) loginModal.setAttribute('aria-hidden', 'true');
          window.location.href = '/web/profile';
        } else if (response.status === 404) {
          alert('Пользователь не найден');
        } else if (response.status === 401) {
          alert('Неверный пароль');
        } else {
          let errorText = 'Неизвестная ошибка';
          try {
            const error = await response.json();
            if (error && error.detail) {
              errorText = error.detail;
            }
          } catch (_) {}
          alert('Ошибка входа: ' + errorText);
        }
      } catch (error) {
        console.error('Ошибка при входе:', error);
        alert('Ошибка сети. Попробуйте позже.');
      }
    });
  }

  // ==================== Вспомогательные функции ====================

  function openHelpBlock() {
    let helpBlock = document.getElementById('helpBlock');

    if (!helpBlock) {
      helpBlock = document.createElement('div');
      helpBlock.id = 'helpBlock';
      helpBlock.className = 'overlay-block';
      helpBlock.setAttribute('aria-hidden', 'true');
      helpBlock.innerHTML = ``;

      document.body.appendChild(helpBlock);

      const closeBtn = document.getElementById('closeHelpBlock');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          helpBlock.setAttribute('aria-hidden', 'true');
        });
      }

      helpBlock.addEventListener('click', (e) => {
        if (e.target === helpBlock) {
          helpBlock.setAttribute('aria-hidden', 'true');
        }
      });
    }

    helpBlock.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      const closeBtn = document.getElementById('closeHelpBlock');
      if (closeBtn) closeBtn.focus();
    }, 100);
  }

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
        window.location.href = '/web/profile';
      } else {
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

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function fallbackNavigation(tab) {
    const routes = {
      rent: '/web/rent',
      list: '/web/list',
      favorites: '/web/favorites'
    };
    if (routes[tab]) {
      window.location.href = routes[tab];
    } else {
      window.location.href = '/web/';
    }
  }

  console.log('Signup handler initialized');
});
