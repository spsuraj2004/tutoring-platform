import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import {
  Session,
  SessionDocument,
} from './schema/session.schema';

import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {

  constructor(
    @InjectModel(Session.name)
    private sessionModel:
      Model<SessionDocument>,
  ) {}

  create(
    createSessionDto: CreateSessionDto,
  ) {
    return this.sessionModel.create(
      createSessionDto,
    );
  }

  findAll() {
    return this.sessionModel.find();
  }

  findTutorSessions(
    tutorId: string,
  ) {
    return this.sessionModel.find({
      tutorId,
    });
  }

  findStudentSessions(
    studentId: string,
  ) {
    return this.sessionModel.find({
      studentId,
    });
  }

  deleteSession(id: string) {
    return this.sessionModel.findByIdAndDelete(
      id,
    );
  }
}