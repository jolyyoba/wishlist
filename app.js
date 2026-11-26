/**
 * bzik-style Wishlist Application (GitHub Pages + Supabase Ready)
 * - Supports shared Supabase REST API when SUPABASE_URL & SUPABASE_ANON_KEY are set
 * - Automatically falls back to localStorage when keys are empty (local preview mode)
 * - Multi-booking support for "money" (multiple friends can join without locking the card)
 * - Per-browser cancel tokens so guests can only cancel their own bookings
 */

// === НАСТРОЙКИ SUPABASE (заполните для общего доступа друзей) ===
const SUPABASE_URL = "https://iypmbxifqshzpjtvvlel.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cG1ieGlmcXNoenBqdHZ2bGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU2NTg4ODQsImV4cCI6MjExMTIzNDg4NH0.HREv3TwQ8RlD6J3bZIHfriS7Am316eJIArsU57hOUT8";
const SUPABASE_TABLE = "wishlist_bookings";

const STORAGE_KEY_LOCAL_BOOKINGS = "bzik_wishlist_bookings_v2";
const STORAGE_KEY_MY_TOKENS = "bzik_wishlist_my_tokens_v1";
const STORAGE_KEY_THEME = "bzik_wishlist_theme_v1";
const STORAGE_KEY_HAPTICS = "bzik_wishlist_haptics_v1";

