const express = require("express");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const path = require("path");
const cors = require("cors");

const dotenv = require("dotenv");
require("./config/db");

dotenv.config({ path: "./config/.env" });

const { checkUser, requireAuth } = require("./middleware/auth.middleware");

const app = express();

const corsOptions = {
  origin: "https://elastic-heisenberg-0a0fd3.netlify.app",
  methods: "GET,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//JWT

// app.get("*", checkUser);
// app.get("/api/jwtid", requireAuth, (req, res) => {
//   res.status(200).send(res.locals.user._id);
// });

// routes
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);

// serve static assets if in production
if (process.env.NODE_ENV === "production") {
  //set static folder
  app.use(express.static(path.join(__dirname, "../build")));
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../build"));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
