import jwt, { SignOptions,TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { JwtPayLoad } from '../types/auth';
import { env } from '../config/env';
import { UnauthorizedError } from '../errors/AppError';

export function signToken(payload:JwtPayLoad,expiresIn:string=env.jwtExpiresIn):string {
    const options : SignOptions = {expiresIn : expiresIn as any};
    //signoptions configureshow jwt headers and standard claims are signed and configured
    return jwt.sign(payload,env.jwtSecret,options);
}

export function verifyToken(token:string):JwtPayLoad{
    try{
        return jwt.verify(token,env.jwtSecret) as JwtPayLoad;
    }catch(error){
        if (error instanceof TokenExpiredError) {
            throw new UnauthorizedError("Authentication token has expired. Please log in again.");
        }
        if (error instanceof JsonWebTokenError) {
            throw new UnauthorizedError("Invalid authentication token.");
        }
        throw new UnauthorizedError("Could not authenticate token.");
    }
    
}