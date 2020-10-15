import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { CourseDataModel } from './model/Coursedata';
import { CourseData, RegisterableCourse, RegisterableSection } from './model/data.model';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()

  @Render('login')
  getHello() {
    return this.appService.getHello();
  }
}
