require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
const listsRoutes = require('./routes/lists');
app.use('/lists', listsRoutes);

// Start
app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});
