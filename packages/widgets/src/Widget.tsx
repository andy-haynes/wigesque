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

export function Widget({ id, sourceUrl, widgetProps }: { id: string, sourceUrl: string, widgetProps?: any }) {
    const [source, setSource] = useState(null);

    // instance-scoped flag indicating whether the source for this widget has been rendered
    // React Strict Mode means the fetch is called this twice, causing issues with identifiers
    let sourceFetched =  false;

    useEffect(() => {
        (async function () {
            if (!sourceFetched) {
                sourceFetched = true;
                const res = await fetch(sourceUrl);
                const { source: appSource } = await res.json();
                setSource(appSource);
            }
        }());
    }, []);

    if (!source) {
      return null;
    }

    return (
        <SandboxedIframe
            id={getIframeId(id)}
            scriptSrc={source}
            widgetProps={widgetProps}
        />
    );
}
