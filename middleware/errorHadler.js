module.exports = (err, req, res, next) => {
    console.error(err.stack);
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ message: 'Validation Error', errors });
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({ message: `${field} already exists` });
    }
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token' });
    if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired' });
    res.status(500).json({ message: 'Internal server error' });
};