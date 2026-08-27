export interface ApiResponse<T=any>{
    statusCode?:string;
    success:boolean;
    message:string;
    data:T;
}

export interface ApiErrorResponse{
    success:false;
    message:string
}