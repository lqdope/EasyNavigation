// === ТЕМА ===
const themeToggle = document.getElementById('themeToggle');
const htmlEl = document.documentElement;

function initTheme() {
  const saved = localStorage.getItem('theme');
  const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && darkMode)) {
    htmlEl.setAttribute('data-theme', 'dark');
  } else {
    htmlEl.removeAttribute('data-theme');
  }
}

function toggleTheme() {
  if (htmlEl.getAttribute('data-theme') === 'dark') {
    htmlEl.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    htmlEl.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
}

themeToggle.addEventListener('click', toggleTheme);
initTheme();

// === ДАННЫЕ ===
let data = JSON.parse(localStorage.getItem('navData')) || {
  'arzamas-1': {
    points: ['Вход', 'Кассы', 'Туалет'],
    routes: {
      'Вход|Кассы': './VID20250923213427.mp4',
      'Вход|Туалет': './document_5373327128966236948.mp4'
    }
  },
  'arzamas-2': {
    points: ['Главный вход'],
    routes: {}
  }
};

// DOM
const stationSelect = document.getElementById('stationSelect');
const pointA = document.getElementById('pointA');
const pointB = document.getElementById('pointB');
const playBtn = document.getElementById('playBtn');
const editBtn = document.getElementById('editBtn');
const editPanel = document.getElementById('editPanel');
const newPoint = document.getElementById('newPoint');
const addPointBtn = document.getElementById('addPointBtn');
const pointsList = document.getElementById('pointsList');
const routeFrom = document.getElementById('routeFrom');
const routeTo = document.getElementById('routeTo');
const videoUrl = document.getElementById('videoUrl');
const saveRouteBtn = document.getElementById('saveRouteBtn');
const routesList = document.getElementById('routesList');
const player = document.getElementById('player');
const playerLog = document.getElementById('playerLog');

let currentStation = 'arzamas-1';

function log(msg) {
  playerLog.textContent = msg;
}

function save() {
  localStorage.setItem('navData', JSON.stringify(data));
}

function fillSelects(points, ...selects) {
  selects.forEach(sel => {
    sel.innerHTML = '';
    points.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      sel.appendChild(opt);
    });
  });
}

function renderPoints() {
  const pts = data[currentStation].points;
  fillSelects(pts, pointA, pointB, routeFrom, routeTo);
}

function renderPointsList() {
  const pts = data[currentStation].points;
  pointsList.innerHTML = pts.map((p, i) => `
    <div class="pair-item">
      <span>${p}</span>
      <button class="icon-btn del-point" data-idx="${i}">✖</button>
    </div>
  `).join('');
  
  pointsList.querySelectorAll('.del-point').forEach(btn => {
    btn.onclick = () => {
      const idx = btn.dataset.idx;
      if (data[currentStation].points.length <= 1) {
        alert('Нельзя удалить последнюю точку');
        return;
      }
      data[currentStation].points.splice(idx, 1);
      save();
      renderPoints();
      renderPointsList();
      renderRoutesList();
      log('Точка удалена');
    };
  });
}

function renderRoutesList() {
  const routes = data[currentStation].routes;
  routesList.innerHTML = Object.entries(routes).map(([key, url]) => `
    <div class="pair-item">
      <div><strong>${key.replace('|', ' → ')}</strong><br><small>${url}</small></div>
      <button class="icon-btn del-route" data-key="${key}">✖</button>
    </div>
  `).join('');

  routesList.querySelectorAll('.del-route').forEach(btn => {
    btn.onclick = () => {
      delete data[currentStation].routes[btn.dataset.key];
      save();
      renderRoutesList();
      log('Маршрут удалён');
    };
  });
}

function playRoute() {
  const a = pointA.value;
  const b = pointB.value;
  const url = data[currentStation].routes[`${a}|${b}`];
  if (!url) return log('Видео не найдено');

  if (window.hls) window.hls.destroy();
  player.src = '';
  
  if (url.endsWith('.m3u8') && Hls.isSupported()) {
    const hls = new Hls();
    window.hls = hls;
    hls.loadSource(url);
    hls.attachMedia(player);
    hls.on(Hls.Events.MANIFEST_PARSED, () => player.play());
  } else {
    player.src = url;
    player.play();
  }
  log(`Воспроизведение: ${a} → ${b}`);
}

// === СОБЫТИЯ ===
stationSelect.onchange = () => {
  currentStation = stationSelect.value;
  renderPoints();
  log('Вокзал выбран');
};

playBtn.onclick = playRoute;

editBtn.onclick = () => {
  const show = editPanel.style.display !== 'block';
  editPanel.style.display = show ? 'block' : 'none';
  editBtn.textContent = show ? '← Назад' : '🛠️ Редактировать';
  if (show) {
    renderPoints();
    renderPointsList();
    renderRoutesList();
  }
};

addPointBtn.onclick = () => {
  const name = newPoint.value.trim();
  if (!name) return;
  if (data[currentStation].points.includes(name)) {
    log('Точка уже существует');
    return;
  }
  data[currentStation].points.push(name);
  save();
  renderPoints();
  renderPointsList();
  newPoint.value = '';
  log('Точка добавлена');
};

saveRouteBtn.onclick = () => {
  const a = routeFrom.value;
  const b = routeTo.value;
  const url = videoUrl.value.trim();
  if (!url) return log('Укажите ссылку');
  if (!url.endsWith('.mp4') && !url.endsWith('.m3u8')) {
    return log('Только .mp4 или .m3u8');
  }
  data[currentStation].routes[`${a}|${b}`] = url;
  save();
  renderRoutesList();
  log('Маршрут сохранён');
};

// Инициализация
renderPoints();
log('Готов.');