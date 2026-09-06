import exp from "express";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";
import { verifyToken } from "../middlewares/tokenVerificationMiddleware.js";
import { allowedRoles } from "../middlewares/allowedRolesMiddleware.js";

export const userRoute = exp.Router();

//User registration(User creation/ Create User account)
userRoute.post("/users", async (req, res) => {
  //get user from client
  let newUser = req.body;

  //only USER and EMPLOYER can register normally
  if (newUser.role === "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Admin account cannot be created through public registration",
    });
  }

  //hash the password
  let hashedPassword = await hash(newUser.password, 12);

  //replace plain password with hashed password
  newUser.password = hashedPassword;

  //save in db
  let userDocument = await UserModel.create(newUser);

  //send response without password
  let userResponse = userDocument.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    message: "User created",
    data: userResponse,
  });
});

//User Login
userRoute.post("/users/login", async (req, res) => {
  //get user cred object
  let credObj = req.body;

  //verify email
  let user = await UserModel.findOne({ email: credObj.email });

  //if email not found
  if (user === null) {
    return res.status(404).json({ success: false, message: "Invalid Email" });
  }

  //check whether user is active
  if (user.active === false) {
    return res.status(403).json({
      success: false,
      message: "Your account is inactive",
    });
  }

  //compare passwords
  let result = await compare(credObj.password, user.password);

  //if passwords not matched
  if (result === false) {
    return res.status(404).json({ success: false, message: "Invalid Password" });
  }

  //create encoded(signed) JWT token
  let signedToken = jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  //store token in cookie storage as httpOnly cookie
  res.cookie("accessToken", signedToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  //send response
  res.status(200).json({ success: true, message: "Login success" });
});

//User logout
userRoute.post("/logout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.status(200).json({ success: true, message: "Logout success" });
});

//User profile(protected route)
userRoute.get(
  "/users/:id",
  verifyToken,
  allowedRoles("USER"),
  async (req, res) => {
    //check the loggedin user id and id in url param are same or not
    let idOfParam = req.params.id;
    let currentUserId = req.user.id;

    if (idOfParam !== currentUserId) {
      return res.status(401).json({
        success: false,
        message: "You are not allowed to access other's profile",
      });
    }

    //find user by id and hide password
    let user = await UserModel.findById(idOfParam).select("-password");

    if (user === null) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User found", data: user });
  }
);

//update user by id(protected route)
userRoute.put(
  "/users/:id",
  verifyToken,
  allowedRoles("USER"),
  async (req, res) => {
    let idOfParam = req.params.id;
    let currentUserId = req.user.id;

    if (idOfParam !== currentUserId) {
      return res.status(401).json({
        success: false,
        message: "You are not allowed to access other's profile",
      });
    }

    //get modified user from client
    let { name, email, skills, experience, education } = req.body;

    //update
    let updatedUser = await UserModel.findByIdAndUpdate(
      idOfParam,
      { $set: { name, email, skills, experience, education } },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "User profile updated",
      data: updatedUser,
    });
  }
);
