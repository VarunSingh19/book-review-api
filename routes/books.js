const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createBook, getBooks, getBookById, addReview } = require('../controllers/bookController');

router.post('/', auth, createBook);
router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/:id/reviews', auth, addReview);

module.exports = router;