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
    /* ${widgetPath} */
    ${source}
  }
`;

  const { code } = await transformAsync(componentSource, {
    presets: ['preact'],
  });

  return code;
}

function parseComponentExpression({ componentName, source, startIndex }) {
  const widgetIndex = source.indexOf(`h(${componentName}, `, startIndex);
  if (widgetIndex === -1) {
    return null;
  }

  const nameOffset = componentName.length + 4;
  let bracketIndex = widgetIndex + nameOffset + 1;
  let bracketCount = 1;
  while (bracketCount > 0) {
    if (source[bracketIndex] === '{') {
      bracketCount++;
    } else if (source[bracketIndex] === '}') {
      bracketCount--;
    }

    bracketIndex++;
  }

  const original = source.substring(widgetIndex, bracketIndex + 1);
  const args = source.substring(widgetIndex + nameOffset, bracketIndex);

  return {
    args,
    original,
    terminatingIndex: bracketIndex,
  };
}

function replaceComponents({ source, components }) {
  return Object.entries(components).reduce((code, [target, replacement]) => {
    let parsed;
    let startIndex = 0;
    do {
      parsed = parseComponentExpression({
        componentName: target,
        source,
        startIndex,
      });
      if (!parsed) {
        continue;
      }
      code = code.replace(parsed.original, `${replacement}(${parsed.args})`);
      startIndex = parsed.terminatingIndex;
    } while (parsed);
    return code;
  }, source);
}

export async function compileWidget(widgetPath) {
  return replaceComponents({
    source: await transpileWidget(widgetPath),
    components: {
      // IpfsImageUpload: '__renderBuiltin',
      // Widget: '__renderWidget',
    },
  });
}
