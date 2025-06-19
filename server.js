// server.js
const express = require('express');
const productsRoute = require('./routes/products'); // <-- your route file

const app = express();
const PORT = 3000;

// ✅ Middleware to parse JSON bodies
app.use(express.json()); // ⚠️ VERY important — must come before routes

// ✅ Root route
app.get('/', (req, res) => {
  res.send('Hello World');
});

// ✅ Use your product routes
app.use('/api/products', productsRoute);

// ✅ Start server
app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
