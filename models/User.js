const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Add userId field
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    age: { type: Number, required: false },
    province: { 
        type: String, 
        enum: ['Sousse', 'Sfax', 'Monastir', 'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Bizerte', 'Beja', 'Jendouba', 'Kef', 'Siliana', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabes', 'Medenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili', 'Mahdia', 'Zaghouan'],
        required: false 
    },
    rentals: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental' 
    }],
    profilePicture: { type: String, required: false,default:null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
