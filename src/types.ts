import Photon from '@generated/photon';
import { Request } from 'express';

export interface Context {
  photon: Photon;
  request: Request;
}
