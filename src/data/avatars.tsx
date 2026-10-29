import React from 'react';

export interface StudentAvatar {
  id: string;
  name: string;
  gender: 'male' | 'female';
  styleDesc: string;
  bgColor: string;
  badgeColor: string;
}

export const STUDENT_AVATARS: StudentAvatar[] = [
  // --- MALE AVATARS ---
  {
    id: 'boy-adam',
    name: 'Adam',
    gender: 'male',
    styleDesc: 'Neat hair & terracotta sweater',
    bgColor: '#F0E2D8',
    badgeColor: '#C65D3B',
  },
  {
    id: 'boy-zayn',
    name: 'Zayn',
    gender: 'male',
    styleDesc: 'Curly hair & wireframe glasses',
    bgColor: '#DEE8D6',
    badgeColor: '#5B6B4E',
  },
  {
    id: 'boy-tanvir',
    name: 'Tanvir',
    gender: 'male',
    styleDesc: 'Side-part & academic blazer',
    bgColor: '#D9E3EF',
    badgeColor: '#3D5A80',
  },
  {
    id: 'boy-farhan',
    name: 'Farhan',
    gender: 'male',
    styleDesc: 'Messy crop & mustard hoodie',
    bgColor: '#F5ECCB',
    badgeColor: '#E8B04A',
  },
  {
    id: 'boy-arian',
    name: 'Arian',
    gender: 'male',
    styleDesc: 'Athletic cap & graphic tee',
    bgColor: '#EBE4D8',
    badgeColor: '#6E655F',
  },
  {
    id: 'boy-tahmid',
    name: 'Tahmid',
    gender: 'male',
    styleDesc: 'Trim beard & classic polo',
    bgColor: '#E8DFD3',
    badgeColor: '#C65D3B',
  },
  {
    id: 'boy-nafis',
    name: 'Nafis',
    gender: 'male',
    styleDesc: 'Fluffy hair & studio headphones',
    bgColor: '#E1EDEB',
    badgeColor: '#3D7B75',
  },

  // --- FEMALE AVATARS ---
  {
    id: 'girl-zara',
    name: 'Zara',
    gender: 'female',
    styleDesc: 'Long wavy hair & terracotta knit',
    bgColor: '#F2DFD8',
    badgeColor: '#C65D3B',
  },
  {
    id: 'girl-fatima',
    name: 'Fatima',
    gender: 'female',
    styleDesc: 'Elegantly draped sage hijab',
    bgColor: '#E2EBDC',
    badgeColor: '#5B6B4E',
  },
  {
    id: 'girl-ayesha',
    name: 'Ayesha',
    gender: 'female',
    styleDesc: 'Terracotta-rose pinned hijab',
    bgColor: '#F4E4DF',
    badgeColor: '#C65D3B',
  },
  {
    id: 'girl-samira',
    name: 'Samira',
    gender: 'female',
    styleDesc: 'High topknot bun & glasses',
    bgColor: '#F7EDD5',
    badgeColor: '#E8B04A',
  },
  {
    id: 'girl-naila',
    name: 'Naila',
    gender: 'female',
    styleDesc: 'Sleek bob cut & pearl studs',
    bgColor: '#DFE7ED',
    badgeColor: '#3D5A80',
  },
  {
    id: 'girl-maya',
    name: 'Maya',
    gender: 'female',
    styleDesc: 'High ponytail & zipped jacket',
    bgColor: '#EAE1D6',
    badgeColor: '#8C684E',
  },
  {
    id: 'girl-anika',
    name: 'Anika',
    gender: 'female',
    styleDesc: 'Voluminous curls & denim layers',
    bgColor: '#E4EADF',
    badgeColor: '#5B6B4E',
  },
];

export function getAvatarById(id: string | undefined): StudentAvatar {
  if (!id) return STUDENT_AVATARS[0];
  const found = STUDENT_AVATARS.find((a) => a.id === id);
  return found || STUDENT_AVATARS[0];
}

interface AvatarGraphicProps {
  avatarId: string;
  size?: number | string;
  className?: string;
  name?: string;
}