const WISHLIST_ITEMS = [
  {
    id: "money",
    title: "Подарок деньгами",
    category: "Абсолютный приоритет",
    priority: true,
    allowMultiple: true,
    image: "assets/money.svg?v=3",
    imageAlt: "Иллюстрация золотой монетки",
    description: "",
    detailsHtml:
      '<div class="details-with-meme"><span>а чоу тут смотреть, деньги это деньги, ну всё понятно вроди</span><img src="assets/cat-meme.png" alt="Котик" class="details-meme-img" /></div>'
  },
  {
    id: "ssd",
    title: "SSD на 0.5–2 ТБ",
    category: "Накопители",
    priority: false,
    priceFrom: "от 7 000 ₽",
    image: "assets/ssd.svg",
    imageAlt: "Иллюстрация NVMe M.2 SSD накопителя",
    description:
      "ну вроде тут и так всё понятно, но если надо подробно распишу снизу",
    details:
      "желательно м.2 2280, но можно и обычный SATA/ база типо Kingston KC3000 / NV3, Samsung 980 / 990, WD Black SN770 / SN850X, ADATA Legend и так далее. крч хз че обьяснять."
  },
  {
    id: "gamepad",
    title: "Беспроводной геймпад с датчиками Холла",
    category: "Гейминг",
    priority: false,
    avito: true,
    priceFrom: "от 2 000 ₽",
    image: "assets/gamepad.svg",
    imageAlt: "Иллюстрация беспроводного геймпада 8BitDo с датчиками Холла",
    description:
      "8BitDo Ultimate или 8BitDo Pro 2 чёрного или белого цвета с датчиками Холла",
    details:
      "ну желательно конечно проверить что берете точно с датчиками холхла, но если без - пох. в целом можно две штучьки, если не лень, если лень - пох, один. ну и на авито если будут можно брать, я обеими руками за экологию"
  },
  {
    id: "pixel-buds",
    title: "Pixel Buds Pro 2",
    category: "Аудио",
    priority: false,
    priceFrom: "от 16 000 ₽",
    image: "assets/pixel-buds.svg",
    imageAlt: "Иллюстрация беспроводных наушников Pixel Buds Pro 2 в кейсе",
    description:
      "хуй кто купит, для себя распишу видимо",
    details:
      "надо именнно второе поколение, потому что прошлые про у меня сейчас. желательно Porcelain, но можно и Olive"
  },
  {
    id: "thinkpad",
    title: "Lenovo ThinkPad (не ниже i5-8xxx)",
    category: "Ноутбуки",
    priority: false,
    avito: true,
    priceFrom: "от 14 000 ₽",
    image: "assets/thinkpad.svg",
    imageAlt: "Иллюстрация ноутбука Lenovo ThinkPad с красным трекпоинтом",
    description:
      "Классический ThinkPad на базе процессора Intel Core i5 8-го поколения (i5-8xxx) или новее.",
    details:
      "можно T480, T480s, X280, T490 или L480. Желательно экран Full HD IPS (не TN), от 8–16 ГБ ОЗУ и живая батарея. На Авито много отличных корпоративных вариантов после лизинга, крч думаю тут тоже всё понятно, а если не понятно то в эпоху нейросетей живьом"
  },
  {
    id: "bedding",
    title: "Постельное бельё «Pragma»",
    category: "Дом и уют",
    priority: false,
    priceFrom: "от 2 000 ₽",
    image: "assets/bedding.svg",
    imageAlt: "Иллюстрация аккуратно сложенного комплекта постельного белья Pragma",
    description:
      "Комплект качественного постельного белья бренда «Pragma». По конкретным деталям и расцветке — лучше уточнить у Сони.",
    detailsHtml: `Бренд «Pragma» (продаётся на Яндекс Маркете). Чтобы не промахнуться с размером пододеяльника/простыни, тканью (сатин или варёный хлопок) и оттенком, перед покупкой обязательно напишите <a href="https://t.me/mezenceva_s" target="_blank" rel="noopener noreferrer" class="sonya-link">Соне</a> — она подскажет точный вариант.<div class="copy-handle-row"><button type="button" class="copy-handle-btn tactile-target" data-copy="@mezenceva_s"><span class="material-symbols-sharp" aria-hidden="true">content_copy</span><span>@mezenceva_s</span></button></div>`
  },
  {
    id: "mini-pc",
    title: "Мини-ПК Shuttle DH110",
    category: "Компактные ПК",
    priority: false,
    avito: true,
    priceFrom: "от 4 000 ₽",
    image: "assets/mini-pc.svg",
    imageAlt: "Иллюстрация компактного мини-ПК Shuttle DH110",
    description:
      "Компактный металлический корпус на LGA1151 с двумя LAN-портами и поддержкой 24/7 работы. Можно брать с Авито как barebone, так и в сборе (с процессором, DDR3L SO-DIMM и SSD) — главное, чтобы в комплекте был родной блок питания 19V.",
    detailsHtml:
      'очень желательно брать в сборе с памятью и накопителем, в целом можно взять <a href="https://www.avito.ru/suvorovskaya/nastolnye_kompyutery/mini_pk_shuttle_dh110_2_lan_i_ozu_do_32gb_lga1151_7983946816?utm_campaign=native&utm_medium=item_page_android&utm_source=soc_sharing" target="_blank" rel="noopener noreferrer" class="sonya-link">здесь</a>'
  },
  {
    id: "xreal",
    title: "Очки Xreal Air / другие очки Xreal",
    category: "AR-устройства",
    priority: false,
    avito: true,
    priceFrom: "от 10 000 ₽",
    image: "assets/xreal.svg",
    imageAlt: "Иллюстрация AR-очков Xreal Air",
    description:
      "Лёгкие очки дополненной реальности Xreal Air (или другая актуальная модель Xreal) для большого виртуального экрана в любом месте.",
    details:
      "крч не знаю что про них сказать, это просто хотелка\\прикол\\смеяка, в любом месте вывести изображение с телефона и смотреть юпуп как будто бы круто. в общем то прикол, не знаю как советы дать по покупке, кроме базы - проверить состояние, отсутствие царапин, по хорошему наличие комплекта."
  }
];

/* ==========================================================================
   State
   ========================================================================== */
const useSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Array of booking records: { id, item_id, reserver_name, note, cancel_token, created_at }
let bookingsList = [];
let myTokens = loadMyTokens();
let activeFilter = "all";
let expandedIds = new Set();
let hapticsEnabled = loadHapticsPref();
let pendingReserveId = null;
let lastFocusedElement = null;
let snackbarTimer = null;
let undoHandler = null;
let audioCtx = null;
let isSyncing = false;

/* ==========================================================================
   DOM Elements
   ========================================================================== */
const wishlistGrid = document.getElementById("wishlistGrid");
const emptyState = document.getElementById("emptyState");
const emptyTitle = document.getElementById("emptyTitle");
const emptyText = document.getElementById("emptyText");
const showAllBtn = document.getElementById("showAllBtn");

const progressCount = document.getElementById("progressCount");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const progressHint = document.getElementById("progressHint");

const countAll = document.getElementById("countAll");
const countAvailable = document.getElementById("countAvailable");
const countBooked = document.getElementById("countBooked");

