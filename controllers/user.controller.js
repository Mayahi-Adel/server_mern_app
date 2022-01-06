const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ err });
  }
};

module.exports.userInfo = async (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id))
    return res.status(400).json({ message: "Unknown ID : " + id });
  try {
    UserModel.findById(id, (err, docs) => {
      if (!err) res.status(200).json(docs);
      else console.log("Unkown ID : " + err);
    }).select("-password");
  } catch (err) {}

  //   try {
  //     const user = await UserModel.findById(id).select("-password");
  //     res.status(200).json({ user });
  //   } catch (err) {
  //     res.status(500).json({ err });
  //   }
};

module.exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { bio } = req.body;

  if (!ObjectID.isValid(id))
    return res.status(400).json({ message: "Unknown ID : " + id });

  try {
    await UserModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          bio,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
      (err, docs) => {
        if (!err) return res.status(201).json({ docs });
        else return res.status(500).json({ msg: err });
      }
    );
  } catch (err) {
    //return res.status(500).json({ err });
  }
};

module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!ObjectID.isValid(id))
    return res.status(400).json({ message: "Unknown ID : " + id });

  try {
    await UserModel.remove({ _id: id }).exec();
    res.status(200).json({ message: "Successfuly deleted." });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

module.exports.followUser = async (req, res) => {
  const { id } = req.params;
  const { idToFollow } = req.body;
  if (!ObjectID.isValid(id) || !ObjectID.isValid(idToFollow))
    return res.status(400).send("ID unknown : " + id);

  try {
    // add to the follower list
    await UserModel.findByIdAndUpdate(
      id,
      { $addToSet: { following: idToFollow } },
      { new: true, upsert: true }
    );

    // add to following list
    await UserModel.findByIdAndUpdate(
      idToFollow,
      { $addToSet: { followers: id } },
      { new: true, upsert: true },
      (err, docs) => {
        if (!err) res.status(201).json(docs);
        else return res.status(400).json(err);
      }
    );
  } catch (err) {
    //return res.status(500).json({ message: err });
  }
};

module.exports.unfollowUser = async (req, res) => {
  const { id } = req.params;
  const { idToUnfollow } = req.body;
  // if (!ObjectID.isValid(id) || !ObjectID.isValid(idToUnfollow));
  // return res.status(400).send("ID unknown : " + idToUnfollow);

  try {
    await UserModel.findByIdAndUpdate(
      id,
      { $pull: { following: idToUnfollow } },
      { new: true, upsert: true }
    );
    // remove to following list
    await UserModel.findByIdAndUpdate(
      idToUnfollow,
      { $pull: { followers: id } },
      { new: true, upsert: true },
      (err, docs) => {
        if (!err) res.status(201).json(docs);
        if (err) return res.status(400).jsos(err);
      }
    );
  } catch (err) {
    //return res.status(500).json({ message: err });
  }
};
