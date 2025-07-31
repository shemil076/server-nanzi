import { Request } from 'express';
import { UserPayload } from './auth'; // adjust the path accordingly

export interface RequestWithUser extends Request {
  user?: UserPayload;
}
