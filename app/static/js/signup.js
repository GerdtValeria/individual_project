// signup-handler.js
document.addEventListener('DOMContentLoaded', () => {
  // ==================== Навигация по логотипу и кнопкам ====================

  const logoLink = document.querySelector('.logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/web/';
    });
  }

  const cancelBtn = document.querySelector('a.btn[href="/web/"], a.btn[href="/"]');
  if (cancelBtn && cancelBtn.textContent.includes('Отмена')) {
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/web/';
    });
  }

  const navButtons = {
    rent: '/web/rents',
    list: '/web/list',
    help: null,
    favorites: '/web/favorites',
    signup: '/web/auth'
  };

  document.querySelectorAll('.top-tabs .tab[data-tab]').forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = button.dataset.tab;
      if (tab === 'help') {
        openHelpBlock();
        return;
      }
      if (navButtons[tab]) {
        window.location.href = navButtons[tab];
      }
    });
  });

  const favoritesLink = document.querySelector('a[href="/web/favorites"]');
  if (favoritesLink) {
    favoritesLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/web/favorites';
    });
  }

  // ==================== Регистрация ====================

  const signupForm = document.getElementById('signupForm');

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(signupForm);
      const email = formData.get('email');
      const password = formData.get('password');

      const userData = {
        name: formData.get('name'),
        email,
        password,
        role_id: 1 // дефолтная роль пользователя
      };

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
        const response = await fetch('/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });

        if (response.ok) {
          // сразу пробуем залогиниться теми же email/паролем
          await loginAfterRegistration(email, password);
        } else if (response.status === 409) {
          alert('Пользователь с таким email уже существует');
        } else {
          const errorText = await extractErrorText(response);
          alert('Ошибка регистрации: ' + errorText);
        }
      } catch (err) {
        console.error('Ошибка при регистрации:', err);
        alert('Ошибка сети. Попробуйте позже.');
      }
    });
  }

  // ==================== Модальное окно входа ====================

  const openLoginBtn = document.getElementById('openLogin');
  const loginModal = document.getElementById('loginModal');
  const cancelLoginBtn = document.getElementById('cancelLogin');
  const loginForm = document.getElementById('loginForm');

  if (openLoginBtn) {
    openLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!loginModal) return;
      loginModal.setAttribute('aria-hidden', 'false');
      setTimeout(() => {
        const emailInput = loginModal.querySelector('input[name="email"]');
        if (emailInput) emailInput.focus();
      }, 100);
    });
  }

  if (cancelLoginBtn) {
    cancelLoginBtn.addEventListener('click', () => {
      if (loginModal) loginModal.setAttribute('aria-hidden', 'true');
    });
  }

  if (loginModal) {
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        loginModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(loginForm);
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authData)
        });

        if (response.ok) {
          await response.json(); // токен кладётся в cookie
          if (loginModal) loginModal.setAttribute('aria-hidden', 'true');
          window.location.href = '/web/profile';
        } else if (response.status === 404) {
          alert('Пользователь не найден');
        } else if (response.status === 401) {
          alert('Неверный пароль');
        } else {
          const errorText = await extractErrorText(response);
          alert('Ошибка входа: ' + errorText);
        }
      } catch (err) {
        console.error('Ошибка при входе:', err);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        await response.json();
        window.location.href = '/web/profile';
      } else {
        const errorText = await extractErrorText(response);
        console.warn('Автовход не удался:', errorText);
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
    } catch (err) {
      console.error('Ошибка автоматического входа:', err);
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

  async function extractErrorText(response) {
    try {
      const data = await response.json();
      if (!data || !data.detail) return 'Неизвестная ошибка';
      const d = data.detail;
      if (typeof d === 'string') return d;
      if (Array.isArray(d)) {
        return d.map((item) => item.msg || JSON.stringify(item)).join(', ');
      }
      return JSON.stringify(d);
    } catch {
      return 'Неизвестная ошибка';
    }
  }

  function fallbackNavigation(tab) {
    const routes = {
      rent: '/web/rent',
      list: '/web/list',
      favorites: '/web/favorites'
    };
    window.location.href = routes[tab] || '/web/';
  }

  console.log('Signup handler initialized');
});
