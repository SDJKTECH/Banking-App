export interface JwtPayLoad{
    userId: string;
    emailId:string;
    role:string;
    custId?:string | null;
}