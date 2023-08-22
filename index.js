const express = require('express')
const app = express()
const argon2 = require('argon2');
const cors = require('cors')
const connection = require('./db');
const AppointmentModel = require('./model/docters.model');
const UserModel = require('./model/user.model');
const jwt = require('jsonwebtoken');

app.use(express.json())
app.use(cors())

app.post('/signup', async (req, res) => {
    let { name, email, password } = req.body
    try {
        const hash = await argon2.hash(password);
        let newuser = new UserModel({ name, email, password: hash })
        await newuser.save()
        return res.send({ "msg": "Signup successful!" })
    } catch (err) {
        console.log(err)
        return res.send({ "msg": "Signup failed!" })
    }
})
app.post('/login', async (req, res) => {
    let { email, password } = req.body
    try {
        const user = await UserModel.findOne({ 'email': email });
        if (!user) {
            return res.send({ "msg": "No such user found!" })
        } else {
            let hashPass = user.password
            if (await argon2.verify(hashPass, password)) {
                let token = jwt.sign({ email: email }, 'secret');
                return res.send({ "msg": "Login Successful!", "token": token })
            } else {
                return res.send({ "msg": "Wrong Password!" })
            }
        }

    } catch (err) {
        return res.status(404).send({ "msg": "Something went wrong!" })
    }
})

app.post('/appointments', async (req, res) => {
    let { name, imageUrl, specialization, experience, location, date, slots, fee } = req.body

    try {
        var appointment = new AppointmentModel({ name, imageUrl, specialization, experience, location, date, slots, fee })
        await appointment.save()
        return res.send("Appointment booked successfully!")
    } catch (error) {
        return res.send("Appointment booking failed!")
    }
})

app.get('/dashboard', async (req, res) => {
    // let { name, imageUrl, specialization, experience, location, date, slots, fee } = req.body

    try {
        var appointments = await AppointmentModel.find()
        return res.send({ "data": appointments })
    } catch (error) {
        return res.send("Fetch failed!")
    }
})

app.delete('/delete/:id', async (req, res) => {
    let id = req.params.id

    try {
        await AppointmentModel.findByIdAndDelete(id)
        return res.send({ 'msg': 'Deleted' })
    } catch (error) {
        return res.send({ 'msg': 'Error' })
    }
})

app.listen(4500, async () => {
    try {
        await connection
        console.log('Connected to db!')
    } catch (error) {
        console.log('Connected to db!', error)
    }
})