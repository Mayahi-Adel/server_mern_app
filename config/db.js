const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/.env" });

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER_PASS}@cluster0.jyl5o.mongodb.net/mern-project`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log("Fieled to connect to MongoDB", err));
