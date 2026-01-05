const User = require("../models/user");

exports.getBookings = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.bookings);
};

exports.addBooking = async (req, res) => {
  const user = await User.findById(req.user.id);

  user.bookings.push(req.body);
  await user.save();

  res.json(user.bookings);
};
