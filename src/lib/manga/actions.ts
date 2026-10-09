import { useStudio } from "./store";

export function insertTitle() {
  useStudio.getState().addOverlay("title");
}
