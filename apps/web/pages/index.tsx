import { Events, getAppDomId, Widget } from "widgets";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

const LOCAL_PROXY_WIDGET_URL_PREFIX = 'http://localhost:3001/widget';

const roots = {} as { [key: string]: any };
const widgets = {} as { [key: string]: any };

export default function Web() {
  const [updates, setUpdates] = useState(0);

  const createAndMountElement = ({ children, id, props, type }: { children?: any, id: string, props: object, type: string }) => {
    const element = React.createElement(type, props, children);
    if (roots[id]) {
      roots[id].render(element);
    } else {
      const domElement = document.getElementById(getAppDomId(id));
      if (domElement) {
        const root = ReactDOM.createRoot(domElement);
        roots[id] = root;
        setUpdates(updates + 1);
        root.render(element);
      }
    }
  };

  const createChildElements = (children: any): any => {
    if (typeof children === 'string') {
      return children;
    }

    if (children.type) {
      const { type, props: { children: subChildren, ...props } } = children;
      return React.createElement(type, props, createChildElements(subChildren));
    }

    return children.reduce((components: any, child: any) => {
      return [...components, createChildElements(child)];
    }, []);
  };

  useEffect(() => {
    async function processEvent(event: any) {
      try {
        if (typeof event.data !== 'string') {
          return;
        }

        const data = JSON.parse(event.data);
        if (data.type === Events.IFRAME_RENDER) {
          const { id, node } = data;
          const { children, ...props } = node?.props || { children: [] };

          createAndMountElement({
            children: createChildElements(children),
            id,
            props,
            type: node.type,
          });
        } else if (data.type === Events.WIDGET_RENDER) {
          const { props, source, widgetId } = data;

          widgets[widgetId] = {
              props,
              sourceUrl: `${LOCAL_PROXY_WIDGET_URL_PREFIX}/${source}`,
          };
          createAndMountElement({
            id: widgetId,
            props,
            type: 'div',
          });
          setUpdates(updates + 1);
        }
      } catch (e) {
        console.error({ event }, e);
      }
    }

    window.addEventListener('message', processEvent);
    return () => window.removeEventListener('message', processEvent);
  }, []);

  return (
    <div className='App'>
      <div className="iframes">
        <div id={getAppDomId('root')} className='iframe'>
          root
        </div>
        <Widget
          key={0}
          id={'root'}
          sourceUrl={`${LOCAL_PROXY_WIDGET_URL_PREFIX}/mob.near/widget/Homepage`}
        />
        {
          Object.entries(widgets)
            .map(([widgetId, { sourceUrl }]) => (
              <Widget key={widgetId} id={widgetId} sourceUrl={sourceUrl} />
            ))
        }
      </div>
    </div>
  );
}
