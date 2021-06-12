const mongoose = require('mongoose')

//declaring schema
const registrationSchema = mongoose.Schema({
    user: {
        type: String
    },
    userName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    stateOfDosage: {
        type: String,
        required: true
    },
    slotDate: {
        type: String,
        required: true
    },
    slotTime: {
        type: String,
        required: true
    },
})

//creatind model
const Registration = module.exports = mongoose.model('Registration', registrationSchema)

//function to return the availability of specific slot i.e slots=10
module.exports.getSlotsAvailability = async function(slotTime, slotDate){
    let available = await Registration.countDocuments({slotTime, slotDate })
    if(available < 10)
    {
        return true
    }
    return false
}

//function to return the availability of date i.e slots = 14*10
module.exports.getDatesAvailability = async function(slotDate){
    let available = await Registration.countDocuments({slotDate})
    if(available < 140)
    {
        return true
    }
    return false
}

//function to return the availability of total slots i.e slots = 30*14*10
module.exports.getTotalAvailability = async function(){
    let available = await Registration.countDocuments({})
    if(available < 4200)
    {
        return true
    }
    return false
}