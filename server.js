const express = require("express");
const connectDB = require("./config/db");
const app = express();

connectDB();

//Middleware: Body Pasrser
app.use(express.json({ extended: false }));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("API is running.. ");
});

//Routes
app.use("/api/contacts", require("./route/api/contact"));

const PORT = process.env.PORT || 2000;

app.listen(PORT, () => console.log(PORT));
