const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authController = require('../Controllers/authController');
const companyController = require('../Controllers/companyController');
const rentalController = require('../Controllers/rentalController');
const carController = require('../Controllers/carController');
const multer = require('multer');
const upload = require('../middleware/upload');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

// Middleware to authenticate token (if needed)
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; 
    if (!token) return res.sendStatus(401); 

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); 
        req.user = user;
        next();
    });
};

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify the directory to save the uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Use a unique filename
    }
});

const uploadMulter = multer({ storage: storage });

// Routes

// Public routes (no authentication required)
router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/user/:id', authController.getUser);
router.get('/cars', carController.getAllCars);
router.get('/cars/:carId', carController.getCarDetails);
router.get('/companies/:companyId/cars', carController.getCarsByCompany);

// Protected routes (authentication required)
router.put('/update-profile', authenticateToken, upload, authController.updateProfile);
router.get('/getusers', authenticateToken, authController.getUsers);
router.delete('/delete-user/:id', authenticateToken, authController.deleteUser);
router.post('/rentals', authenticateToken, rentalController.createRental);
router.post('/companies', authenticateToken, companyController.createCompany);
router.post('/companies/:companyId/cars', authenticateToken, uploadMulter.single('carImage'), carController.addCarToCompany);
router.put('/cars/:carId', authenticateToken, carController.updateCarDetails);
router.post('/cars/image', carController.getCarImageById);

module.exports = router;