import { Controller, Get, Param } from '@nestjs/common';

import { compileWidget } from "./transpiler";

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
    return {
      source: await compileWidget(`${accountId}/widget/${widgetId}`),
    };
  }
}
