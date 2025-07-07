const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require('./config/connectToDB');

// Connect to database
connectDB();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration
app.use(cors({
    origin: [
        'https://bccgallery.netlify.app',
        'https://bccgalleryadmin.netlify.app',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));

// Routes
const userRouter = require("./route/userRoute");
const imageRouter = require("./route/imagesRoute");
const savedRouter = require("./route/savedRoute");
const pastAlbumRouter = require("./route/pastAlbumRoute");

const port = process.env.PORT || 6500;

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({ 
        message: "Welcome to BCC Gallery", 
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use("/users", userRouter);
app.use("/images", imageRouter);
app.use("/saved", savedRouter);
app.use("/album", pastAlbumRouter);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        files: req.files?.map(f => ({ name: f.originalname, size: f.size }))
    });
    
    // Handle Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
            error: 'File size too large. Maximum 20MB allowed per file.' 
        });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ 
            error: 'Too many files. Maximum 50 files allowed.' 
        });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
            error: 'Unexpected file field. Use "primaryImage" as field name.' 
        });
    }
    
    if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({ 
            error: 'Only image files are allowed.' 
        });
    }
    
    // Handle other errors
    res.status(500).json({ 
        error: 'Something went wrong!', 
        details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});


// 404 
app.use('"/{*any}', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;

