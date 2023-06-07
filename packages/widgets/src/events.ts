import type {
  InvokeCallbackOptions,
  InvokeWidgetCallbackOptions,
  PostMessageEvent,
  ProcessEventOptions,
  WidgetCallbackInvocationResult
} from "./types";

/**
 * Execute the callback and return the value
 * @param args The arguments to the invoked callback
 * @param callback The function to execute
 */
export function invokeCallback({ args, callback }: InvokeCallbackOptions): any {
  if (args === undefined) {
    return callback();
  }

  // TODO real implementation for event passing
  // @ts-expect-error
  if (args?.event) {
    // @ts-expect-error
    return callback(args.event);
  }

  // @ts-expect-error
  return callback(...args);
}

/**
 * Invoke a callback declared within a Widget
 * @param args The arguments to the invoked callback
 * @param buildRequest Function to build an inter-Widget asynchronous callback request
 * @param callbacks The set of callbacks defined on the target Widget
 * @param method The name of the callback to be invoked
 * @param postCallbackInvocationMessage Request invocation on external Widget via window.postMessage
 * @param requests The set of inter-Widget callback requests being tracked by the Widget
 * @param serializeArgs The function responsible for serializing arguments to be passed via window.postMessage
 * @param widgetId ID of the target Widget on which the
 */
export function invokeWidgetCallback({
  args,
  buildRequest,
  callbacks,
  method,
  postCallbackInvocationMessage,
  requests,
  serializeArgs,
  widgetId,
}: InvokeWidgetCallbackOptions): WidgetCallbackInvocationResult {
  if (!callbacks[method]) {
    console.error(`No method ${method} on widget ${widgetId}`);
    return { shouldRender: false };
  }

  if (typeof args?.some === 'function' && args.some((arg: any) => arg.__widgetMethod)) {
    args = args.map((arg: any) => {
      const { __widgetMethod: widgetMethod } = arg;
      if (!widgetMethod) {
        return arg;
      }

      return (...childArgs: any[]) => {
        const requestId = window.crypto.randomUUID();
        requests[requestId] = buildRequest();

        postCallbackInvocationMessage({
          args: childArgs,
          callbacks,
          method: widgetMethod,
          requestId,
          serializeArgs,
          targetId: widgetMethod.split('::').slice(1).join('::'),
          widgetId,
        });
      };
    });
  }

  return {
    result: invokeCallback({ args, callback: callbacks[method] }),
    shouldRender: true,
  };
}

/**
 * Return an event handler function to be registered under `window.on('message', ...)`
 * @param buildRequest Function to build an inter-Widget asynchronous callback request
 * @param callbacks The set of callbacks defined on the target Widget
 * @param deserializeProps Function to deserialize props passed on the event
 * @param postCallbackResponseMessage Send callback execution result to calling Widget via window.postMessage
 * @param renderWidget Callback for rendering the Widget
 * @param requests The set of inter-Widget callback requests being tracked by the Widget
 * @param serializeArgs The function responsible for serializing arguments to be passed via window.postMessage
 * @param setProps Callback for setting the Widget's props
 * @param widgetId ID of the target Widget on which the
 */
export function buildEventHandler({
  buildRequest,
  callbacks,
  deserializeProps,
  postCallbackInvocationMessage,
  postCallbackResponseMessage,
  renderWidget,
  requests,
  serializeArgs,
  setProps,
  widgetId,
}: ProcessEventOptions): Function {
  return function processEvent(event: PostMessageEvent) {
    let error = null;
    let result;
    let shouldRender = false;

    switch (event.data.type) {
      case 'widget.callback': {
        let { args, method, originator, requestId } = event.data;
        try {
          ({ result, shouldRender } = invokeWidgetCallback({
            args,
            buildRequest,
            callbacks,
            method,
            postCallbackInvocationMessage,
            requests,
            serializeArgs,
            widgetId,
          }));
        } catch (e: any) {
          error = e as Error;
        }

        if (requestId) {
          postCallbackResponseMessage({
            error,
            requestId,
            result,
            targetId: originator,
          });
        }
        break;
      }
      case 'widget.update': {
        setProps(deserializeProps({
          buildRequest,
          callbacks,
          postCallbackInvocationMessage,
          props: event.data.props,
          requests,
          widgetId,
        }));

        shouldRender = true;
        break;
      }
      case 'widget.callbackResponse': {
        const { requestId, result } = event.data;
        if (!(requestId in requests)) {
          console.error(`No request found for request ${requestId}`);
        }

        if (!result) {
          console.error(`No response for request ${requestId}`);
        }

        const { rejecter, resolver } = requests[requestId];
        if (!rejecter || !resolver) {
          console.error(`No resolver set for request ${requestId}`);
          return;
        }

        const { error, value } = JSON.parse(result);
        if (error) {
          console.error('External Widget callback failed', { error });
          // TODO reject w/ Error instance
          rejecter(error);
          return;
        }

        resolver(value);
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
