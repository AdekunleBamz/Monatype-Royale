import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
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
        return (_jsx("div", { children: _jsxs("p", { children: ["Connected to ", selectedProvider.isMetaMask ? 'MetaMask' : 'another wallet'] }) }));
    }
    return (_jsxs("div", { children: [_jsx("h2", { children: "Select a Wallet" }), providers.length > 0 ? (_jsx("ul", { children: providers.map((provider, index) => (_jsx("li", { children: _jsx("button", { onClick: () => handleProviderSelect(provider), children: provider.isMetaMask ? 'MetaMask' : `Wallet ${index + 1}` }) }, index))) })) : (_jsx("p", { children: "No Ethereum wallet detected. Please install MetaMask or another wallet." }))] }));
};
export default WalletProviderSelector;
