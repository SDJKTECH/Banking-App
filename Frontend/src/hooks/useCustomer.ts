import { useState, useEffect, useCallback } from "react";
import { CustomerProfile, UpdateCustomerPayload } from "../types/customer.types";
import { customerService } from "../services/customer.service";
import { useAuth } from "./useAuth";

// Custom hook to manage fetching, updating, and caching customer profile data
export function useCustomer() {
  // Extract authenticated user object from auth context
  const { user } = useAuth();
  // State storing the retrieved customer profile data
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  // State indicating whether profile data is currently being fetched
  const [loading, setLoading] = useState<boolean>(true);
  // State holding any error messages during fetch or update actions
  const [error, setError] = useState<string | null>(null);

  // Memoized function to fetch customer profile data by customer ID
  const fetchProfile = useCallback(async () => {
    // Abort fetch and turn off loader if no authenticated customer ID exists
    if (!user?.custId) {
      setLoading(false);
      return;
    }

    try {
      // Set loading state and clear previous errors before fetching
      setLoading(true);
      setError(null);
      // Fetch customer profile from the API service
      const response = await customerService.getCustomerById(user.custId);
      // Store returned customer profile in state
      setProfile(response.data);
    } catch (err: any) {
      // Capture and store failure message in error state
      setError(typeof err === "string" ? err : "Failed to load customer profile");
    } finally {
      // Turn off loading state after network request finishes
      setLoading(false);
    }
  }, [user?.custId]);

  // Fetch the customer profile whenever the memoized fetch function changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Function to send updated customer details to the API and update state
  const updateProfile = async (payload: UpdateCustomerPayload): Promise<CustomerProfile> => {
    // Guard against executing update without a valid customer ID
    if (!user?.custId) throw new Error("No customer ID available");

    try {
      // Reset prior errors before initiating profile update
      setError(null);
      // Send updated payload to backend API service
      const response = await customerService.updateCustomer(user.custId, payload);
      const updatedCustomer: CustomerProfile = response.data;

      // Merge newly updated fields into current profile state
      setProfile((prev: CustomerProfile | null): CustomerProfile | null => {
        if (!prev) return updatedCustomer;
        return {
          ...prev,
          ...updatedCustomer,
        };
      });

      // Return the updated customer record to the caller
      return updatedCustomer;
    } catch (err: any) {
      // Set and rethrow formatted error message on update failure
      const msg = typeof err === "string" ? err : "Failed to update profile";
      setError(msg);
      throw msg;
    }
  };

  // Expose profile state, status flags, and interaction handlers to consumer components
  return {
    profile,
    loading,
    error,
    refetchProfile: fetchProfile,
    updateProfile,
  };
}