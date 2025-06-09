const Book = require('../models/Book');
const Review = require('../models/Review');
const { bookValidation } = require('../utils/validation');

exports.createBook = async (req, res) => {
    const { error } = bookValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const data = { ...req.body, addedBy: req.user._id };
    const book = new Book(data);
    await book.save();
    await book.populate('addedBy', 'username email');
    res.status(201).json({ message: 'Book added', book });
};

exports.getBooks = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.author) filter.author = { $regex: req.query.author, $options: 'i' };
    if (req.query.genre) filter.genre = { $regex: req.query.genre, $options: 'i' };

    const [books, total] = await Promise.all([
        Book.find(filter).populate('addedBy', 'username').sort({ createdAt: -1 }).skip(skip).limit(limit),
        Book.countDocuments(filter)
    ]);

    const booksWithRatings = await Promise.all(books.map(async book => {
        const reviews = await Review.find({ book: book._id });
        const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
        return { ...book.toObject(), averageRating: Math.round(avg * 10) / 10, reviewCount: reviews.length };
    }));

    res.json({ books: booksWithRatings, pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalBooks: total } });
};

exports.getBookById = async (req, res) => {
    const { id } = req.params;
    const book = await Book.findById(id).populate('addedBy', 'username email');
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [reviews, totalReviews] = await Promise.all([
        Review.find({ book: id }).populate('user', 'username').sort({ createdAt: -1 }).skip(skip).limit(limit),
        Review.countDocuments({ book: id })
    ]);

    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

    res.json({ book: { ...book.toObject(), averageRating: Math.round(avg * 10) / 10, reviewCount: totalReviews }, reviews, reviewsPagination: { currentPage: page, totalPages: Math.ceil(totalReviews / limit), totalReviews } });
};

exports.addReview = async (req, res) => {
    const { id } = req.params;
    const { error } = require('../utils/validation').reviewValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    const exists = await Review.findOne({ book: id, user: req.user._id });
    if (exists) return res.status(400).json({ message: 'You have already reviewed this book' });

    const review = new Review({ book: id, user: req.user._id, rating: req.body.rating, comment: req.body.comment });
    await review.save();
    await review.populate('user', 'username');
    res.status(201).json({ message: 'Review added', review });
};