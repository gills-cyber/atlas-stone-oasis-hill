export type ClinicIcon = {
  id: string;
  label: string;
  tags: string;
  group: string;
  svg: string;
};

const TEAL = "#2F8F85";
const TEAL_DK = "#1F6B64";
const CORAL = "#E07A5F";
const CORAL_LT = "#F0A08A";
const NAVY = "#2C4454";
const GOLD = "#E8B86D";
const SKY = "#7EB8C9";
const LEAF = "#6BAA5B";
const ROSE = "#E8A0A0";
const CREAM = "#F7F1E8";
const WHITE = "#FFFBF7";

function svg(body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${body}</svg>`;
}

export const CLINIC_ICONS: ClinicIcon[] = [
  {
    id: "brain",
    label: "Brain",
    tags: "neuro mind cognition testing",
    group: "Care",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <ellipse cx="38" cy="50" rx="22" ry="27" fill="${CORAL}"/>
       <ellipse cx="62" cy="50" rx="22" ry="27" fill="${CORAL_LT}"/>
       <circle cx="30" cy="34" r="11" fill="${CORAL}"/>
       <circle cx="50" cy="28" r="12" fill="#F3B7A4"/>
       <circle cx="70" cy="34" r="11" fill="${CORAL_LT}"/>
       <path d="M50 30 C48 42 48 54 50 66" fill="none" stroke="${CORAL}" stroke-width="2.2"/>
       <circle cx="41" cy="52" r="3.3" fill="${NAVY}"/>
       <circle cx="59" cy="52" r="3.3" fill="${NAVY}"/>
       <path d="M42 64 Q50 72 58 64" fill="none" stroke="${NAVY}" stroke-width="2.8" stroke-linecap="round"/>`,
    ),
  },
  {
    id: "testing",
    label: "Testing",
    tags: "assessment clipboard evaluation",
    group: "Care",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <rect x="28" y="22" width="44" height="56" rx="8" fill="${SKY}"/>
       <rect x="32" y="30" width="36" height="44" rx="4" fill="${WHITE}"/>
       <rect x="40" y="18" width="20" height="10" rx="4" fill="${TEAL}"/>
       <rect x="38" y="40" width="18" height="4" rx="2" fill="${NAVY}" opacity=".35"/>
       <rect x="38" y="50" width="24" height="4" rx="2" fill="${NAVY}" opacity=".35"/>
       <rect x="38" y="60" width="14" height="4" rx="2" fill="${NAVY}" opacity=".35"/>
       <circle cx="68" cy="66" r="12" fill="${LEAF}"/>
       <path d="M62 66 L66 70 L75 59" fill="none" stroke="${WHITE}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`,
    ),
  },
  {
    id: "therapy",
    label: "Therapy",
    tags: "talk counseling session",
    group: "Care",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <ellipse cx="36" cy="70" rx="16" ry="10" fill="${TEAL}"/>
       <circle cx="36" cy="48" r="14" fill="${TEAL}"/>
       <ellipse cx="66" cy="72" rx="16" ry="10" fill="${CORAL}"/>
       <circle cx="66" cy="50" r="14" fill="${CORAL_LT}"/>
       <circle cx="31" cy="46" r="2.4" fill="${NAVY}"/>
       <circle cx="39" cy="46" r="2.4" fill="${NAVY}"/>
       <path d="M31 54 Q36 58 41 54" fill="none" stroke="${NAVY}" stroke-width="2.2" stroke-linecap="round"/>
       <circle cx="61" cy="48" r="2.4" fill="${NAVY}"/>
       <circle cx="69" cy="48" r="2.4" fill="${NAVY}"/>
       <path d="M61 56 Q66 60 71 56" fill="none" stroke="${NAVY}" stroke-width="2.2" stroke-linecap="round"/>
       <path d="M48 40 Q50 34 52 40" fill="none" stroke="${GOLD}" stroke-width="3" stroke-linecap="round"/>`,
    ),
  },
  {
    id: "care",
    label: "Care",
    tags: "heart hands support",
    group: "Care",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <path d="M24 62 C24 50 38 46 50 58 C62 46 76 50 76 62 C76 74 62 82 50 88 C38 82 24 74 24 62 Z" fill="${ROSE}"/>
       <path d="M50 28 C42 18 26 22 26 36 C26 44 34 50 50 62 C66 50 74 44 74 36 C74 22 58 18 50 28 Z" fill="${CORAL}"/>`,
    ),
  },
  {
    id: "calm",
    label: "Calm",
    tags: "lotus relax mindfulness",
    group: "Care",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <ellipse cx="50" cy="72" rx="28" ry="8" fill="${SKY}" opacity=".55"/>
       <path d="M50 70 C38 58 28 50 32 40 C40 42 48 54 50 70 Z" fill="${LEAF}"/>
       <path d="M50 70 C62 58 72 50 68 40 C60 42 52 54 50 70 Z" fill="${TEAL}"/>
       <path d="M50 72 C46 50 50 30 50 24 C54 30 54 50 50 72 Z" fill="${GOLD}"/>
       <circle cx="50" cy="38" r="6" fill="${CORAL_LT}"/>`,
    ),
  },
  {
    id: "kids",
    label: "Kids",
    tags: "child pediatric youth",
    group: "People",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <circle cx="50" cy="38" r="16" fill="${GOLD}"/>
       <circle cx="44" cy="36" r="2.4" fill="${NAVY}"/>
       <circle cx="56" cy="36" r="2.4" fill="${NAVY}"/>
       <path d="M44 44 Q50 50 56 44" fill="none" stroke="${NAVY}" stroke-width="2.4" stroke-linecap="round"/>
       <path d="M38 62 C38 54 62 54 62 62 L62 78 C62 84 38 84 38 78 Z" fill="${SKY}"/>
       <circle cx="72" cy="64" r="8" fill="${CORAL}"/>
       <path d="M72 56 C72 50 80 52 76 58" fill="${LEAF}"/>`,
    ),
  },
  {
    id: "adults",
    label: "Adults",
    tags: "grown grownup parent",
    group: "People",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <circle cx="50" cy="32" r="14" fill="${TEAL}"/>
       <circle cx="45" cy="30" r="2.2" fill="${NAVY}"/>
       <circle cx="55" cy="30" r="2.2" fill="${NAVY}"/>
       <path d="M45 38 Q50 42 55 38" fill="none" stroke="${NAVY}" stroke-width="2.2" stroke-linecap="round"/>
       <path d="M34 56 C34 48 66 48 66 56 L66 84 C66 90 34 90 34 84 Z" fill="${NAVY}"/>
       <path d="M42 56 L42 84" stroke="${CREAM}" stroke-width="2" opacity=".35"/>`,
    ),
  },
  {
    id: "family",
    label: "Family",
    tags: "parent child together",
    group: "People",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <circle cx="38" cy="34" r="12" fill="${TEAL}"/>
       <path d="M24 78 C24 58 52 58 52 78 Z" fill="${TEAL_DK}"/>
       <circle cx="64" cy="42" r="9" fill="${GOLD}"/>
       <path d="M54 80 C54 66 76 66 76 80 Z" fill="${SKY}"/>`,
    ),
  },
  {
    id: "memory",
    label: "Memory",
    tags: "recall sparkle cognition",
    group: "Care",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <ellipse cx="48" cy="56" rx="26" ry="20" fill="${SKY}"/>
       <circle cx="30" cy="70" r="6" fill="${SKY}"/>
       <circle cx="22" cy="78" r="3.5" fill="${SKY}"/>
       <path d="M48 28 L51 40 L63 40 L53 48 L57 60 L48 52 L39 60 L43 48 L33 40 L45 40 Z" fill="${GOLD}"/>`,
    ),
  },
  {
    id: "focus",
    label: "Focus",
    tags: "attention adhd target",
    group: "Care",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <circle cx="50" cy="50" r="28" fill="none" stroke="${TEAL}" stroke-width="5"/>
       <circle cx="50" cy="50" r="16" fill="none" stroke="${GOLD}" stroke-width="5"/>
       <circle cx="50" cy="50" r="6" fill="${CORAL}"/>`,
    ),
  },
  {
    id: "speech",
    label: "Speech",
    tags: "language talk bubble",
    group: "Care",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <path d="M22 38 C22 26 34 20 50 20 C66 20 78 26 78 38 C78 50 66 56 54 56 L44 70 L46 56 C32 56 22 50 22 38 Z" fill="${TEAL}"/>
       <circle cx="40" cy="38" r="4" fill="${WHITE}"/>
       <circle cx="50" cy="38" r="4" fill="${WHITE}"/>
       <circle cx="60" cy="38" r="4" fill="${WHITE}"/>`,
    ),
  },
  {
    id: "calendar",
    label: "Appointments",
    tags: "schedule book visit",
    group: "Visit",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <rect x="24" y="28" width="52" height="48" rx="8" fill="${WHITE}" stroke="${NAVY}" stroke-width="3"/>
       <rect x="24" y="28" width="52" height="14" rx="8" fill="${TEAL}"/>
       <rect x="24" y="36" width="52" height="8" fill="${TEAL}"/>
       <circle cx="38" cy="28" r="4" fill="${NAVY}"/>
       <circle cx="62" cy="28" r="4" fill="${NAVY}"/>
       <circle cx="40" cy="56" r="4.5" fill="${CORAL}"/>
       <circle cx="54" cy="56" r="4.5" fill="${GOLD}"/>
       <circle cx="68" cy="56" r="4.5" fill="${SKY}"/>`,
    ),
  },
  {
    id: "phone",
    label: "Call",
    tags: "phone contact",
    group: "Visit",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <path d="M34 28 C30 28 26 32 26 38 C26 58 42 74 62 74 C68 74 72 70 72 66 L64 58 C62 56 58 56 56 58 L52 62 C46 58 42 54 38 48 L42 44 C44 42 44 38 42 36 Z" fill="${LEAF}"/>
       <circle cx="68" cy="34" r="10" fill="${CORAL}"/>
       <path d="M64 34 L67 37 L74 28" fill="none" stroke="${WHITE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    ),
  },
  {
    id: "pin",
    label: "Location",
    tags: "map office visit",
    group: "Visit",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <path d="M50 18 C36 18 26 30 26 42 C26 58 50 82 50 82 C50 82 74 58 74 42 C74 30 64 18 50 18 Z" fill="${CORAL}"/>
       <circle cx="50" cy="42" r="10" fill="${WHITE}"/>`,
    ),
  },
  {
    id: "hours",
    label: "Hours",
    tags: "clock time open",
    group: "Visit",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <circle cx="50" cy="50" r="28" fill="${WHITE}" stroke="${NAVY}" stroke-width="4"/>
       <circle cx="50" cy="50" r="3.2" fill="${CORAL}"/>
       <path d="M50 50 L50 34" stroke="${NAVY}" stroke-width="3.4" stroke-linecap="round"/>
       <path d="M50 50 L62 56" stroke="${CORAL}" stroke-width="3.2" stroke-linecap="round"/>`,
    ),
  },
  {
    id: "growth",
    label: "Progress",
    tags: "growth sprout improve",
    group: "Care",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <rect x="47" y="48" width="6" height="28" rx="3" fill="${TEAL_DK}"/>
       <ellipse cx="36" cy="46" rx="14" ry="10" fill="${LEAF}"/>
       <ellipse cx="64" cy="40" rx="14" ry="10" fill="${TEAL}"/>
       <circle cx="58" cy="28" r="7" fill="${GOLD}"/>`,
    ),
  },
  {
    id: "neuro",
    label: "Neurodiversity",
    tags: "infinity autism inclusive",
    group: "Care",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <path d="M32 50 C32 38 42 32 50 44 C58 32 68 38 68 50 C68 62 58 68 50 56 C42 68 32 62 32 50 Z" fill="none" stroke="${GOLD}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
    ),
  },
  {
    id: "school",
    label: "School",
    tags: "learning book education",
    group: "People",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <path d="M20 38 L50 26 L80 38 L50 50 Z" fill="${TEAL}"/>
       <path d="M50 50 L50 78" stroke="${NAVY}" stroke-width="3"/>
       <path d="M34 44 L34 66 C42 72 50 74 50 74 L50 50 Z" fill="${SKY}"/>
       <path d="M66 44 L66 66 C58 72 50 74 50 74 L50 50 Z" fill="${CORAL_LT}"/>`,
    ),
  },
  {
    id: "telehealth",
    label: "Telehealth",
    tags: "video remote virtual",
    group: "Visit",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <rect x="18" y="28" width="50" height="38" rx="6" fill="${NAVY}"/>
       <rect x="22" y="32" width="42" height="30" rx="3" fill="${SKY}"/>
       <circle cx="43" cy="44" r="7" fill="${TEAL}"/>
       <ellipse cx="43" cy="56" rx="10" ry="6" fill="${TEAL}"/>
       <path d="M70 40 L86 32 L86 62 L70 54 Z" fill="${CORAL}"/>`,
    ),
  },
  {
    id: "sleep",
    label: "Sleep",
    tags: "rest moon night",
    group: "Care",
    svg: svg(
      `<circle cx="50" cy="50" r="46" fill="${CREAM}"/>
       <path d="M58 24 C42 26 32 40 34 56 C36 72 52 82 68 78 C58 78 46 66 48 50 C50 36 58 28 58 24 Z" fill="${NAVY}"/>
       <circle cx="72" cy="32" r="4" fill="${GOLD}"/>
       <circle cx="80" cy="46" r="2.4" fill="${GOLD}"/>
       <circle cx="70" cy="54" r="2" fill="${GOLD}"/>`,
    ),
  },
];

export const CLINIC_ICON_GROUPS = [...new Set(CLINIC_ICONS.map((i) => i.group))];

const SRC_CACHE = new Map<string, string>();

export function clinicIconById(id: string): ClinicIcon | undefined {
  return CLINIC_ICONS.find((i) => i.id === id);
}

export function clinicIconSrc(id: string): string {
  const hit = SRC_CACHE.get(id);
  if (hit) return hit;
  const icon = clinicIconById(id);
  if (!icon) return "";
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(icon.svg)}`;
  SRC_CACHE.set(id, src);
  return src;
}

export function isClinicIconSrc(src?: string): boolean {
  if (!src) return false;
  return CLINIC_ICONS.some((i) => clinicIconSrc(i.id) === src);
}

export function clinicIconSize(): { w: number; h: number } {
  return { w: 14, h: 14 };
}
