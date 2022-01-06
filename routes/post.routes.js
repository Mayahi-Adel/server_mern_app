const router = require("express").Router();
const postController = require("../controllers/post.controller");
const { upload } = require("../utils/upload");

router.get("/", postController.readPosts);
router.post("/", upload, postController.createPost);
router.put("/:id", postController.updatePost);
router.delete("/:id", postController.deletePost);
router.patch("/like/:id", postController.likePost);
router.patch("/unlike/:id", postController.unlikePost);

// Comments

router.patch("/comment/:id", postController.commentPost);
router.patch("/edit-comment/:id", postController.editCommentPost);
router.patch("/delete-comment/:id", postController.deleteCommentPost);

module.exports = router;
