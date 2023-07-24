import { croodles } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';

const createAvatarInstance = (seed: string | undefined) =>
  createAvatar(croodles, {
    scale: 180,
    radius: 25,
    backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
    backgroundType: ['gradientLinear'],
    size: 128,
    seed: seed,
  }).toString();

export default createAvatarInstance;