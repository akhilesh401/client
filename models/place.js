const mongoose = require('mongoose');
const { type } = require('os');


const PlaceSchema = mongoose.Schema({
    owner:{type:mongoose.Schema.Types.ObjectId, ref: 'User' } ,
    title:String,
    description: String,
    address:String,
    photos:[String],
    perks:[String],
    extraInfo:String,
    checkIn:Number,
    checkOut:Number,
    maxGuests:Number,
    price:Number
})
const placeModel = mongoose.model('Place',PlaceSchema)
module.exports = placeModel;
