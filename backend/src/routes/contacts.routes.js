import { Router } from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { getAllContacts, getContactsForDmList, searchContacts } from "../controllers/contacts.controller.js";

const router = Router();

router.route("/search").post(verifyAccessToken, searchContacts)
router.route("/get-contacts-for-dm").get(verifyAccessToken, getContactsForDmList)
router.route("/get-all-contacts").get(verifyAccessToken, getAllContacts)

export default router;