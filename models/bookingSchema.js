
const mongoose = require('mongoose')



 BookingSchema = new mongoose.Schema({
    owner:{type:mongoose.Schema.Types.ObjectId, ref: 'Place' },
    checkIn: { type: Date,  },
    checkOut: { type: Date, required: true },
    noOfGuests: { type: Number, required: true },
    numberOfDays: { type: Number, required: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
    price: { type: Number, required: true },
   
})

const BookingModel = mongoose.model('Booking', BookingSchema)
module.exports = BookingModel