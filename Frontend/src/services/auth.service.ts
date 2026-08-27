import { api } from './api';
import { ApiResponse } from '../types/api.types';
import {
  LoginPayload,
  LoginData,
  CreateAccountPayload,
  UserSession,
} from "../types/auth.types";

export const authService={

    login:async (payload:LoginPayload):Promise<ApiResponse<LoginData>> => {
        const result = await api.post<ApiResponse<LoginData>>(
            "/auth/login",
            payload
        );
        return result.data
    },

    createAccount: async (payload: CreateAccountPayload):Promise<ApiResponse<any>> => {
        const response = await api.post<ApiResponse<any>>(
            "/auth/create-account",
            payload
        );
        return response.data;
    },

    getMe:async (): Promise<ApiResponse<UserSession>> =>{
        const response= await api.get<ApiResponse<UserSession>>("/auth/me");
        return response.data;
    },

    async changePassword(payload: { Email: string; OldPassword: string; NewPassword: string }) {
        const response = await api.post("/auth/change-password", payload);
        return response.data;
    },

    async forgotPassword(email: string) {
        return await api.post("/auth/forgot-password", { Email: email });
    },
}