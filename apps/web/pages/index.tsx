import { getAppDomId, Widget } from "widgets";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import { createChildElements, createElement, postMessageToChildIframe, WidgetDOMElement } from './widget-utils';

const LOCAL_PROXY_WIDGET_URL_PREFIX = 'http://localhost:3001/widget';
const DEFAULT_ROOT_WIDGET = 'mob.near/widget/Welcome'

const roots = {} as { [key: string]: ReactDOM.Root };
const widgets = {} as { [key: string]: any };

function mountElement({ widgetId, element }: { widgetId: string, element: WidgetDOMElement }) {
  if (!roots[widgetId]) {
    const domElement = document.getElementById(getAppDomId(widgetId));
    if (!domElement) {
      console.error(`Node not found: #${getAppDomId(widgetId)}`);
      return;
    }

    roots[widgetId] = ReactDOM.createRoot(domElement);
  }

  roots[widgetId].render(element);
}

export default function Web() {
  const [rootWidget, setRootWidget] = useState('');
  const [rootWidgetInput, setRootWidgetInput] = useState(DEFAULT_ROOT_WIDGET);
  const [updates, setUpdates] = useState('');
  const [widgetCount, setWidgetCount] = useState(1);

  useEffect(() => {
    async function processEvent(event: any) {
      try {
        if (typeof event.data !== 'object') {
          return;
        }

        const { data } = event;
        if (data.type === 'widget.render') {
          /* a widget has been rendered and is ready to be updated in the outer window */
          const { widgetId, childWidgets, node } = data;
          const { children, ...props } = node?.props || { children: [] };

          const componentChildren = createChildElements({ children, depth: 0, parentId: widgetId });
          const element = createElement({
            children: [
              React.createElement('span', { className: 'dom-label' }, `[${widgetId.split('::')[0]}]`),
              React.createElement('br'),
              ...(Array.isArray(componentChildren) ? componentChildren : [componentChildren]),
            ],
            id: widgetId,
            props,
            type: node.type,
          });
          mountElement({ widgetId, element });

          childWidgets.forEach(({ widgetId: childWidgetId, props: widgetProps, source }: { widgetId: string, props: any, source: string }) => {
            /*
              a widget is being rendered by a parent widget, either:
              - this widget is being loaded for the first time
              - the parent widget has updated and is re-rendering this widget
            */
            if (!widgets[childWidgetId]) {
              /* widget code has not yet been loaded, add to cache and load */
              widgets[childWidgetId] = {
                parentId: widgetId,
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

          setUpdates(updates + widgetId);
        } else if (data.type === 'widget.callback') {
          /*
            a widget has invoked a callback passed to it as props by its parent widget
            post a widget callback message to the parent iframe
          */
          const { args, method, originator, requestId, targetId } = data;
          postMessageToChildIframe({
            id: targetId,
            message: {
              args,
              method,
              originator,
              requestId,
              targetId,
              type: 'widget.callback',
            },
            targetOrigin: '*',
          });
        } else if (data.type === 'widget.callbackResponse') {
          /*
            a widget has invoked a callback passed to it as props by its parent widget
            post a widget callback message to the parent iframe
          */
          const { requestId, result, targetId } = data;
          postMessageToChildIframe({
            id: targetId,
            message: {
              result,
              requestId,
              type: 'widget.callbackResponse',
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

  if (!rootWidget) {
    return (
      <div className='App'>
        <div>
          <input
            type='text'
            value={rootWidgetInput}
            style={{ width: '400px' }}
            onChange={(e) => setRootWidgetInput(e.target.value)}
          />
          <button onClick={() => setRootWidget(rootWidgetInput)}>
            Update Root Widget
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='App'>
      <h6>{widgetCount} widgets rendered</h6>
      <div id={getAppDomId(rootWidget)} className='iframe'>
        root widget goes here
      </div>
      <div className="iframes">
        <h5>here be hidden iframes</h5>
        <Widget
          key={0}
          id={rootWidget}
          sourceUrl={`${LOCAL_PROXY_WIDGET_URL_PREFIX}/${rootWidget}`}
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
