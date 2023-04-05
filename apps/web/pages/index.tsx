import { Events, getAppDomId, Widget } from "widgets";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { v4 as uuidv4 } from 'uuid';

const LOCAL_PROXY_WIDGET_URL_PREFIX = 'http://localhost:3001/widget';

export default function Web() {
  const [roots, setRoots] = useState({} as { [key: string]: any });
  const [widgets, setWidgets] = useState({} as { [key: string]: any });

  useEffect(() => {
    async function processEvent(event: any) {
      try {
        if (typeof event.data !== 'string') {
          return;
        }

        const data = JSON.parse(event.data);
        if (data.type === Events.IFRAME_RENDER) {
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
        } else if (data.type === Events.WIDGET_RENDER) {
          const { widgetSrc } = data;

          const widgetId = uuidv4();
          const NewWidget = () => (
            <Widget
              key={widgetId}
              id={widgetId}
              sourceUrl={`${LOCAL_PROXY_WIDGET_URL_PREFIX}/${widgetSrc}`}
            />
          );

          setWidgets({
            ...widgets,
            [widgetId]: NewWidget,
          });
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
        <Widget
          key={0}
          id={'0'}
          sourceUrl={`${LOCAL_PROXY_WIDGET_URL_PREFIX}/mob.near/widget/Homepage`}
        />
        {
          Object.entries(widgets)
            .map(([widgetId, WidgetComponent]) => (
              <WidgetComponent key={widgetId} />
            ))
        }
      </div>
    </div>
  );
}
