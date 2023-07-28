export default function Transpiler() {
  return (
    <iframe
      id='transpiler'
      // @ts-expect-error: you're wrong about this one, TypeScript
      csp={[
        'default-src \'self\'',
        'connect-src *',
        'img-src * data:',
        'script-src \'unsafe-inline\' \'unsafe-eval\'',
        'script-src-elem https://unpkg.com https://cdn.jsdelivr.net http://localhost http://localhost:3001 \'unsafe-inline\'',
        '',
      ].join('; ')}
      height={0}
      sandbox='allow-scripts'
      srcDoc={`
<html>
  <head>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/near-api-js@2.1.3/dist/near-api-js.min.js"></script>
  </head>
  <script type="text/babel" data-presets="react">
    const sourceCache = {};

    function bytesToBase64(bytes) {
      return btoa(Array.from(bytes, (b) => String.fromCodePoint(b)).join(''));
    }

    function transpileSource(source) {
      return Babel.transform(source, {
        plugins: [
          [Babel.availablePlugins['transform-react-jsx'], { pragma: 'h' }],
        ],
      });
    }

    function fetchWidgetSource(widgetPath) {
      if (sourceCache[widgetPath]) {
        return Promise.resolve(sourceCache[widgetPath]);
      }

      const provider = new window.nearApi.providers.JsonRpcProvider('https://rpc.near.org');

      return provider.query({
        account_id: 'social.near',
        args_base64: bytesToBase64(new TextEncoder().encode('{"keys":["' + widgetPath + '"]}')),
        finality: 'optimistic',
        method_name: 'get',
        request_type: 'call_function',
      }).then(({ result }) => {
        const decodedResult = new TextDecoder().decode(Uint8Array.from(result));
        const [author, , widget] = widgetPath.split('/');
        return JSON.parse(decodedResult)[author].widget[widget];
      }).catch((e) => console.error(e));
    }

    function getTranspiledWidget(widgetPath) {
      if (sourceCache[widgetPath]) {
        return Promise.resolve(sourceCache[widgetPath]);
      }

      return fetchWidgetSource(widgetPath)
        .then((source) => {
          const { code } = transpileSource('function WidgetComponent() { ' + source + ' }');
          sourceCache[widgetPath] = code;
          window.parent.postMessage({ type: 'transpiler.sourceTranspiled', source: code }, '*');
        }).catch((e) => console.error(e));
    }

    window.addEventListener('message', (event) => {
      const { data } = event;
      if (data?.type === 'transpiler.widgetFetch') {
          fetchWidgetSource(data.widgetPath);
      }
    });
  </script>
</html>
          `}
      title='transpiler-container'
      width={0}
      style={{ border: 'none' }}
    />
  );
}
