const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const config = require('../config/database')
const Admin = require('../models/admin')
const Registration = require('../models/registration')

//To signup admin
router.post('/admin/signup', async (req, res) => {
    try {
        const admin = await Admin.getAdminByPhone(req.body.phone)
        if(admin) {
            return res.status(400).json({success: false, msg:"This admin is already registered."})
        }
        let newAdmin = new Admin({
            phone: req.body.phone,
            password: req.body.password
        })
        await newAdmin.save()
        res.status(201).send({success: true, msg: "Admin registered successfully."})
    }catch (e) {
        res.status(400).send(e)
    }
})

//admin to login.
router.post('/admin/login', async (req, res) => {
    const phone = req.body.phone;
    const password = req.body.password;
    try{
        let admin = await Admin.getAdminByPhone(phone)
        if(!admin) {
            return res.status(404).json({success: false, msg:"Admin not found"})
        }

        if(password == admin.password) {
            const token = jwt.sign({_id: admin._id.toString()}, config.secret)
            admin = await Admin.findByIdAndUpdate(admin._id, {token})
            res.status(200).json({
                success: true,
                token,
                phone: admin.phone
            })
        }
        else {
            return res.status(400).json({success:false, msg: 'Wrong password'});
        }
    }catch (e) {
        res.status(400).send(e)
    }
})

//admin logout
router.post('/admin/logout', async (req, res) => {
    try {
        const token = req.header('Authorization')
        const decoded = jwt.verify(token, config.secret);
        const adminId = decoded._id

        const val = await Admin.findById(adminId)
        val.token = undefined

        const user = await val.save()
        res.status(200).send({msg: "Successfully logged out"})

    } catch (error) {
        res.status(400).send(e)
    }
})

//admin to get the records by filters.
router.get('/admin/registrationsList', async (req, res) => {
    try {
        const token = req.header('Authorization')
        const decoded = jwt.verify(token, config.secret);

        //taking the admin given queries
        let query = {}
        if(req.query.slotDate && req.query.stateOfDosage){
            query = {
                slotDate: req.query.slotDate,
                stateOfDosage: req.query.stateOfDosage
            }
        }
        else if(req.query.slotDate){
            query = {
                slotDate: req.query.slotDate,
            }
        }
        else if(req.query.age && req.query.pincode && req.query.stateOfDosage){
            query = {
                age: req.query.age,
                pincode: req.query.pincode,
                stateOfDosage: req.query.stateOfDosage
            }
        }
        else if(req.query.age && req.query.pincode){
            query = {
                age: req.query.age,
                pincode: req.query.pincode
            }
        }
        else if(req.query.pincode && req.query.stateOfDosage){
            query = {
                pincode: req.query.pincode,
                stateOfDosage: req.query.stateOfDosage
            }
        }
        else if(req.query.age  && req.query.stateOfDosage){
            query = {
                age: req.query.age,
                stateOfDosage: req.query.stateOfDosage
            }
        }
        else if(req.query.age){
            query = {
                age: req.query.age
            }
        }
        else if(req.query.pincode){
            query = {
                pincode: req.query.pincode
            }
        }
        else if(req.query.stateOfDosage){
            query = {
                stateOfDosage: req.query.stateOfDosage
            }
        }

        //finding the records based on admin given filters.
        const val  = await Registration.find(query).exec()
        return res.status(200).json({
            success: true,
            message: "Required slots",
            data : val
        });
    } catch (error) {
        res.status(400).send(e)
    }
})


module.exports = router