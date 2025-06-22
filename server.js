const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require('./config/connectToDB');

connectDB();



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// CORS 
app.use(cors({
    origin: [
        'https://bccgallery.netlify.app',
        'https://bccgalleryadmin.netlify.app',

      ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));

const userRouter = require("./route/userRoute");
const imageRouter = require("./route/imagesRoute");
const savedRouter = require("./route/savedRoute");
const pastAlbumRouter = require("./route/pastAlbumRoute");





const port = 6500;

// Health check 
app.get("/health", (req, res) => {
    res.status(200).json({ message: "Welcome to BCC Gallery", status: "healthy" });
});

// Routes
app.use("/users", userRouter);
app.use("/images", imageRouter);
app.use("/saved", savedRouter);
app.use("/album", pastAlbumRouter);

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// 404 
app.use('"/{*any}', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
    console.log(`Server running`);
});