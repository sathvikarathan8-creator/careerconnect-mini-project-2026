import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { JobModel } from "../models/JobModel.js";
import { ApplicationModel } from "../models/ApplicationModel.js";
import { verifyToken } from "../middlewares/tokenVerificationMiddleware.js";
import { allowedRoles } from "../middlewares/allowedRolesMiddleware.js";

export const adminRouter = exp.Router();

//Admin views all users
adminRouter.get(
  "/users",
  verifyToken,
  allowedRoles("ADMIN"),
  async (req, res) => {
    let users = await UserModel.find().select("-password");

    res.status(200).json({
      success: true,
      message: "List of users",
      data: users,
    });
  }
);

//Admin views one user
adminRouter.get(
  "/users/:id",
  verifyToken,
  allowedRoles("ADMIN"),
  async (req, res) => {
    let user = await UserModel.findById(req.params.id).select("-password");

    if (user === null) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User found", data: user });
  }
);

//Admin updates user status
adminRouter.put(
  "/users/:id/status",
  verifyToken,
  allowedRoles("ADMIN"),
  async (req, res) => {
    let { active } = req.body;

    let updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $set: { active } },
      { new: true, runValidators: true }
    ).select("-password");

    if (updatedUser === null) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User status updated",
      data: updatedUser,
    });
  }
);

//Admin deletes user
adminRouter.delete(
  "/users/:id",
  verifyToken,
  allowedRoles("ADMIN"),
  async (req, res) => {
    let deletedUser = await UserModel.findByIdAndDelete(req.params.id);

    if (deletedUser === null) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted" });
  }
);

//Admin views all jobs
adminRouter.get(
  "/jobs",
  verifyToken,
  allowedRoles("ADMIN"),
  async (req, res) => {
    let jobs = await JobModel.find().populate("employer", "name email");

    res.status(200).json({
      success: true,
      message: "List of all jobs",
      data: jobs,
    });
  }
);

//Admin views one job
adminRouter.get(
  "/jobs/:id",
  verifyToken,
  allowedRoles("ADMIN"),
  async (req, res) => {
    let job = await JobModel.findById(req.params.id).populate(
      "employer",
      "name email"
    );

    if (job === null) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({ success: true, message: "Job found", data: job });
  }
);

//Admin removes job
adminRouter.delete(
  "/jobs/:id",
  verifyToken,
  allowedRoles("ADMIN"),
  async (req, res) => {
    let deletedJob = await JobModel.findByIdAndDelete(req.params.id);

    if (deletedJob === null) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    //remove applications related to deleted job
    await ApplicationModel.deleteMany({ job: req.params.id });

    res.status(200).json({ success: true, message: "Job removed" });
  }
);

//Admin platform data
adminRouter.get(
  "/stats",
  verifyToken,
  allowedRoles("ADMIN"),
  async (req, res) => {
    let totalUsers = await UserModel.countDocuments();
    let totalJobs = await JobModel.countDocuments();
    let totalApplications = await ApplicationModel.countDocuments();

    res.status(200).json({
      success: true,
      message: "Platform statistics",
      data: {
        totalUsers,
        totalJobs,
        totalApplications,
      },
    });
  }
);
