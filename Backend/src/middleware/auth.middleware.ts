import { Request, Response, NextFunction} from 'express';
import { verifyToken } from '../lib/jwt';
import { JwtPayLoad } from '../types/auth';
import { UnauthorizedError,ForbiddenError } from "../errors/AppError";

//TypeScript's global scope to extend existing type definitions
declare global{
    //Target Express's global namespace
    namespace Express{
        //Extends Express's built-in Request interface to add custom properties used by authentication middleware.
        interface Request{
            //able to use req.users
            user?: JwtPayLoad;
        }
    }
}

export function authenticateUser(req:Request,res:Response,next:NextFunction){
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        throw new UnauthorizedError("Authentication token required");
    }

    const token = authHeader.split(" ")[1];

    req.user=verifyToken(token);

    return next();
}

// Role-Based Access Control Middleware
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError("You do not have permission to perform this action");
    }

    next();
  };
}