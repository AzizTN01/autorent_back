const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const companyController = require('../Controllers/companyController');
const rentalController = require('../Controllers/rentalController');
const carController = require('../Controllers/carController');
const multer = require('multer');

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

const upload = multer({ storage: storage });

// Routes

router.post('/rentals', rentalController.createRental);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.put('/update-profile', authController.updateProfile); // Assuming you are protecting this route
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/getusers', authController.getUsers);
router.delete('/delete-user', authController.deleteUser); 
router.get('/user/:id', authController.getUser); 
router.post('/companies', companyController.createCompany);
router.post('/:carId/companies/:companyId', carController.addCarToCompany);
router.put('/cars/:carId', carController.updateCarDetails); 
router.get('/companies/:companyId/cars', carController.getCarsByCompany);
router.get('/cars/:carId', carController.getCarDetails); 
router.get('/cars', carController.getAllCars);
router.post('/companies/:companyId/cars', upload.single('carImage'), carController.addCarToCompany);
router.post('/cars/image', carController.getCarImageById);

module.exports = router;
