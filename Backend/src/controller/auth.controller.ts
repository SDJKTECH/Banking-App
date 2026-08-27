import { NextFunction,Request, Response } from "express";
import { createBankAccount } from "../services/customer.service";
import { loginUser, changeUserPassword } from "../services/auth.services";
import { sendWelcomeCredentialsEmail } from "../lib/mailer";
import bcrypt from "bcrypt";
import { findUserByEmail,updateUserPassword } from "../repository/auth.repository";
import { generateRandomPassword } from "../lib/password";

export async function createBankAccountController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const account = await createBankAccount(req.body);

        return res.status(201).json({
            success: true,
            message: "Bank account created successfully",
            data: account,
        });

    } catch (error) {
        next(error);
    }
}

export async function loginController(
    req:Request,
    res:Response,
    next:NextFunction
){
    try{
        const result = await loginUser(req.body);

        return res.status(201).json({
            success:true,
            message:"Login successful",
            data:result
        })
    }catch(error){
        next(error);
    }
}


export async function getProfileController(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        // req.user was attached by authenticateUser middleware
        return res.status(200).json({
            success: true,
            message: "User profile retrieved successfully",
            data: req.user ?? null,
        });
    } catch (error) {
        next(error);
    }
}

export async function changePasswordController(req: Request, res: Response, next: NextFunction) {
  try {
    const { Email, OldPassword, NewPassword } = req.body;
    
    const result = await changeUserPassword({ Email, OldPassword, NewPassword });
    
    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPasswordController(req: Request, res: Response, next: NextFunction) {
  try {
    const { Email } = req.body;
    const tempPassword = generateRandomPassword(10);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await findUserByEmail(Email);
    if (!user) {
      // Return 200 to prevent email enumeration
      return res.status(200).json({ success: true, message: "If this email exists, a reset password was dispatched." });
    }

    await updateUserPassword(user.UserID, passwordHash);
    await sendWelcomeCredentialsEmail({
      toEmail: Email,
      customerName: user.Customer?.FirstName || "Customer",
      custId: user.CustID || "",
      tempPassword: tempPassword,
      accountNumber: "N/A",
      accountType: "RESET",
    });

    return res.status(200).json({ success: true, message: "Temporary password sent to your email." });
  } catch (error) {
    next(error);
  }
}