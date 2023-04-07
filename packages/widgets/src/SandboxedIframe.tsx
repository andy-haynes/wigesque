
function buildSandboxedWidget(id: string, scriptSrc: string) {
  const moduleContents = `
    const { h } = window.preact;

    const widgetRenders = [];

    /* NS shims */
    const context = { accountId: 'andyh.near' };
    const props = {};
    const Social = { get(url) {
      return undefined;
    } };
    const React = {
      Fragment: 'div',
    };
    const styled = {
      div: (s) => s,
    };

    const __renderWidget = ({ source, props }) => {
      const widgetId = window.crypto.randomUUID();
      widgetRenders.push({ props, source, type: 'WIDGET_RENDER', widgetId, parentId: '${id}' });
      console.log('rendering dom-' + widgetId + ' for ' + source);
      return h('div', { ...props, id: 'dom-' + widgetId, className: 'iframe' }, source);
    }

    function Comp() {
      return (
        /* BEGIN EXTERNAL SOURCE */
        ${scriptSrc}
        /* END EXTERNAL SOURCE */
      )();
    }

    const node = Comp();
    window.parent.postMessage(
      JSON.stringify({ type: 'IFRAME_RENDER', id: '${id}', node }),
      '*'
    );

    widgetRenders.forEach((message) => {
      window.parent.postMessage(JSON.stringify(message), '*');
    });
  `;

  return `
    <html>
      <head>
        <script crossorigin src="https://cdnjs.cloudflare.com/ajax/libs/preact/10.13.2/preact.min.js"></script>
        <script type="module">
          ${moduleContents}
        </script>
      </head>
    </html>
  `;
}

export function SandboxedIframe({ id, scriptSrc }: { id: string, scriptSrc: string }) {
    return (
        <iframe
            id={id}
            className='sandboxed-iframe'
            // @ts-expect-error: you're wrong about this one, TypeScript
            csp={[
                "default-src 'self'",
                "connect-src https://rpc.testnet.near.org",
                "script-src 'unsafe-inline' 'unsafe-eval'",
                "script-src-elem https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://esm.sh http://localhost 'unsafe-inline'",
                '',
            ].join('; ')}
            height={0}
            sandbox='allow-scripts'
            srcDoc={buildSandboxedWidget(id.replace('iframe-', ''), scriptSrc)}
            title='code-container'
            width={0}
            style={{ border: 'none' }}
        />
    );
}
