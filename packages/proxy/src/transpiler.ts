import { transformAsync } from '@babel/core';
import { JsonRpcProvider } from '@near-js/providers';
import { CodeResult } from '@near-js/types';

export async function compileWidget(widgetPath) {
  const provider = new JsonRpcProvider({ url: 'https://rpc.mainnet.near.org' });

  const { result } = await provider.query<CodeResult>({
    account_id: 'social.near',
    args_base64: Buffer.from(`{"keys":["${widgetPath}"]}`).toString('base64'),
    finality: 'optimistic',
    method_name: 'get',
    request_type: 'call_function',
  });

  const [author, , widget] = widgetPath.split('/');
  const {
    [author]: {
      widget: { [widget]: source },
    },
  } = JSON.parse(Buffer.from(result).toString());

  const componentSource = `
  function WidgetComponent () {
    ${source}
  }
`;

  const { code } = await transformAsync(componentSource, {
    presets: ['preact'],
  });

  return code;
}
