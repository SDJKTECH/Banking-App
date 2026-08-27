import { findUserByEmail,updateUserPassword  } from "../repository/auth.repository";
import { UnauthorizedError } from "../errors/AppError";
import { signToken } from "../lib/jwt";
import bcrypt from "bcrypt";
import { BadRequestError, NotFoundError } from "../errors/AppError";

export async function loginUser(
    data:{
        Email:string;
        Password:string
    }
){
    const user = await findUserByEmail(data.Email);
    if(!user){
        throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(data.Password,user.PasswordHash);
    if(!isPasswordValid){
        throw new UnauthorizedError("Invalid email or password");
    }

    const token = signToken({
        userId: user.UserID,
        emailId: user.Email,
        role:user.Role,
        custId:user.CustID 
    });

    return{
        token,
        user:{
            id:user.UserID,
            email:user.Email,
            role:user.Role,
            custId:user.CustID,
            customerName:user.Customer ? `${user.Customer.FirstName} ${user.Customer.LastName}` : null,
        },
    };
}

export async function changeUserPassword(data: { Email: string; OldPassword: string; NewPassword: string }) {
  // 1. Find user by email
  const user = await findUserByEmail(data.Email);
  if (!user) {
    throw new NotFoundError("User account not found with this email");
  }

  // 2. Compare old/temporary password with stored hash
  const isMatch = await bcrypt.compare(data.OldPassword, user.PasswordHash);
  if (!isMatch) {
    throw new BadRequestError("Invalid old or temporary password");
  }

  // 3. Hash the new password (10 rounds)
  const newPasswordHash = await bcrypt.hash(data.NewPassword, 10);

  // 4. Save the new password hash in the database
  await updateUserPassword(user.UserID, newPasswordHash);

  return { message: "Password updated successfully" };
}