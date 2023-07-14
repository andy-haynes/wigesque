import { getAppDomId, Widget } from "widgets";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import { WidgetDOMElement } from './widget-utils';
import { onCallbackInvocation, onCallbackResponse, onRender } from "./widget-handlers";

const LOCAL_PROXY_WIDGET_URL_PREFIX = 'http://localhost:3001/widget';
const DEFAULT_ROOT_WIDGET = 'mob.near/widget/Welcome'

const roots = {} as { [key: string]: ReactDOM.Root };
const widgets = {} as { [key: string]: any };

const metrics = { renders: 0, updates: 0, callbackInvocations: 0, callbackResponses: 0 };

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
    function buildMessageListener(eventType: string) {
      return function (event: any) {
        try {
          if (typeof event.data !== 'object' || event.data.type !== eventType) {
            return;
          }

          const { data } = event;
          switch (eventType) {
            case 'widget.callbackInvocation': {
              metrics.callbackInvocations++;
              onCallbackInvocation({ data });
              break;
            }
            case 'widget.callbackResponse': {
              metrics.callbackResponses++;
              onCallbackResponse({ data });
              break;
            }
            case 'widget.render': {
              const { widgetId } = data;
              metrics.renders++;
              onRender({
                data,
                incrementUpdateMetrics: () => metrics.updates++,
                mountElement,
                setWidgetCount,
                widgetSourceBaseUrl: LOCAL_PROXY_WIDGET_URL_PREFIX,
                widgets,
              });
              setUpdates(updates + widgetId);
              break;
            }
            default:
              break;
          }
        } catch (e) {
          console.error({ event }, e);
        }
      }
    }

    const messageListeners = [
      buildMessageListener('widget.callbackInvocation'),
      buildMessageListener('widget.callbackResponse'),
      buildMessageListener('widget.render'),
    ];

    messageListeners.forEach((cb) => window.addEventListener('message', cb));
    return () => messageListeners.forEach((cb) => window.removeEventListener('message', cb));
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
      <h6>{metrics.renders} renders</h6>
      <h6>{metrics.updates} updates</h6>
      <h6>{metrics.callbackInvocations} invocations</h6>
      <h6>{metrics.callbackResponses} responses</h6>
      <div id={getAppDomId(rootWidget)} className='iframe'>
        root widget goes here
      </div>
      <div className="iframes">
        <h5>here be hidden iframes</h5>
        <div key={0} widget-id={rootWidget}>
          <Widget
            id={rootWidget}
            sourceUrl={`${LOCAL_PROXY_WIDGET_URL_PREFIX}/${rootWidget}`}
          />
        </div>
        {
          Object.entries(widgets)
            .map(([widgetId, { props, sourceUrl }]) => (
              <div key={widgetId} widget-id={widgetId}>
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
