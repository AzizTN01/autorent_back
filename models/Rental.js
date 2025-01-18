const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  rentalStartDate: {
    type: Date,
    required: true
  },
  rentalEndDate: {
    type: Date,
    required: true
  },
  totalCost: { 
    type: Number,
    required: true 
  },
  pickupLocation: {
    type: String,
    required: true // Ensure pickup location is specified
  },
  dropOffLocation: {
    type: String,
    required: true // Ensure drop-off location is specified
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Pending' // Default status for new rentals
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Paid', 'Refunded'],
    default: 'Unpaid' // Payment status for rentals
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically set to the current timestamp
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update `updatedAt` before saving
rentalSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Rental = mongoose.model('Rental', rentalSchema);

module.exports = Rental;
