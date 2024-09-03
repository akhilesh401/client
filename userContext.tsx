'use client';

import axios, {AxiosResponse} from 'axios';
import { userInfo } from 'os';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  ready: boolean;
  setReady: React.Dispatch<React.SetStateAction<boolean>>;
}


export const UserContext = createContext<UserContextType | undefined>(undefined);

const UserContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response: AxiosResponse<User> = await axios.get('http://127.0.0.1:9000/profile');
        setUser(response.data);
        setReady(true);
      } catch (error) {
        console.error('Error fetching user:', error);
        setReady(true); // Set ready to true even if there is an error
      }
    };

    if (!user) {
      fetchUser();
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, ready, setReady }}>
      {children}
    </UserContext.Provider>
  );
};

 

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
 
  if (context === undefined) {
  
    throw new Error('useUser must be used within a UserContextProvider');
  }
  return context;
};

export default UserContextProvider;
