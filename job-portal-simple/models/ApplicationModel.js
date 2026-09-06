import { Schema, model } from "mongoose";

const applicationSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "job",
      required: [true, "Job is required"],
    },
    jobSeeker: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Job seeker is required"],
    },
    jobSnapshot: {
      title: { type: String, required: true },
      companyName: { type: String, required: true },
    },
    resumeLink: {
      type: String,
      trim: true,
    },
    coverLetter: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["APPLIED", "SHORTLISTED", "REJECTED", "HIRED"],
      default: "APPLIED",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

//prevent duplicate applications for the same job
applicationSchema.index({ job: 1, jobSeeker: 1 }, { unique: true });

//create model
export const ApplicationModel = model("application", applicationSchema);
