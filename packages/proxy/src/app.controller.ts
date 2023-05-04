import { Controller, Get, Param } from '@nestjs/common';

import { fetchWidgetSource, transpileWidget } from './transpiler';

@Controller()
export class AppController {
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
      source: await transpileWidget(`${accountId}/widget/${widgetId}`),
    };
  }

  @Get('source/:accountId/widget/:widgetId')
  async getNSWidgetSource(@Param('accountId') accountId: string, @Param('widgetId') widgetId: string) {
    return await fetchWidgetSource(`${accountId}/widget/${widgetId}`);
  }
}
