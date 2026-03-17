const urlMap = {
  "enter|platform-1": "./video/platform_1.mp4",
  "enter|platform-245": "./video/2_45pl.mp4",
  "enter|cassa": "./video/enter-cassa.mp4",
  "enter|restroom": "./video/wcroom.mp4",
  "enter|hall-enter-floor1": "./video/zal1.mp4",
  "enter|hall-enter-floor2": "./video/enter-zal2.mp4",
  "enter|camera-items": "./video/enter-camera.mp4",
  
  "platform-1|enter": "./video/platforms-vokzal.mp4",
  "platform-245|enter": "./video/platforms-vokzal.mp4",
  "restroom|enter": "./video/wc-exit.mp4",
  "hall-enter-floor1|enter": "./video/zal1-exit.mp4",
  "hall-enter-floor2|enter": "./video/zal-exit.mp4",
};
const fromSelect = document.getElementById("fromSelect");
const toSelect = document.getElementById("toSelect");
const applyBtn = document.getElementById("applyBtn");
const savePairBtn = document.getElementById("savePairBtn");
const player = document.getElementById("player");
const statusText = document.getElementById("statusText");
const currentUrlEl = document.getElementById("currentUrl");
const playerLog = document.getElementById("playerLog");
const pairsList = document.getElementById("pairsList");
const openBtn = document.getElementById("openBtn");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");

function log(text) {
  playerLog.textContent = "Лог: " + text;
}
function setStatus(text) {
  statusText.textContent = text;
}
function getKey(f, t) {
  return `${f}|${t}`;
}
function getUrlFor(f, t) {
  return urlMap[getKey(f, t)] || null;
}

function setVideoSrc(from, to) {
  const url = getUrlFor(from, to);
  if (!url) {
    setStatus("Ошибка");
    log("Для выбранной комбинации видео не найдено");
    return;
  }

  // handle HLS: basic approach, prefer native if available
  if (url.endsWith(".m3u8")) {
    if (player.canPlayType("application/vnd.apple.mpegurl")) {
      player.src = url;
      player.load();
      player.play().catch(() => {});
    } else if (window.Hls) {
      if (window.hlsInstance) {
        window.hlsInstance.destroy();
        window.hlsInstance = null;
      }
      const hls = new Hls();
      window.hlsInstance = hls;
      hls.loadSource(url);
      hls.attachMedia(player);
      hls.on(Hls.Events.MANIFEST_PARSED, () => player.play().catch(() => {}));
    } else {
      setStatus("HLS недоступен");
      log(
        "HLS-плейлист выбран, но hls.js не подключён и браузер не поддерживает HLS",
      );
      return;
    }
  } else {
    if (window.hlsInstance) {
      window.hlsInstance.destroy();
      window.hlsInstance = null;
    }
    player.pause();
    player.src = url;
    player.load();
    player.play().catch(() => {});
  }

  setStatus("Воспроизведение");
  currentUrlEl.textContent = url;
  log(`Запущено: ${from} → ${to}`);
}

// UI actions
applyBtn.addEventListener("click", () => {
  setVideoSrc(fromSelect.value, toSelect.value);
});

function renderPairs() {
  pairsList.innerHTML = "";
  savedPairs.forEach((key) => {
    const [from, to] = key.split("|");
    const li = document.createElement("li");
    li.className = "pair-item";
    li.innerHTML = `
      <div class="pair-label">${from} → ${to}</div>
      <div class="pair-actions">
        <button class="icon-btn play-btn" data-key="${key}" title="Запустить">▶</button>
        <button class="icon-btn edit-btn" data-key="${key}" title="Редактировать">✎</button>
        <button class="icon-btn del-btn" data-key="${key}" title="Удалить">✖</button>
      </div>
    `;
    pairsList.appendChild(li);
  });

  // attach listeners
  pairsList.querySelectorAll(".play-btn").forEach((b) => {
    b.addEventListener("click", (e) => {
      const key = e.currentTarget.dataset.key;
      const [f, t] = key.split("|");
      fromSelect.value = f;
      toSelect.value = t;
      setVideoSrc(f, t);
    });
  });
}

// // Extra buttons
// openBtn.addEventListener('click', ()=>{
//   const url = currentUrlEl.textContent;
//   if(!url || url==='—') return;
//   window.open(url, '_blank');
// });
// copyBtn.addEventListener('click', async ()=>{
//   const url = currentUrlEl.textContent;
//   if(!url || url==='—') return;
//   try{
//     await navigator.clipboard.writeText(url);
//     log('URL скопирован');
//   }catch{
//     log('Не удалось скопировать URL');
//   }
// });
// downloadBtn.addEventListener('click', ()=>{
//   const url = currentUrlEl.textContent;
//   if(!url || url==='—') return;
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = '';
//   document.body.appendChild(a);
//   a.click();
//   a.remove();
//   log('Начата загрузка (если доступно)');
// });

// initial render
//renderPairs();
//log('готов.');
