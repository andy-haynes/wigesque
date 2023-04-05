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

    return (
      <div>
          {source && (
              <SandboxedIframe
                  id={getIframeId(id)}
                  scriptSrc={source}
              />
          )}
          <div
              id={getAppDomId(id)}
              className='iframe'
          >
              {source && (<div className='iframe-loading'>{id}</div>)}
              {!source && (<div className='iframe-unrendered'>{id}</div>)}
          </div>
      </div>
    );
}
