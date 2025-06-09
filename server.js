require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Connect to DB
connectDB();

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));