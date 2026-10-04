'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, userApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        try {
            const list = await userApi.getAllUsers();
            setUsers(list || []);
            return list;
        } catch {
            return [];
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem('taskly_token');

            const allUsers = await loadUsers();

            if (savedToken) {
                try {
                    setToken(savedToken);
                    const profile = await authApi.me();
                    setUser(profile);
                } catch {
                    localStorage.removeItem('taskly_token');
                    localStorage.removeItem('taskly_user_id');
                    setToken(null);
                    setUser(null);
                }
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email) => {
        const result = await authApi.login({ email });
        setUser(result.user);
        setToken(result.token);
        localStorage.setItem('taskly_token', result.token);
        localStorage.setItem('taskly_user_id', result.user.id);
        await loadUsers();
        return result.user;
    };

    const register = async (name, email, role) => {
        const result = await authApi.register({ name, email, role });
        setUser(result.user);
        setToken(result.token);
        localStorage.setItem('taskly_token', result.token);
        localStorage.setItem('taskly_user_id', result.user.id);
        await loadUsers();
        return result.user;
    };

    const switchUser = (selectedUser) => {
        setUser(selectedUser);
        localStorage.setItem('taskly_user_id', selectedUser.id);
        localStorage.removeItem('taskly_token');
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('taskly_token');
        localStorage.removeItem('taskly_user_id');
    };

    return (
        <AuthContext.Provider value={{ user, token, users, loading, login, register, switchUser, logout, refreshUsers: loadUsers }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
