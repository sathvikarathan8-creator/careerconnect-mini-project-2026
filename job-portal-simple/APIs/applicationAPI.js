import exp from "express";
import { ApplicationModel } from "../models/ApplicationModel.js";
import { JobModel } from "../models/JobModel.js";
import { verifyToken } from "../middlewares/tokenVerificationMiddleware.js";
import { allowedRoles } from "../middlewares/allowedRolesMiddleware.js";

export const applicationRoute = exp.Router();

//Job Seeker applies for a job
applicationRoute.post(
  "/applications/:jobId",
  verifyToken,
  allowedRoles("USER"),
  async (req, res) => {
    //find job
    let job = await JobModel.findById(req.params.jobId);

    if (job === null) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    //check job status
    if (job.jobStatus !== "OPEN") {
      return res.status(400).json({
        success: false,
        message: "Applications are closed for this job",
      });
    }

    //check deadline
    if (new Date(job.applicationDeadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Application deadline has passed",
      });
    }

    //check whether user already applied
    let oldApplication = await ApplicationModel.findOne({
      job: job._id,
      jobSeeker: req.user.id,
    });

    if (oldApplication !== null) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    //get application from client
    let newApplication = {
      job: job._id,
      jobSeeker: req.user.id,
      jobSnapshot: {
        title: job.title,
        companyName: job.companyName,
      },
      resumeLink: req.body.resumeLink,
      coverLetter: req.body.coverLetter,
    };

    //save in db
    let applicationDocument = await ApplicationModel.create(newApplication);

    //send response
    res.status(201).json({
      success: true,
      message: "Application submitted",
      data: applicationDocument,
    });
  }
);

//Job Seeker views submitted applications
applicationRoute.get(
  "/my-applications",
  verifyToken,
  allowedRoles("USER"),
  async (req, res) => {
    let applications = await ApplicationModel.find({
      jobSeeker: req.user.id,
    }).populate("job", "title companyName location");

    res.status(200).json({
      success: true,
      message: "Your applications",
      data: applications,
    });
  }
);

//Job Seeker views one application/status
applicationRoute.get(
  "/applications/:id",
  verifyToken,
  allowedRoles("USER"),
  async (req, res) => {
    let application = await ApplicationModel.findOne({
      _id: req.params.id,
      jobSeeker: req.user.id,
    }).populate("job", "title companyName location");

    if (application === null) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application found",
      data: application,
    });
  }
);

//Employer views applications for their jobs
applicationRoute.get(
  "/employer-applications",
  verifyToken,
  allowedRoles("EMPLOYER"),
  async (req, res) => {
    //get employer jobs
    let jobs = await JobModel.find({ employer: req.user.id }).select("_id");
    let jobIds = jobs.map((job) => job._id);

    //get applications for those jobs
    let applications = await ApplicationModel.find({
      job: { $in: jobIds },
    })
      .populate("job", "title companyName")
      .populate("jobSeeker", "name email skills experience education");

    res.status(200).json({
      success: true,
      message: "Applications received for your jobs",
      data: applications,
    });
  }
);

//Employer updates application status
applicationRoute.put(
  "/applications/:id/status",
  verifyToken,
  allowedRoles("EMPLOYER"),
  async (req, res) => {
    let application = await ApplicationModel.findById(req.params.id).populate(
      "job"
    );

    if (application === null) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    //check whether this job belongs to logged in employer
    if (application.job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can manage applications only for your jobs",
      });
    }

    //get status from client
    let { status } = req.body;

    if (!["APPLIED", "SHORTLISTED", "REJECTED", "HIRED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    //update status
    let updatedApplication = await ApplicationModel.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Application status updated",
      data: updatedApplication,
    });
  }
);
