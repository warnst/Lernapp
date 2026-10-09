import type { AvatarId } from '@/domain/types';

// Profil-Tiere (docs/02 6.4, docs/09 Abschnitt 3.2). `small` für „Hallo, kleiner Delfin!“.

export interface AvatarInfo {
  id: AvatarId;
  name: string;
  small: string;
}

export const AVATARS: readonly AvatarInfo[] = [
  { id: 'delfin', name: 'Delfin', small: 'kleiner Delfin' },
  { id: 'schildkroete', name: 'Schildkröte', small: 'kleine Schildkröte' },
  { id: 'seepferdchen', name: 'Seepferdchen', small: 'kleines Seepferdchen' },
  { id: 'pinguin', name: 'Pinguin', small: 'kleiner Pinguin' },
  { id: 'robbe', name: 'Robbe', small: 'kleine Robbe' },
  { id: 'flamingo', name: 'Flamingo', small: 'kleiner Flamingo' },
];

export function avatarInfo(id: AvatarId): AvatarInfo {
  const info = AVATARS.find((a) => a.id === id);
  if (!info) throw new Error(`Unbekanntes Tier: ${id}`);
  return info;
}
