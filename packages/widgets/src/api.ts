import type {
  InitNearOptions,
  InitSocialOptions,
} from './types';

export function initNear({ requests, renderWidget, rpcUrl }: InitNearOptions): any {
  /* @ts-expect-error */
  const provider = new window.nearApi.providers.JsonRpcProvider(rpcUrl);
  return {
    block(blockHeightOrFinality: number | string) {
      const reqKey = JSON.stringify({ blockHeightOrFinality, type: 'block' });
      const request = requests[reqKey];
      if (request || (reqKey in requests && request === undefined)) {
        delete requests[reqKey];
        return request;
      }
      provider.block({ finality: blockHeightOrFinality })
        .then((block: any) => {
          requests[reqKey] = block;
          renderWidget();
        })
        .catch(console.error);
    },
    call(contractName: string, methodName: string, args: string, gas: string, deposit: number) {},
    view(contractName: string, methodName: string, args: string, blockId: string | number | object, subscribe: any) {},
    asyncView(contractName: string, methodName: string, args: string, blockId: string | number | object, subscribe: any) {
      return provider.query({
        request_type: 'call_function',
        finality: blockId,
        account_id: contractName,
        method_name: methodName,
        /* @ts-expect-error */
        args_base64: JSON.stringify(args).toString('base64')
      });
    },
  };

}

export function initSocial({ cache, endpointBaseUrl, renderWidget, widgetId }: InitSocialOptions) {
  function cachedQuery({ apiEndpoint, body, cacheKey }: { apiEndpoint: string, body: object, cacheKey: string }) {
    const cached = cache[cacheKey];
    if (cached || (cacheKey in cache && cached === undefined)) {
      return cached;
    }

    fetch(apiEndpoint, {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
      .then((res) => res.json())
      .then((json) => {
        cache[cacheKey] = Object.keys(json).length ? json : undefined;
        renderWidget();
      })
      .catch((e) => console.error({ error: e, widgetId }));

    return null;
  }

  return {
    get(keys: string[]/*, finality, options*/) {
      return cachedQuery({
        apiEndpoint: `${endpointBaseUrl}/get`,
        body: { keys: Array.isArray(keys) ? keys : [keys] },
        cacheKey: JSON.stringify(keys),
      });
    },
    getr(keys: string[]/*, finality, options*/) {
      // TODO expand keys for recursive get
      return cachedQuery({
        apiEndpoint: `${endpointBaseUrl}/get`,
        body: { keys: Array.isArray(keys) ? keys : [keys] },
        cacheKey: JSON.stringify(keys),
      });
    },
    index(action: string, key: string, options: object) {
      return cachedQuery({
        apiEndpoint: `${endpointBaseUrl}/index`,
        body: { action, key, options },
        cacheKey: JSON.stringify({ action, key, options }),
      });
    },
    keys(keys: string[]/*, finality, options*/) {
      return cachedQuery({
        apiEndpoint: `${endpointBaseUrl}/keys`,
        body: { keys: Array.isArray(keys) ? keys : [keys] },
        cacheKey: JSON.stringify(keys),
      });
    }
  };
}
