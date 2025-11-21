/* Config */
const MAX_MB = 500; // смените при необходимости
const UPLOAD_URL = '/api/upload'; // <- ваш endpoint (Express)
const FORM_FIELD_NAME = 'video';

 /* Elements */
const drop = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const selectBtn = document.getElementById('selectBtn');
const clearBtn = document.getElementById('clearBtn');
const preview = document.getElementById('preview');
const previewVideo = document.getElementById('previewVideo');
const fileInfo = document.getElementById('fileInfo');
const uploadBtn = document.getElementById('uploadBtn');
const removeBtn = document.getElementById('removeBtn');
const progressWrap = document.getElementById('progressWrap');
const progressBar = document.getElementById('progressBar');
const percentText = document.getElementById('percentText');
const statusText = document.getElementById('statusText');
const cancelBtn = document.getElementById('cancelBtn');
const errorMsg = document.getElementById('errorMsg');
const backBtn = document.getElementById('backBtn');
document.getElementById('maxSizeLabel').textContent = MAX_MB;

let currentFile = null;
let xhr = null;

/* Helpers */
function showError(text){
  errorMsg.style.display='block';
  errorMsg.textContent = text;
}
function clearError(){
  errorMsg.style.display='none';
  errorMsg.textContent = '';
}
function bytesToMB(n){ return (n/1024/1024).toFixed(1) }
function resetUI(){
  currentFile = null;
  preview.style.display='none';
  previewVideo.src = '';
  fileInfo.textContent = '—';
  progressWrap.style.display='none';
  progressBar.style.width = '0%';
  percentText.textContent='0%';
  statusText.textContent='Ожидание';
  clearError();
}

/* File handling */
function handleFile(file){
  clearError();
  if(!file) return;
  if(!file.type.startsWith('video/')){
    showError('Неверный формат: выберите видео-файл.');
    return;
  }
  const sizeMB = file.size / 1024 / 1024;
  if(sizeMB > MAX_MB){
    showError(`Файл слишком большой — максимум ${MAX_MB} MB.`);
    return;
  }
  currentFile = file;
  // preview
  const url = URL.createObjectURL(file);
  previewVideo.src = url;
  preview.style.display = 'block';
  fileInfo.textContent = `${file.name} · ${bytesToMB(file.size)} MB`;
  progressWrap.style.display='none';
}

/* Input events */
selectBtn.addEventListener('click', ()=> fileInput.click());
drop.addEventListener('click', ()=> fileInput.click());
fileInput.addEventListener('change', e => handleFile(e.target.files[0]));

/* Drag & drop (mobile-friendly) */
['dragenter','dragover'].forEach(ev=>{
  drop.addEventListener(ev, (e)=>{
    e.preventDefault(); e.stopPropagation();
    drop.classList.add('dragover');
  });
});
['dragleave','drop','dragend'].forEach(ev=>{
  drop.addEventListener(ev, (e)=>{
    e.preventDefault(); e.stopPropagation();
    drop.classList.remove('dragover');
  });
});
drop.addEventListener('drop', e=>{
  const f = (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) || null;
  if(f) handleFile(f);
});

/* Remove / Clear */
removeBtn.addEventListener('click', ()=> resetUI());
clearBtn.addEventListener('click', ()=> {
  fileInput.value='';
  resetUI();
});

/* Upload */
uploadBtn.addEventListener('click', ()=> {
  if(!currentFile){ showError('Выберите файл для загрузки.'); return; }
  startUpload(currentFile);
});

function startUpload(file){
  clearError();
  progressWrap.style.display='block';
  statusText.textContent='Загрузка...';
  progressBar.style.width='0%';
  percentText.textContent='0%';

  xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:3000/api/upload', true);

  xhr.upload.onprogress = function(e){
    if(e.lengthComputable){
      const pct = Math.round((e.loaded / e.total) * 100);
      progressBar.style.width = pct + '%';
      percentText.textContent = pct + '%';
    }
  };

  xhr.onload = function(){
    if(xhr.status >= 200 && xhr.status < 300){
      statusText.textContent = 'Готово';
      progressBar.style.width = '100%';
      percentText.textContent = '100%';
      try{
        const res = JSON.parse(xhr.responseText || '{}');
        // сервер возвращает массив файлов (req.files)
        alert(`Загрузка завершена. Название файла: ${xhr.responseText}`);
        resetUI();
      }catch(e){
        alert(`Загрузка завершена. Название файла: ${xhr.responseText}`);
        resetUI();
      }
    } else {
      statusText.textContent = 'Ошибка';
      showError('Сервер вернул ошибку: ' + xhr.status);
    }
    xhr = null;
  };

  xhr.onerror = function(){
    statusText.textContent = 'Ошибка';
    showError('Ошибка сети при загрузке.');
    xhr = null;
  };

  xhr.onabort = function(){
    statusText.textContent = 'Отменено';
    showError('Загрузка была отменена.');
    xhr = null;
  };

  const form = new FormData();
  // IMPORTANT: multer настроен на поле 'photos' и максимум 2 файла.
  // Мы отправляем одно видео как поле 'photos' (массив файлов). При необходимости
  // можно отправлять несколько файлов: form.append('photos', file1); form.append('photos', file2);
  form.append(FORM_FIELD_NAME, file, file.name);

  xhr.send(form);
}

/* Cancel */
cancelBtn.addEventListener('click', ()=> {
  if(xhr){ xhr.abort(); }
});

/* Back button (пример) */
backBtn.addEventListener('click', ()=> {
  history.back();
});

/* Accessibility: keyboard activation */
drop.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
});

/* Инициализация */
resetUI();