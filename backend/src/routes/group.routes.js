import Router from "express"
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { createGroup, getGroupMessages, getUserGroups } from "../controllers/group.controller.js";

const router = Router()


router.route("/create-group").post(verifyAccessToken, createGroup)
router.route("/get-user-groups").get(verifyAccessToken, getUserGroups)
router.route("/get-group-messages/:groupId").get(verifyAccessToken, getGroupMessages)


export default router;