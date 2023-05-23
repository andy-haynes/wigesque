import { getAppDomId, getIframeId, Widget } from "widgets";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

const LOCAL_PROXY_WIDGET_URL_PREFIX = 'http://localhost:3001/widget';
const rootWidgetPath = 'andyh.near/widget/RenderTestRoot'

const roots = {} as { [key: string]: any };
const widgets = {} as { [key: string]: any };

function postMessageToChildIframe({ id, message, targetOrigin }: { id: string, message: object, targetOrigin: string }) {
  (document.getElementById(getIframeId(id)) as HTMLIFrameElement)
    ?.contentWindow?.postMessage(message, targetOrigin);
}

function deserializeProps({ id, props }: { id: string, props: any }): any {
  if (!props || !props.__domcallbacks) {
    return props;
  }

  Object.entries(props.__domcallbacks)
    .forEach(([propKey, callback]: [string, any]) => {
      props[propKey.split('::')[0]] = (...args: any[]) => {
        let serializedArgs: any = args;
        // is this a DOM event?
        if (args[0]?.target) {
          serializedArgs = {
            event: {
              target: {
                value: args[0].target?.value,
              },
            },
          }
        }

        postMessageToChildIframe({
          id,
          message: {
            args: serializedArgs,
            method: callback.method,
            type: 'widget.callback',
          },
          targetOrigin: '*',
        });
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
        index,
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
          /* a widget has been rendered and is ready to be updated in the outer window */
          const { id, childWidgets, node } = data;
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

          childWidgets.forEach(({ widgetId, props: widgetProps, source }: { widgetId: string, props: any, source: string }) => {
            /*
              a widget is being rendered by a parent widget, either:
              - this widget is being loaded for the first time
              - the parent widget has updated and is re-rendering this widget
            */
            if (!widgets[widgetId]) {
              /* widget code has not yet been loaded, add to cache and load */
              widgets[widgetId] = {
                parentId: id,
                props: widgetProps,
                sourceUrl: `${LOCAL_PROXY_WIDGET_URL_PREFIX}/${source}`,
              };

              setWidgetCount(Object.keys(widgets).length);
            } else {
              /* widget iframe is already loaded, post update message to iframe */
              postMessageToChildIframe({
                id: widgetId,
                message: {
                  props: widgetProps,
                  type: 'widget.update',
                },
                targetOrigin: '*',
              })
            }
          });

          setUpdates(updates + id);
        } else if (data.type === 'widget.callback') {
          /*
            a widget has invoked a callback passed to it as props by its parent widget
            post a widget callback message to the parent iframe
          */
          const { args, callbackArgs, method, targetId } = data;
          postMessageToChildIframe({
            id: targetId,
            message: {
              args: args || callbackArgs.map((cb: any) => cb.method ? cb.method : cb),
              callbackArgs,
              method,
              targetId,
              type: 'widget.callback',
            },
            targetOrigin: '*',
          });
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
      <div id={getAppDomId(rootWidgetPath)} className='iframe'>
        root widget goes here
      </div>
      <div className="iframes">
        <h5>here be hidden iframes</h5>
        <Widget
          key={0}
          id={rootWidgetPath}
          sourceUrl={`${LOCAL_PROXY_WIDGET_URL_PREFIX}/${rootWidgetPath}`}
        />
        {
          Object.entries(widgets)
            .map(([widgetId, { props, sourceUrl }]) => (
              <div key={widgetId}>
                <Widget
                  id={widgetId}
                  sourceUrl={sourceUrl}
                  widgetProps={props}
                />
              </div>
            ))
        }
      </div>
    </div>
  );
}
