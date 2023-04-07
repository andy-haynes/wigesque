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
  let {
    [author]: {
      widget: { [widget]: source },
    },
  } = JSON.parse(Buffer.from(result).toString());

  const widgetRegex =
    /(?<isWidgetReturned>return[(]?)?\s*<Widget\s+(?:src={(?<source0>.+?)})?(?:src="(?<source1>.+?)")?\s+(?:props={(?<props>.+)})?\s*\/>/g;

  const matches = [...source.matchAll(widgetRegex)].map((match) => ({
    original: match[0],
    groups: { ...match.groups },
  }));

  matches.forEach(({ original, groups }) => {
    const { isWidgetReturned, props, source0, source1 } = groups;
    const sourceExpression = source0 || `"${source1}"`;
    const renderWidgetExpression = `__renderWidget({ source: ${sourceExpression}, props: ${props} })`;
    source = source.replace(
      original,
      !!isWidgetReturned ? `return ${renderWidgetExpression}` : `{${renderWidgetExpression}}`,
    );
  });

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
