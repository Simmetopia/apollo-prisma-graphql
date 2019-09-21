import { SaberParts } from '@generated/photon';
import { enumType } from 'nexus';

export const SaberPart = enumType({
  name: 'saberPart',
  members: SaberParts,
});
