const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require('./config/db.js');
const hostRoutes = require('./routes/host.js');
const clientRoutes = require('./routes/client.js');
const reviewRoutes = require('./routes/review.js');
dotenv.config();

const app = express();
const PORT = process.env.PORT;

// CORS FIRST!
app.use(cors({
  origin: [
    "https://peer-eval-front.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

app.use(express.json());
connectDB();

app.use('/api/host', hostRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/review', reviewRoutes);

app.get("/", (req, res) => {
  res.send("Express backend is running!");
});

// Only start server if not in test environment
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
}

module.exports = app;