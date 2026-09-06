import { Schema, model } from "mongoose";

const educationSchema = new Schema(
  {
    degree: {
      type: String,
      required: [true, "Degree is required"],
      trim: true,
    },
    institution: {
      type: String,
      required: [true, "Institution is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
    },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minLength: [4, "Min length of name should be 4"],
      maxLength: [30, "Max length of name should not exceed 30"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: [true, "Email already existed"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [4, "Min length of password should be 4"],
    },
    role: {
      type: String,
      enum: {
        values: ["USER", "EMPLOYER", "ADMIN"],
        message: "Invalid role",
      },
      default: "USER",
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      default: 0,
      min: [0, "Experience cannot be negative"],
    },
    education: {
      type: [educationSchema],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: "throw",
  }
);

//create model
export const UserModel = model("user", userSchema);
