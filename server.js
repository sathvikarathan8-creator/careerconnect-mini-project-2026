import exp from "express";
import { connect } from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { userRoute } from "./APIs/userAPI.js";
import { jobRoute } from "./APIs/jobAPI.js";
import { applicationRoute } from "./APIs/applicationAPI.js";
import { adminRouter } from "./APIs/adminAPI.js";

dotenv.config();

const app = exp();

// Basic service check for deployment and API testing
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "CareerConnect API",
    status: "running",
  });
});

//body parser
app.use(exp.json());
//cookie parser middleware
app.use(cookieParser());

const port = process.env.PORT || 4000;

// DB config
async function connectDB() {
  try {
    await connect(process.env.DB_URL);
    console.log("DB connected");
    app.listen(port, () => console.log(`server listening on ${port}..`));
  } catch (err) {
    console.log("Err in DB connection:", err.message);
  }
}

connectDB();

app.use("/user-api", userRoute);
app.use("/job-api", jobRoute);
app.use("/application-api", applicationRoute);
app.use("/admin-api", adminRouter);

//Error handling middleware
app.use((err, req, res, next) => {
  console.log("Err is ", err);
  res.status(500).json({ success: false, message: err.message });
});
