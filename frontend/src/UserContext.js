import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Check for user info in local storage
    const storedUserID = localStorage.getItem('userID');
    const storedUsername = localStorage.getItem('username');
    if (storedUserID && storedUsername) {
      setUser({ userID: storedUserID, username: storedUsername });
    }
    setLoading(false); // Set loading to false once initialization is done
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}> {/* Include loading state in context value */}
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
