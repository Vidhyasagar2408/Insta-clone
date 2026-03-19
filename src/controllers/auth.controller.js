const userModel = require("../models/user.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

async function registerController(req, res) {
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
}

async function loginController(req, res) {
  const { userName, email, password } = req.body;

  const user = await userModel.findOne({
    $or: [
      {
        userName: userName,
      },
      {
        email: email,
      },
    ],
  });

  if (!user) {
    return res.status(404).json({
      message: "user not found",
    });
  }

  const hash = crypto.createHash("sha256").update(password).digest("hex");

  const isPasswordValid = hash == user.password;

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "password incorrect",
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRETE, {
    expiresIn: "1d",
  });

  res.cookie("token", token);

  res.status(200).json({
    message: "User logged in successfully",
    user: {
      userName: user.userName,
      email: user.email,
      bio: user.bio,
      profileImage: user.profileImage,
    },
  });
}

module.exports = {
  registerController,
  loginController,
};
