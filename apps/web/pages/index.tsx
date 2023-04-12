import { Events, getAppDomId, Widget } from "widgets";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

const LOCAL_PROXY_WIDGET_URL_PREFIX = 'http://localhost:3001/widget';

const roots = {} as { [key: string]: any };
const widgets = {} as { [key: string]: any };

export default function Web() {
  const [updates, setUpdates] = useState('');

  const createAndMountElement = ({ children, id, props, type }: { children?: any, id: string, props: object, type: string }) => {
    const element = React.createElement(type, props, children);
    if (roots[id]) {
      roots[id].render(element);
    } else {
      const domElement = document.getElementById(getAppDomId(id));
      if (domElement) {
        const root = ReactDOM.createRoot(domElement);
        roots[id] = root;
        root.render(element);
      }
    }
  };

  const createChildElements = ({ children, depth, index, parentId }: { children: any, depth: number, index?: number, parentId: string }): any => {
    if (!children) {
      return '';
    }

    if (typeof children === 'string') {
      return children;
    }

    if (children.type) {
      const { type, props: { children: subChildren, ...props } } = children;
      return React.createElement(type, { ...props, key: `${parentId}-${depth}-${index}` }, createChildElements({ children: subChildren, depth: depth + 1, parentId }));
    }

    return children.map((child: any, i: number) => createChildElements({ children: child, depth: depth + 1, index: i, parentId }));
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
            children: [
              React.createElement('span', { className: 'dom-label' }, `[${id.split('::')[0]}]`),
              React.createElement('br'),
              ...createChildElements({ children, depth: 0, parentId: id }),
            ],
            id,
            props,
            type: node.type,
          });
          console.log(`rendered DOM for ${id}`);
          setUpdates(updates + id);
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
          console.log(`mounted root DOM for ${source}`);
          setUpdates(updates + widgetId);
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
      <div id={getAppDomId('root')} className='iframe'>
        root
      </div>
      <div className="iframes">
        <Widget
          key={0}
          id={'root'}
          sourceUrl={`${LOCAL_PROXY_WIDGET_URL_PREFIX}/mob.near/widget/Homepage`}
        />
        {
          Object.entries(widgets)
            .map(([widgetId, { sourceUrl }]) => (
              <div key={widgetId}>
                <Widget id={widgetId} sourceUrl={sourceUrl} />
              </div>
            ))
        }
      </div>
    </div>
  );
}
