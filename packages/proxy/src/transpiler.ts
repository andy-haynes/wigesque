import { transformAsync } from '@babel/core';
import { JsonRpcProvider } from '@near-js/providers';
import { CodeResult } from '@near-js/types';

export async function fetchWidgetSource(widgetPath) {
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

  return source;
}

export async function transpileWidget(widgetPath) {
  const source = await fetchWidgetSource(widgetPath);
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

export async function getWidgetAst(widgetPath) {
  const source = await fetchWidgetSource(widgetPath);
  const componentSource = `
  function WidgetComponent () {
    ${source}
  }
`;

  const { ast } = await transformAsync(componentSource, {
    ast: true,
    presets: ['preact'],
  });

  console.log({ ast });
  return JSON.stringify(ast);
}

export async function compileWidget(widgetPath) {
  let transpiled = await transpileWidget(widgetPath);

  const widgetRegex =
    /h\(Widget,\s+\{\s+src:\s+(?<source>[\w\d '"`/.?$&(){}-]+),?\s+(?:props:\s+(?<props>[{}a-z0-9,.\s]+))?}\)/gi;
  const matches = [...transpiled.matchAll(widgetRegex)].map((match) => ({
    original: match[0],
    groups: { ...match.groups },
  }));

  matches.forEach(({ original, groups }) => {
    const { props, source } = groups;
    transpiled = transpiled.replace(
      original,
      `__renderWidget({ source: ${source}, props: ${props} })`,
    );
  });

  return transpiled;
}
