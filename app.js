const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv");
const users = require('./routers/users');
const admin = require('./routers/admin')
const app = express()

//port number
const port = process.env.PORT || 3000;

//connecting to database and starting server
dotenv.config();
mongoose.connect(process.env.DB_CONNECT, { 
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false }, () => {
    console.log("Connected to db!");
    app.listen(port, () => console.log("Server Up and running"));
});

//cors middleware
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')))

//body parser middleware
app.use(bodyParser.json());

//Index routes
app.use('/', users)
app.use('/', admin)
