"use client";

import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState({
        username: "Admin User",
        photo: "",
        role: "admin",
        id: ""
    });

    useEffect(() => {
        // Initial load from localStorage
        const storedUsername = localStorage.getItem("adminUsername");
        const storedPhoto = localStorage.getItem("adminPhoto");
        const storedRole = localStorage.getItem("adminRole");
        const storedId = localStorage.getItem("adminId");

        if (storedUsername || storedPhoto) {
            setUser({
                username: storedUsername || "Admin User",
                photo: storedPhoto || "",
                role: storedRole || "admin",
                id: storedId || ""
            });
        }
    }, []);

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));

        // Sync to localStorage
        if (userData.username) localStorage.setItem("adminUsername", userData.username);
        if (userData.photo !== undefined) localStorage.setItem("adminPhoto", userData.photo);
        if (userData.role) localStorage.setItem("adminRole", userData.role);
        if (userData.id) localStorage.setItem("adminId", userData.id);
    };

    return (
        <UserContext.Provider value={{ user, updateUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
