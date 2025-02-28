const Company = require('../models/Company'); 
const Car = require('../models/Car');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the directory to save the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the file name
  }
});

// Create an async handler to catch errors in async functions
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

exports.addCarToCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const carData = req.body;

  if (req.file) {
    carData.image = req.file.path;
  }

  carData.company = companyId; 
  // Create the new car
  const newCar = await Car.create(carData); 
  
  // Find the company and update its 'cars' array
  const updatedCompany = await Company.findByIdAndUpdate(
    companyId,
    { $push: { cars: newCar._id } },
    { new: true }
  ).populate('cars');

  if (!updatedCompany) {
    const error = new Error('Company not found');
    error.statusCode = 404;
    throw error;
  }

  res.status(201).json({ 
    message: 'Car added to company successfully', 
    company: updatedCompany 
  });
});

exports.updateCarDetails = asyncHandler(async (req, res) => {
  const { carId } = req.params;
  const updatedData = req.body;

  const updatedCar = await Car.findByIdAndUpdate(carId, updatedData, { new: true });

  if (!updatedCar) {
    const error = new Error('Car not found');
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    message: 'Car details updated successfully',
    car: updatedCar
  });
});

  
exports.getCarsByCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;

  const company = await Company.findById(companyId).populate('cars');

  if (!company) {
    const error = new Error('Company not found');
    error.statusCode = 404;
    throw error;
  }

  const carsWithImages = company.cars.map(car => ({
    ...car.toObject(),
    image: `http://localhost:5001/uploads/${car.image}`
  }));

  res.status(200).json({
    message: 'Cars retrieved successfully',
    cars: carsWithImages
  });
});

exports.getCarDetails = asyncHandler(async (req, res) => {
  const { carId } = req.params;

  const car = await Car.findById(carId).populate('company');

  if (!car) {
    const error = new Error('Car not found');
    error.statusCode = 404;
    throw error;
  }

  const imageUrl = `http://localhost:5001/uploads/${car.image}`;

  res.status(200).json({
    ...car.toObject(),
    image: imageUrl
  });
});

exports.getAllCars = asyncHandler(async (req, res) => {
  const cars = await Car.find().populate('company');
  
  res.status(200).json({
    message: 'Cars retrieved successfully',
    cars: cars,
  });
});

exports.getCarImageById = asyncHandler(async (req, res) => {
  const { carId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(carId)) {
    const error = new Error('Invalid car ID');
    error.statusCode = 400;
    throw error;
  }

  const car = await Car.findById(carId);

  if (!car) {
    const error = new Error('Car not found');
    error.statusCode = 404;
    throw error;
  }

  const imageUrl = `http://localhost:5001/uploads/${car.image}`;

  res.status(200).json({
    image: imageUrl
  });
});