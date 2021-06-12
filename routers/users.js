const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const config = require('../config/database')
const User = require('../models/users')
const Registration = require('../models/registration');
const bcrypt = require('bcryptjs')

//To signup user
router.post('/signup', async (req, res) => {
    try {
        const user = await User.getUserByPhone(req.body.phone)
        if(user) {
            return res.status(400).json({success: false, msg:"You are already registered."})
        }

        let newUser = new User({
            name: req.body.name,
            phone: req.body.phone,
            age: req.body.age,
            pincode: req.body.pincode,
            aadhar: req.body.aadhar,
            password: await bcrypt.hash(req.body.password, 8)
        })
        await newUser.save()
        res.status(201).send({success: true, msg: "You are registered successfully."})
    }catch (e) {
        res.status(400).send(e)
    }
})

//to login user
router.post('/login', async (req, res) => {
    const phone = req.body.phone;
    const password = req.body.password;

    try{
        let user = await User.getUserByPhone(phone)
        if(!user) {
            return res.status(404).json({success: false, msg:"User not found"})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(isMatch) {
            const token = jwt.sign({_id: user._id.toString()}, config.secret) //generating token 
            user = await User.findByIdAndUpdate(user._id, {token}) //updating in database
            res.status(200).json({
                success: true,
                msg: "You successfully logged in",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    phone: user.phone
                }
            })
        }
        else {
            return res.status(400).json({success:false, msg: 'Wrong password'});
        }
    }catch (e) {
        res.status(400).send(e)
    }
})

//to logout the user.
router.post('/logout', async (req, res) => {
    try {
        const token = req.header('Authorization')
        const decoded = jwt.verify(token, config.secret);
        const userId = decoded._id

        const val = await User.findById(userId)
        val.token = undefined

        const user = await val.save()
        res.status(200).send({msg: "Successfully logged out"})

    } catch (error) {
        res.status(400).send(e)
    }
})

//to get the 30 dates and their availability
router.get('/user/dates', async (req, res) => {
    
    try {
        const token = req.header('Authorization')
        const decoded = jwt.verify(token, config.secret);

        let totalAvailability = await Registration.getTotalAvailability()
        if(!totalAvailability){
            return res.status(400).send({success:false, msg: "All dates slots are filled."})
        }

        let year = 2021;
        let month = 6;
        let monthIndex = month - 1;
        let names = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
        let date = new Date(year, monthIndex, 1);
        let days = [];
        while (date.getMonth() == monthIndex) {
            let perDate;
            if(date.getDate() < 10){
                perDate = "0" + date.getDate() + "-0" + parseInt(date.getMonth()+1) + "-" + date.getFullYear()
            }
            else{
                perDate = date.getDate() + "-0" + parseInt(date.getMonth()+1) + "-" + date.getFullYear()
            }
            
            let dateObj = {}
            dateObj = {
                date : perDate,
                day: names[date.getDay()],
                availability: await Registration.getDatesAvailability(perDate) ? "Available" : "Not available"
            }
            days.push(dateObj);
            date.setDate(date.getDate() + 1);
        }
        res.status(200).json(days)
    } catch (error) {
        res.status(400).send(error)
    }
})

//to get the slots in specific date and their availability
router.get('/user/dates/slots', async (req, res) => {

    try {
        const token = req.header('Authorization')
        const decoded = jwt.verify(token, config.secret);

        let dateAvailability = await Registration.getDatesAvailability(req.body.slotDate)
        if(!dateAvailability){
            return res.status(400).send({success:false, msg: "Given date all slots are filled"})
        }

        let totalSlots = ['10.00AM-10.30AM', '10.30AM-11.00AM', '11.00AM-11.30AM', '11.30AM-12.00AM', '12.00PM-12.30PM', '12.30PM-01.00PM', 
                        '01.00PM-01.30PM', '01.30PM-02.00PM', '02.00PM-02.30PM', '02.30PM-03.00PM', '03.00PM-03.30PM', '03.30PM-04.00PM',
                        '04.00PM-04.30PM', '04.30PM-05.00PM']
        let slots = []
        for(let i=0; i<14; i++)
        {
            let slot = {}
            slot = {
                slotDate: req.body.slotDate,
                slot: totalSlots[i],
                availability: await Registration.getSlotsAvailability(totalSlots[i], req.body.slotDate) ? "Available" : "Not available"
            }
            slots.push(slot)
        }
        res.status(200).send({slots})
    } catch (error) {
        res.status(400).send(error)
    }
})

