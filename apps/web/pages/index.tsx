import { Events, getAppDomId, getIframeId, Widget } from "widgets";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

const LOCAL_PROXY_WIDGET_URL_PREFIX = 'http://localhost:3001/widget';

const roots = {} as { [key: string]: any };
const widgets = {} as { [key: string]: any };

function deserializeProps({ id, props }: { id: string, props: any }): any {
  if (!props || !props.__callbacks) {
    return props;
  }

  Object.entries(props.__callbacks)
    .forEach(([propKey, callback]: [string, any]) => {
      props[propKey] = (e: any) => {
        const iframe = document.getElementById(getIframeId(id)) as HTMLIFrameElement;
        iframe?.contentWindow?.postMessage({
          args: {
            event: {
              target: {
                value: e.target?.value,
              },
            },
          },
          method: callback.method,
          type: 'widget.callback',
        }, '*');
      }
    });

  return props;
}

export default function Web() {
  const [updates, setUpdates] = useState('');
  const [widgetCount, setWidgetCount] = useState(1);

  const createAndMountElement = ({ children, id, props, type }: { children?: any, id: string, props: object, type: string }) => {
    const element = React.createElement(type, deserializeProps({ id, props }), children);
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

  const createChildElements = ({ children, depth, index, parentId }: { children?: any, depth: number, index?: number, parentId: string }): any => {
    // `children` is a literal
    if (typeof children === 'string' || typeof children === 'number') {
      return children;
    }

    // `children` is (non-zero) falsy
    if (!children) {
      return '';
    }

    // `children` is a single component
    if (children.type) {
      const { type, props: { children: subChildren, ...props } } = children;
      const childProps = {
        ...deserializeProps({ id: parentId, props }),
        key: `${parentId}-${depth}-${index}`
      };

      if (!subChildren || !subChildren.filter((c: any) => c !== undefined).length) {
        return React.createElement(type, childProps);
      }

      return React.createElement(type, childProps, createChildElements({
        children: subChildren,
        depth: depth + 1,
        parentId,
      }));
    }

    // `children` is an array of components and/or primitives
    return children.map((child: any, i: number) => createChildElements({
      children: child,
      depth: depth + 1,
      index: i,
      parentId,
    }));
  };

  useEffect(() => {
    async function processEvent(event: any) {
      try {
        if (typeof event.data !== 'object') {
          return;
        }

        const { data } = event;
        if (data.type === 'widget.render') {
          const { id, node } = data;
          const { children, ...props } = node?.props || { children: [] };

          const componentChildren = createChildElements({ children, depth: 0, parentId: id });
          createAndMountElement({
            children: [
              React.createElement('span', { className: 'dom-label' }, `[${id.split('::')[0]}]`),
              React.createElement('br'),
              ...(Array.isArray(componentChildren) ? componentChildren : [componentChildren]),
            ],
            id,
            props,
            type: node.type,
          });
          console.log(`rendered DOM for ${id}`);
          setUpdates(updates + id);
        } else if (data.type === 'widget.load') {
          const { props, source, widgetId } = data;

          if (!widgets[widgetId]) {
            widgets[widgetId] = {
              props,
              sourceUrl: `${LOCAL_PROXY_WIDGET_URL_PREFIX}/${source}`,
            };

            setWidgetCount(Object.keys(widgets).length);
            console.log(`mounted root DOM for ${source}`);
          } else {
            const iframe = document.getElementById(getIframeId(widgetId)) as HTMLIFrameElement;
            iframe?.contentWindow?.postMessage({
              props,
              type: 'widget.update',
            }, '*');
          }
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
      <h6>{widgetCount} widgets rendered</h6>
      <div id={getAppDomId('root')} className='iframe'>
        root
      </div>
      <div className="iframes">
        <h5>here be hidden iframes</h5>
        <Widget
          key={0}
          id={'root'}
          sourceUrl={`${LOCAL_PROXY_WIDGET_URL_PREFIX}/mob.near/widget/Homepage`}
        />
        {
          Object.entries(widgets)
            .map(([widgetId, { props, sourceUrl }]) => (
              <div key={widgetId}>
                <Widget id={widgetId} sourceUrl={sourceUrl} widgetProps={props} />
              </div>
            ))
        }
      </div>
    </div>
  );
}
