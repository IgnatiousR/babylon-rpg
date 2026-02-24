import type { ActionName, AxisName } from "./types";

export interface IInputSource {
  getAxis(name: AxisName): number;
  isActionPressed(name: ActionName): boolean;
  update(): void;
}
