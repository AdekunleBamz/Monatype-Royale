import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
const WalletProviderSelector = ({ onProviderSelected }) => {
    const [providers, setProviders] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState(null);
    useEffect(() => {
        const detectProviders = () => {
            const detectedProviders = window.ethereum?.providers || (window.ethereum ? [window.ethereum] : []);
            setProviders(detectedProviders);
        };
        detectProviders();
        window.ethereum?.on('providersChanged', detectProviders);
        return () => {
            window.ethereum?.removeListener('providersChanged', detectProviders);
        };
    }, []);
    const handleProviderSelect = (provider) => {
        const web3Provider = new ethers.BrowserProvider(provider);
        setSelectedProvider(provider);
        onProviderSelected(web3Provider);
    };
    if (selectedProvider) {
        return (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.5em' }, children: [_jsx("span", { style: {
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#00ff00',
                        boxShadow: '0 0 8px 2px #00ff00',
                        animation: 'blinker 1s linear infinite'
                    } }), _jsx("span", { children: "Connected to Monad Testnet" }), _jsx("style", { children: `
          @keyframes blinker {
            50% { opacity: 0.2; }
          }
        ` })] }));
    }
    return (_jsxs("div", { children: [_jsx("h2", { children: "Select a Wallet" }), providers.length > 0 ? (_jsx("ul", { children: providers.map((provider, index) => (_jsx("li", { children: _jsx("button", { onClick: () => handleProviderSelect(provider), children: "Connect to Wallet" }) }, index))) })) : (_jsx("p", { children: "No Ethereum wallet detected. Please install MetaMask or another wallet." }))] }));
};
export default WalletProviderSelector;
