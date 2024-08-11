import { Router } from "express";
import { signUpUser, loginUser, getUserInfo, updateProfile, addProfileImage, removeProfileImage, logOutUser } from "../controllers/auth.controller.js";
import { verifyAccessToken, verifyRfreshToken } from "../middlewares/auth.middleware.js";
import { upload } from '../middlewares/multer.middleware.js';


const router = Router();

router.route("/signup").post(signUpUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyAccessToken, logOutUser);
router.route("/user-info").get(verifyAccessToken, getUserInfo);
router.route("/update-profile").post(
    verifyAccessToken,
    updateProfile
);
router.route("/add-profile-image").post(
    verifyAccessToken,
    upload.single("avatar"),
    addProfileImage
);
router.route("/delete-profile-image").delete(
    verifyAccessToken,
    removeProfileImage
)
export default router;