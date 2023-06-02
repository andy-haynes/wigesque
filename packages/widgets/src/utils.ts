export interface CallbackRequest {
  promise: Promise<any>,
  rejecter?: (reason: any) => void;
  resolver?: (value: any) => void;
}

export type BuildRequestCallback = () => CallbackRequest;

export function buildRequest(): CallbackRequest {
  let resolver;
  let rejecter;
  const promise = new Promise((res, rej) => {
    resolver = res;
    rejecter = rej;
  });

  return {
    promise,
    rejecter,
    resolver,
  };
}