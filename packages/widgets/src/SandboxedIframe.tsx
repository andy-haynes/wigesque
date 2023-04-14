
function buildSandboxedWidget(id: string, scriptSrc: string) {
  const widgetPath = id.split('::')[0];
  const moduleContents = `
    /* generated code for ${widgetPath} */
    const { h } = window.preact;

    const widgetRenders = [];

    const __renderBuiltin = (props) => {
      return h('span', props, 'I am a predefined component with props keys: ' + Object.keys(props).join(', '));
    }

    const __renderWidget = ({ src, props }) => {
      const widgetId = src + '::' + window.crypto.randomUUID();
      widgetRenders.push({ props, source: src, type: 'WIDGET_RENDER', widgetId, parentId: '${id}' });
      return h('div', { ...props, id: 'dom-' + widgetId, className: 'iframe' }, 'loading ' + src + '...');
    }

    function __InternalSandboxComponent() {
      try {
        /* NS shims */
        const context = { accountId: 'andyh.near' };
        const props = {};
        let state = {};
        const State = {
          init(obj) { state = obj; },
          update() {},
        };
        const Social = {
          get(url) {
            return undefined;
          },
          getr(url) {
            return null;
          },
          index(action, key, options) {
            return null;
          },
          keys(path) {
            return null;
          }
        };
        const React = {
          Fragment: 'div',
        };
        const styled = {
          div: (s) => 'div',
        };

        return (
          /* BEGIN EXTERNAL SOURCE */
          ${scriptSrc}
          /* END EXTERNAL SOURCE */
        )();
      } catch (e) {
        return h('div', {}, 'failed to load ${widgetPath}: ' + e.toString());
      }
    }

    let node = __InternalSandboxComponent();
    if (!node) {
      node = h('span', {}, '<null>');
    }

    if (typeof node === 'string') {
      node = h('span', {}, 'component returned string: "' + node + '"');
    }

    if (typeof node.type !== 'string') {
      node = h('div', {}, '${widgetPath} parsed non-string type: ' + JSON.stringify(node, null, 2));
    }
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
