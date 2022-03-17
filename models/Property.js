const mongoose = require('mongoose');
const { cities } = require('../cities');
const { propertyTypes } = require('../propertyTypes');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  addedBy: {
    type: String,
    required: true
  },
  specification: {
    bedroom: Number,
    livingroom: Number,
    kitchen: Number,
    bathroom: Number,
  },
  location: {
    street: {
      type: String
    },
    city: {
      type: String,
      enum: cities
    },
    pin: {
      type: String,
      length: 6,
    }
  },
  coverImage: {
    type: String
  },
  description: {
    type: String,
    default: "Dummy Description"
  },
  type: {
    type: String,
    enum: [propertyTypes.APPARTMENT, propertyTypes.BUILDING, propertyTypes.OFFICE]
  },
  status: {
    type: String,
    default: 'New',
    enum: ['New', 'Sold']
  }
}, { timestamps: true });

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;