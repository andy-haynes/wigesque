import type {
  PostMessageWidgetCallbackInvocation,
  PostMessageWidgetCallbackResponse,
  PostMessageWidgetRender,
} from 'widgets';
import React from 'react';

export interface DomCallback {
  args: { event: any };
  method: string;
  type: string;
}

export interface WidgetUpdate {
  props: any;
  widgetId: string;
}

export interface Widget {
  parentId: string;
  props: any;
  sourceUrl: string;
}

export class WidgetActivityMonitor {
  callbacks: {
    invocations: PostMessageWidgetCallbackInvocation[],
    responses: PostMessageWidgetCallbackResponse[],
  } = { invocations: [], responses: [] };
  domCallbacks: DomCallback[] = [];
  renders: PostMessageWidgetRender[] = [];
  updates: WidgetUpdate[] = [];
  widgets: Widget[] = [];
  missingWidgets: string[] = [];

  domCallbackInvoked(callback: DomCallback) {
    this.domCallbacks.push(callback);
  }

  missingWidgetReferenced(widgetId: string) {
    this.missingWidgets.push(widgetId);
  }

  widgetAdded(widget: Widget) {
    this.widgets.push(widget);
  }

  widgetCallbackInvoked(invocation: PostMessageWidgetCallbackInvocation) {
    this.callbacks.invocations.push(invocation);
  }

  widgetCallbackReturned(response: PostMessageWidgetCallbackResponse) {
    this.callbacks.responses.push(response);
  }

  widgetRendered(render: PostMessageWidgetRender) {
    this.renders.push(render);
  }

  widgetUpdated(update: WidgetUpdate) {
    this.updates.push(update);
  }
}

export function WidgetMonitor({ monitor }: { monitor: WidgetActivityMonitor }) {
  return (
    <div id='widget-monitor'>
      <div className='metrics'>
        <div className='metrics-data-point'>
          <div className='data-point-header'>widgets loaded</div>
          <div className='data-point-value'>
            {monitor.widgets.length}
          </div>
        </div>
        <div className='metrics-data-point'>
          <div className='data-point-header'>renders</div>
          <div className='data-point-value'>
            {monitor.renders.length}
          </div>
        </div>
        <div className='metrics-data-point'>
          <div className='data-point-header'>updates</div>
          <div className='data-point-value'>
            {monitor.updates.length}
          </div>
        </div>
        <div className='metrics-data-point'>
          <div className='data-point-header'>invocations</div>
          <div className='data-point-value'>
            {monitor.callbacks.invocations.length}
          </div>
        </div>
        <div className='metrics-data-point'>
          <div className='data-point-header'>responses</div>
          <div className='data-point-value'>
            {monitor.callbacks.responses.length}
          </div>
        </div>
        <div className='metrics-data-point'>
          <div className='data-point-header'>widgets missing</div>
          <div className='data-point-value'>
            {monitor.missingWidgets.length}
          </div>
        </div>
      </div>
      <div className='widgets'>
        {
          Object.entries(monitor.widgets.reduce((widgetsBySource, widget) => {
            const { sourceUrl: source } = widget;
            if (!widgetsBySource[source]) {
              widgetsBySource[source] = [];
            }

            widgetsBySource[source].push(widget);
            return widgetsBySource;
          }, {} as { [key: string]: Widget[] }))
              .sort(([, aWidgets], [, bWidgets]) => bWidgets.length - aWidgets.length)
              .map(([source, widgets]) => (
                  <div className='widget-row'>
                    {widgets.length} {source}
                  </div>
              ))
        }
      </div>
    </div>
  );
}
