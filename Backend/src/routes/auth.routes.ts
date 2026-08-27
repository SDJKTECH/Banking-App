import { Router } from "express";
import { createBankAccountController,
    loginController,
    getProfileController,
    changePasswordController,
    forgotPasswordController
 } from "../controller/auth.controller";

 

import { authenticateUser } from "../middleware/auth.middleware";

const authrouter = Router();

authrouter.post("/create-account", createBankAccountController);
authrouter.post("/login",loginController);

//Protected
authrouter.get("/me",authenticateUser,getProfileController);
authrouter.post("/change-password", changePasswordController);
authrouter.post("/forgot-password", forgotPasswordController);




export default authrouter;