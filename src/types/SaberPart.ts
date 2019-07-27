import { SaberParts } from '@generated/photon';
import { enumType } from '@prisma/nexus/dist';

export const SaberPart = enumType({
  name: 'SaberPart',
  members: [SaberParts.CRYSTAL, SaberParts.CRYSTAL_VIBRATOR, SaberParts.HILT, SaberParts.POWER_CORE],
});
