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


exports.addCarToCompany = async (req, res) => {
  const { companyId } = req.params; // Get the company ID from the URL parameters
  const carData = req.body;         // Get the car data from the request body 

  if (req.file) {
    carData.image = req.file.path; // Store the path of the uploaded image
  }

  try {
    carData.company = companyId; 
    // Create the new car
    const newCar = await Car.create(carData); 
    
    // Find the company and update its 'cars' array
    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      { $push: { cars: newCar._id } }, // Push the new car's ID to the company's 'cars' array
      { new: true } // Return the updated company document
    ).populate('cars'); // Populate the 'cars' array with car data

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(201).json({ 
      message: 'Car added to company successfully', 
      company: updatedCompany 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add car to company' });
  }
};

exports.updateCarDetails = async (req, res) => {
    const { carId } = req.params; // Get the car ID from the URL parameters
    const updatedData = req.body; // Get the updated car data from the request body
  
    try {
      // Find the car by ID and update it with the new data
      const updatedCar = await Car.findByIdAndUpdate(carId, updatedData, { new: true });
  
      if (!updatedCar) {
        return res.status(404).json({ message: 'Car not found' });
      }
  
      res.status(200).json({
        message: 'Car details updated successfully',
        car: updatedCar
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update car details' });
    }
    
  };

  
exports.getCarsByCompany = async (req, res) => {
    const { companyId } = req.params; // Get the company ID from the URL parameters
  
    try {
      // Find the company and populate its cars
      const company = await Company.findById(companyId).populate('cars');
  
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
  
      // Map through the cars to include the full image URL
      const carsWithImages = company.cars.map(car => ({
        ...car.toObject(), // Convert Mongoose document to plain object
        image: `http://localhost:5001/uploads/${car.image}` // Add the full image URL
      }));
  
      res.status(200).json({
        message: 'Cars retrieved successfully',
        cars: carsWithImages // Return the populated cars array with image URLs
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve cars' });
    }
  };

exports.getCarDetails = async (req, res) => {
  const { carId } = req.params; // Get the car ID from the URL parameters

  try {
    const car = await Car.findById(carId).populate('company'); // Populate the company field

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Construct the full image URL
    const imageUrl = `http://localhost:5001/uploads/${car.image}`;

    res.status(200).json({
      ...car.toObject(), // Convert Mongoose document to plain object
      image: imageUrl // Add the full image URL to the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve car details' });
  }
};

exports.getAllCars = async (req, res) => {
    try {
      const cars = await Car.find().populate('company'); // Populate the company field to get company details
      res.status(200).json({
        message: 'Cars retrieved successfully',
        cars: cars,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve cars' });
    }
  };

exports.getCarImageById = async (req, res) => {
    const { carId } = req.body;

    // Check if carId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(carId)) {
        return res.status(400).json({ message: 'Invalid car ID' });
    }

    try {
        const car = await Car.findById(carId);

        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        // Construct the full image URL
        const imageUrl = `http://localhost:5001/uploads/${car.image}`;

        res.status(200).json({
            image: imageUrl // Return the image URL
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve car image' });
    }
};