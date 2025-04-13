import { createContext,useState } from "react";

export const AppContent = createContext();

export const AppContextProvider=(props)=>{
    const backendUrl="http://localhost:3000"
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userData, setUserData] = useState(false)

    const value={
        backendUrl,
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData,
        // Add more context variables as needed...
    }
    return(
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}