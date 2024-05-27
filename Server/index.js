const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");

const { auth } = require("./middlewares/auth");

const database = require("./config/database");
const cookieParser = require("cookie-parser");

//backend mere frontend ki request ko entertain karein and hence need cors
const cors = require("cors");

const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 4000;

//database connect
database.connect();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    //meri frontend ki request 3000 port se aayegi and hence it is very important
    origin: "*",
    credentials: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

//cloudinary connection
cloudinaryConnect();

//mounting the routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/course", courseRoutes);

//default route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your app is running successfully",
  });
});

//activate the server
app.listen(PORT, () => {
  console.log(`App is running at port ${PORT}`);
});
