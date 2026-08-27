import React , {useState,useEffect,useCallback,createContext} from "react";
import { UserSession } from "../types/auth.types";
import { authService } from "../services/auth.service";

// Define the TypeScript interface for authentication context values and methods
export interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: UserSession) => void;
  logout: () => void;
  setUserSession: (user: UserSession) => void;
}

// Create the React authentication context initialized as undefined
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provide authentication state and actions to child components
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize token state lazily from local storage
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  // Initialize user state lazily by parsing stored JSON from local storage
  const [user, setUser] = useState<UserSession | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  // State to track initial authentication loading and token verification
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Clear authentication state and remove stored credentials from local storage
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  // Save new session token and user details to local storage and state
  const login = useCallback((newToken: string, newUser: UserSession) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  // Update stored user profile data in local storage and state
  const setUserSession = useCallback((updatedUser: UserSession) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  // Validate existing token with backend /api/auth/me on initial app load
  useEffect(() => {
    // Flag to prevent state updates if the component unmounts during async calls
    let isMounted = true;

    // Verify stored auth token and retrieve latest user profile from server
    async function initializeAuth() {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          // Fetch authenticated user data from backend service
          const response = await authService.getMe();
          if (isMounted && response.data) {
            // Merge verified user data into local state
            setUser((prev) => ({
              ...prev,
              ...response.data,
            }));
          }
        } catch {
          // Clear invalid or expired credentials on verification failure
          if (isMounted) {
            logout();
          }
        }
      }
      // Finish initial authentication loading check
      if (isMounted) {
        setIsLoading(false);
      }
    }

    // Run auth initialization on component mount
    initializeAuth();

    // Clean up mount flag on unmount
    return () => {
      isMounted = false;
    };
  }, [logout]);

  // Assemble context value object exposed to consumer components
  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    setUserSession,
  };

  // Render context provider wrapping child components with auth state
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};