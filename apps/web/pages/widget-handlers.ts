import React from "react";
import {
  CallbackInvocationEventData,
  CallbackResponseEventData,
  RenderEventData,
} from 'widgets';

import type { WidgetUpdate } from './monitor';
import { createChildElements, createElement, postMessageToChildIframe } from './widget-utils';

interface CallbackInvocationHandlerOptions {
  data: CallbackInvocationEventData;
}

interface CallbackResponseHandlerOptions {
  data: CallbackResponseEventData;
}

interface RenderHandlerOptions {
  data: RenderEventData;
  markWidgetUpdated: (update: WidgetUpdate) => void;
  mountElement: ({ widgetId, element }: { widgetId: string, element: any }) => void;
  widgetSourceBaseUrl: string;
  widgets: { [key: string]: any };
}

export function onCallbackInvocation({
  data,
}: CallbackInvocationHandlerOptions) {
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
      type: 'widget.callbackInvocation',
    },
    targetOrigin: '*',
  });
}

export function onCallbackResponse({
  data,
}: CallbackResponseHandlerOptions) {
  /*
    a widget has executed a callback invoked from another widget
    return the value of the callback execution to the calling widget
  */
  const { isComponent, requestId, result, targetId } = data;
  postMessageToChildIframe({
    id: targetId,
    message: {
      isComponent,
      result,
      requestId,
      targetId,
      type: 'widget.callbackResponse',
    },
    targetOrigin: '*',
  });
}

export function onRender({
  data,
  markWidgetUpdated,
  mountElement,
  widgetSourceBaseUrl,
  widgets,
}: RenderHandlerOptions) {
  /* a widget has been rendered and is ready to be updated in the outer window */
  const { widgetId, childWidgets, node } = data;
  const { children, ...props } = node?.props || { children: [] };

  const componentChildren = createChildElements({ children, depth: 0, parentId: widgetId });
  const element = createElement({
    children: [
      React.createElement('span', { className: 'dom-label' }, `[${widgetId.split('##')[0]}]`),
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
        sourceUrl: `${widgetSourceBaseUrl}/${source}`,
      };
    } else {
      /* widget iframe is already loaded, post update message to iframe */
      markWidgetUpdated({ props, widgetId });
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
}
