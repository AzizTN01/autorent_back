

const Company = require('../models/Company'); 
const Car = require('../models/Car');


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
  
      res.status(200).json({
        message: 'Cars retrieved successfully',
        cars: company.cars // Return the populated cars array
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

    res.status(200).json(car); // Return the car details
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve car details' });
  }
};
