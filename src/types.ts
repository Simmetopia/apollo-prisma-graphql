import { Request } from 'express';
import { Photon } from '@generated/photon';

export interface Context {
  photon: Photon;
  request: Request;
}
