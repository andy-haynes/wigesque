
function buildSandboxedWidget(id: string, scriptSrc: string) {
  const moduleContents = `
    const { h } = window.preact;

    /* NS shims */
    const context = { accountId: 'andyh.near' };
    const props = { className: 'iframe-initialized' };
    const Social = { get(url) {
      return undefined;
    } };

    function Comp() {
      return h('div', { className: 'iframe-initialized' }, '${id}');
    }

    const node = Comp();
    window.parent.postMessage(
      JSON.stringify({ type: 'IFRAME_RENDER', id: '${id}', node }),
      '*'
    );
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
            srcDoc={buildSandboxedWidget(id.split('-')[1], scriptSrc)}
            title='code-container'
            width={0}
            style={{ border: 'none' }}
        />
    );
}
