interface KeyValuePair {
  [key: string]: any;
}

interface Props extends KeyValuePair {
  __domcallbacks: { [key: string]: any };
  __widgetcallbacks: { [key: string]: any };
}

interface SerializedWidgetCallback {
  __widgetMethod: string;
  parentId: string;
}

interface SerializedProps extends KeyValuePair {
  __widgetcallbacks?: {
    [key: string]: SerializedWidgetCallback;
  };
}

type SerializedArgs = Array<string | number | object | any[] | { __widgetMethod: string }>;

interface WidgetProps {
  className: string;
  id: string;
}

interface NodeProps extends Props {
  children: any[];
}

interface SerializedNode {
  childWidgets?: SerializedNode[];
  type: string;
  props: NodeProps | WidgetProps;
}

interface SerializePropsOptions {
  callbacks: KeyValuePair;
  index: number;
  parentId: string;
  props: any;
  widgetId?: string;
}

interface DeserializePropsOptions {
  props: SerializedProps;
  callbacks: KeyValuePair;
  widgetId: string;
}

interface SerializeArgsOptions {
  args: any[];
  callbacks: KeyValuePair;
  widgetId: string;
}

interface SerializeNodeOptions {
  node: any;
  index: number;
  childWidgets: any[];
  callbacks: KeyValuePair;
  parentId: string;
}

export type DeserializePropsCallback = (props: DeserializePropsOptions) => any;
export type SerializeArgsCallback = (args: SerializeArgsOptions) => SerializedArgs;

export function serializeProps({ callbacks, index, parentId, props, widgetId }: SerializePropsOptions): Props {
  return Object.entries(props)
    .reduce((newProps, [key, value]) => {
      if (typeof value !== 'function') {
        newProps[key] = value;
        return newProps;
      }

      // [widgetId] only applies to props on widgets, use method
      // body to distinguish between non-widget callbacks
      const fnKey = [key, widgetId || value.toString().replace(/\\n/g, '')].join('::');
      callbacks[fnKey] = value;

      if (widgetId) {
        newProps.__widgetcallbacks[key] = {
          __widgetMethod: fnKey,
          parentId,
        };
      } else {
        newProps.__domcallbacks[key] = {
          __widgetMethod: fnKey,
        };
      }

      return newProps;
    }, {
      __domcallbacks: {},
      __widgetcallbacks: {},
    } as Props);
}

export function serializeArgs({ args, callbacks, widgetId }: SerializeArgsOptions): SerializedArgs {
  return (args || []).map((arg) => {
    if (typeof arg !== 'function') {
      return arg;
    }

    const callbackBody = arg.toString().replace(/\\n/g, '');
    const fnKey = callbackBody + '::' + widgetId;
    callbacks[fnKey] = arg;
    return {
      __widgetMethod: fnKey,
    };
  });
}

export function deserializeProps({ props, callbacks, widgetId }: DeserializePropsOptions): object {
  const { __widgetcallbacks } = props;
  const widgetProps = { ...props };
  delete widgetProps.__widgetcallbacks;

  return {
    ...widgetProps,
    ...Object.entries(__widgetcallbacks || {}).reduce((widgetCallbacks, [methodName, { __widgetMethod, parentId }]) => {
      if (props[methodName]) {
        throw new Error(`'duplicate props key ${methodName} on ${widgetId}'`);
      }

      widgetCallbacks[methodName] = (...args: any) => {
        // any function arguments are closures in this child widget scope
        // and must be cached in the widget iframe
        window.parent.postMessage({
          args: serializeArgs({ args, callbacks, widgetId }),
          method: __widgetMethod, // the key on the props object passed to this Widget
          targetId: parentId,
          type: 'widget.callback',
        }, '*');
      }

      return widgetCallbacks;
    }, {} as { [key: string]: any }),
  };
}

export function serializeNode({ node, index, childWidgets, callbacks, parentId }: SerializeNodeOptions): SerializedNode {
// TODO implement these for real
  const BUILTIN_COMPONENTS = {
    Checkbox: {
      type: 'div',
      children: 'Checkbox',
    },
    CommitButton: {
      type: 'button',
      children: 'CommitButton',
    },
    Dialog: {
      type: 'div',
      children: 'Dialog',
    },
    DropdownMenu: {
      type: 'div',
      children: 'DropdownMenu',
    },
    InfiniteScroll: {
      type: 'div',
      children: 'InfiniteScroll',
    },
    IpfsImageUpload: {
      type: 'button',
      children: 'IpfsImageUpload',
    },
    Markdown: {
      type: 'div',
      children: 'Markdown',
    },
  };

  let { type } = node;
  const { children } = node.props;
  const props = { ...node.props };
  delete props.children;

  const unifiedChildren = Array.isArray(children)
    ? children
    : [children];

  if (!type) {
    type = 'div';
  } else if (typeof type === 'function') {
    const { name: component } = type;
    if (component === '_') {
      type = 'div';
      // @ts-expect-error
    } else if (BUILTIN_COMPONENTS[component]) {
      // @ts-expect-error
      type = BUILTIN_COMPONENTS[component].type;
    } else if (component === 'Widget') {
      const { src, props: widgetProps } = props;
      // FIXME this breaks when the order of children changes
      //  needs a deterministic key (hash the internal widget state?)
      //  to distinguish between sibling widgets with the same source
      const widgetId = [src, index, parentId].join('::');
      try {
        childWidgets.push({
          props: widgetProps ? serializeProps({ props: widgetProps, callbacks, index, parentId, widgetId }) : {},
          source: src,
          widgetId,
        });
      } catch (error) {
        console.warn(`failed to dispatch widget load for ${parentId}`, { error, widgetProps });
      }

      return {
        type: 'div',
        props: {
          id: 'dom-' + widgetId,
          className: 'iframe',
        },
      }
    }
  }

  return {
    type,
    props: {
      ...serializeProps({ props, index, callbacks, parentId }),
      children: unifiedChildren
        .flat()
        .map((c, i) => c?.props ? serializeNode({
            node: c,
            index: i,
            childWidgets,
            callbacks,
            parentId,
          }) : c
        ),
    },
    childWidgets,
  }
}
