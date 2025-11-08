const express = require('express')
const app = express()

const multer  = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
// 2. Создание функции фильтрации файлов
const fileFilter = (req, file, cb) => {
    // Проверяем MIME-тип файла
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        // Принимаем файл (null для ошибки, true для принятия)
        cb(null, true);
    } else {
        // Отклоняем файл и возвращаем ошибку
        // (null для ошибки, false для отклонения, или передаем объект ошибки в cb)
        cb(new Error('Разрешены только файлы форматов JPG и PNG!'), false);
    }
};
const upload = multer({ storage: storage, fileFilter: fileFilter})

app.get('/', (req, res) => {
  res.send("Hello!")
})
//Название ключа запроса и максимальное кол-во файлов
app.post('/api/upload', upload.array('photos', 2), (req, res) => {
  res.json(req.files)
})

const port = process.env.PORT || 3000

app.listen(port, ()=>{
  console.log(`listen on port: ${port}`)
})