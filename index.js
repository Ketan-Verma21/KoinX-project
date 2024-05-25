const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const dotenv = require("dotenv");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const balance=require("./routes/balace")
const Trade = require("./models/trade");

dotenv.config();

const app = express();
app.use(express.json());
app.use(balance);
const PORT = process.env.PORT || 3000;
const DB = process.env.MONGO_URL;

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Parse and store CSV data
const parseAndStoreCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const trades = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const [base_coin, quote_coin] = row.Market.split('/');
        trades.push({
          user_id: row.User_ID,
          utc_time: new Date(row.UTC_Time),
          operation: row.Operation,
          market: row.Market,
          base_coin: base_coin,
          quote_coin: quote_coin,
          amount: parseFloat(row['Buy/Sell Amount']),
          price: parseFloat(row.Price)
        });
      })
      .on('end', () => {
        Trade.insertMany(trades)
          .then(result => resolve(result))
          .catch(err => reject(err));
      });
  });
};

// API endpoint to upload CSV file
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  parseAndStoreCSV(req.file.path)
    .then(result => 
        res.send('File processed and data stored successfully'))
    .catch(err => res.status(500).send(err.message))
    .finally(() => {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete temporary file');
      });
    });
});

// Connect to MongoDB and start server
mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Mongoose Connected");
  
  var server = http.createServer(app);
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server connected to port ${PORT}`);
  });

}).catch((err) => {
  console.log(err);
});
