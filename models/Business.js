const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  phone_number: { type: String, required: true, unique: true }, 
  business_name: String,
  status: { type: String, enum: ['onboarding', 'active', 'suspended'], default: 'onboarding' },
  onboarding_step: { type: Number, default: 1 },
  raw_data: {
    menu: String,
    hours: String,
    payment_link: String
  },
  system_prompt: String
});

module.exports = mongoose.model('Business', businessSchema);
