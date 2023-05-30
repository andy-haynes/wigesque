import type { DeserializePropsCallback, SerializeArgsCallback } from './serialize';

type Args = Array<object | string | number | null | undefined | RegExp> | { event: any };

interface EventData {
  args: Args;
  method: string;
  props: object;
  type: string;
}

interface PostMessageEvent {
  data: EventData;
}

interface ProcessEventOptions {
  callbacks: { [key: string]: Function };
  deserializeProps: DeserializePropsCallback;
  renderWidget: () => void;
  serializeArgs: SerializeArgsCallback;
  setProps: (props: object) => void;
  widgetId: string;
}

interface InvokeWidgetCallbackOptions {
  args: Args;
  callbacks: { [key: string]: Function };
  method: string;
  serializeArgs: SerializeArgsCallback;
  widgetId: string;
}

interface WidgetCallbackInvocationResult {
  shouldRender: boolean;
}

export function invokeWidgetCallback({ args, callbacks, method, serializeArgs, widgetId }: InvokeWidgetCallbackOptions): WidgetCallbackInvocationResult {
  if (!callbacks[method]) {
    console.error(`No method ${method} on widget ${widgetId}`);
    return { shouldRender: false };
  }

  // @ts-expect-error
  if (typeof args?.some === 'function' && args.some((arg: any) => arg.__widgetMethod)) {
    // @ts-expect-error
    args = args.map((arg: any) => {
      const { __widgetMethod: widgetMethod } = arg;
      if (!widgetMethod) {
        return arg;
      }

      return (...childArgs: any[]) => {
        window.parent.postMessage({
          args: serializeArgs({ args: childArgs, callbacks, widgetId }),
          method: widgetMethod,
          targetId: widgetMethod.split('::').slice(1).join('::'),
          type: 'widget.callback',
        }, '*');
      };
    });
  }

  const callback = callbacks[method];
  if (args === undefined) {
    callback();
  } else if (Array.isArray(args)) {
    callback(...args);
  } else if (args.event) {
    callback(args.event);
  } else if (args) {
    // FIXME
    if (args.event) {
      // unwrap event
      callback(args.event);
    } else {
      callback(args);
    }
  } else {
    console.error('Unknown args pattern', { args });
  }

  return { shouldRender: true };
}

export function buildEventHandler({ callbacks, deserializeProps, renderWidget, serializeArgs, setProps, widgetId }: ProcessEventOptions): Function {
  return function processEvent(event: PostMessageEvent) {
    let shouldRender = false;
    switch (event.data.type) {
      case 'widget.callback': {
        let { args, method } = event.data;
        ({ shouldRender } = invokeWidgetCallback({
          args,
          callbacks,
          method,
          serializeArgs,
          widgetId,
        }));
        break;
      }
      case 'widget.update': {
        setProps(deserializeProps({
          callbacks,
          props: event.data.props,
          widgetId,
        }));

        shouldRender = true;
        break;
      }
      default: {
        return;
      }
    }

    if (shouldRender) {
      renderWidget();
    }
  }
}
