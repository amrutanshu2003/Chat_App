import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const profilePicture = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

  const inputs = { username: userName, email: email, password: password, profilePicture: profilePicture };

  const navigate = useNavigate();

 

       const register = async () => {
    setLoading(true);
    try {
      const registerInputs = { username: userName, email: email, password: password, profilePicture: profilePicture };
      const res = await axios.post('http://localhost:6001/register', registerInputs);
      console.log("Register response:", res);
      localStorage.setItem('userToken', res.data.token);
      localStorage.setItem('userId', res.data.user._id);
      localStorage.setItem('username', res.data.user.username);
      localStorage.setItem('email', res.data.user.email);
      localStorage.setItem('profilePic', res.data.user.profilePic);
      localStorage.setItem('posts', JSON.stringify(res.data.user.posts));
      localStorage.setItem('followers', JSON.stringify(res.data.user.followers));
      localStorage.setItem('following', JSON.stringify(res.data.user.following));
      navigate('/');
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
    const login = async () => {
    setLoading(true);
    try {

      const loginInputs = { email: email, password: password };
      const res = await axios.post('http://localhost:6001/login', loginInputs);
      console.log("Login response:", res);
      localStorage.setItem('userToken', res.data.token);
      localStorage.setItem('userId', res.data.user._id);
      localStorage.setItem('username', res.data.user.username);
      localStorage.setItem('email', res.data.user.email);
      localStorage.setItem('profilePic', res.data.user.profilePic);
      localStorage.setItem('posts', JSON.stringify(res.data.user.posts));
      localStorage.setItem('followers', JSON.stringify(res.data.user.followers));
      localStorage.setItem('following', JSON.stringify(res.data.user.following));
      navigate('/');
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const logout =async() => {

    for(let key in localStorage) {
      if (key.startsWith('user')) {
        localStorage.removeItem(key);
      }
    }
  navigate('/landing');
  } 

  return (
    <AuthContext.Provider value={{ userName, setUserName, email, setEmail, password, setPassword, loading, login, register }}>
      {children}
    </AuthContext.Provider>
  );
};
