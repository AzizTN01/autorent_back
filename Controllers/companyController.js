
const Company = require('../models/Company'); 
const Car = require('../models/Car');

exports.createCompany = async (req, res) => {
  try {
    const newCompany = await Company.create(req.body); 
    res.status(201).json({
      message: 'Company created successfully',
      company: newCompany
    });
  } catch (error) {
    // Handle validation errors, duplicate key errors, etc.
    console.error(error);
    if (error.code === 11000) {
      // Duplicate key error (e.g., company name or email already exists)
      return res.status(400).json({ message: 'Duplicate entry. Company name and email must be unique.' });
    } 
    res.status(500).json({ message: 'Failed to create company' });
  }
};


// ... other controller functions (createCompany) 

exports.addCarToCompany = async (req, res) => {
  const { companyId } = req.params; // Get the company ID from the URL parameters
  const carData = req.body;         // Get the car data from the request body 

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
