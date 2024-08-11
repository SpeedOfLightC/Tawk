import Router from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { getMessages, uploadFile } from "../controllers/messages.controller.js";
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();


router.route("/get-messages").post(verifyAccessToken, getMessages)
router.route("/upload-file").post(
    verifyAccessToken, 
    upload.single("file"),
    uploadFile
)


export default router;