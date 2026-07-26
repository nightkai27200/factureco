import {
Controller,
Get,
Req,
UseGuards,
} from '@nestjs/common';

import { DashboardService } from './dashboard.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';



@Controller('dashboard')
export class DashboardController {


constructor(
private dashboardService:DashboardService,
){}




@Get()

@UseGuards(JwtAuthGuard)

async stats(
@Req() req
){


return this.dashboardService.getStats(
 req.user.id
);


}



}