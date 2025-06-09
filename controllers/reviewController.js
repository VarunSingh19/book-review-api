const Review = require('../models/Review');
const mongoose = require('mongoose');
const { reviewValidation } = require('../utils/validation');

exports.updateReview = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid review ID' });
    const { error } = reviewValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    const updated = await Review.findByIdAndUpdate(id, { rating: req.body.rating, comment: req.body.comment }, { new: true, runValidators: true }).populate('user', 'username');
    res.json({ message: 'Review updated', review: updated });
};

exports.deleteReview = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid review ID' });
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Access denied' });
    await Review.findByIdAndDelete(id);
    res.json({ message: 'Review deleted successfully' });
};