import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, getAllUsers, setCurrentUser as saveCurrentUser, createUser } from '../utils/userUtils.js';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const users = await getAllUsers();
      setAllUsers(users);
      
      const current = await getCurrentUser();
      if (current) {
        setCurrentUser(current);
      } else if (users.length > 0) {
        // Set first user as current if no current user
        await saveCurrentUser(users[0]);
        setCurrentUser(users[0]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function switchUser(user) {
    await saveCurrentUser(user);
    setCurrentUser(user);
  }

  async function addNewUser(name) {
    const newUser = await createUser(name);
    setAllUsers([...allUsers, newUser]);
    await switchUser(newUser);
    return newUser;
  }

  return (
    <UserContext.Provider value={{
      currentUser,
      allUsers,
      loading,
      switchUser,
      addNewUser,
      refreshUsers: loadUsers
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
