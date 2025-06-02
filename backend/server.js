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

connectDB();
app.use(cors());
app.use(express.json());
app.use('/api/host', hostRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/review', reviewRoutes);

app.get("/", (req, res) => {
  res.send("Express backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

module.exports = app;