const express = require('express');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const validateProduct = require('../middleware/validateProduct');
const router = express.Router();
const { NotFoundError, ValidationError } = require('../middleware/errors');
const asyncHandler = require('../middleware/asyncHandler');


let products = [];

// Apply auth middleware to all product routes
router.use(auth);


router.get('/', asyncHandler(async (req, res) => {
  res.json(products);
}));



router.get('/', (req, res) => {
  let results = [...products]; // Clone product list

  const { category, search, page = 1, limit = 5 } = req.query;

  // 🔍 Filter by category
  if (category) {
    results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // 🔍 Search by name
  if (search) {
    results = results.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  // 🔄 Pagination
  const start = (parseInt(page) - 1) * parseInt(limit);
  const end = start + parseInt(limit);
  const paginatedResults = results.slice(start, end);

  res.json({
    page: parseInt(page),
    limit: parseInt(limit),
    total: results.length,
    data: paginatedResults,
  });
});


router.get('/stats', (req, res) => {
  const stats = {};

  products.forEach(product => {
    const cat = product.category;
    stats[cat] = (stats[cat] || 0) + 1;
  });

  res.json({ total: products.length, byCategory: stats });
});


// GET product by ID
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) throw new NotFoundError('Product not found');
  res.json(product);
});

// POST new product
router.post('/', validateProduct, (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price,
    category,
    inStock,
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT update product
router.put('/:id', validateProduct, (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Product not found' });

  const updatedProduct = {
    ...products[index],
    ...req.body,
  };
  products[index] = updatedProduct;
  res.json(updatedProduct);
});

// DELETE product
router.delete('/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Product not found' });

  products.splice(index, 1);
  res.json({ message: 'Product deleted successfully' });
});

module.exports = router;
