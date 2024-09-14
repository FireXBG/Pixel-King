const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    pixels: { type: Number, required: true },
    expirationDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

module.exports = PromoCode;