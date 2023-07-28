import { Controller, Get, Param } from '@nestjs/common';

import { fetchWidgetSource, transpileWidget } from './transpiler';

@Controller()
export class AppController {
  @Get('widget/:accountId/widget/:widgetId')
  async getNSWidget(
    @Param('accountId') accountId: string,
    @Param('widgetId') widgetId: string,
  ) {
    return {
      source: await transpileWidget(`${accountId}/widget/${widgetId}`),
    };
  }

  @Get('source/:accountId/widget/:widgetId')
  async getNSWidgetSource(
    @Param('accountId') accountId: string,
    @Param('widgetId') widgetId: string,
  ) {
    return await fetchWidgetSource(`${accountId}/widget/${widgetId}`);
  }
}
