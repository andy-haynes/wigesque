import { Events, getAppDomId, Widget } from "widgets";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

export default function Web() {
  const [roots, setRoots] = useState({} as { [key: string]: any });

  useEffect(() => {
    async function processEvent(event: any) {
      try {
        if (typeof event.data !== 'string') {
          return;
        }

        const data = JSON.parse(event.data);
        if (data.type === 'IFRAME_RENDER') {
          const { id, node } = data;
          const { children, ...props } = node.props;

          const element = React.createElement(node.type, props, children);
          if (roots[id]) {
            roots[id].render(element);
          } else {
            const domElement = document.getElementById(getAppDomId(id));
            if (domElement) {
              const root = ReactDOM.createRoot(domElement);
              setRoots({ ...roots, [id]: root });
              root.render(element);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    window.addEventListener('message', processEvent);
    return () => window.removeEventListener('message', processEvent);
  }, []);

  return (
    <div className='App'>
      <span>
            Each box is the root DOM for an app running in a corresponding sandboxed iframe.
            The boxes change colors as they load:
            <br />Red indicates the widget source is being loaded
            <br />Yellow indicates the iframe is being rendered and executing code
            <br />Green indicates the parent window has rendered the VNode sent from the iframe via `postMessage`
        </span>
      <div className="iframes">
        {[...new Array(50)].map((n, i) => (
          <Widget
            key={i}
            id={i.toString()}
            sourceUrl={`https://demo-nsproxy.kitwallet.app/source/${i}`}
          />
        ))}
      </div>
    </div>
  );
}
