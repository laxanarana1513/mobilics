const express = require("express");
const fs = require("fs");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();
const mongoURL = process.env.MONGO_URL;
const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());
app.use(cors());
// Set CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const data = JSON.parse(fs.readFileSync('./sample_data.json', 'utf-8'))

//connect to mongodb
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

//User Schema
const UserSchema = new mongoose.Schema({
    id: Number,
    first_name: String,
    last_name: String,
    email: String,
    gender: String,
    income: String,
    city: String,
    car: String,
    quote: String,
    phone_price: String
})

//User model
const User = mongoose.model("User", UserSchema);

//import data to mongodb
const importData = async () => {
    try {
        await User.create(data);
        process.exit();
    } catch (err) {
        console.error(err);
    }
}
importData();

app.get('/', async (req, res) => {
    try {
        res.status(200).send("Live Server")
    }catch(err) {
        res.status(500).send(`Server Error ${err}`)
    }
})

//API for task1
app.get('/task1', async (req, res) => {
    try {
        const one = await data.filter(user => {
            var income = user.income.substr(1);
            return parseFloat(income) < 5 && ['BMW', 'Mercedes'].includes(user.car);
        });
        res.status(200).json(one);
    }
    catch (err) {
        res.status(500).send(`Server Error ${err}`);
    }
})

//API for task2
app.get('/task2', async (req, res) => {
    try {
        const two = await data.filter(user => {
            var price = parseInt(user.phone_price);
            return user.gender === 'Male' && price > 10000;
        })
        res.status(200).json(two);
    }
    catch (err) {
        res.status(500).send(`Server Error ${err}`)
    }
})

//API for task3
app.get('/task3', async (req, res) => {
    try {
        const three = await data.filter(user => {
            var last = user.last_name.toLowerCase();
            return user.last_name.startsWith('M') && user.quote.length > 15 && user.email.includes(last);
        })
        res.status(200).json(three);
    } catch (err) {
        res.status(500).send(`Server Error ${err}`);
    }
})

//API for task4
app.get('/task4', async (req, res) => {
    try {
        const four = await data.filter(user => {
            return ['BMW', 'Mercedes', 'Audi'].includes(user.car) && !/\d/.test(user.email);
        })
        res.status(200).json(four);
    } catch (err) {
        res.status(500).send(`Server Error ${err}`)
    }
})

//API for task5
app.get('/task5', async (req, res) => {
    try {
        const dataCities = {};

        data.forEach(user => {
            const city = user.city;
            var income = parseFloat(user.income.substr(1));
            if (dataCities[city]) {
                dataCities[city].count++;
                dataCities[city].totalIncome += income;
            } else {
                dataCities[city] = {
                    count: 1,
                    totalIncome: income
                }
            }
        })

        const sortedCities = Object.keys(dataCities).sort((x, y) => {
            return dataCities[y].count - dataCities[x].count;
        }).slice(0, 10);

        const finalResult = sortedCities.map(city => {
            const count = dataCities[city].count;
            const totalIncome = dataCities[city].totalIncome;
            const avgIncome = totalIncome / count;
            return {
                city: city,
                id: count,
                income: avgIncome
            }
        })

        console.log(finalResult);
        res.status(200).json(finalResult);

    } catch (err) {
        res.status(500).send(`Server Error ${err}`);
    }
})

//server start
app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})