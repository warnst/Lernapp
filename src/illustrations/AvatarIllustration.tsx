import { useId, type ReactNode } from 'react';
import type { AvatarId } from '@/domain/types';

// Profil-Avatare (docs/02, 6.4): rund, Brustbild, gleicher Stil wie Kiko. viewBox 0 0 96 96.

function Eye({ cx, cy, r = 5 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="var(--white)" strokeWidth={2.5} />
      <circle cx={cx + 0.5} cy={cy + 0.5} r={r * 0.55} fill="var(--stroke)" stroke="none" />
      <circle cx={cx + 1.5} cy={cy - 1} r={r * 0.2} fill="var(--white)" stroke="none" />
    </g>
  );
}

const BACKGROUND: Record<AvatarId, string> = {
  delfin: 'var(--ill-bg-sea)',
  schildkroete: 'var(--ill-bg-sand)',
  seepferdchen: 'var(--ill-bg-sun)',
  pinguin: 'var(--ill-bg-sea)',
  robbe: 'var(--ill-bg-sand)',
  flamingo: 'var(--ill-bg-pink)',
};

const FIGURES: Record<AvatarId, ReactNode> = {
  delfin: (
    <>
      <path d="M30 46 C26 36 26 28 24 22 C34 26 40 32 42 38 Z" fill="var(--ill-dolphin)" />
      <path
        d="M14 100 C12 64 26 38 50 36 C62 35 70 40 80 44 C88 47 88 54 80 55 C72 56 66 56 64 60 C70 72 72 88 72 100 Z"
        fill="var(--ill-dolphin)"
      />
      <path d="M64 60 C66 72 64 86 60 100 L40 100 C46 84 54 70 64 60 Z" fill="var(--ill-surf)" />
      <path d="M66 52 Q74 55 84 51" fill="none" strokeWidth={2.5} />
      <Eye cx={58} cy={45} />
    </>
  ),
  schildkroete: (
    <>
      <path d="M36 70 C34 60 34 52 36 46 H60 C62 52 62 60 60 70 Z" fill="var(--ill-turtle)" />
      <circle cx={48} cy={40} r={19} fill="var(--ill-turtle)" />
      <path d="M10 100 C10 76 26 64 48 64 C70 64 86 76 86 100 Z" fill="var(--ill-turtle-shell)" />
      <path
        d="M36 100 L38 84 L48 78 L58 84 L60 100 M38 84 L22 78 M58 84 L74 78 M48 78 V65"
        fill="none"
        strokeWidth={2.5}
      />
      <Eye cx={40} cy={37} />
      <Eye cx={56} cy={37} />
      <path d="M42 48 Q48 53 54 48" fill="none" strokeWidth={2.5} />
      <circle cx={34} cy={46} r={2.5} fill="var(--ill-coral)" stroke="none" opacity={0.6} />
      <circle cx={62} cy={46} r={2.5} fill="var(--ill-coral)" stroke="none" opacity={0.6} />
    </>
  ),
  seepferdchen: (
    <>
      <path d="M44 28 L40 18 L48 24 L50 14 L55 24" fill="var(--ill-coral)" />
      <path d="M34 60 L24 64 L30 70 L24 76 L32 80 L28 88 L36 90" fill="var(--ill-coral)" />
      <path
        d="M38 100 C34 84 36 70 42 62 C34 56 32 42 40 32 C46 24 58 22 64 30 C66 33 67 35 68 36 L82 36 C86 36 86 42 82 42 L66 43 C63 50 58 56 56 64 C60 74 62 88 60 100 Z"
        fill="var(--ill-seahorse)"
      />
      <path
        d="M54 70 Q50 72 48 70 M56 80 Q51 82 48 80 M57 90 Q52 92 49 90"
        fill="none"
        strokeWidth={2}
      />
      <Eye cx={54} cy={35} />
      <path
        d="M46 46 C40 46 38 52 42 56 C44 52 46 50 46 46 Z"
        fill="var(--ill-coral)"
        strokeWidth={2.5}
      />
    </>
  ),
  pinguin: (
    <>
      <path d="M16 100 C16 60 26 24 48 24 C70 24 80 60 80 100 Z" fill="var(--ill-penguin)" />
      <path
        d="M48 46 C40 34 26 38 28 54 C30 66 34 74 30 100 H66 C62 74 66 66 68 54 C70 38 56 34 48 46 Z"
        fill="var(--white)"
      />
      <Eye cx={39} cy={50} />
      <Eye cx={57} cy={50} />
      <path d="M43 58 H53 L48 65 Z" fill="var(--kiko-beak)" strokeWidth={2.5} />
      <circle cx={34} cy={62} r={2.5} fill="var(--ill-coral)" stroke="none" opacity={0.6} />
      <circle cx={62} cy={62} r={2.5} fill="var(--ill-coral)" stroke="none" opacity={0.6} />
    </>
  ),
  robbe: (
    <>
      <path d="M16 100 C18 76 32 64 48 64 C64 64 78 76 80 100 Z" fill="var(--ill-seal)" />
      <ellipse cx={48} cy={46} rx={27} ry={23} fill="var(--ill-seal)" />
      <Eye cx={38} cy={40} r={6} />
      <Eye cx={58} cy={40} r={6} />
      <ellipse cx={43} cy={56} rx={6} ry={5} fill="var(--ill-surf)" strokeWidth={2.5} />
      <ellipse cx={53} cy={56} rx={6} ry={5} fill="var(--ill-surf)" strokeWidth={2.5} />
      <ellipse cx={48} cy={51} rx={4} ry={3} fill="var(--stroke)" />
      <path
        d="M36 55 L24 52 M36 58 L24 60 M60 55 L72 52 M60 58 L72 60"
        fill="none"
        strokeWidth={2}
      />
    </>
  ),
  flamingo: (
    <>
      <ellipse cx={34} cy={100} rx={30} ry={18} fill="var(--ill-flamingo)" />
      <path d="M50 44 C38 58 38 72 48 82 C54 88 54 96 50 104" fill="none" strokeWidth={14} />
      <path
        d="M50 44 C38 58 38 72 48 82 C54 88 54 96 50 104"
        fill="none"
        stroke="var(--ill-flamingo)"
        strokeWidth={8}
      />
      <path d="M64 30 C76 30 82 38 78 50 C75 46 70 43 64 42 Z" fill="var(--ill-white)" />
      <path d="M78 50 C79 46 79 43 78.5 40 L73 44.5 C75 46 77 48 78 50 Z" fill="var(--stroke)" />
      <circle cx={54} cy={36} r={14} fill="var(--ill-flamingo)" />
      <Eye cx={56} cy={33} />
      <circle cx={48} cy={42} r={2.5} fill="var(--ill-coral)" stroke="none" opacity={0.7} />
    </>
  ),
};

export function AvatarIllustration({
  avatar,
  size = 96,
  className,
}: {
  avatar: AvatarId;
  size?: number;
  className?: string;
}) {
  // useId liefert Sonderzeichen, die in url(#…) stören können
  const clipId = `avatar-clip-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 96 96"
      className={className}
      data-avatar={avatar}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={48} cy={48} r={45} />
        </clipPath>
      </defs>
      <g stroke="var(--stroke)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <circle cx={48} cy={48} r={45} fill={BACKGROUND[avatar]} stroke="none" />
        <g clipPath={`url(#${clipId})`}>{FIGURES[avatar]}</g>
        <circle cx={48} cy={48} r={45} fill="none" />
      </g>
    </svg>
  );
}
