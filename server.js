const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json()); // Essential for parsing Green API webhooks

const webhookRoutes = require('./routes/webhook');
app.use('/webhook', webhookRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
    app.listen(process.env.PORT, () => {
      console.log(`Nexa Engine running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error("MongoDB Connection Failed:", err));
