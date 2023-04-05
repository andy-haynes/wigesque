var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import './App.css';
import { SandboxedIframe } from './SandboxedIframe';
export const Events = {
    IFRAME_RENDER: 'IFRAME_RENDER',
};
export function getAppDomId(id) {
    return `dom-${id}`;
}
export function getIframeId(id) {
    return `iframe-${id}`;
}
export function Widget({ id, sourceUrl }) {
    const [source, setSource] = useState(null);
    useEffect(() => {
        (function () {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield fetch(sourceUrl);
                const { source: appSource } = yield res.json();
                setSource(appSource);
            });
        }());
    }, []);
    return (_jsxs("div", { children: [source && (_jsx(SandboxedIframe, { id: getIframeId(id), scriptSrc: source })), _jsxs("div", Object.assign({ id: getAppDomId(id), className: 'iframe' }, { children: [source && (_jsx("div", Object.assign({ className: 'iframe-loading' }, { children: id }))), !source && (_jsx("div", Object.assign({ className: 'iframe-unrendered' }, { children: id })))] }))] }));
}