//to register the slot
router.post('/user/dates/slots/slotRegistration', async (req, res) => {
    try {
        const token = req.header('Authorization')
        const decoded = jwt.verify(token, config.secret);
        const userId = decoded._id

        let slotAvailability = await Registration.getSlotsAvailability(req.body.slotTime, req.body.slotDate)
        if(!slotAvailability){
            return res.status(400).json({success:false, msg: "Given slot doses are completed"})
        }

        const val = await Registration.findOne({ "user": userId })

        if(req.query.dose == 1){
            if(val == null){
                let registerData = new Registration({
                    user: userId,
                    userName: req.body.userName,
                    age: req.body.age,
                    pincode: req.body.pincode,
                    phone: req.body.phone,
                    stateOfDosage: "None",
                    slotDate: req.body.slotDate,
                    slotTime: req.body.slotTime
                });
        
                await registerData.save()
                return res.status(201).send({
                    success: true,
                    message: "Successfully registered for first dose."
                })
            }
            else {
                //finding current date and dose date
                let regDay = parseInt(val.slotDate.substring(0,3));
                let regHour = parseInt(val.slotTime.substring(8, 10))
                if(val.slotTime.substring(13, 15) === "PM" && regHour!=12){
                    regHour += 12
                }
                const regMin = parseInt(val.slotTime.substring(11, 13))
                let doseDateTime = new Date(2021, 5, regDay, regHour+6, regMin-30, 0);

                let currentDateTime = new Date();
                currentDateTime = new Date(currentDateTime.getFullYear(), 
                                        currentDateTime.getMonth(),
                                            currentDateTime.getDate(), 
                                            currentDateTime.getHours()+6, 
                                            currentDateTime.getMinutes()-30, 
                                            currentDateTime.getSeconds(), 
                                            currentDateTime.getMilliseconds())
                
                //if dosage time is lapsed then updating to firs dose completed in database
                if(currentDateTime.getTime() > doseDateTime.getTime() && val.stateOfDosage == "None") {
                    await Registration.findByIdAndUpdate(val._id, {stateOfDosage: "First dose completed"})
                }
                
                return res.status(400).json({
                    success:false, 
                    message: "You already registered for first dose."
                });
             }
        }
        else {
            if(val == null){
                return res.status(400).json({success:false, message : "Please first register for first dose."});
            }

            //finding current date and dose date
            let regDay = parseInt(val.slotDate.substring(0,3));
            let regHour = parseInt(val.slotTime.substring(8, 10))
            if(val.slotTime.substring(13, 15) === "PM" && regHour!=12){
                regHour += 12
            }
            const regMin = parseInt(val.slotTime.substring(11, 13))
            let doseDateTime = new Date(2021, 5, regDay, regHour+6, regMin-30, 0);

            let currentDateTime = new Date();
            currentDateTime = new Date(currentDateTime.getFullYear(), 
                                       currentDateTime.getMonth(),
                                        currentDateTime.getDate(), 
                                        currentDateTime.getHours()+6, 
                                        currentDateTime.getMinutes()-30, 
                                        currentDateTime.getSeconds(), 
                                        currentDateTime.getMilliseconds())

            //if user already registered for second dose.
            if(currentDateTime.getTime() > doseDateTime.getTime() && val.stateOfDosage == "Second dose registered") { //if time lapsed then updating.
                await Registration.findByIdAndUpdate(val._id, {stateOfDosage: "All completed"})
                res.status(400).json({
                    success:false, 
                    message : "You completed all doses."
                });
            }
            else if(val.stateOfDosage == "Second dose registered") {
                res.status(400).json({success:false, message : "You already registered for second dose."});
            }
            else if(currentDateTime.getTime() <= doseDateTime.getTime()) { //allowing after completing the first dose.
                res.status(400).json({
                    success:false, 
                    message : "You didnot taken first dose. Please register after completing the first dose."
                });
            }
            else{ //registering for second dose by updating the details.
                await Registration.findByIdAndUpdate(val._id, {stateOfDosage: "Second dose registered", slotDate: req.body.slotDate, slotTime: req.body.slotTime})
                res.status(201).json({success:true, message : "You successfully registered for second dose."});
            }
        }
    } catch (error) {
        res.status(400).send(error)
    }
})

//to user get the registered details.
router.get('/user/getRegistrationDetails', async (req, res) => {
    try {
        const token = req.header('Authorization')
        const decoded = jwt.verify(token, config.secret);
        const userId = decoded._id

        const val = await Registration.findOne({ "user": userId })

        res.status(200).send({
            name: val.userName,
            age: val.age,
            pincode: val.pincode,
            phone: val.phone,
            stateOfDosage: val.stateOfDosage,
            slotDate: val.slotDate,
            slotTime: val.slotTime
        })

    } catch (error) {
        res.status(400).send(error)
    }
})

//to user updating the dosage registration.
router.put('/user/updateRegistration', async (req, res) => {

    try {
        const token = req.header('Authorization')
        const decoded = jwt.verify(token, config.secret);
        let userId = decoded._id

        const val = await Registration.findOne({ "user": userId })

        //findindg the current date and dosage before date.
        let regDay = parseInt(val.slotDate.substring(0,3));
        let regHour = parseInt(val.slotTime.substring(8, 10))
        if(val.slotTime.substring(13, 15) === "PM" && regHour!=12){
            regHour += 12
        }
        const regMin = parseInt(val.slotTime.substring(11, 13))
        let doseDateTime = new Date(2021, 5, regDay-1, regHour+6, regMin-30, 0);
        
        let currentDateTime = new Date();
        currentDateTime = new Date(currentDateTime.getFullYear(), 
                                currentDateTime.getMonth(),
                                currentDateTime.getDate(), 
                                currentDateTime.getHours()+6, 
                                currentDateTime.getMinutes()-30, 
                                currentDateTime.getSeconds(), 
                                currentDateTime.getMilliseconds())
        
        //if user come to update below the 24 hours then not allowing.
        if(currentDateTime.getTime() > doseDateTime.getTime()){
            res.status(400).json({success: false, message : "Not possible to update less than 24 hours of dosage registered time."});
        }
        else{ //if user come to update above 24 hours then updating.
            await Registration.findByIdAndUpdate(val._id, {slotDate: req.body.slotDate, slotTime: req.body.slotTime})
            res.status(200).json({
                success: true,
                message : "Registered details updated."});
        }
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router

