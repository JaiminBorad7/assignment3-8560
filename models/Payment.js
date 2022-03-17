const mongoose = require('mongoose');

// Create Schema
const PaymentSchema = new mongoose.Schema(
    {
      madeBy: {
        type: String,
        required: true
      },
      property: {
        type: String,
        required: true
      },
      totalAmount: {
        type: Number,
        required: true
      }
    },
    { strict: false }
);

const Payment = mongoose.model("payment", PaymentSchema);
module.exports = Payment;