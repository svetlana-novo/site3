"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- 1. Переключение темы ---------- */
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");

  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("codestart-theme", theme);
  };

  const savedTheme = localStorage.getItem("codestart-theme")
    || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(savedTheme);

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  /* ---------- 2. Мобильное меню ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  burger.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("nav--open");
    burger.classList.toggle("burger--open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("nav--open");
      burger.classList.remove("burger--open");
      burger.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- 3. Аккордеон программы обучения ---------- */
  const accordionItems = document.querySelectorAll(".accordion__item");

  const closeItem = (item) => {
    item.classList.remove("accordion__item--open");
    item.querySelector(".accordion__body").style.maxHeight = null;
    item.querySelector(".accordion__header").setAttribute("aria-expanded", "false");
  };

  const openItem = (item) => {
    item.classList.add("accordion__item--open");
    const body = item.querySelector(".accordion__body");
    body.style.maxHeight = body.scrollHeight + "px";
    item.querySelector(".accordion__header").setAttribute("aria-expanded", "true");
  };

  accordionItems.forEach((item) => {
    item.querySelector(".accordion__header").addEventListener("click", () => {
      const isOpen = item.classList.contains("accordion__item--open");
      // Закрываем остальные (аккордеон — только один открытый)
      accordionItems.forEach(closeItem);
      if (!isOpen) openItem(item);
    });
  });

  // Открываем первый пункт по умолчанию
  if (accordionItems.length) openItem(accordionItems[0]);

  /* ---------- 4. Фильтрация модулей ---------- */
  const chips = document.querySelectorAll("#modulesFilters .chip");
  const moduleCards = document.querySelectorAll(".module-card");
  const modulesEmpty = document.getElementById("modulesEmpty");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("chip--active"));
      chip.classList.add("chip--active");

      const filter = chip.dataset.filter;
      let visibleCount = 0;

      moduleCards.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("module-card--hidden", !show);
        if (show) visibleCount++;
      });

      modulesEmpty.hidden = visibleCount > 0;
    });
  });

  /* ---------- 5. Анимация счётчиков в hero ---------- */
  const counters = document.querySelectorAll("[data-counter]");
  const animateCounter = (el) => {
    const target = Number(el.dataset.counter);
    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * progress).toLocaleString("ru-RU");
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => observer.observe(el));

  /* ---------- 6. Маска и валидация телефона ---------- */
  const phoneInput = document.getElementById("phone");

  phoneInput.addEventListener("input", () => {
    let digits = phoneInput.value.replace(/\D/g, "");
    if (digits.startsWith("8")) digits = "7" + digits.slice(1);
    if (!digits.startsWith("7")) digits = "7" + digits;
    digits = digits.slice(0, 11);

    let result = "+7";
    if (digits.length > 1)  result += " (" + digits.slice(1, 4);
    if (digits.length >= 4) result += ") " + digits.slice(4, 7);
    if (digits.length >= 7) result += "-" + digits.slice(7, 9);
    if (digits.length >= 9) result += "-" + digits.slice(9, 11);

    phoneInput.value = digits.length <= 1 ? "+7" : result;
  });

  /* ---------- 7. Валидация формы регистрации ---------- */
  const form = document.getElementById("registerForm");
  const modal = document.getElementById("successModal");
  const modalText = document.getElementById("modalText");

  const setError = (fieldName, message) => {
    const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
    const input = form.elements[fieldName];
    if (errorEl) errorEl.textContent = message;
    if (input && input.classList) input.classList.toggle("form__input--invalid", Boolean(message));
  };

  const validators = {
    name: (value) => {
      if (!value.trim()) return "Введите имя";
      if (value.trim().length < 2) return "Имя слишком короткое";
      return "";
    },
    email: (value) => {
      if (!value.trim()) return "Введите email";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return "Некорректный email";
      return "";
    },
    phone: (value) => {
      if (!value.trim()) return "Введите телефон";
      if (value.replace(/\D/g, "").length !== 11) return "Введите телефон полностью";
      return "";
    },
    module: (value) => (!value ? "Выберите модуль" : ""),
    agree: (_, input) => (input.checked ? "" : "Нужно согласие на обработку данных"),
  };

  // Валидация при отправке
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let isValid = true;

    Object.keys(validators).forEach((fieldName) => {
      const input = form.elements[fieldName];
      const message = validators[fieldName](input.value, input);
      setError(fieldName, message);
      if (message) isValid = false;
    });

    if (!isValid) return;

    // Успешная отправка — показываем модалку с данными
    const name = form.elements.name.value.trim();
    const moduleSelect = form.elements.module;
    const moduleName = moduleSelect.options[moduleSelect.selectedIndex].text;

    modalText.textContent = `${name}, спасибо за заявку на курс «${moduleName}»! Мы свяжемся с вами в течение часа.`;
    openModal();
    form.reset();
    form.querySelectorAll(".form__input--invalid").forEach((el) => el.classList.remove("form__input--invalid"));
  });

  // Очищаем ошибку при вводе
  form.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", () => setError(input.name, ""));
    input.addEventListener("change", () => setError(input.name, ""));
  });

  /* ---------- 8. Модальное окно ---------- */
  const openModal = () => {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = "";
  };

  modal.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });
});