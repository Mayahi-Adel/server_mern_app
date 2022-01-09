const fs = require("fs");
const PostModel = require("../models/post.model");
const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;
const { uploadErrors } = require("../utils/errors.utils");

module.exports.readPosts = async (req, res) => {
  //   await PostModel.find((err, docs) => {
  //     if (!err) res.send(docs);
  //     else console.log("Error to get data : " + err);
  //   });
  try {
    const posts = await PostModel.find().sort({ createdAt: -1 });
    res.status(200).send(posts);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports.createPost = async (req, res) => {
  const { posterId, message, picture, video } = req.body;

  try {
    const file = req?.file;
    if (
      file == undefined ||
      (req?.file?.mimetype != "image/jpg" &&
        req?.file?.mimetype != "image/png" &&
        req?.file?.mimetype != "image/jpeg")
    )
      throw Error("Invalid file");

    if (req.file.size > 500000) throw Error("max size");
  } catch (err) {
    const errors = uploadErrors(err);
    return res.send({ errors });
  }

  // rename the picture (it takes the pseudo of the user)
  const fileName = req.file.filename;
  const newFileName = req.body.posterId + Date.now() + ".jpg";
  fs.rename(
    `${__dirname}/../client/public/uploads/posts/${fileName}`,
    `${__dirname}/../client/public/uploads/posts/${newFileName}`,
    function (err) {
      if (err) console.log("ERROR: " + err);
    }
  );

  const newPost = new PostModel({
    posterId,
    message,
    picture: req.file ? "./uploads/posts/" + newFileName : "",
    video,
    likers: [],
    comments: [],
  });

  try {
    const post = await newPost.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!ObjectID.isValid(id)) return res.status(400).json("ID unknown : " + id);
  try {
    await PostModel.findByIdAndUpdate(
      id,
      {
        $set: {
          message,
        },
      },
      { new: true, upsert: true },
      (err, docs) => {
        if (!err) res.send(docs);
        else console.log("Update error : " + err);
      }
    );
  } catch (err) {
    //console.log(err);
  }
};

module.exports.deletePost = async (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) return res.status(400).json("ID unknown : " + id);

  try {
    await PostModel.findByIdAndRemove(id, (err, docs) => {
      if (!err) {
        res.send({ id: docs._id });
      } else console.log("Delete error : " + err);
    });
  } catch (err) {}
};

module.exports.likePost = async (req, res) => {
  const idPost = req.params.id;
  const { idLiker } = req.body;

  // if (!ObjectID.isValid(idLiker) || !ObjectID.isValid(idPost))
  //   return res.status(400).json("ID unknown : " + idLiker);

  try {
    await PostModel.findByIdAndUpdate(
      idPost,
      { $addToSet: { likers: idLiker } },
      { new: true, upsert: true },
      (err, docs) => {
        if (!err) res.send(docs);
        if (err) console.log("Post - Like post error :" + err);
      }
    );

    //
    // IT'S NOT NECESSARY TO HAVE A likes REGISTER IN THE user DOCUMENT !!!  //
    //
    // await UserModel.findByIdAndUpdate(
    //   idLiker,
    //   { $addToSet: { likes: idPost } },
    //   { new: true },
    //   (err, docs) => {
    //     if (!err) res.send(docs);
    //     else console.log("User - Like post error :" + err);
    //   }
    // );
  } catch (err) {
    //console.log("Error: " + err.message);
  }
};

module.exports.unlikePost = async (req, res) => {
  const idPost = req.params.id;
  const { idLiker } = req.body;

  if (!ObjectID.isValid(idLiker) || !ObjectID.isValid(idPost))
    return res.status(400).json("ID unknown : " + idLiker);

  PostModel.findByIdAndUpdate(
    idPost,
    { $pull: { likers: idLiker } },
    { new: true },
    (err, docs) => {
      if (!err) res.send(docs);
      else console.log("Unlike post error :" + err);
    }
  );
};

// Comments

module.exports.commentPost = async (req, res) => {
  const { id } = req.params;
  const { commenterId, commenterPseudo, text } = req.body;

  if (!ObjectID.isValid(id)) return res.status(400).json("ID unknown : " + id);

  try {
    const response = await PostModel.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: {
            commenterId,
            commenterPseudo,
            text,
            timestamps: new Date().getTime(),
          },
        },
      },
      { new: true },
      (err, docs) => {
        if (!err) res.send(docs);
        else res.status(500).send(err);
      }
    );
  } catch (err) {
    // commented because there is a problem in mongoose package !
    //res.status(500).json(err.message);
  }
};

module.exports.editCommentPost = async (req, res) => {
  const { id } = req.params;
  const { commentId, text } = req.body;

  console.log(commentId);

  if (!ObjectID.isValid(id)) return res.status(400).json("ID unknown : " + id);

  try {
    await PostModel.findById(id, (err, docs) => {
      const theComment = docs.comments.find((comment) =>
        comment._id.equals(commentId)
      );

      if (!theComment) return res.status(400).json("Comment not found !");

      theComment.text = text;

      return docs.save((err) => {
        if (!err) res.status(200).json(docs);
        else return res.status(500).json(err);
      });
    });
  } catch (err) {
    // commented because there is a problem in mongoose package !
    //res.status(500).json(err.message);
  }
};

module.exports.deleteCommentPost = async (req, res) => {
  const { id } = req.params;
  const { commentId } = req.body;

  if (!ObjectID.isValid(id)) return res.status(400).json("ID unknown : " + id);

  try {
    await PostModel.findByIdAndUpdate(
      id,
      {
        $pull: {
          comments: {
            _id: commentId,
          },
        },
      },
      { new: true },
      (err, docs) => {
        if (!err) res.status(200).json(docs);
        else return res.status(500).json(err);
      }
    );
  } catch (err) {
    // commented because there is a problem in mongoose package !
    //res.status(500).json(err.message);
  }
};
