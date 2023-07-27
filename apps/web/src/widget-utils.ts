import type { EventData } from "container";
import React from "react";
import type { DOMElement } from "react";
import {
  getIframeId,
} from "widgets";

interface IframePostMessageOptions {
  id: string;
  message: EventData;
  targetOrigin: string;
}

interface DeserializePropsOptions {
  id: string;
  props: any;
}

export interface WidgetDOMElement extends DOMElement<any, any> {}

interface CreateElementOptions {
  children?: any;
  id: string;
  props: object;
  type: string;
}

interface CreateChildElementOptions {
  children?: any;
  depth: number;
  index?: number;
  parentId: string;
}

export function postMessageToChildIframe({ id, message, targetOrigin }: IframePostMessageOptions): void {
  (document.getElementById(getIframeId(id)) as HTMLIFrameElement)
    ?.contentWindow?.postMessage(message, targetOrigin);
}

export function deserializeProps({ id, props }: DeserializePropsOptions): any {
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
            method: callback.__widgetMethod,
            type: 'widget.domCallback',
          },
          targetOrigin: '*',
        });
      }
    });

  delete props.__domcallbacks;
  delete props.__widgetcallbacks;

  return props;
}

export function createElement({ children, id, props, type }: CreateElementOptions): WidgetDOMElement {
  return React.createElement(type, deserializeProps({ id, props }), children);
}

export function createChildElements({ children, depth, index, parentId }: CreateChildElementOptions): any {
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
}
