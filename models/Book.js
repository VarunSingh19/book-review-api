const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    publishedYear: { type: Number, required: true, min: 1000, max: new Date().getFullYear() },
    isbn: { type: String, unique: true, sparse: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

bookSchema.index({ title: 'text', author: 'text' });
bookSchema.index({ author: 1 });
bookSchema.index({ genre: 1 });

module.exports = mongoose.model('Book', bookSchema);