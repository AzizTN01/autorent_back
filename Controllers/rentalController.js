
const Rental = require('../models/Rental');
const User = require('../models/User');
const Car = require('../models/Car'); 

// Function to create a new rental 
exports.createRental = async (req, res) => {
  try {
    const {
        userId,
        carId,
        rentalStartDate,
        rentalEndDate,
        totalCost,
        dropOffLocation,
        pickupLocation,
      } = req.body;

    // 1. Check if car is available for the selected dates
    const isCarAvailable = await checkCarAvailability(carId, rentalStartDate, rentalEndDate);
    if (!isCarAvailable) {
      return res.status(400).json({ message: 'Car is not available for the selected dates' });
    }

    // 2. Create the new rental document
    const newRental = await Rental.create({
        user: userId,
        car: carId,
        rentalStartDate,
        rentalEndDate,
        totalCost,
        dropOffLocation,
        pickupLocation,
      });
  

    // 3. Update user's rentals array
    await User.findByIdAndUpdate(userId, { $push: { rentals: newRental._id } });

    // 4. Optionally update car availability (if you have an availability field)
    // ... (You'll need to implement this if you are managing car availability directly)

    res.status(201).json({ 
      message: 'Rental created successfully',
      rental: newRental 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create rental' });
  }
};

// Helper function to check car availability 
async function checkCarAvailability(carId, rentalStartDate, rentalEndDate) {
  const overlappingRentals = await Rental.find({
    car: carId,
    $or: [
      { rentalStartDate: { $lt: rentalEndDate, $gte: rentalStartDate } }, // Check for start date overlap
      { rentalEndDate: { $gt: rentalStartDate, $lte: rentalEndDate } },   // Check for end date overlap
    ],
  });

  return overlappingRentals.length === 0; // If no overlapping rentals found, the car is available
}

// ... other functions for fetching rentals (e.g., get rentals by user)
