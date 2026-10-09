export type FitMode = "cover" | "contain";
export type PaperTone = "cream" | "white" | "newsprint";
export type ImageTool = "frame" | "crop";

export type PanelRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type PanelImage = {
  src: string;
  zoom: number;
  focusX: number;
  focusY: number;
  fit: FitMode;
  brightness: number;
  contrast: number;
  rotate: number;
  flipX: boolean;
  flipY: boolean;
};

export type PanelState = {
  id: string;
  image: PanelImage | null;
  background?: PanelImage | null;
  locked?: boolean;
  rect?: PanelRect;
  shape?: PanelShape;
  rotate?: number;
};

export type BalloonStyle =
  | "oval"
  | "round"
  | "soft"
  | "rect"
  | "burst"
  | "spike"
  | "cloud"
  | "whisper"
  | "radio"
  | "box";

export type OverlayKind =
  | "speech"
  | "thought"
  | "narration"
  | "title"
  | "sticker"
  | "sfx"
  | "shout"
  | "whisper"
  | "scream"
  | "tone"
  | "text";

export type ToneId = "speed" | "focus" | "dots" | "blush" | "rain" | "hatch" | "fog";

export type PanelShape = "rect" | "round" | "circle" | "break";

export type StickerId =
  | "heart"
  | "exclaim"
  | "star"
  | "anger"
  | "sweat"
  | "notes"
  | "question"
  | "sparkle"
  | "blush"
  | "tear"
  | "dizzy"
  | "sleep"
  | "burst"
  | "shock"
  | "vein"
  | "gloom"
  | "flower"
  | "skull"
  | "sigh"
  | "focus"
  | "bang"
  | "dots"
  | "twitch"
  | "haha"
  | "giggle"
  | "hee"
  | "wara"
  | "temper"
  | "rage"
  | "scowl"
  | "fury"
  | "crossvein"
  | "spike"
  | "clench"
  | "steam"
  | "boil"
  | "puff"
  | "huff"
  | "heat"
  | "haze"
  | "breath"
  | "pant"
  | "smell"
  | "stink"
  | "fume"
  | "sniff"
  | "spicy"
  | "drool"
  | "nosebleed"
  | "shiver"
  | "throb"
  | "scent"
  | "vapor"
  | "jets"
  | "haa"
  | "kiss"
  | "hearts"
  | "flush"
  | "drip"
  | "saliva"
  | "swirl"
  | "skunk"
  | "aroma"
  | "lust"
  | "phew"
  | "chomp"
  | "scratch"
  | "wet"
  | "moan"
  | "fog"
  | "mist"
  | "shower"
  | "bank";

export type Overlay = {
  id: string;
  kind: OverlayKind;
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  color: string;
  fill?: string;
  stroke?: string;
  tailX: number;
  tailY: number;
  sticker?: StickerId;
  src?: string;
  chainId?: string;
  balloonStyle?: BalloonStyle;
  locked?: boolean;
  hidden?: boolean;
  vertical?: boolean;
  behind?: boolean;
  autoFit?: boolean;
  tone?: ToneId;
  rotate?: number;
  /** 0–1. Undefined means fully opaque. */
  opacity?: number;
  fontId?: string;
  align?: "left" | "center" | "right";
  /** Linked script line — balloon text stays in sync with the script. */
  scriptLineId?: string;
  speakerId?: string;
};

export type CustomSticker = {
  id: string;
  src: string;
  name: string;
};

export type LibraryImage = CustomSticker;

export type ScriptKind =
  | "speech"
  | "thought"
  | "narration"
  | "shout"
  | "whisper"
  | "scream";

export type CastMember = {
  id: string;
  name: string;
  color: string;
  portrait?: string;
};

export type ScriptLine = {
  id: string;
  speakerId: string | null;
  kind: ScriptKind;
  text: string;
  pageId: string | null;
  overlayId: string | null;
};

export type BookInfo = {
  title: string;
  author: string;
  series: string;
  volume: string;
  coverFirst: boolean;
};

export type Chapter = {
  id: string;
  title: string;
  startPageId: string;
};

export type PageState = {
  id: string;
  title: string;
  templateId: string;
  panels: PanelState[];
  overlays: Overlay[];
};

export type GridSpec = {
  id: string;
  name: string;
  blurb: string;
  rows: number[];
  cols: number[];
  cells: string[][];
  group?: "manga" | "brochure";
};

export type LaidOutPanel = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  index: number;
};

export type SampleArt = {
  id: string;
  src: string;
  label: string;
};

export type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
