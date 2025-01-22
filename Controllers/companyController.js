
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


