// models/User.js - UPDATED
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: function() {
        return !this.googleId; // Name is required only for non-Google users
      },
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: function() {
        return !this.googleId; // Password is required only for non-Google users
      },
      minlength: 6
    },
    profilePicture: {
      type: String,
      default: function() {
        const nameInitial = this.name ? this.name.charAt(0).toUpperCase() : 'U';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=random&color=fff&size=128`;
      }
    },
    role: {
      type: String,
      enum: ['admin', 'farmer', 'expert'],
      default: 'farmer',
    },
    // Google OAuth fields
    googleId: {
      type: String,
      sparse: true,
      unique: true
    },
    googleProfile: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    bio: {
      type: String,
      maxlength: 500,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: {
        type: String,
        default: 'Kenya'
      },
      county: String,
      subCounty: String,
      zipCode: String
    },
    isNewUser: {
      type: Boolean,
      default: false
    },
    // Expert-specific fields
    expertise: {
      type: [String],
      default: []
    },
    yearsOfExperience: {
      type: Number,
      default: 0
    },
    hourlyRate: {
      type: Number,
      default: 0,
      min: 0
    },
    availability: {
      type: String,
      enum: ['available', 'busy', 'away'],
      default: 'available'
    },
    languages: {
      type: [String],
      default: ['English']
    },
    // Farmer-specific fields
    farmSize: {
      type: String,
      default: ''
    },
    mainCrops: {
      type: [String],
      default: []
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    // Stats and verification
    rating: {
      average: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add index for Google ID
userSchema.index({ googleId: 1 });

// Virtual for checking if user is Google authenticated
userSchema.virtual('isGoogleAuth').get(function() {
  return !!this.googleId;
});

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  if (!addr) return '';
  return [addr.street, addr.city, addr.county, addr.country, addr.zipCode]
    .filter(Boolean).join(', ');
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'address.county': 1 });
userSchema.index({ expertise: 1 });

// Method to check if user is expert
userSchema.methods.isExpert = function() {
  return this.role === 'expert';
};

// Method to check if user is farmer
userSchema.methods.isFarmer = function() {
  return this.role === 'farmer';
};

// Method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Method to check if consultation is free
userSchema.methods.isFreeConsultation = function() {
  return this.hourlyRate === 0;
};

module.exports = mongoose.model('User', userSchema);