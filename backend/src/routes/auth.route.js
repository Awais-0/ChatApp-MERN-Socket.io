import { Router } from "express";
import { checkAuth, login, logout, signup } from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.route('/signup').post(upload.single('avatar'), signup);

authRouter.route('/login').post(login);

authRouter.route('/checkAuth').get(verifyJWT, checkAuth);

authRouter.route('/logout').get(verifyJWT, logout);

export default authRouter;