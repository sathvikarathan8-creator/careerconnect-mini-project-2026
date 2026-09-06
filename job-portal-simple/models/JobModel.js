import { Schema, model } from "mongoose";

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"],
      required: [true, "Employment type is required"],
    },
    salaryRange: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    experienceRequirement: {
      type: Number,
      min: [0, "Experience cannot be negative"],
      default: 0,
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    applicationDeadline: {
      type: Date,
      required: [true, "Application deadline is required"],
    },
    jobStatus: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
    },
    employer: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Employer is required"],
    },
  },
  {
    versionKey: false,
  }
);

//create model
export const JobModel = model("job", jobSchema);
