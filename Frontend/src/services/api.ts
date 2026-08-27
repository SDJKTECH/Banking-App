import axios,{AxiosError} from "axios";
import { ApiErrorResponse } from "../types/api.types";

export const api = axios.create({
    baseURL:import.meta.env.VITE_API_URL ,
    headers:{
        "Content-Type":"application/json",
    },
});
// Request Interceptor: Attach JWT token from localStorage
api.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem("token");
        if(token && config.headers){
            config.headers.Authorization=`Bearer ${token}`;
        }
        return config;
    },
    (error)=>Promise.reject(error)
);

//Handle errors
api.interceptors.response.use(
    (response)=>response,
    (error:AxiosError<ApiErrorResponse>)=>{
        if(error.response?.status===401){
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
        const message =
        error.response?.data?.message ||
        error.message ||
        "An unexpected server error occurred";

        return Promise.reject(message);
    }
);