const filterButtons = Array.from(document.querySelectorAll(".bzik-tab[data-filter]"));
const themeToggle = document.getElementById("themeToggle");
const hapticSoundToggle = document.getElementById("hapticSoundToggle");

const reserveModal = document.getElementById("reserveModal");
const reserveForm = document.getElementById("reserveForm");
const reservePreviewImg = document.getElementById("reservePreviewImg");
const reservePreviewTitle = document.getElementById("reservePreviewTitle");
const reservePreviewSub = document.getElementById("reservePreviewSub");
const reserverNameInput = document.getElementById("reserverNameInput");
const reserverNoteInput = document.getElementById("reserverNoteInput");
const cancelReserveModalBtn = document.getElementById("cancelReserveModalBtn");

const snackbar = document.getElementById("snackbar");
const snackbarText = document.getElementById("snackbarText");
const snackbarAction = document.getElementById("snackbarAction");

/* ==========================================================================
   Storage & Supabase API Layer
   ========================================================================== */
function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2, 11) + "-" + Date.now();
}

function loadMyTokens() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MY_TOKENS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMyTokens() {
  try {
    localStorage.setItem(STORAGE_KEY_MY_TOKENS, JSON.stringify(myTokens));
  } catch {
    // Ignore
  }
}

function loadLocalBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOCAL_BOOKINGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalBookings(list) {
  try {
    localStorage.setItem(STORAGE_KEY_LOCAL_BOOKINGS, JSON.stringify(list));
  } catch {
    // Ignore
  }
}

