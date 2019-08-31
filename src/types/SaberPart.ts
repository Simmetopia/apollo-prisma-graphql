import { SaberParts } from '@generated/photon';
import { enumType } from '@prisma/nexus/dist';

export const SaberPart = enumType({
  name: 'saberPart',
  members: SaberParts,
});
