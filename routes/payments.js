const express = require("express");
const router = express.Router();
const Property = require('../models/Property');
const { Message } = require("../messages");
const { Routes } = require("../Routes");
const { Roles } = require("../roles");
const Payment = require("../models/Payment");
const { isLoggedIn } = require("../isLoggedIn.middleware");
const { isUser } = require("../isUser.middleware");

router.post("/", isLoggedIn, isUser, async (req, res) => {
  const { id, totalAmount } = req.body;
  const payment = new Payment({ madeBy: req.user._id, property: id, totalAmount: parseFloat(totalAmount) });
  try {
    await Payment.insertMany([payment]);
    await Property.findByIdAndUpdate(id, { status: "Sold" });
    req.flash("message", "Congratulations! You have bought this property.");
    res.redirect(Routes.properties.bought);
  } catch(err) {
    req.flash("message", "Unable to process payment. Please try again");
    res.redirect(Routes.properties.id(id));
  }
});


module.exports = router;