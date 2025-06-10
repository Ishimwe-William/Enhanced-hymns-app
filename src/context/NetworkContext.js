import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

const NetworkContext = createContext();

export const useNetwork = () => {
    const context = useContext(NetworkContext);
    if (!context) {
        throw new Error('useNetwork must be used within a NetworkProvider');
    }
    return context;
};

export const NetworkProvider = ({ children }) => {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsOffline(!state.isConnected);
        });

        // Fetch initial network state
        NetInfo.fetch().then((state) => {
            setIsOffline(!state.isConnected);
        });

        return () => unsubscribe();
    }, []);

    const checkNetworkStatus = async () => {
        const state = await NetInfo.fetch();
        return !state.isConnected;
    };

    const value = {
        isOffline,
        checkNetworkStatus,
    };

    return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
};
