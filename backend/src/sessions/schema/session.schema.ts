import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {

  @Prop({ required: true })
  tutorId: string;

  @Prop({ required: true })
  studentId: string;

  @Prop({ required: true })
  subject: string;

  @Prop({
    default: 'active',
    enum: ['active', 'completed', 'cancelled'],
  })
  status: string;
}

export const SessionSchema =
  SchemaFactory.createForClass(Session);