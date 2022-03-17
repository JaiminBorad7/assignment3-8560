const express = require("express");
const router = express.Router();
const Property = require('../models/Property');
const { isSellerOrAgent } = require("../isSellerOrAgent.middleware");
const { Message } = require("../messages");
const { Routes } = require("../Routes");
const upload = require("../upload");
const { cities } = require("../cities");
const User = require("../models/User");
const { Roles } = require("../roles");
const Payment = require("../models/Payment");
const mongoose = require('mongoose');
const { isUser } = require("../isUser.middleware");

router.get('/', async (req, res) => {
  const { search, status, price, type, city, minBedrooms, maxBedrooms, minLivingrooms, 
    maxLivingrooms, minKitchens, maxKitchens, minBathrooms, maxBathrooms } = req.query;
  console.log(req.query);
  let q = {};
  
  if(status && status !== 'Any') {
    q = { status };
  }

  if(price && price !== 'Price') {
    const priceRange = price.split('-');
    const minPrice = parseInt(priceRange[0].match(/(\d+)/));
    let maxPrice = 10000000000000;
    if(priceRange[1].trim() !== 'above')
      maxPrice = parseInt(priceRange[1].match(/(\d+)/));
    
      console.log(priceRange, minPrice, maxPrice);
  
    q = { ...q, price: { $gte: minPrice, $lte: maxPrice } };
  }
  
  if(type && type !== 'Property') {
    q = { ...q, type };
  }

  if(city && city !== 'City') {
    q = { ...q, 'location.city': city };
  }

  if(maxBedrooms) {
    q = { ...q, 'specification.bedroom': { $gte: parseInt(minBedrooms), $lte: parseInt(maxBedrooms) } };
  } else if(minBedrooms) {
    q = { ...q, 'specification.bedroom': { $gte: parseInt(minBedrooms) } };
  }

  if(maxLivingrooms) {
    q = { ...q, 'specification.livingroom': { $gte: parseInt(minLivingrooms), $lte: parseInt(maxLivingrooms) } }
  } else if(minLivingrooms) {
    q = { ...q, 'specification.livingroom': { $gte: parseInt(minLivingrooms) } }
  }

  if(maxKitchens) {
    q = { ...q, 'specification.kitchen': { $gte: parseInt(minKitchens), $lte: parseInt(maxKitchens) } };
  } else if(minKitchens) {
    q = { ...q, 'specification.kitchen': { $gte: parseInt(minKitchens) } };
  }

  if(maxBathrooms) {
    q = { ...q, 'specification.bathroom': { $gte: parseInt(minBathrooms), $lte: parseInt(maxBathrooms) } };
  } else if(minBathrooms) {
    q = { ...q, 'specification.bathroom': { $gte: parseInt(minBathrooms) } };
  }

  let properties = [];
  try {
    if(search) {
    properties = await Property.aggregate([
      {
        $search: {
          index: 'property',
            text: {
              query: search,
              path: {
                'wildcard': '*'
              }
            }
        }
      },
      {
        $match: q
      }
    ]);
  } else {
    properties = await Property.find(q);
  }

  res.render('properties', { user: req.user, properties, message: req.flash("message") });
  } catch(err) {
    console.error(e);
    req.flash("message", "There was some problem searching");
    res.redirect(Routes.home);
  }
});

router.get('/me', isSellerOrAgent, async (req, res) => {
  const id = req.user.id;
  const properties = await Property.find({ addedBy: id });
  res.render('your-listings', { user: req.user, properties, message: req.flash("message") });
});

router.get('/bought', isUser, async (req, res) => {
  const id = req.user.id;
  const payments = await Payment.find({ madeBy: id });
  const propertyIds = payments.map((payment) => mongoose.Types.ObjectId(payment.property));
  let properties = [];
  console.log(propertyIds);
  if(propertyIds.length > 0) {
    properties = await Property.find({ '_id': { $in: propertyIds } });
  }
  res.render('bought', { user: req.user, properties, message: req.flash("message") });
})

router.get('/add', isSellerOrAgent, (req, res) => {
  res.render('add-property', { user: req.user, cities, message: req.flash('message')  })
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const property = await Property.findById(id);
  console.log(property);
  const listedBy = await User.findById(property.addedBy);
  console.log(listedBy);
  const tax = (property.price*3/100).toFixed(2);
  const agentCharges = listedBy.role === Roles.AGENT ? (property.price*1/100).toFixed(2) : 0;
  property.tax = tax;
  property.agentCharges = agentCharges;
  property.totalPayableAmount = (property.price + parseFloat(tax) + parseFloat(agentCharges));
  console.log(property.totalPayableAmount);
  res.render('property', { user: req.user, property: [property], listedBy: [listedBy], description: [property.description], status: property.status, message: req.flash("message") });
})

router.post('/add', isSellerOrAgent, upload.single('coverImage'), async (req, res) => {
  const { title, price, addedBy, street, city, pin, bedroom, livingroom, kitchen, bathroom, type, description } = req.body
  const coverImage = `/uploads/${req.file.originalname}`;
  console.log(req.body);
  const property = new Property({ title, price, addedBy, location: {street, city, pin}, specification: {bedroom, livingroom, kitchen, bathroom}, type, description, coverImage });
  property.save().then(() => {
    req.flash('message', Message.addPropertySuccess);
    res.redirect(Routes.properties.me);
  }).catch((err) => {
    console.log(err);
    req.flash("message", "Book Validation failed");
    res.redirect(Routes.addProperty);
  })
});

router.get('/update/:id', isSellerOrAgent, upload.single('coverImage'), async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const property = await Property.findById(id);
  if(property) {
    console.log(property);
    res.render('update-property', { user: req.user, cities, property: [property], city: property.location.city, type: property.type, message: req.flash('message') });
  } else {
    req.flash("message", "Invalid Property Id");
    res.redirect(Routes.properties.me);
  }
});

router.post('/update', isSellerOrAgent, async (req, res) => {
  const { id, title, price, addedBy, street, city, pin, bedroom, livingroom, kitchen, bathroom, description } = req.body
  const coverImage = req.file ? `/uploads/${req.file.originalname}` : '';
  let property = {}
  
  if(coverImage) {
    property = new Property({ title, price, addedBy, location: {street, city, pin}, specification: {bedroom, livingroom, kitchen, bathroom}, description, coverImage });
  } else {
    property = new Property({ title, price, addedBy, location: {street, city, pin}, specification: {bedroom, livingroom, kitchen, bathroom}, description });
  }

  try {
    await Property.findByIdAndUpdate(id, property);
    req.flash("message", "Succesfully updated property");
    res.redirect(Routes.properties.me);
  } catch(err) {
    req.flash("message", "Problem updating property.");
    res.redirect(Routes.updateProperty(id));
  }
});

router.post('/remove', isSellerOrAgent, (req, res) => {
  const { id } = req.body;
  Property.findByIdAndDelete(id).then(() => {
    req.flash("message", Message.bookRemoveSuccess);
    res.redirect(Routes.properties.me);
  });
})

module.exports = router;