
const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const companyController = require('../Controllers/companyController');
const rentalController = require('../Controllers/rentalController');
const carController = require('../Controllers/carController');


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
router.post('/companies/:companyId/cars', companyController.addCarToCompany);
router.put('/cars/:carId', carController.updateCarDetails); 
router.get('/companies/:companyId/cars', carController.getCarsByCompany);
router.get('/cars/:carId', carController.getCarDetails); 

module.exports = router;
