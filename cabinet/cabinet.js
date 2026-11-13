(() => {
  'use strict';

  const CATEGORIES = ['Вакансии', 'Подработка', 'Резюме', 'Услуги', 'Стройка и ремонт', 'Другое'];
  const KEY = 'rd.ads.v1';
  const FAV_KEY = 'rd.fav.v1';
  const MAX_PHOTOS = 5;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- Хранилище ----------
  const load = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const save = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  };

  let ads = load(KEY, []);
  let favs = new Set(load(FAV_KEY, []));
  const state = { tab: 'active', q: '', cat: '', sort: 'new' };
  let editingId = null;
  let formPhotos = [];

  const persist = () => {
    if (!save(KEY, ads)) alert('Не удалось сохранить: в браузере закончилось место. Удалите лишние фото или объявления.');
    save(FAV_KEY, [...favs]);
  };

  // ---------- Утилиты ----------
  const fmtPrice = (p) => (p > 0 ? `${Number(p).toLocaleString('ru-RU')} ₽` : 'Договорная');
  const fmtDate = (ts) => {
    const d = new Date(ts), now = new Date();
    const days = Math.floor((new Date(now.toDateString()) - new Date(d.toDateString())) / 864e5);
    const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    if (days === 0) return `Сегодня, ${time}`;
    if (days === 1) return `Вчера, ${time}`;
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };
  const plural = (n, [a, b, c]) => (n % 10 === 1 && n % 100 !== 11 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? b : c);

  // Уменьшаем фото, чтобы не забить localStorage
  const resizeImage = (file) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 900, k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });

  // ---------- Список ----------
  const visibleAds = () => {
    const q = state.q.trim().toLowerCase();
    let list = ads.filter((a) => {
      if (state.tab === 'fav') return favs.has(a.id) && !a.archived;
      return state.tab === 'archive' ? a.archived : !a.archived;
    });
    if (state.cat) list = list.filter((a) => a.category === state.cat);
    if (q) list = list.filter((a) => `${a.title} ${a.description} ${a.city}`.toLowerCase().includes(q));
    const by = {
      new: (a, b) => b.createdAt - a.createdAt,
      cheap: (a, b) => a.price - b.price,
      rich: (a, b) => b.price - a.price,
      views: (a, b) => b.views - a.views,
    }[state.sort];
    return list.sort(by);
  };

  const cardHTML = (a) => {
    const own = state.tab !== 'fav';
    const actions = !own ? '' : a.archived
      ? `<button class="btn" data-act="restore">Вернуть</button><button class="btn btn--danger" data-act="delete">Удалить</button>`
      : `<button class="btn" data-act="edit">Изменить</button><button class="btn" data-act="archive">В архив</button><button class="btn btn--danger" data-act="delete">Удалить</button>`;
    return `
      <article class="card" data-id="${a.id}">
        <button class="card__img" data-act="open" aria-label="Открыть: ${esc(a.title)}">
          ${a.photos[0] ? `<img src="${a.photos[0]}" alt="" style="width:100%;height:100%;object-fit:cover">` : '🖼'}
        </button>
        <span class="badge">${esc(a.category)}</span>
        <button class="fav" data-act="fav" aria-pressed="${favs.has(a.id)}" aria-label="В избранное">${favs.has(a.id) ? '♥' : '♡'}</button>
        <div class="card__body">
          <div class="card__price">${fmtPrice(a.price)}</div>
          <button class="card__title" data-act="open">${esc(a.title)}</button>
          <div class="card__meta">${esc(a.city)}</div>
          <div class="card__meta">${fmtDate(a.createdAt)} · 👁 ${a.views}</div>
        </div>
        ${actions ? `<div class="card__actions">${actions}</div>` : ''}
      </article>`;
  };

  const render = () => {
    const list = visibleAds();
    $('#grid').innerHTML = list.map(cardHTML).join('');

    const active = ads.filter((a) => !a.archived);
    $$('[data-count]').forEach((el) => {
      const k = el.dataset.count;
      const n = k === 'active' ? active.length : k === 'archive' ? ads.length - active.length : active.filter((a) => favs.has(a.id)).length;
      el.textContent = n ? `(${n})` : '';
    });
    const views = active.reduce((s, a) => s + a.views, 0);
    $('#stats').textContent = `${active.length} ${plural(active.length, ['активное объявление', 'активных объявления', 'активных объявлений'])} · ${views} ${plural(views, ['просмотр', 'просмотра', 'просмотров'])}`;

    const empty = $('#empty');
    empty.hidden = list.length > 0;
    if (!list.length) {
      const filtered = state.q || state.cat;
      const msg = filtered ? ['Ничего не найдено', 'Попробуйте изменить поиск или фильтры.']
        : state.tab === 'archive' ? ['Архив пуст', 'Сюда попадают снятые с публикации объявления.']
        : state.tab === 'fav' ? ['Избранного пока нет', 'Нажмите ♡ на карточке, чтобы сохранить объявление.']
        : ['У вас пока нет объявлений', 'Разместите первое — это займёт минуту.'];
      empty.innerHTML = `<h2>${msg[0]}</h2><p>${msg[1]}</p>${state.tab === 'active' && !filtered ? '<button class="btn btn--primary" data-act="new">+ Разместить объявление</button>' : ''}`;
    }
  };

  // ---------- Форма ----------
  const form = $('#form');
  const dlgForm = $('#dlg-form');

  const renderPhotos = () => {
    $('#photos').innerHTML = formPhotos.map((p, i) => `
      <div class="photo"><img src="${p}" alt="Фото ${i + 1}"><button type="button" data-rm="${i}" aria-label="Убрать фото">×</button></div>`).join('')
      + (formPhotos.length < MAX_PHOTOS ? '<button type="button" class="photo-add" id="photo-add" aria-label="Добавить фото">+</button>' : '');
  };

  const openForm = (ad) => {
    editingId = ad ? ad.id : null;
    form.reset();
    $('#form-error').hidden = true;
    $('#form-title').textContent = ad ? 'Редактирование' : 'Новое объявление';
    $('[type=submit]', form).textContent = ad ? 'Сохранить' : 'Опубликовать';
    formPhotos = ad ? [...ad.photos] : [];
    if (ad) {
      for (const k of ['title', 'category', 'city', 'phone', 'description']) form.elements[k].value = ad[k];
      form.elements.price.value = ad.price || '';
    } else {
      form.elements.city.value = localStorage.getItem('rd.city') || '';
      form.elements.phone.value = localStorage.getItem('rd.phone') || '';
    }
    renderPhotos();
    dlgForm.showModal();
  };

  const showError = (msg) => { const e = $('#form-error'); e.textContent = msg; e.hidden = false; };

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const f = form.elements;
    const data = {
      title: f.title.value.trim(),
      category: f.category.value,
      price: Math.max(0, Math.floor(Number(f.price.value) || 0)),
      city: f.city.value.trim(),
      phone: f.phone.value.trim(),
      description: f.description.value.trim(),
      photos: formPhotos,
    };
    if (!data.title || !data.city || !data.description) return showError('Заполните заголовок, город и описание.');
    if (data.phone.replace(/\D/g, '').length < 10) return showError('Укажите корректный телефон.');

    if (editingId) {
      Object.assign(ads.find((a) => a.id === editingId), data);
    } else {
      ads.push({ id: crypto.randomUUID(), createdAt: Date.now(), views: 0, archived: false, ...data });
      try { localStorage.setItem('rd.city', data.city); localStorage.setItem('rd.phone', data.phone); } catch {}
      state.tab = 'active';
      syncTabs();
    }
    persist();
    dlgForm.close();
    render();
  });

  $('#photo-input').addEventListener('change', async (ev) => {
    const files = [...ev.target.files].slice(0, MAX_PHOTOS - formPhotos.length);
    for (const file of files) {
      try { formPhotos.push(await resizeImage(file)); } catch { showError('Не удалось прочитать файл как изображение.'); }
    }
    ev.target.value = '';
    renderPhotos();
  });

  $('#photos').addEventListener('click', (ev) => {
    if (ev.target.closest('#photo-add')) return $('#photo-input').click();
    const rm = ev.target.closest('[data-rm]');
    if (rm) { formPhotos.splice(Number(rm.dataset.rm), 1); renderPhotos(); }
  });

  // ---------- Просмотр ----------
  const dlgView = $('#dlg-view');
  const openView = (id) => {
    const a = ads.find((x) => x.id === id);
    if (!a) return;
    if (!a.archived) { a.views++; persist(); render(); }
    $('#view').innerHTML = `
      <div class="view">
        <div class="view__gallery">${a.photos[0] ? `<img id="view-main" src="${a.photos[0]}" alt="">` : '<span style="font-size:3rem">🖼</span>'}</div>
        ${a.photos.length > 1 ? `<div class="view__thumbs">${a.photos.map((p, i) => `<img src="${p}" alt="Фото ${i + 1}" data-i="${i}" ${i === 0 ? 'aria-current="true"' : ''}>`).join('')}</div>` : ''}
        <div class="view__body">
          <div class="view__price">${fmtPrice(a.price)}</div>
          <h2>${esc(a.title)}</h2>
          <div class="muted">${esc(a.category)} · ${esc(a.city)} · ${fmtDate(a.createdAt)} · 👁 ${a.views}</div>
          <p class="view__desc">${esc(a.description)}</p>
          <div class="view__foot">
            <button class="btn btn--primary" id="show-phone" type="button">Показать телефон</button>
            <button class="btn" type="button" data-close>Закрыть</button>
          </div>
        </div>
      </div>`;
    $('#show-phone').addEventListener('click', (e) => {
      e.currentTarget.outerHTML = `<a class="btn btn--primary" href="tel:${esc(a.phone.replace(/[^\d+]/g, ''))}">${esc(a.phone)}</a>`;
    });
    $$('.view__thumbs img').forEach((t) => t.addEventListener('click', () => {
      $('#view-main').src = t.src;
      $$('.view__thumbs img').forEach((x) => x.removeAttribute('aria-current'));
      t.setAttribute('aria-current', 'true');
    }));
    dlgView.showModal();
  };

  // ---------- События ----------
  const syncTabs = () => $$('.tabs [role=tab]').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === state.tab));

  $('#btn-new').addEventListener('click', () => openForm());
  $('.tabs').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-tab]');
    if (b) { state.tab = b.dataset.tab; syncTabs(); render(); }
  });
  $('#search').addEventListener('input', (e) => { state.q = e.target.value; render(); });
  $('#f-cat').addEventListener('change', (e) => { state.cat = e.target.value; render(); });
  $('#f-sort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });

  document.addEventListener('click', (ev) => {
    if (ev.target.closest('[data-close]')) return ev.target.closest('dialog').close();
    const btn = ev.target.closest('[data-act]');
    if (!btn) return;
    const card = btn.closest('.card');
    const id = card && card.dataset.id;
    const ad = ads.find((a) => a.id === id);
    switch (btn.dataset.act) {
      case 'new': return openForm();
      case 'open': return openView(id);
      case 'edit': return openForm(ad);
      case 'fav': favs.has(id) ? favs.delete(id) : favs.add(id); break;
      case 'archive': ad.archived = true; break;
      case 'restore': ad.archived = false; break;
      case 'delete':
        if (!confirm('Удалить объявление безвозвратно?')) return;
        ads = ads.filter((a) => a.id !== id); favs.delete(id); break;
    }
    persist();
    render();
  });

  // Клик по фону закрывает диалог просмотра
  dlgView.addEventListener('click', (e) => { if (e.target === dlgView) dlgView.close(); });

  // ---------- Старт ----------
  $('#f-cat').innerHTML = '<option value="">Все категории</option>' + CATEGORIES.map((c) => `<option>${c}</option>`).join('');
  form.elements.category.innerHTML = CATEGORIES.map((c) => `<option>${c}</option>`).join('');
  render();
})();
