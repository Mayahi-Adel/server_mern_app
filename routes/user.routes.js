const router = require("express").Router();
//const multer = require("multer");
const { upload } = require("../utils/upload");
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const uploadController = require("../controllers/upload.controller");

router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.get("/logout", authController.logout);

router.get("/", userController.getAllUsers);
router.get("/:id", userController.userInfo);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.patch("/follow/:id", userController.followUser);
router.patch("/unfollow/:id", userController.unfollowUser);

router.get("api/jwtid", (req, res) => {
  res.status(200).send(res.locals.user._id);
});

// upload

router.post("/upload", upload, uploadController.uploadProfil);

module.exports = router;
