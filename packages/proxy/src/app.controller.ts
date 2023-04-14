import { Controller, Get, Param } from '@nestjs/common';

import { compileWidget, transpileWidget } from "./transpiler";

@Controller()
export class AppController {
  @Get('source/:widgetId')
  getHardcodedWidget(@Param('widgetId') widgetId: string) {
    return {
      source: `
        import { h } from 'https://esm.sh/preact';
        const node = h('div', { className: 'iframe-initialized' }, '${widgetId}');
        window.parent.postMessage(
          JSON.stringify({ type: 'IFRAME_RENDER', id: '${widgetId}', node }),
          '*'
        );
      `,
    };
  }

  @Get('widget/:accountId/widget/:widgetId')
  async getNSWidget(@Param('accountId') accountId: string, @Param('widgetId') widgetId: string) {
    const blacklist = [
      'ComponentSearch',
      'ProfileSearch',
    ];
    if (blacklist.includes(widgetId)) {
      return {
        source: "function wtfEver() { return h('span', {}, 'I am a bad widget and I break the page') }",
      };
    }
    return {
      source: await compileWidget(`${accountId}/widget/${widgetId}`),
    };
  }

  @Get('raw/:accountId/widget/:widgetId')
  async getNSWidgetRaw(@Param('accountId') accountId: string, @Param('widgetId') widgetId: string) {
    return await compileWidget(`${accountId}/widget/${widgetId}`);
  }

  @Get('transpiled/:accountId/widget/:widgetId')
  async getNSWidgetSource(@Param('accountId') accountId: string, @Param('widgetId') widgetId: string) {
    return await transpileWidget(`${accountId}/widget/${widgetId}`);
  }
}
