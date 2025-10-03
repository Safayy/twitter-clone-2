import { createContext, useState, useEffect } from "react";
import { auth } from "../firebase";
/*
<AuthProvider>
    <h1>Hello</h1>
</AuthProvider>
*/

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
  }, []);
  // {
  //   currentUser  = {
  //     id: ...
  //     time: ...
  //     currentUser: {uid: 123989h2g34jh2g, name:'Safa', email:'safa.yousif@outlook.com'}
  //   }
  // }
  const value = { currentUser };
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
