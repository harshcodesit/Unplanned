const User = require("../models/user.js");
const Vibe = require("../models/vibe.js");
const Request = require("../models/request.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const getAuthCookieOptions = () => ({
  maxAge: 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
});

const getClearCookieOptions = () => ({
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
});

const registerUser = async (req, res) => {
  const { name, username, email, password } = req.body || {};
  let errors = [];

  if (!name || !username || !email || !password) {
    errors.push({ msg: "Please enter all fields." });
  }
  if (password && password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters." });
  }
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (username && !usernameRegex.test(username)) {
    errors.push({
      msg: "Username can only contain letters, numbers, and underscores, and be 3-20 characters long.",
    });
  }
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (email && !emailRegex.test(email)) {
    errors.push({ msg: "Please enter a valid email address." });
  }
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const lowercasedUsername = username.toLowerCase();
  const lowercasedEmail = email.toLowerCase();
  const avatarUrl = req.file ? req.file.path : undefined;

  try {
    const existingUserByEmail = await User.findOne({ email: lowercasedEmail });
    if (existingUserByEmail) {
      errors.push({ msg: "Email is already registered." });
    }

    const existingUserByUsername = await User.findOne({
      username: lowercasedUsername,
    });
    if (existingUserByUsername) {
      errors.push({ msg: "Username is already taken." });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username: lowercasedUsername,
      email: lowercasedEmail,
      password: hashedPassword,
    });
    if (avatarUrl) {
      newUser.avatarUrl = avatarUrl;
    }
    const savedUser = await newUser.save();
    const token = jwt.sign(
      { userId: savedUser._id, username: savedUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    return res
      .status(201)
      .cookie("token", token, getAuthCookieOptions())
      .json({
        message: "User registered successfully!",
        user: {
          id: savedUser._id,
          name: savedUser.name,
          username: savedUser.username,
          email: savedUser.email,
          avatarUrl: savedUser.avatarUrl,
        },
        success: true,
      });
  } catch (err) {
    console.error("Database Error during registration:", err);

    if (err.code === 11000) {
      let msg = "A record with that information already exists.";
      if (err.keyPattern && err.keyPattern.email) {
        msg = "That email is already registered to another account.";
      } else if (err.keyPattern && err.keyPattern.username) {
        msg = "That username is already taken.";
      }
      return res.status(400).json({ errors: [{ msg }] });
    }

    return res.status(500).json({
      errors: [{ msg: "Server error during registration. Please try again." }],
    });
  }
};



const loginUser = async (req, res) => {

  console.log("Login request body:", req.body);
  const { email, username, password } = req.body || {};
  let errors = [];

  if ((!email && !username) || !password) {
    errors.push({ msg: "Please enter your credentials and password." });
    return res.status(400).json({ errors });
  }

  try {
    let user = null;

    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (username) {
      user = await User.findOne({ username: username.toLowerCase() });
    }

    if (!user) {
      errors.push({ msg: "Invalid email/username or password." });
      return res.status(400).json({ errors });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      errors.push({ msg: "Invalid email/username or password." });
      return res.status(400).json({ errors });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res
      .status(200)
      .cookie("token", token, getAuthCookieOptions())
      .json({
        message: "Logged in successfully!",
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
        success: true,
      });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      errors: [{ msg: "Server error during login. Please try again." }],
    });
  }
};


const logoutUser = (req, res) => {
  res.clearCookie("token", getClearCookieOptions());
  return res.status(200).json({ message: "Logged out successfully!" });
};

const getAuraProfile = async (req, res) => {

  try {

    const user = await User.findById(req.user.userId)
      .select("-password")
      .populate('hostedVibes')
      .populate('joinedVibes');

    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User aura not found.' }] });
    }


    return res.status(200).json({
      success: true,
      user,
    });

  } catch (err) {
    console.error("Error fetching aura profile:", err);
    return res.status(500).json({ errors: [{ msg: 'Could not load aura information.' }] });
  }
};


const updateProfile = async (req, res) => {
  let errors = [];

  if (req.fileValidationError) {
    errors.push({ msg: req.fileValidationError });
    return res.status(400).json({ errors });
  }

  const { name, username, email } = req.body || {};
  const avatarUrl = req.file ? req.file.path : undefined;

  const lowercasedUsername = username ? username.toLowerCase() : '';
  const lowercasedEmail = email ? email.toLowerCase() : '';

  if (!name || !username || !email) {
    errors.push({ msg: 'Name, Username, and Email are required.' });
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (email && !emailRegex.test(email)) {
    errors.push({ msg: 'Please enter a valid email address.' });
  }

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (username && !usernameRegex.test(username)) {
    errors.push({ msg: 'Username can only contain letters, numbers, and underscores, and be 3-20 characters long.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found.' }] });
    }

    if (lowercasedEmail !== user.email) {
      const existingUserWithEmail = await User.findOne({ email: lowercasedEmail });
      if (existingUserWithEmail && existingUserWithEmail._id.toString() !== user._id.toString()) {
        errors.push({ msg: 'That email is already registered to another account.' });
      }
    }
    if (lowercasedUsername !== user.username) {
      const existingUserWithUsername = await User.findOne({ username: lowercasedUsername });
      if (existingUserWithUsername && existingUserWithUsername._id.toString() !== user._id.toString()) {
        errors.push({ msg: 'That username is already taken.' });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    user.name = name;
    user.username = lowercasedUsername;
    user.email = lowercasedEmail;
    if (avatarUrl) {
      user.avatarUrl = avatarUrl;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });

  } catch (dbErr) {
    console.error("Error updating profile:", dbErr);
    let msg = 'Error updating profile. Please try again.';
    if (dbErr.code === 11000) {
      if (dbErr.keyPattern && dbErr.keyPattern.email) { msg = 'That email is already registered to another account.'; }
      else if (dbErr.keyPattern && dbErr.keyPattern.username) { msg = 'That username is already taken.'; }
    }
    return res.status(400).json({ errors: [{ msg }] });
  }
};


const changePassword = async (req, res) => {

  const { currentPassword, newPassword, newPassword2 } = req.body || {};
  let errors = [];

  if (!currentPassword || !newPassword || !newPassword2) {
    errors.push({ msg: 'Please fill in all fields.' });
  }
  if (newPassword !== newPassword2) {
    errors.push({ msg: 'Confirm passwords do not match.' });
  }
  if (newPassword && newPassword.length < 6) {
    errors.push({ msg: 'New password must be at least 6 characters.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found.' }] });
    }


    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Incorrect current password.' }] });
    }


    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully!'
    });

  } catch (err) {
    console.error("Error changing password:", err);
    return res.status(500).json({ errors: [{ msg: 'Error changing password. Please try again.' }] });
  }
};

const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ errors: [{ msg: "User account not found." }] });
    }


    await Vibe.deleteMany({ creator: userId });


    await Request.deleteMany({ requester: userId });


    await Vibe.updateMany(
      { participants: userId },
      { $pull: { participants: userId } }
    );


    await User.findByIdAndDelete(userId);


    res.clearCookie("token", getClearCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Account and associated data deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting user account:", err);
    return res.status(500).json({
      errors: [{ msg: "Failed to delete account. Please try again later." }],
    });
  }
};

module.exports = {
  loginUser,
  registerUser,
  getAuraProfile,
  updateProfile,
  changePassword,
  deleteUserAccount,
  logoutUser
};