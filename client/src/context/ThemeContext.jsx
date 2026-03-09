import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // We can expand this later for dark/light mode if needed
    // For now, it just manages the primary palette and ensures stability
    const [theme, setTheme] = useState('light');

    const colors = {
        p1: '#d8f3dc',
        p2: '#b7e4c7',
        p3: '#95d5b2',
        p4: '#74c69d',
        p5: '#52b788',
        p6: '#40916c',
        p7: '#2d6a4f',
        p8: '#1b4332',
        p9: '#081c15',
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};
