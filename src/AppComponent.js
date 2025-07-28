import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './App.css';
import { Lobby } from './components/Lobby';
const AppComponent = () => {
    return (_jsxs("div", { className: "app-container", children: [_jsx("header", { className: "app-header", children: _jsx("h1", { className: "app-title", children: "Monatype" }) }), _jsx("main", { className: "app-main", children: _jsx(Lobby, {}) }), _jsx("footer", { className: "app-footer" })] }));
};
export default AppComponent;
