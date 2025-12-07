const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
let username = "MyUserName";
app.use(cors());
const fs = require("fs");
const path = require("path");

app.use(express.static(path.join(__dirname, 'public')));

let maxCountVideo = 3;
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + username + "-" + file.originalname);
  },
});
// 2. Создание функции фильтрации файлов
const fileFilter = (req, file, cb) => {
  // Проверяем MIME-тип файла
  if (file.mimetype === "video/mp4" || file.mimetype === "video/quicktime") {
    // Принимаем файл (null для ошибки, true для принятия)
    cb(null, true);
  } else {
    // Отклоняем файл и возвращаем ошибку
    // (null для ошибки, false для отклонения, или передаем объект ошибки в cb)
    cb(new Error("Разрешены только файлы видео форматов"), false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
  console.log(path.join(__dirname, "public", "index.html"))
});


app.post("/api/upload", upload.array("video", maxCountVideo), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("Файлы не загружены");
  }

  // Массив сохранённых имён файлов (имя на диске)
  const savedNames = req.files.map((f) => f.filename);

  // Отправить plain text: каждое имя в новой строке
  const textResponse = savedNames.join("\n");
  res.type("text/plain").send(textResponse);

  // Если нужен JSON вместо текста — используйте:
  // res.json({ files: savedNames });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`listen on port: ${port}`);
});
