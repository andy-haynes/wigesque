import { getIframeId } from "widgets";

import type {
  DeserializePropsOptions,
  IframePostMessageOptions,
} from './types';

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
