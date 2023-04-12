import { Controller, Get, Param } from '@nestjs/common';

import { compileWidget, getWidgetAst, transpileWidget } from "./transpiler";

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

  @Get('raw/:accountId/widget/:widgetId')
  async getNSWidgetRaw(@Param('accountId') accountId: string, @Param('widgetId') widgetId: string) {
    return await compileWidget(`${accountId}/widget/${widgetId}`);
  }

  @Get('transpiled/:accountId/widget/:widgetId')
  async getNSWidgetSource(@Param('accountId') accountId: string, @Param('widgetId') widgetId: string) {
    return await transpileWidget(`${accountId}/widget/${widgetId}`);
  }

  @Get('ast/:accountId/widget/:widgetId')
  async getNSWidgetAst(@Param('accountId') accountId: string, @Param('widgetId') widgetId: string) {
    return await getWidgetAst(`${accountId}/widget/${widgetId}`);
  }
}
