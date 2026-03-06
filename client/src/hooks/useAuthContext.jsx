import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // TEMPORARY: bypass auth with details of a dummy user
    const [user, setUser] = useState({
        _id: '000000000000000000000000',
        name: 'Demo User',
        email: 'demo@propflow.com',
        role: 'broker',
        plan: 'Enterprise'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        /*
        const token = localStorage.getItem('token');
        if (token) {
            getProfile()
                .then((res) => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('token');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
        */
    }, []);

    const login = (userData) => {
        /*
        localStorage.setItem('token', userData.token);
        setUser(userData);
        */
    };

    const logout = () => {
        /*
        localStorage.removeItem('token');
        setUser(null);
        */
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