async function supabaseFetch(path, options = {}) {
  const url = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`;
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Supabase error ${res.status}: ${errText}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function fetchAllBookings() {
  if (!useSupabase) {
    bookingsList = loadLocalBookings();
    return;
  }
  const rows = await supabaseFetch(
    `${SUPABASE_TABLE}?select=id,item_id,reserver_name,note,created_at&order=created_at.asc`
  );
  bookingsList = Array.isArray(rows) ? rows : [];
}

async function createBookingRecord({ item_id, reserver_name, note }) {
  const cancel_token = generateId();

  if (!useSupabase) {
    const record = {
      id: generateId(),
      item_id,
      reserver_name,
      note,
      cancel_token,
      created_at: new Date().toISOString()
    };
    bookingsList.push(record);
    saveLocalBookings(bookingsList);
    myTokens[record.id] = cancel_token;
    saveMyTokens();
    return record;
  }

  // Check if single-item gift was already booked by someone else in the meantime
  const item = WISHLIST_ITEMS.find((x) => x.id === item_id);
  if (item && !item.allowMultiple) {
    const existing = await supabaseFetch(
      `${SUPABASE_TABLE}?item_id=eq.${encodeURIComponent(item_id)}&select=id`
    );
    if (Array.isArray(existing) && existing.length > 0) {
      await fetchAllBookings();
      throw new Error("ALREADY_BOOKED");
    }
  }

  const inserted = await supabaseFetch(SUPABASE_TABLE, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ item_id, reserver_name, note, cancel_token })
  });
  const record = Array.isArray(inserted) ? inserted[0] : inserted;
  if (record && record.id) {
    myTokens[record.id] = cancel_token;
    saveMyTokens();
    bookingsList.push(record);
  }
  return record;
}

async function deleteBookingRecord(bookingId) {
  if (!useSupabase) {
    bookingsList = bookingsList.filter((b) => b.id !== bookingId);
    saveLocalBookings(bookingsList);
    delete myTokens[bookingId];
    saveMyTokens();
    return;
  }

  await supabaseFetch(`${SUPABASE_TABLE}?id=eq.${encodeURIComponent(bookingId)}`, {
    method: "DELETE"
  });
  bookingsList = bookingsList.filter((b) => b.id !== bookingId);
  delete myTokens[bookingId];
  saveMyTokens();
}

function canCancelBooking(booking) {
  return Boolean(booking && myTokens[booking.id]);
}

/* ==========================================================================
   Haptics & Audio
   ========================================================================== */
function loadHapticsPref() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HAPTICS);
    return raw === null ? true : raw === "true";
  } catch {
    return true;
  }
}

function saveHapticsPref(val) {
  try {
    localStorage.setItem(STORAGE_KEY_HAPTICS, String(val));
  } catch {
    // Ignore
  }
}

function triggerHaptic(type = "tap") {
  if (!hapticsEnabled) return;

  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    const patterns = {
      tap: [8],
      expand: [4],
      select: [10, 14, 8],
      confirm: [14, 24, 20],
      cancel: [22, 24, 14],
      hero: [16, 20, 28]
    };
    navigator.vibrate(patterns[type] || patterns.tap);
  }

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === "suspended") audioCtx.resume();

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const profiles = {
      tap: { freqStart: 280, freqEnd: 120, duration: 0.024, volume: 0.035 },
      expand: { freqStart: 980, freqEnd: 340, duration: 0.009, volume: 0.022 },
      select: { freqStart: 420, freqEnd: 580, duration: 0.035, volume: 0.04 },
      confirm: { freqStart: 460, freqEnd: 760, duration: 0.065, volume: 0.05 },
      cancel: { freqStart: 320, freqEnd: 180, duration: 0.055, volume: 0.04 },
      hero: { freqStart: 540, freqEnd: 920, duration: 0.075, volume: 0.05 }
    };
    const p = profiles[type] || profiles.tap;
    osc.type = "triangle";
    osc.frequency.setValueAtTime(p.freqStart, now);
    osc.frequency.exponentialRampToValueAtTime(p.freqEnd, now + p.duration);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(p.volume, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + p.duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + p.duration + 0.01);
  } catch {
    // Ignore
  }
}

document.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".tactile-target")) {
    triggerHaptic("tap");
  }
});

/* ==========================================================================
   Theme & Admin UI
   ========================================================================== */
function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY_THEME);
  } catch {
    saved = null;
  }
  applyTheme(saved || "dark");
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", theme === "dark" ? "#000000" : "#F6F6F6");
  }
  try {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  } catch {
    // Ignore
  }
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
  triggerHaptic("select");
});

function updateHapticToggleUI() {
  hapticSoundToggle.setAttribute("aria-pressed", String(hapticsEnabled));
}

hapticSoundToggle.addEventListener("click", () => {
  hapticsEnabled = !hapticsEnabled;
  saveHapticsPref(hapticsEnabled);
  updateHapticToggleUI();
  if (hapticsEnabled) {
    triggerHaptic("select");
    showSnackbar("Тактильная отдача включена");
  } else {
    showSnackbar("Тактильная отдача выключена");
  }
});

/* ==========================================================================
   Rendering
   ========================================================================== */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderReserverIdentity(name) {
  const clean = (name || "").trim();
  if (!clean || clean === "Анонимный даритель") {
    return `<img src="assets/anon.jpg" alt="Аноним" title="Анонимный даритель" class="anon-avatar" />`;
  }
  return escapeHtml(clean);
}

function getItemBookings(itemId) {
  return bookingsList.filter((b) => b.item_id === itemId);
}

function renderWishlist() {
  const total = WISHLIST_ITEMS.length;
  const bookedCount = WISHLIST_ITEMS.filter((item) => getItemBookings(item.id).length > 0).length;
  const availableCount = WISHLIST_ITEMS.filter(
    (item) => item.allowMultiple || getItemBookings(item.id).length === 0
  ).length;

  countAll.textContent = total;
  countAvailable.textContent = availableCount;
  countBooked.textContent = bookedCount;

  progressCount.textContent = `${bookedCount} / ${total}`;
  const percent = Math.round((bookedCount / total) * 100);
  progressFill.style.width = `${percent}%`;
  progressBar.setAttribute("aria-valuenow", String(bookedCount));

  if (bookedCount === 0) {
    progressHint.textContent = "Все позиции пока свободны";
  } else if (bookedCount === total) {
    progressHint.textContent = "Все подарки из списка уже забронированы";
  } else {
    progressHint.textContent = `Свободных позиций: ${availableCount}`;
  }

  const filtered = WISHLIST_ITEMS.filter((item) => {
    const itemBookings = getItemBookings(item.id);
    const hasBooking = itemBookings.length > 0;
    if (activeFilter === "available") return item.allowMultiple || !hasBooking;
    if (activeFilter === "booked") return hasBooking;
    return true;
  });

  wishlistGrid.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.hidden = false;
    if (activeFilter === "booked") {
      emptyTitle.textContent = "Пока нет забронированных подарков";
      emptyText.textContent = "Выберите любой свободный подарок из общего списка и нажмите «Забронировать».";
    } else {
      emptyTitle.textContent = "Все подарки уже забронированы";
      emptyText.textContent = "Свободных позиций не осталось.";
    }
    return;
  }

  emptyState.hidden = true;

  filtered.forEach((item, index) => {
    const itemBookings = getItemBookings(item.id);
    const isSingleBooked = !item.allowMultiple && itemBookings.length > 0;
    const singleBooking = isSingleBooked ? itemBookings[0] : null;
    const isExpanded = expandedIds.has(item.id);

    const card = document.createElement("article");
    card.className = [
      "gift-card",
      item.priority ? "gift-card--priority" : "",
      isSingleBooked ? "is-booked" : "",
      isExpanded ? "is-expanded" : ""
    ]
      .filter(Boolean)
      .join(" ");
    card.dataset.cardId = item.id;
    card.setAttribute("aria-expanded", String(isExpanded));
    card.style.animationDelay = `${Math.min(index * 40, 240)}ms`;

    const priorityBadge = item.priority
      ? `<span class="gift-badge gift-badge--priority pixel-font">★ АБСОЛЮТНЫЙ ПРИОРИТЕТ</span>`
      : "";

    const bookedBadge = isSingleBooked
      ? `<span class="gift-badge gift-badge--booked pixel-font">ЗАБРОНИРОВАНО</span>`
      : item.allowMultiple && itemBookings.length > 0
      ? `<span class="gift-badge gift-badge--booked pixel-font">УЧАСТНИКОВ: ${itemBookings.length}</span>`
      : "";

    const priceBadgeHtml = item.priceFrom
      ? `<span class="price-badge pixel-font">${escapeHtml(item.priceFrom)}</span>`
      : "";

    const avitoBadgeHtml = item.avito
      ? `<span class="avito-badge pixel-font">можно с Авито</span>`
      : "";

    const metaBadgesHtml =
      priceBadgeHtml || avitoBadgeHtml
        ? `<div class="gift-card__meta-badges">${priceBadgeHtml}${avitoBadgeHtml}</div>`
        : "";

    const categoryHtml = item.priority
      ? ""
      : `<span class="gift-card__category pixel-font">${escapeHtml(item.category)}</span>`;

    const metaRowHtml =
      categoryHtml || metaBadgesHtml
        ? `<div class="gift-card__meta-row">${categoryHtml}${metaBadgesHtml}</div>`
        : "";

    const descHtml = item.description
      ? `<p class="gift-card__desc">${escapeHtml(item.description)}</p>`
      : "";

    const detailsBody = item.detailsHtml ? item.detailsHtml : escapeHtml(item.details || "");
    const detailsHtml =
      item.details || item.detailsHtml
        ? `<div class="gift-card__expand-hint pixel-title-font">
             <span>${isExpanded ? "[ − свернуть ]" : "[ + подробнее ]"}</span>
           </div>
           <div class="gift-card__details-wrap">
             <div class="gift-card__details-inner">
               <div class="gift-card__details">${detailsBody}</div>
             </div>
           </div>`
        : "";

    // Booking status block (single vs multi)
    let bookingMetaHtml = "";
    if (item.allowMultiple && itemBookings.length > 0) {
      const listHtml = itemBookings
        .map((b) => {
          const canCancelThis = canCancelBooking(b);
          return `<div class="multi-booking-item">
            <div class="multi-booking-item__info">
              <span class="multi-booking-item__name">${renderReserverIdentity(b.reserver_name)}</span>
              ${b.note ? `<span class="multi-booking-item__note">${escapeHtml(b.note)}</span>` : ""}
            </div>
            ${
              canCancelThis
                ? `<button type="button" class="multi-booking-cancel tactile-target" data-action="cancel-one" data-booking-id="${escapeHtml(b.id)}">Отменить</button>`
                : ""
            }
          </div>`;
        })
        .join("");

      bookingMetaHtml = `<div class="multi-bookings">
        <span class="multi-bookings__title">УЖЕ ОТМЕТИЛИСЬ (${itemBookings.length}):</span>
        ${listHtml}
      </div>`;
    } else if (singleBooking) {
      bookingMetaHtml = `<div class="booking-meta">
        <div>
          <span class="booking-meta__who">Бронь: ${renderReserverIdentity(singleBooking.reserver_name)}</span>
          ${singleBooking.note ? `<span class="booking-meta__note">${escapeHtml(singleBooking.note)}</span>` : ""}
        </div>
      </div>`;
    }

    // Action button
    let actionButtonHtml = "";
    if (item.allowMultiple) {
      actionButtonHtml = `<button type="button" class="bzik-btn bzik-btn--primary bzik-btn--full tactile-target" data-action="reserve" data-id="${item.id}">
        <span>Поучаствовать / Отметиться</span>
      </button>`;
    } else if (singleBooking) {
      if (canCancelBooking(singleBooking)) {
        actionButtonHtml = `<button type="button" class="bzik-btn bzik-btn--ghost bzik-btn--full tactile-target" data-action="cancel-one" data-booking-id="${escapeHtml(singleBooking.id)}">
          <span>Отменить бронь</span>
        </button>`;
      } else {
        actionButtonHtml = `<button type="button" class="bzik-btn bzik-btn--locked bzik-btn--full" disabled>
          <span>Уже занято</span>
        </button>`;
      }
    } else {
      actionButtonHtml = `<button type="button" class="bzik-btn bzik-btn--primary bzik-btn--full tactile-target" data-action="reserve" data-id="${item.id}">
        <span>Забронировать</span>
      </button>`;
    }

    const priorityBgCoins = item.priority
      ? `<div class="priority-coins-bg" aria-hidden="true">
           <img src="assets/money.svg?v=3" alt="" class="bg-coin bg-coin--1" />
           <img src="assets/money.svg?v=3" alt="" class="bg-coin bg-coin--2" />
           <img src="assets/money.svg?v=3" alt="" class="bg-coin bg-coin--3" />
           <img src="assets/money.svg?v=3" alt="" class="bg-coin bg-coin--4" />
           <img src="assets/money.svg?v=3" alt="" class="bg-coin bg-coin--5" />
           <img src="assets/money.svg?v=3" alt="" class="bg-coin bg-coin--6" />
           <img src="assets/money.svg?v=3" alt="" class="bg-coin bg-coin--7" />
         </div>`
      : "";

    card.innerHTML = `
      ${priorityBgCoins}
      <div class="gift-card__media">
        <img src="${item.image}" alt="${escapeHtml(item.imageAlt)}" loading="lazy" />
        ${priorityBadge}
        ${bookedBadge}
      </div>
      <div class="gift-card__body">
        ${metaRowHtml}
        <h2 class="gift-card__title pixel-title-font">${escapeHtml(item.title)}</h2>
        ${descHtml}
        ${detailsHtml}
        <div class="gift-card__spacer"></div>
        ${bookingMetaHtml}
        <div class="gift-card__actions">
          ${actionButtonHtml}
        </div>
      </div>
    `;

    wishlistGrid.appendChild(card);
  });
}

/* ==========================================================================
   Events: Filters, Card Expand, Copy, Links, Book/Cancel
   ========================================================================== */
function setFilter(filterName) {
  activeFilter = filterName;
  filterButtons.forEach((btn) => {
    const selected = btn.dataset.filter === filterName;
    btn.classList.toggle("is-selected", selected);
    btn.setAttribute("aria-selected", String(selected));
  });
  triggerHaptic("select");
  renderWishlist();
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => setFilter(btn.dataset.filter));
});

showAllBtn.addEventListener("click", () => setFilter("all"));

wishlistGrid.addEventListener("click", (e) => {
  const copyBtn = e.target.closest("button[data-copy]");
  if (copyBtn) {
    e.stopPropagation();
    const text = copyBtn.dataset.copy;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    triggerHaptic("confirm");
    showSnackbar(`Скопировано: ${text}`);
    return;
  }

  if (e.target.closest("a")) {
    e.stopPropagation();
    triggerHaptic("select");
    return;
  }

  const btn = e.target.closest("button[data-action]");
  if (btn) {
    e.stopPropagation();
    const { action, id, bookingId } = btn.dataset;
    if (action === "reserve") openReserveModal(id, btn);
    else if (action === "cancel-one") handleCancelOne(bookingId);
    return;
  }

  const card = e.target.closest(".gift-card[data-card-id]");
  if (!card) return;
  const cardId = card.dataset.cardId;
  const nowExpanded = !expandedIds.has(cardId);
  if (nowExpanded) expandedIds.add(cardId);
  else expandedIds.delete(cardId);

  card.classList.toggle("is-expanded", nowExpanded);
  card.setAttribute("aria-expanded", String(nowExpanded));
  const hint = card.querySelector(".gift-card__expand-hint span");
  if (hint) hint.textContent = nowExpanded ? "[ − свернуть ]" : "[ + подробнее ]";
  triggerHaptic("expand");
});

function openReserveModal(id, triggerEl) {
  const item = WISHLIST_ITEMS.find((x) => x.id === id);
  if (!item) return;

  pendingReserveId = id;
  lastFocusedElement = triggerEl || document.activeElement;

  reservePreviewImg.src = item.image;
  reservePreviewImg.alt = item.imageAlt;
  reservePreviewTitle.textContent = item.title;
  reservePreviewSub.textContent = item.category;

  reserverNameInput.value = "";
  reserverNoteInput.value = "";

  reserveModal.hidden = false;
  reserveModal.setAttribute("aria-hidden", "false");
  setTimeout(() => reserverNameInput.focus(), 40);
}

function closeReserveModal() {
  reserveModal.hidden = true;
  reserveModal.setAttribute("aria-hidden", "true");
  pendingReserveId = null;
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

cancelReserveModalBtn.addEventListener("click", closeReserveModal);
reserveModal.addEventListener("click", (e) => {
  if (e.target === reserveModal) closeReserveModal();
});

reserveForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!pendingReserveId || isSyncing) return;

  const id = pendingReserveId;
  const item = WISHLIST_ITEMS.find((x) => x.id === id);
  const reserver_name = reserverNameInput.value.trim() || "Анонимный даритель";
  const note = reserverNoteInput.value.trim();

  isSyncing = true;
  try {
    await createBookingRecord({ item_id: id, reserver_name, note });
    closeReserveModal();
    triggerHaptic(item && item.priority ? "hero" : "confirm");
    renderWishlist();
    showSnackbar(
      item && item.allowMultiple
        ? `Вы отметились в «${item.title}»`
        : `«${item ? item.title : "Подарок"}» забронирован`
    );
  } catch (err) {
    closeReserveModal();
    renderWishlist();
    if (err && err.message === "ALREADY_BOOKED") {
      showSnackbar("Этот подарок только что успел забронировать кто-то другой");
    } else {
      showSnackbar("Не удалось сохранить бронь. Попробуйте ещё раз");
    }
  } finally {
    isSyncing = false;
  }
});

async function handleCancelOne(bookingId) {
  if (!bookingId || isSyncing) return;
  const target = bookingsList.find((b) => b.id === bookingId);
  if (!target || !canCancelBooking(target)) return;

  const item = WISHLIST_ITEMS.find((x) => x.id === target.item_id);
  isSyncing = true;
  try {
    await deleteBookingRecord(bookingId);
    triggerHaptic("cancel");
    renderWishlist();
    showSnackbar(`Бронь снята: «${item ? item.title : "Подарок"}»`);
  } catch {
    showSnackbar("Ошибка при отмене брони");
  } finally {
    isSyncing = false;
  }
}

/* ==========================================================================
   Snackbar & Keyboard
   ========================================================================== */
function showSnackbar(message, actionLabel = null, onAction = null) {
  clearTimeout(snackbarTimer);
  snackbarText.textContent = message;
  if (actionLabel && typeof onAction === "function") {
    snackbarAction.textContent = actionLabel;
    snackbarAction.hidden = false;
    undoHandler = onAction;
  } else {
    snackbarAction.hidden = true;
    undoHandler = null;
  }
  snackbar.hidden = false;
  snackbarTimer = setTimeout(() => {
    snackbar.hidden = true;
    undoHandler = null;
  }, 4800);
}

snackbarAction.addEventListener("click", () => {
  if (typeof undoHandler === "function") undoHandler();
  clearTimeout(snackbarTimer);
  snackbar.hidden = true;
  undoHandler = null;
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!reserveModal.hidden) closeReserveModal();
  }
});

/* ==========================================================================
   Init
   ========================================================================== */
async function init() {
  initTheme();
  updateHapticToggleUI();
  try {
    await fetchAllBookings();
  } catch {
    bookingsList = loadLocalBookings();
    showSnackbar("Не удалось подключиться к базе — включён локальный режим");
  }
  renderWishlist();
}

init();
