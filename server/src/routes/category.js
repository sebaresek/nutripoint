const { Router } = require('express');
const { getCategories, seedCategories } = require('../controllers/categoryController');
const router = Router();

router.get('/', getCategories);
router.get('/seed', seedCategories);

module.exports = router;