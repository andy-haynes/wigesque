import { getAppDomId, Widget } from "@bos-web-engine-viewer/widgets";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  WidgetActivityMonitor,
  WidgetMonitor,
  WidgetUpdate,
  WidgetDOMElement,
  onCallbackInvocation,
  onCallbackResponse,
  onRender,
} from "@bos-web-engine-viewer/application";

const LOCAL_PROXY_WIDGET_URL_PREFIX = 'http://localhost:3001/widget';
const DEFAULT_ROOT_WIDGET = 'andyh.near/widget/MainPage'

const roots = {} as { [key: string]: ReactDOM.Root };
const widgets = {} as { [key: string]: any };

const monitor = new WidgetActivityMonitor();

function mountElement({ widgetId, element }: { widgetId: string, element: WidgetDOMElement }) {
  if (!roots[widgetId]) {
    const domElement = document.getElementById(getAppDomId(widgetId));
    if (!domElement) {
      const metricKey = widgetId.split('##')[0];
      monitor.missingWidgetReferenced(metricKey);
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
  const [widgetCount, setWidgetCount] = useState(1);
  const [widgetUpdates, setWidgetUpdates] = useState('');

  const widgetProxy = new Proxy(widgets, {
    get(target, key: string) {
      return target[key];
    },

    set(target, key: string, value: any) {
      target[key] = value;
      monitor.widgetAdded({
        ...value,
        sourceUrl: value.sourceUrl.replace(`${LOCAL_PROXY_WIDGET_URL_PREFIX}/`, ''),
      });
      setWidgetUpdates(widgetUpdates + key);
      return true;
    },
  });

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
              monitor.widgetCallbackInvoked(data);
              onCallbackInvocation({ data });
              break;
            }
            case 'widget.callbackResponse': {
              monitor.widgetCallbackReturned(data);
              onCallbackResponse({ data });
              break;
            }
            case 'widget.render': {
              monitor.widgetRendered(data);
              onRender({
                data,
                markWidgetUpdated: (update: WidgetUpdate) => monitor.widgetUpdated(update),
                mountElement,
                widgetSourceBaseUrl: LOCAL_PROXY_WIDGET_URL_PREFIX,
                widgets: widgetProxy,
              });
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
      <WidgetMonitor monitor={monitor} />
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
          Object.entries({ ...widgetProxy })
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
