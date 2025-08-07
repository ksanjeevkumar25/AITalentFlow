
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 5000;
app.use(cors());

const upload = multer({ dest: "uploads/" });
app.post("/upload", upload.single("file"), (req, res) => {
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, "uploads", req.file.originalname);
  fs.rename(tempPath, targetPath, err => {
    if (err) return res.sendStatus(500);
    res.status(200).json({ message: "File saved." });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
