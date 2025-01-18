
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  baseProvince: { 
    type: String, 
    enum: [
      'Sousse', 'Sfax', 'Monastir', 'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 
      'Nabeul', 'Bizerte', 'Beja', 'Jendouba', 'Kef', 'Siliana', 'Kairouan', 
      'Kasserine', 'Sidi Bouzid', 'Gabes', 'Medenine', 'Tataouine', 'Gafsa', 
      'Tozeur', 'Kebili', 'Mahdia', 'Zaghouan'
    ],
    required: true 
  },
  address: { 
    type: String, 
    required: false, // Optional but can be marked as required if needed
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, // Ensure no duplicate company emails
    match: /.+\@.+\..+/ // Basic email validation
  },
  phone: { 
    type: String, 
    required: true, 
    match: /^[0-9]{8}$/ // Tunisian phone numbers have 8 digits
  },
  cars: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Car'  
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now // Automatically set creation date
  },
  updatedAt: {
    type: Date,
    default: Date.now // Automatically update on save
  }
});

// Middleware to update updatedAt before saving
companySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
