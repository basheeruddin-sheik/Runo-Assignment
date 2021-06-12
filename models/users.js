const mongoose = require('mongoose')

//declaring user schema
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
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
    aadhar: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String
    }
})

//creating user model
const User = module.exports = mongoose.model('User', userSchema);


//function to find the user by given phone number
module.exports.getUserByPhone = async function(phone) {
    const query = {phone}
    const user = await User.findOne(query)
    return user
}


