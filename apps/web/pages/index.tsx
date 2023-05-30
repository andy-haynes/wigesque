import { getAppDomId, Widget } from "widgets";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import { createChildElements, createElement, postMessageToChildIframe, WidgetDOMElement } from './widget-utils';

const LOCAL_PROXY_WIDGET_URL_PREFIX = 'http://localhost:3001/widget';
const rootWidgetPath = 'andyh.near/widget/RenderTestRoot'

const roots = {} as { [key: string]: ReactDOM.Root };
const widgets = {} as { [key: string]: any };

function mountElement({ id, element }: { id: string, element: WidgetDOMElement }) {
  if (!roots[id]) {
    const domElement = document.getElementById(getAppDomId(id));
    if (!domElement) {
      console.error(`Node not found: #${id}`);
      return;
    }

    roots[id] = ReactDOM.createRoot(domElement);
  }

  roots[id].render(element);
}

export default function Web() {
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
          const { id, childWidgets, node } = data;
          const { children, ...props } = node?.props || { children: [] };

          const componentChildren = createChildElements({ children, depth: 0, parentId: id });
          const element = createElement({
            children: [
              React.createElement('span', { className: 'dom-label' }, `[${id.split('::')[0]}]`),
              React.createElement('br'),
              ...(Array.isArray(componentChildren) ? componentChildren : [componentChildren]),
            ],
            id,
            props,
            type: node.type,
          });
          mountElement({ id, element });

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
          const { args, method, targetId } = data;
          postMessageToChildIframe({
            id: targetId,
            message: {
              args,
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
