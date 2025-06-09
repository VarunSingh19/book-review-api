const Book = require('../models/Book');
const Review = require('../models/Review');

exports.searchBooks = async (req, res) => {
    const { q, page = 1, limit = 10 } = req.query;
    if (!q || !q.trim()) return res.status(400).json({ message: 'Search query is required' });

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = { $or: [{ title: { $regex: q, $options: 'i' } }, { author: { $regex: q, $options: 'i' } }] };
    const [books, total] = await Promise.all([
        Book.find(filter).populate('addedBy', 'username').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        Book.countDocuments(filter)
    ]);

    const booksWithRatings = await Promise.all(books.map(async b => {
        const revs = await Review.find({ book: b._id });
        const avg = revs.length ? revs.reduce((s, r) => s + r.rating, 0) / revs.length : 0;
        return { ...b.toObject(), averageRating: Math.round(avg * 10) / 10, reviewCount: revs.length };
    }));

    res.json({ searchQuery: q, books: booksWithRatings, pagination: { currentPage: pageNum, totalPages: Math.ceil(total / limitNum), totalBooks: total } });
};