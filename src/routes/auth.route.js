const express = require("express");
const userModel = require("../models/user.model");
const crypto = require("crypto");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");

authRouter.post("/register", async (req, res) => {
  const { userName, password, email, profileImage, bio } = req.body;

  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ userName }, { email }],
  });

  if (isUserAlreadyExists) {
    return res.status(409).json({
      message:
        "user already exists" +
        (isUserAlreadyExists.email == email
          ? "Email already exists"
          : "username already exists"),
    });
  }

  const hash = crypto.createHash("sha256").update(password).digest("hex");

  const user = await userModel.create({
    userName,
    email,
    password: hash,
    bio,
    profileImage,
  });

  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRETE,
    { expiresIn: "1d" },
  );

  res.cookie("token", token);

  res.status(201).json({
    message: "user registered successfully",
    user: {
      userName: user.userName,
      email: user.email,
      bio: user.bio,
      profileImage: user.profileImage,
    },
  });
});

authRouter.post("/login", async (req, res) => {
  const { userName, email, password } = req.body;

  const user = userModel.findOne({
    $or: [
      {
        userName: userName,
      },
      {
        email: email,
      },
    ],
  });
});

module.exports = authRouter;
