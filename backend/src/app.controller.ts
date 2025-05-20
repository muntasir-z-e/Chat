import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Redirect('/api/docs', 302)
  redirectToDocs() {
    // Redirects to Swagger documentation
  }
}
