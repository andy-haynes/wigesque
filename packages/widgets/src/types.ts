export type Args = Array<object | string | number | null | undefined | RegExp>;

export type BuildRequestCallback = () => CallbackRequest;

export interface CallbackRequest {
  promise: Promise<any>,
  rejecter?: (reason: any) => void;
  resolver?: (value: any) => void;
}

export type DeserializePropsCallback = (props: DeserializePropsOptions) => any;
export interface DeserializePropsOptions {
  buildRequest: BuildRequestCallback;
  props: SerializedProps;
  callbacks: KeyValuePair;
  requests: { [key: string]: CallbackRequest }
  widgetId: string;
}

export type EventArgs = { event: any };

export interface EventData {
  args: Args;
  method: string;
  originator: string;
  props: object;
  requestId: string;
  result: string;
  type: string;
}

export interface InvokeCallbackOptions {
  args: Args | EventArgs;
  callback: Function;
}

export interface InvokeWidgetCallbackOptions {
  args: Args;
  buildRequest: BuildRequestCallback;
  callbacks: { [key: string]: Function };
  method: string;
  requests: { [key: string]: CallbackRequest };
  serializeArgs: SerializeArgsCallback;
  widgetId: string;
}

export interface KeyValuePair {
  [key: string]: any;
}

export interface NodeProps extends Props {
  children: any[];
}

export interface PostMessageEvent {
  data: EventData;
}

export interface ProcessEventOptions {
  buildRequest: BuildRequestCallback;
  callbacks: { [key: string]: Function };
  deserializeProps: DeserializePropsCallback;
  renderWidget: () => void;
  requests: { [key: string]: CallbackRequest };
  serializeArgs: SerializeArgsCallback;
  setProps: (props: object) => void;
  widgetId: string;
}

export interface Props extends KeyValuePair {
  __domcallbacks: { [key: string]: any };
  __widgetcallbacks: { [key: string]: any };
}

export type SerializedArgs = Array<string | number | object | any[] | { __widgetMethod: string }>;
export type SerializeArgsCallback = (args: SerializeArgsOptions) => SerializedArgs;
export interface SerializeArgsOptions {
  args: any[];
  callbacks: KeyValuePair;
  widgetId: string;
}

export interface SerializeNodeOptions {
  node: any;
  index: number;
  childWidgets: any[];
  callbacks: KeyValuePair;
  parentId: string;
}

export interface SerializedNode {
  childWidgets?: SerializedNode[];
  type: string;
  props: NodeProps | WidgetProps;
}

export interface SerializedProps extends KeyValuePair {
  __widgetcallbacks?: {
    [key: string]: SerializedWidgetCallback;
  };
}

export interface SerializePropsOptions {
  callbacks: KeyValuePair;
  index: number;
  parentId: string;
  props: any;
  widgetId?: string;
}

export interface SerializedWidgetCallback {
  __widgetMethod: string;
  parentId: string;
}

export interface WidgetCallbackInvocationResult {
  result?: any;
  shouldRender: boolean;
}

export interface WidgetProps {
  className: string;
  id: string;
}
