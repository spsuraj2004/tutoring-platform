import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { SessionsService } from './sessions.service';

import { CreateSessionDto } from './dto/create-session.dto';

@Controller('sessions')
export class SessionsController {

  constructor(
    private readonly sessionsService:
      SessionsService,
  ) {}

  @Post()
  create(
    @Body()
    createSessionDto: CreateSessionDto,
  ) {
    return this.sessionsService.create(
      createSessionDto,
    );
  }

  @Get()
  findAll() {
    return this.sessionsService.findAll();
  }

  @Get('tutor/:id')
  findTutorSessions(
    @Param('id') id: string,
  ) {
    return this.sessionsService.findTutorSessions(
      id,
    );
  }

  @Get('student/:id')
  findStudentSessions(
    @Param('id') id: string,
  ) {
    return this.sessionsService.findStudentSessions(
      id,
    );
  }

  @Delete(':id')
  deleteSession(
    @Param('id') id: string,
  ) {
    return this.sessionsService.deleteSession(
      id,
    );
  }
}