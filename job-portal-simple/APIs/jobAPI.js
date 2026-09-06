import exp from "express";
import { JobModel } from "../models/JobModel.js";
import { verifyToken } from "../middlewares/tokenVerificationMiddleware.js";
import { allowedRoles } from "../middlewares/allowedRolesMiddleware.js";

export const jobRoute = exp.Router();

// Browse open jobs with optional keyword, location and employment filters
jobRoute.get("/jobs", async (req, res) => {
  const { keyword, location, employmentType } = req.query;
  const filter = { jobStatus: "OPEN" };

  if (keyword?.trim()) {
    filter.$or = [
      { title: { $regex: keyword.trim(), $options: "i" } },
      { companyName: { $regex: keyword.trim(), $options: "i" } },
      { requiredSkills: { $regex: keyword.trim(), $options: "i" } },
    ];
  }

  if (location?.trim()) {
    filter.location = { $regex: location.trim(), $options: "i" };
  }

  if (employmentType) {
    filter.employmentType = employmentType.toUpperCase();
  }

  const jobs = await JobModel.find(filter)
    .sort({ postedDate: -1 })
    .populate("employer", "name email");

  res.status(200).json({
    success: true,
    message: "Available jobs retrieved",
    count: jobs.length,
    data: jobs,
  });
});

//View a single job by id
jobRoute.get("/jobs/:id", async (req, res) => {
  let job = await JobModel.findById(req.params.id).populate(
    "employer",
    "name email"
  );

  if (job === null) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }

  res.status(200).json({ success: true, message: "Job found", data: job });
});

//Employer creates a job
jobRoute.post(
  "/jobs",
  verifyToken,
  allowedRoles("EMPLOYER"),
  async (req, res) => {
    //get job from client
    let newJob = req.body;

    //add logged in employer id
    newJob.employer = req.user.id;

    //save in db
    let jobDocument = await JobModel.create(newJob);

    //send response
    res.status(201).json({
      success: true,
      message: "Job created",
      data: jobDocument,
    });
  }
);

//Employer views own jobs
jobRoute.get(
  "/my-jobs",
  verifyToken,
  allowedRoles("EMPLOYER"),
  async (req, res) => {
    let jobs = await JobModel.find({ employer: req.user.id });

    res.status(200).json({
      success: true,
      message: "Your jobs",
      data: jobs,
    });
  }
);

//Employer updates own job
jobRoute.put(
  "/jobs/:id",
  verifyToken,
  allowedRoles("EMPLOYER"),
  async (req, res) => {
    //find job
    let job = await JobModel.findById(req.params.id);

    if (job === null) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    //check ownership
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own jobs",
      });
    }

    //update job
    let updatedJob = await JobModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Job updated",
      data: updatedJob,
    });
  }
);

//Employer deletes own job
jobRoute.delete(
  "/jobs/:id",
  verifyToken,
  allowedRoles("EMPLOYER"),
  async (req, res) => {
    //find job
    let job = await JobModel.findById(req.params.id);

    if (job === null) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    //check ownership
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own jobs",
      });
    }

    //delete job
    await JobModel.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Job deleted" });
  }
);
