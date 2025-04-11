const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi PostgreSQL (gunakan Environment Variables)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Konfigurasi Telegram (gunakan Environment Variables)
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '8129203580:AAFMqpVB02H0oqX4jsFzpsH3mlxlqu-U9Sw';
const CHAT_ID = process.env.CHAT_ID || '5138243252';
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, 'public')));

// Definisi model FloodData
const FloodData = sequelize.define('FloodData', {
  ketinggian: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Sinkronisasi tabel
FloodData.sync({ force: false })
  .then(() => {
    console.log('Tabel FloodData siap digunakan.');
  })
  .catch((error) => {
    console.error('Gagal sinkronisasi tabel:', error);
  });

// Endpoint untuk menerima data dari Arduino
app.get('/update', async (req, res) => {
  try {
    const { ketinggian, status } = req.query;
    if (!ketinggian || !status) {
      throw new Error("Parameter ketinggian atau status kosong");
    }

    // Simpan data ke database
    await FloodData.create({
      ketinggian: parseFloat(ketinggian),
      status: status
    });

    // Kirim notifikasi Telegram jika status "Bahaya"
    if (status === "Bahaya") {
      const message = `⚠️ PERINGATAN BANJIR! ⚠️\nKetinggian air: ${ketinggian} cm`;
      await bot.sendMessage(CHAT_ID, message);
    }

    res.status(200).send('Data berhasil disimpan');
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send(`Gagal menyimpan data: ${error.message}`);
  }
});

// Endpoint untuk mengambil data terbaru
app.get('/data', async (req, res) => {
  try {
    const data = await FloodData.findOne({
      order: [['createdAt', 'DESC']]
    });
    res.json(data);
  } catch (error) {
    res.status(500).send('Gagal mengambil data');
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});