const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',  // Reference to the Company model
        required: true   // Make the company field required 
      },
      image: {
        type: String, // Store the path to the image
        required: false, // Optional, depending on your requirements
    },
  brand: {
    type: String,
    enum: ['Toyota','Volwagen', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes', 'Audi', 'Hyundai', 'Kia'],
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
    min: 1886, // The year the first car was invented
    max: new Date().getFullYear(), // Current year
  },
  price: {
    type: Number,
    required: true,
    min: 0, // Price can't be negative
  },
  color: {
    type: String,
    enum: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Silver', 'Gray', 'Brown', 'Gold', 'Orange', 'Purple'],
    required: true,
  },
  fuelType: {
    type: String,
    enum: ['Gasoline', 'Diesel', 'Electric', 'Hybrid'], 
    required: true,
  },
  transmission: {
    type: String,
    enum: ['Automatic', 'Manual'],
    required: true,
  },
  mileage: {
    type: Number,
    min: 0, // Mileage can't be negative
  },
  seats: {
    type: Number,
    min: 1, // At least 1 seat
  },
  description: {
    type: String,
    maxlength: 500, // Optional: Limit description length
  },
  isAvailable: {
    type: Boolean,
    default: true, // Default to available
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to the current date
  },
});

const Car = mongoose.model('Car', carSchema);

module.exports = Car;


