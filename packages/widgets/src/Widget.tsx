import React, { useEffect, useState } from 'react';

import { SandboxedIframe } from './SandboxedIframe';

export const Events = {
  IFRAME_RENDER: 'IFRAME_RENDER',
  WIDGET_RENDER: 'WIDGET_RENDER',
};

export function getAppDomId(id: string) {
    return `dom-${id}`;
}

export function getIframeId(id: string) {
    return `iframe-${id}`;
}

export function Widget({ id, sourceUrl }: { id: string, sourceUrl: string }) {
    const [source, setSource] = useState(null);

    useEffect(() => {
        (async function () {
            const res = await fetch(sourceUrl);
            const { source: appSource } = await res.json();
            setSource(appSource);
        }());
    }, []);

    if (!source) {
      return null;
    }

    return (
        <SandboxedIframe
            id={getIframeId(id)}
            scriptSrc={source}
        />
    );
}