export const AvatarGraphic: React.FC<AvatarGraphicProps> = ({
  avatarId,
  size = 40,
  className = '',
  name = 'Adam',
}) => {
  const avatar = getAvatarById(avatarId);
  const clipId = `avatar-clip-${avatarId}`;

  // Common skin tone & features
  const skin = '#E8B896';
  const skinShadow = '#D99F7B';
  const eyeColor = '#241E1A';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`shrink-0 select-none overflow-hidden rounded-full ${className}`}
      aria-label={`${avatar.name} avatar`}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>

      {/* Outer clipped circle */}
      <g clipPath={`url(#${clipId})`}>
        {/* Background circle */}
        <rect width="100" height="100" fill={avatar.bgColor} />

        {/* --- Render specific character illustration --- */}
        {avatarId === 'boy-adam' && (
          <g>
            {/* Shoulders / Torso */}
            <path d="M15 100 C15 76 30 70 50 70 C70 70 85 76 85 100 Z" fill="#C65D3B" />
            <path d="M42 70 L50 82 L58 70 Z" fill="#F5F1EA" />
            {/* Neck */}
            <rect x="43" y="58" width="14" height="16" rx="3" fill={skin} />
            <path d="M43 64 C47 67 53 67 57 64 L57 66 C53 69 47 69 43 66 Z" fill={skinShadow} opacity="0.5" />
            {/* Head */}
            <rect x="33" y="28" width="34" height="38" rx="17" fill={skin} />
            {/* Ears */}
            <circle cx="32" cy="46" r="4.5" fill={skin} />
            <circle cx="68" cy="46" r="4.5" fill={skin} />
            {/* Hair back / sides */}
            <path d="M30 38 C30 20 40 14 50 14 C60 14 70 20 70 38 C70 41 68 30 50 30 C32 30 30 41 30 38 Z" fill="#2E241F" />
            {/* Front hair fringe */}
            <path d="M30 34 C36 24 52 24 68 31 C63 26 55 23 48 24 C40 25 34 29 30 34 Z" fill="#3A2E28" />
            {/* Eyebrows */}
            <path d="M39 39 Q43 37 47 39" stroke="#241E1A" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M53 39 Q57 37 61 39" stroke="#241E1A" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Eyes */}
            <ellipse cx="43" cy="44" rx="2.2" ry="2.6" fill={eyeColor} />
            <ellipse cx="57" cy="44" rx="2.2" ry="2.6" fill={eyeColor} />
            <circle cx="44" cy="43" r="0.7" fill="#FFF" />
            <circle cx="58" cy="43" r="0.7" fill="#FFF" />
            {/* Nose */}
            <path d="M49 46 Q50 50 52 50" stroke={skinShadow} strokeWidth="1.8" strokeLinecap="round" fill="none" />
            {/* Friendly Smile */}
            <path d="M44 54 Q50 59 56 54" stroke="#8C4229" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        )}

        {avatarId === 'boy-zayn' && (
          <g>
            {/* Sage collar shirt */}
            <path d="M15 100 C15 76 30 70 50 70 C70 70 85 76 85 100 Z" fill="#5B6B4E" />
            <path d="M43 70 L50 78 L57 70 Z" fill="#E8B04A" />
            {/* Neck */}
            <rect x="43" y="58" width="14" height="16" rx="3" fill="#DFA986" />
            {/* Head */}
            <rect x="33" y="28" width="34" height="38" rx="17" fill="#DFA986" />
            {/* Curly Voluminous Hair */}
            <circle cx="33" cy="24" r="8" fill="#1C1714" />
            <circle cx="43" cy="18" r="9" fill="#221C18" />
            <circle cx="55" cy="17" r="9" fill="#1C1714" />
            <circle cx="66" cy="23" r="8" fill="#221C18" />
            <circle cx="30" cy="33" r="7" fill="#1C1714" />
            <circle cx="70" cy="33" r="7" fill="#221C18" />
            <path d="M32 29 C40 24 60 24 68 29 C65 24 55 21 50 21 C42 21 35 24 32 29 Z" fill="#2E2520" />
            {/* Round Glasses */}
            <circle cx="42" cy="44" r="6.5" stroke="#2B2622" strokeWidth="1.8" fill="rgba(255,255,255,0.25)" />
            <circle cx="58" cy="44" r="6.5" stroke="#2B2622" strokeWidth="1.8" fill="rgba(255,255,255,0.25)" />
            <path d="M48.5 44 L51.5 44" stroke="#2B2622" strokeWidth="1.8" />
            {/* Eyes behind glasses */}
            <circle cx="42" cy="44" r="2" fill={eyeColor} />
            <circle cx="58" cy="44" r="2" fill={eyeColor} />
            {/* Smile */}
            <path d="M45 54 Q50 58 55 54" stroke="#7A3F29" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </g>
        )}

        {avatarId === 'boy-tanvir' && (
          <g>
            {/* Academic Navy Blazer + Tie */}
            <path d="M15 100 C15 76 30 70 50 70 C70 70 85 76 85 100 Z" fill="#2E3B4E" />
            <polygon points="44,70 56,70 53,88 47,88" fill="#FFF" />
            <polygon points="48,73 52,73 54,84 50,88 46,84" fill="#C65D3B" />
            {/* Neck */}
            <rect x="43" y="58" width="14" height="16" rx="3" fill="#E5B291" />
            {/* Head */}
            <rect x="33" y="28" width="34" height="38" rx="17" fill="#E5B291" />
            {/* Ears */}
            <circle cx="32" cy="46" r="4.5" fill="#E5B291" />
            <circle cx="68" cy="46" r="4.5" fill="#E5B291" />
            {/* Neat side-part hair */}
            <path d="M30 34 C30 18 42 15 52 15 C66 15 70 24 70 36 C66 28 58 23 48 24 C38 25 33 28 30 34 Z" fill="#2B201A" />
            <path d="M32 28 C40 18 58 19 68 28 Z" fill="#1F1713" />
            {/* Eyes */}
            <circle cx="43" cy="44" r="2.2" fill={eyeColor} />
            <circle cx="57" cy="44" r="2.2" fill={eyeColor} />
            {/* Smile */}
            <path d="M44 54 Q50 58 56 54" stroke="#7A3F29" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        )}

        {avatarId === 'boy-farhan' && (
          <g>
            {/* Mustard Yellow Hoodie */}
            <path d="M15 100 C15 76 30 70 50 70 C70 70 85 76 85 100 Z" fill="#E8B04A" />
            <circle cx="50" cy="74" r="14" fill="#D49E3B" />
            <path d="M46 76 L44 92 M54 76 L56 92" stroke="#FFF" strokeWidth="1.6" strokeLinecap="round" />
            {/* Neck */}
            <rect x="43" y="56" width="14" height="16" rx="3" fill="#EBB998" />
            {/* Head */}
            <rect x="33" y="27" width="34" height="38" rx="17" fill="#EBB998" />
            {/* Messy Crop Hair */}
            <path d="M29 33 C31 16 42 14 50 14 C62 14 71 18 71 33 C67 26 59 24 53 26 C47 24 39 24 29 33 Z" fill="#2E221B" />
            <polygon points="34,22 38,15 42,22" fill="#2E221B" />
            <polygon points="46,20 50,13 54,20" fill="#2E221B" />
            <polygon points="58,22 62,15 66,23" fill="#2E221B" />
            {/* Eyes & Smile */}
            <circle cx="43" cy="43" r="2.2" fill={eyeColor} />
            <circle cx="57" cy="43" r="2.2" fill={eyeColor} />
            <path d="M44 53 Q50 59 56 53" stroke="#8C4229" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        )}

        {avatarId === 'boy-arian' && (
          <g>
            {/* Sporty Tee */}
            <path d="M15 100 C15 76 30 70 50 70 C70 70 85 76 85 100 Z" fill="#3D5A80" />
            {/* Neck */}
            <rect x="43" y="57" width="14" height="16" rx="3" fill="#EBB998" />
            {/* Head */}
            <rect x="33" y="28" width="34" height="38" rx="17" fill="#EBB998" />
            {/* Ears */}
            <circle cx="32" cy="46" r="4.5" fill="#EBB998" />
            <circle cx="68" cy="46" r="4.5" fill="#EBB998" />
            {/* Baseball Cap */}
            <path d="M30 33 C30 18 42 15 50 15 C62 15 70 20 70 33 Z" fill="#C65D3B" />
            <path d="M24 33 C34 30 66 30 76 33 C70 36 30 36 24 33 Z" fill="#A84B2D" />
            <circle cx="50" cy="15" r="2" fill="#8C3B21" />
            {/* Eyes & Grin */}
            <circle cx="43" cy="44" r="2.2" fill={eyeColor} />
            <circle cx="57" cy="44" r="2.2" fill={eyeColor} />
            <path d="M43 53 Q50 60 57 53" stroke="#8C4229" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </g>
        )}

        {avatarId === 'boy-tahmid' && (
          <g>
            {/* Classic Earth Polo */}
            <path d="M15 100 C15 76 30 70 50 70 C70 70 85 76 85 100 Z" fill="#4A3F35" />
            <path d="M44 70 L50 84 L56 70 Z" fill="#DCD3C5" />
            {/* Neck */}
            <rect x="43" y="57" width="14" height="16" rx="3" fill="#D9A380" />
            {/* Head */}
            <rect x="33" y="27" width="34" height="38" rx="17" fill="#D9A380" />
            {/* Trim Beard */}
            <path d="M34 46 C34 63 44 67 50 67 C56 67 66 63 66 46 C64 56 56 61 50 61 C44 61 36 56 34 46 Z" fill="#2E241E" />
            {/* Comb-over Hair */}
            <path d="M30 30 C32 15 46 14 56 15 C68 16 70 26 70 32 C65 24 55 22 47 23 C38 24 33 27 30 30 Z" fill="#201814" />
            {/* Eyes */}
            <circle cx="43" cy="42" r="2.2" fill={eyeColor} />
            <circle cx="57" cy="42" r="2.2" fill={eyeColor} />
            {/* Smile */}
            <path d="M45 53 Q50 56 55 53" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </g>
        )}

        {avatarId === 'boy-nafis' && (
          <g>
            {/* Sage t-shirt */}
            <path d="M15 100 C15 76 30 70 50 70 C70 70 85 76 85 100 Z" fill="#3D7B75" />
            {/* Neck */}
            <rect x="43" y="58" width="14" height="16" rx="3" fill="#E8B896" />
            {/* Head */}
            <rect x="33" y="28" width="34" height="38" rx="17" fill="#E8B896" />
            {/* Fluffy hair */}
            <circle cx="36" cy="22" r="8" fill="#2B211B" />
            <circle cx="48" cy="18" r="9" fill="#2B211B" />
            <circle cx="62" cy="22" r="8" fill="#2B211B" />
            <path d="M30 32 C38 25 58 25 70 32 C65 24 52 20 48 20 C40 20 34 25 30 32 Z" fill="#221A15" />
            {/* Studio Headphones around neck */}
            <path d="M26 44 C26 70 74 70 74 44" stroke="#FAF6F0" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <rect x="23" y="44" width="7" height="14" rx="3" fill="#2B2622" />
            <rect x="70" y="44" width="7" height="14" rx="3" fill="#2B2622" />
            {/* Eyes & Smile */}
            <circle cx="43" cy="44" r="2.2" fill={eyeColor} />
            <circle cx="57" cy="44" r="2.2" fill={eyeColor} />
            <path d="M45 54 Q50 58 55 54" stroke="#8C4229" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* --- FEMALE AVATARS --- */}
        {avatarId === 'girl-zara' && (
          <g>
            {/* Hair Back */}
            <path d="M25 35 C25 65 24 85 24 95 C28 95 38 85 36 65 Z" fill="#2B1E17" />
            <path d="M75 35 C75 65 76 85 76 95 C72 95 62 85 64 65 Z" fill="#2B1E17" />
            {/* Terracotta Top */}
            <path d="M15 100 C15 76 30 70 50 70 C70 70 85 76 85 100 Z" fill="#C65D3B" />
            <path d="M42 70 L50 80 L58 70 Z" fill="#FAF6F0" />
            {/* Neck */}
            <rect x="43" y="57" width="14" height="16" rx="3" fill="#F0BE9E" />
            {/* Head */}
            <rect x="33" y="27" width="34" height="38" rx="17" fill="#F0BE9E" />
            {/* Long Wavy Front Hair */}
            <path d="M28 34 C30 18 42 14 50 14 C62 14 72 20 72 38 C70 30 64 24 53 24 C44 24 35 28 28 34 Z" fill="#3B2B22" />
            <path d="M28 32 C30 50 26 70 33 80 C36 70 34 50 34 36 Z" fill="#3B2B22" />
            <path d="M72 32 C70 50 74 70 67 80 C64 70 66 50 66 36 Z" fill="#3B2B22" />
            {/* Pearl Earring */}
            <circle cx="32" cy="50" r="1.8" fill="#FFF" />
            <circle cx="68" cy="50" r="1.8" fill="#FFF" />
            {/* Eyes with subtle eyelashes */}
            <path d="M40 40 Q43 38 46 40" stroke="#2B1E17" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M54 40 Q57 38 60 40" stroke="#2B1E17" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <ellipse cx="43" cy="44" rx="2.2" ry="2.6" fill={eyeColor} />
            <ellipse cx="57" cy="44" rx="2.2" ry="2.6" fill={eyeColor} />
            <circle cx="44" cy="43" r="0.7" fill="#FFF" />
            <circle cx="58" cy="43" r="0.7" fill="#FFF" />
            {/* Gentle Smile */}
            <path d="M44 54 Q50 59 56 54" stroke="#B84930" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        )}

        {avatarId === 'girl-fatima' && (
          <g>
            {/* Sage Hijab Outer Fold */}
            <path d="M15 100 C15 74 26 68 50 68 C74 68 85 74 85 100 Z" fill="#5B6B4E" />
            <path d="M24 45 C24 20 36 14 50 14 C64 14 76 20 76 45 C76 70 66 84 50 84 C34 84 24 70 24 45 Z" fill="#5B6B4E" />
            {/* Inner Under-cap */}
            <path d="M35 32 C40 28 60 28 65 32 L65 35 C60 31 40 31 35 35 Z" fill="#F5F1EA" />
            {/* Face Opening */}
            <ellipse cx="50" cy="48" rx="16" ry="19" fill="#EAB694" />
            {/* Hijab Drape lines */}
            <path d="M34 67 C42 75 58 75 66 67" stroke="#48553E" strokeWidth="2" fill="none" />
            {/* Eyes & Brows */}
            <path d="M39 41 Q43 39 47 41" stroke="#2B2622" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <path d="M53 41 Q57 39 61 41" stroke="#2B2622" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            <ellipse cx="43" cy="46" rx="2.3" ry="2.7" fill={eyeColor} />
            <ellipse cx="57" cy="46" rx="2.3" ry="2.7" fill={eyeColor} />
            <circle cx="44" cy="45" r="0.7" fill="#FFF" />
            <circle cx="58" cy="45" r="0.7" fill="#FFF" />
            {/* Nose */}
            <path d="M49 48 Q50 51 52 51" stroke="#CE9671" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            {/* Cheerful Smile */}
            <path d="M44 56 Q50 61 56 56" stroke="#9E432D" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        )}

        {avatarId === 'girl-ayesha' && (
          <g>
            {/* Terracotta-Rose Wrapped Hijab */}
            <path d="M15 100 C15 74 26 68 50 68 C74 68 85 74 85 100 Z" fill="#C65D3B" />
            <path d="M23 44 C23 18 36 12 50 12 C64 12 77 18 77 44 C77 70 68 85 50 85 C32 85 23 70 23 44 Z" fill="#C65D3B" />
            {/* Soft Cream Headband */}
            <path d="M34 32 C41 27 59 27 66 32 L66 35 C59 30 41 30 34 35 Z" fill="#FAF6F0" />
            {/* Face Opening */}
            <ellipse cx="50" cy="48" rx="16" ry="19" fill="#F0BA9A" />
            {/* Elegant Side Pin Fold */}
            <path d="M34 66 C44 76 60 72 68 64" stroke="#993F23" strokeWidth="2.2" fill="none" />
            <circle cx="37" cy="62" r="2.5" fill="#E8B04A" />
            {/* Eyes */}
            <ellipse cx="43" cy="46" rx="2.3" ry="2.7" fill={eyeColor} />
            <ellipse cx="57" cy="46" rx="2.3" ry="2.7" fill={eyeColor} />
            <circle cx="44" cy="45" r="0.8" fill="#FFF" />
            <circle cx="58" cy="45" r="0.8" fill="#FFF" />
            {/* Smile */}
            <path d="M44 56 Q50 61 56 56" stroke="#A8432C" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        )}

        {avatarId === 'girl-samira' && (
          <g>
            {/* Mustard Knit Sweater */}
            <path d="M15 100 C15 76 30 70 50 70 C70 70 85 76 85 100 Z" fill="#E8B04A" />
            <rect x="42" y="66" width="16" height="8" rx="2" fill="#D49E3B" />
            {/* Neck */}
            <rect x="43" y="56" width="14" height="16" rx="3" fill="#EBB998" />
            {/* Top-knot Bun */}
            <circle cx="50" cy="12" r="10" fill="#2E221B" />
            <ellipse cx="50" cy="16" rx="6" ry="2" fill="#C65D3B" />
            {/* Head */}
            <rect x="33" y="27" width="34" height="38" rx="17" fill="#EBB998" />
            {/* Ears */}
            <circle cx="32" cy="46" r="4.5" fill="#EBB998" />
            <circle cx="68" cy="46" r="4.5" fill="#EBB998" />
            {/* Hair line */}
            <path d="M31 34 C35 22 65 22 69 34 C64 25 56 22 50 22 C44 22 36 25 31 34 Z" fill="#2E221B" />
            {/* Wireframe Glasses */}
            <circle cx="42" cy="43" r="6.5" stroke="#4A3B32" strokeWidth="1.8" fill="rgba(255,255,255,0.3)" />
            <circle cx="58" cy="43" r="6.5" stroke="#4A3B32" strokeWidth="1.8" fill="rgba(255,255,255,0.3)" />
            <path d="M48.5 43 L51.5 43" stroke="#4A3B32" strokeWidth="1.8" />
            {/* Eyes */}
            <circle cx="42" cy="43" r="2" fill={eyeColor} />
            <circle cx="58" cy="43" r="2" fill={eyeColor} />
            {/* Smile */}
            <path d="M45 54 Q50 58 55 54" stroke="#8C4229" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </g>
        )}

        {avatarId === 'girl-naila' && (
          <g>
            {/* Slate Blue Shirt */}
            <path d="M15 100 C15 76 30 70 50 70 C70 70 85 76 85 100 Z" fill="#3D5A80" />
            {/* Neck */}
            <rect x="43" y="57" width="14" height="16" rx="3" fill="#F0BF9F" />
            {/* Back Bob Hair */}
            <path d="M26 36 C26 62 30 68 35 68 C35 50 35 36 35 36 Z" fill="#1C1512" />
            <path d="M74 36 C74 62 70 68 65 68 C65 50 65 36 65 36 Z" fill="#1C1512" />
            {/* Head */}
            <rect x="33" y="27" width="34" height="38" rx="17" fill="#F0BF9F" />
            {/* Stud Earrings */}
            <circle cx="31" cy="48" r="1.8" fill="#FAF6F0" />
            <circle cx="69" cy="48" r="1.8" fill="#FAF6F0" />
            {/* Chic Bob with straight bangs */}
            <path d="M28 35 C28 17 40 14 50 14 C60 14 72 17 72 35 C72 45 70 58 68 62 C65 62 65 42 65 35 C65 32 35 32 35 35 C35 42 35 62 32 62 C30 58 28 45 28 35 Z" fill="#241C18" />
            {/* Straight Bangs */}
            <path d="M33 34 C38 31 62 31 67 34 L67 38 C60 36 40 36 33 38 Z" fill="#2E231E" />
            {/* Eyes */}
            <ellipse cx="43" cy="44" rx="2.2" ry="2.6" fill={eyeColor} />
            <ellipse cx="57" cy="44" rx="2.2" ry="2.6" fill={eyeColor} />
            <circle cx="44" cy="43" r="0.7" fill="#FFF" />
            <circle cx="58" cy="43" r="0.7" fill="#FFF" />
            {/* Confident Smile */}
            <path d="M44 53 Q50 58 56 53" stroke="#A6432B" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
        )}

        {avatarId === 'girl-maya' && (
          <g>
            {/* High Ponytail sticking out back */}
            <ellipse cx="68" cy="22" rx="8" ry="14" fill="#33241C" transform="rotate(25 68 22)" />
            <circle cx="62" cy="26" r="3.5" fill="#C65D3B" />
            {/* Zipped Athletic Track Jacket */}
            <path d="M15 100 C15 76 30 70 50 70 C70 70 85 76 85 100 Z" fill="#5B6B4E" />
            <path d="M50 70 L50 100" stroke="#FAF6F0" strokeWidth="2.5" />
            {/* Neck */}
            <rect x="43" y="57" width="14" height="16" rx="3" fill="#EBB998" />
            {/* Head */}
            <rect x="33" y="27" width="34" height="38" rx="17" fill="#EBB998" />
            {/* Ears */}
            <circle cx="32" cy="46" r="4.5" fill="#EBB998" />
            <circle cx="68" cy="46" r="4.5" fill="#EBB998" />
            {/* Slicked Back High Ponytail Hair */}
            <path d="M31 34 C33 19 46 16 56 16 C66 16 70 24 70 34 C65 25 54 22 47 22 C39 22 34 26 31 34 Z" fill="#3B2A21" />
            {/* Eyes */}
            <ellipse cx="43" cy="43" rx="2.2" ry="2.6" fill={eyeColor} />
            <ellipse cx="57" cy="43" rx="2.2" ry="2.6" fill={eyeColor} />
            {/* Upbeat smile */}
            <path d="M44 53 Q50 59 56 53" stroke="#A6432B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </g>
        )}

        {avatarId === 'girl-anika' && (
          <g>
            {/* Denim / Sage Layered Top */}
            <path d="M15 100 C15 76 30 70 50 70 C70 70 85 76 85 100 Z" fill="#3D7B75" />
            <path d="M43 70 L50 82 L57 70 Z" fill="#FAF6F0" />
            {/* Neck */}
            <rect x="43" y="57" width="14" height="16" rx="3" fill="#F0BA9A" />
            {/* Big Curls Hair Background */}
            <circle cx="28" cy="42" r="9" fill="#261A13" />
            <circle cx="26" cy="56" r="9" fill="#261A13" />
            <circle cx="28" cy="70" r="9" fill="#261A13" />
            <circle cx="72" cy="42" r="9" fill="#261A13" />
            <circle cx="74" cy="56" r="9" fill="#261A13" />
            <circle cx="72" cy="70" r="9" fill="#261A13" />
            {/* Head */}
            <rect x="33" y="27" width="34" height="38" rx="17" fill="#F0BA9A" />
            {/* Front Curly Volume */}
            <circle cx="36" cy="22" r="8" fill="#30221A" />
            <circle cx="50" cy="18" r="9" fill="#30221A" />
            <circle cx="64" cy="22" r="8" fill="#30221A" />
            <path d="M30 32 C38 25 60 25 70 32 C65 24 52 22 48 22 C40 22 34 26 30 32 Z" fill="#30221A" />
            {/* Eyes & Smile */}
            <ellipse cx="43" cy="44" rx="2.2" ry="2.6" fill={eyeColor} />
            <ellipse cx="57" cy="44" rx="2.2" ry="2.6" fill={eyeColor} />
            <circle cx="44" cy="43" r="0.7" fill="#FFF" />
            <circle cx="58" cy="43" r="0.7" fill="#FFF" />
            <path d="M43 54 Q50 60 57 54" stroke="#A8432C" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </g>
        )}
      </g>
    </svg>
  );
};
