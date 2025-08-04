import { Request } from 'express';
import { UserPayload } from './auth';

export interface RequestWithUser extends Request {
  user?: UserPayload;
}
