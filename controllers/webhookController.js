const Business = require('../models/Business');
const axios = require('axios');
require('dotenv').config();

// Helper function to send messages back via Green API
async function sendWhatsAppMessage(chatId, message) {
    const url = `https://api.green-api.com/waInstance${process.env.GREEN_API_ID_INSTANCE}/sendMessage/${process.env.GREEN_API_API_TOKEN_INSTANCE}`;
    try {
        await axios.post(url, { chatId: chatId, message: message });
    } catch (error) {
        console.error("Error sending message:", error.message);
    }
}

exports.handleIncomingMessage = async (req, res) => {
    // Green API sends a lot of data; we only care about text messages for now
    const body = req.body;
    if (!body.receiptId || !body.messageData || !body.messageData.textMessageData) {
        return res.status(200).send("Not a text message, ignoring.");
    }

    const senderNumber = body.senderData.sender; // E.g., 919876543210@c.us
    const textMessage = body.messageData.textMessageData.textMessage;

    try {
        // 1. Check if this business is in our database
        let business = await Business.findOne({ phone_number: senderNumber });

        // 2. If new, create them and start onboarding
        if (!business) {
            business = new Business({ phone_number: senderNumber });
            await business.save();
            await sendWhatsAppMessage(senderNumber, "Welcome to Nexa. Let's set up your automated assistant. What is the exact name of your business?");
            return res.status(200).send("Started onboarding");
        }

        // 3. The Router Logic
        if (business.status === 'onboarding') {
            // Handle the State Machine
            switch (business.onboarding_step) {
                case 1:
                    business.business_name = textMessage;
                    business.onboarding_step = 2;
                    await business.save();
                    await sendWhatsAppMessage(senderNumber, `Got it, ${textMessage}. Please paste your top services/menu items and prices.`);
                    break;
                case 2:
                    business.raw_data.menu = textMessage;
                    business.onboarding_step = 3;
                    await business.save();
                    await sendWhatsAppMessage(senderNumber, "Perfect. What are your working hours?");
                    break;
                case 3:
                    business.raw_data.hours = textMessage;
                    business.onboarding_step = 4;
                    await business.save();
                    await sendWhatsAppMessage(senderNumber, "Finally, paste your UPI ID or payment link for customers.");
                    break;
                case 4:
                    business.raw_data.payment_link = textMessage;
                    // We stop here for today. Tomorrow, Groq synthesizes this data.
                    business.onboarding_step = 5; 
                    await business.save();
                    await sendWhatsAppMessage(senderNumber, "Data collected. Nexa AI is generating your system prompt...");
                    break;
            }
        } else if (business.status === 'active') {
            // Tomorrow's job: Route to Groq for customer chats
            console.log("Business is active, routing to AI logic...");
        }

        res.status(200).send("Webhook processed");

    } catch (error) {
        console.error("Database or Server Error:", error);
        res.status(500).send("Internal Error");
    }
};
