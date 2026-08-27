import { api } from "./api";
import { ApiResponse } from "../types/api.types";
import {
  CustomerProfile,
  SearchCustomerParams,
  UpdateCustomerPayload,
} from "../types/customer.types";

export const customerService = {
  getCustomerById: async (custId: string): Promise<ApiResponse<CustomerProfile>> => {
    const response = await api.get<ApiResponse<CustomerProfile>>(`/customers/${custId}`);
    return response.data;
  },

  searchCustomers: async (params: SearchCustomerParams): Promise<ApiResponse<CustomerProfile[]>> => {
    const response = await api.get<ApiResponse<CustomerProfile[]>>("/customers/search", { params });
    return response.data;
  },

  updateCustomer: async (
    custId: string,
    data: UpdateCustomerPayload
  ): Promise<ApiResponse<CustomerProfile>> => {
    // Explicitly type the Axios PUT call so response.data resolves to ApiResponse<CustomerProfile>
    const response = await api.put<ApiResponse<CustomerProfile>>(`/customers/${custId}`, data);
    return response.data;
  },

  deleteCustomer: async (custId: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/customers/${custId}`);
    return response.data;
  },
};