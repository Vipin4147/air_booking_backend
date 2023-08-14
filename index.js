const express = require("express");
const { connection } = require("./config/db.js");
const app = express();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("./models/usermodel.js");
const { FlightModel } = require("./models/flightmodel.js");
const { BookingModel } = require("./models/bookingmodel.js");

app.use(express.json());
app.get("/", (req, res) => {
  res.send("welcome user");
});

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let old_user = await UserModel.find({ email });

    if (old_user.length > 0) {
      res.status(400).send("User already registered please login");
      return;
    }

    bcrypt.hash(password, 8, async (err, secured_pass) => {
      if (err) {
        console.log("err", err);
      } else {
        const user = new UserModel({ name, email, password: secured_pass });
        await user.save();
        // res.send("User registered Successfull");
        res.status(201).send("User registered Successfull");
      }
    });
  } catch (error) {
    res.send("something went wrong in register");
    console.log("err", error);
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await UserModel.find({ email });
    if (user.length > 0) {
      bcrypt.compare(password, user[0].password, (err, result) => {
        if (result) {
          const token = jwt.sign({ school: "masaischool" }, "masai");
          res.status(201).send({ msg: "login Successful", token: token });
        } else {
          res.status(400).send("wrong Credentials");
        }
      });
    }
  } catch (error) {
    res.send("something went wrong");
    console.log("err", error);
  }
});

app.get("/api/flights", async (req, res) => {
  const flights = await FlightModel.find();
  res.status(200).send(flights);
});

app.get("/api/flights/:id", async (req, res) => {
  try {
    const ID = req.params.id;
    const flight = await FlightModel.findById(ID);
    res.status(200).send(flight);
  } catch (error) {
    res.send(error);
    console.log("err", error);
  }
});

app.patch("/api/flights/:id", async (req, res) => {
  try {
    const ID = req.params.id;
    let payload = req.body;
    const flight = await FlightModel.findByIdAndUpdate(ID, payload);
    res.status(204).send("flight updated successfully");
  } catch (error) {
    res.send(error);
    console.log("err", error);
  }
});

app.delete("/api/flights/:id", async (req, res) => {
  try {
    const ID = req.params.id;

    const flight = await FlightModel.findByIdAndDelete(ID);
    res.status(202).send("flight deleted successfully");
  } catch (error) {
    res.send(error);
    console.log("err", error);
  }
});

app.post("/api/flights", async (req, res) => {
  try {
    const {
      airline,
      flightNo,
      departure,
      arrival,
      departureTime,
      arrivalTime,
      seats,
      price,
    } = req.body;

    const flight = new FlightModel({
      airline,
      flightNo,
      departure,
      arrival,
      departureTime,
      arrivalTime,
      seats,
      price,
    });

    await flight.save();

    res.status(201).send("New flight added to the system successfully");
  } catch (error) {
    res.send("something went wrong in adding a flight");
    console.log("err", error);
  }
});

app.post("/api/flights", async (req, res) => {
  try {
    const { user, flight } = req.body;

    const booking = new BookingModel({
      user,
      flight,
    });

    await booking.save();

    res.status(201).send("New booking added to the system successfully");
  } catch (error) {
    res.send("something went wrong in booking a flight");
    console.log("err", error);
  }
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const booking = await BookingModel.find();
    res.status(200).send(booking);
  } catch (error) {
    res.send(error);
    console.log("err", error);
  }
});

app.patch("/api/dashboard/:id", async (req, res) => {
  try {
    const ID = req.params.id;
    let payload = req.body;
    const flight = await BookingModel.findByIdAndUpdate(ID, payload);
    res.status(204).send("booking updated successfully");
  } catch (error) {
    res.send(error);
    console.log("err", error);
  }
});

app.delete("/api/flights/:id", async (req, res) => {
  try {
    const ID = req.params.id;

    const flight = await BookingModel.findByIdAndDelete(ID);
    res.status(202).send("booking deleted successfully");
  } catch (error) {
    res.send(error);
    console.log("err", error);
  }
});

app.listen(7100, async () => {
  try {
    await connection;
    console.log("connected to db");
  } catch (error) {
    console.log("something went wrong in connection");
    console.log("err", error);
  }
  console.log("running at 7100");
});
