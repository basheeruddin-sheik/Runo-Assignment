const mongoose = require('mongoose')

//creating admin schema
const adminSchema = mongoose.Schema({
    phone: {
        type: String,
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

//creating admin model
const Admin = module.exports = mongoose.model('Admin', adminSchema);

//function to return the admin by phone number.
module.exports.getAdminByPhone = async function(phone) {
    const query = {phone}
    const admin = await Admin.findOne(query)
    return admin
}