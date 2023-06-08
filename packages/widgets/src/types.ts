export type Args = Array<Cloneable>;

export type BuildRequestCallback = () => CallbackRequest;

export interface CallbackRequest {
  promise: Promise<any>,
  rejecter?: (reason: any) => void;
  resolver?: (value: any) => void;
}

export type CallbackMap = { [key: string]: Function };

export type Cloneable = object | string | number | null | undefined | RegExp;

export type DeserializePropsCallback = (props: DeserializePropsOptions) => any;
export interface DeserializePropsOptions {
  buildRequest: BuildRequestCallback;
  props: SerializedProps;
  callbacks: CallbackMap;
  postCallbackInvocationMessage: PostMessageWidgetInvocationCallback;
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
  type: EventType;
}

type WidgetCallbackInvocation = 'widget.callback';
type WidgetCallbackResponse = 'widget.callbackResponse';
type WidgetRender = 'widget.render';
type WidgetUpdate = 'widget.update';
export type EventType = WidgetCallbackInvocation | WidgetCallbackResponse | WidgetRender | WidgetUpdate;

export interface InitNearOptions {
  renderWidget: () => void;
  requests: KeyValuePair;
  rpcUrl: string;
}

export interface InitSocialOptions {
  cache: KeyValuePair;
  endpointBaseUrl: string;
  renderWidget: Function;
  widgetId: string;
}

export interface InvokeCallbackOptions {
  args: Args | EventArgs;
  callback: Function;
}

export interface InvokeWidgetCallbackOptions {
  args: Args;
  buildRequest: BuildRequestCallback;
  callbacks: CallbackMap;
  method: string;
  postCallbackInvocationMessage: PostMessageWidgetInvocationCallback;
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

export interface PostMessageOptions {
  type: EventType;
}

export type PostMessageWidgetInvocationCallback = (message: PostMessageWidgetCallbackInvocationOptions) => void;
export interface PostMessageWidgetCallbackInvocation extends PostMessageOptions {
  args: SerializedArgs;
  method: string;
  originator: string;
  requestId: string;
  targetId: string;
  type: WidgetCallbackInvocation;
}
export interface PostMessageWidgetCallbackInvocationOptions {
  args: any[];
  callbacks: CallbackMap;
  method: string;
  requestId: string;
  serializeArgs: SerializeArgsCallback;
  targetId: string;
  widgetId: string;
}

export type PostMessageWidgetResponseCallback = (message: PostMessageWidgetCallbackResponseOptions) => void;
export interface PostMessageWidgetCallbackResponse extends PostMessageOptions {
  requestId: string;
  result: string; // stringified JSON in the form of { result: any, error: string }
  targetId: string;
  type: WidgetCallbackResponse;
}
export interface PostMessageWidgetCallbackResponseOptions {
  error: Error | null;
  requestId: string;
  result: any;
  targetId: string;
}

export interface PostMessageWidgetRender extends PostMessageOptions {
  childWidgets: string[];
  node: SerializedNode;
  type: WidgetRender;
  widgetId: string;
}
export interface PostMessageWidgetRenderOptions {
  childWidgets: string[];
  node: SerializedNode;
  widgetId: string;
}

export interface PostMessageWidgetUpdate extends PostMessageOptions {
  props: any;
  type: WidgetUpdate;
}
export interface PostMessageWidgetUpdateOptions {
  props: any;
}

export interface ProcessEventOptions {
  buildRequest: BuildRequestCallback;
  callbacks: CallbackMap;
  deserializeProps: DeserializePropsCallback;
  postCallbackInvocationMessage: PostMessageWidgetInvocationCallback;
  postCallbackResponseMessage: PostMessageWidgetResponseCallback;
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
  callbacks: CallbackMap;
  widgetId: string;
}

export interface SerializeNodeOptions {
  node: any;
  index: number;
  childWidgets: any[];
  callbacks: CallbackMap;
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
  callbacks: CallbackMap;
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