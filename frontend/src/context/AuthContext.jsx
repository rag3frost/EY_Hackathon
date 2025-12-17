import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for saved user in localStorage on mount
        const savedUser = localStorage.getItem('auto_aide_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Failed to parse user data", e);
                localStorage.removeItem('auto_aide_user');
            }
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Mock login - accept any email/password for demo
        const mockUser = {
            id: '1',
            email,
            name: email.split('@')[0] || 'User',
            avatar: 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
        };

        setUser(mockUser);
        localStorage.setItem('auto_aide_user', JSON.stringify(mockUser));
        return true;
    };

    const register = (email, password, carModel) => {
        const newUser = {
            id: Date.now().toString(),
            email,
            name: email.split('@')[0],
            carModel,
            avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=0D8ABC&color=fff`
        };
        setUser(newUser);
        localStorage.setItem('auto_aide_user', JSON.stringify(newUser));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auto_aide_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
