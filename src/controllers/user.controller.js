import db from "../../models/index.js";

const { User } = db;

export const createUser = async (req, res) => {
  try {

    const user = await User.create({
      username: req.body.username,
      email: req.body.email
    });

    res.status(201).json(user);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};