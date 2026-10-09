import type { CastMember, OverlayKind, ScriptKind, ScriptLine } from "./types";

export const CAST_COLORS = [
  "#c9343a",
  "#0071e3",
  "#1f7a4d",
  "#5b4fc9",
  "#c45c12",
  "#3a3a3c",
] as const;

export const SCRIPT_KINDS: { id: ScriptKind; label: string }[] = [
  { id: "speech", label: "Speech" },
  { id: "thought", label: "Thought" },
  { id: "shout", label: "Shout" },
  { id: "whisper", label: "Whisper" },
  { id: "scream", label: "Scream" },
  { id: "narration", label: "Caption" },
];

export function isScriptKind(kind: OverlayKind): kind is ScriptKind {
  return SCRIPT_KINDS.some((k) => k.id === kind);
}

export function cloneCast(cast: CastMember[]): CastMember[] {
  return cast.map((c) => ({ ...c }));
}

export function cloneScript(script: ScriptLine[]): ScriptLine[] {
  return script.map((l) => ({ ...l }));
}

export function scriptOrder(script: ScriptLine[], lineId: string | undefined) {
  if (!lineId) return 0;
  const i = script.findIndex((l) => l.id === lineId);
  return i < 0 ? 0 : i + 1;
}

export function speakerOf(cast: CastMember[], id: string | null | undefined) {
  if (!id) return null;
  return cast.find((c) => c.id === id) ?? null;
}

export function nextCastColor(cast: CastMember[]) {
  return CAST_COLORS[cast.length % CAST_COLORS.length] ?? CAST_COLORS[0];
}

export function demoCast(): CastMember[] {
  return [
    { id: "cast_aiko", name: "Aiko", color: CAST_COLORS[0] },
    { id: "cast_ren", name: "Ren", color: CAST_COLORS[1] },
  ];
}

export function demoScript(pageId: string): ScriptLine[] {
  return [
    {
      id: "line_demo_1",
      speakerId: "cast_aiko",
      kind: "speech",
      text: "Wait—!",
      pageId,
      overlayId: "ov_demo_speech",
    },
    {
      id: "line_demo_2",
      speakerId: "cast_ren",
      kind: "thought",
      text: "If I miss this train…",
      pageId,
      overlayId: "ov_demo_thought",
    },
  ];
}
