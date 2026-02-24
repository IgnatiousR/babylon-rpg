import type { IInputSource } from "../IInputSource";
import type { ActionName, AxisName } from "../types";

export class KeyboardInput implements IInputSource {
  private keys = new Map<string, boolean>();

  constructor() {
    window.addEventListener("keydown", (e) => {
      this.keys.set(e.code, true);
    });

    window.addEventListener("keyup", (e) => {
      this.keys.set(e.code, false);
    });
  }

  private isKey(code: string): boolean {
    return this.keys.get(code) ?? false;
  }

  getAxis(name: AxisName): number {
    switch (name) {
      case "moveX":
        return (this.isKey("KeyD") ? 1 : 0) - (this.isKey("KeyA") ? 1 : 0);

      case "moveY":
        return (this.isKey("KeyW") ? 1 : 0) - (this.isKey("KeyS") ? 1 : 0);

      default:
        return 0;
    }
  }

  isActionPressed(name: ActionName): boolean {
    switch (name) {
      case "jump":
        return this.isKey("Space");
      case "shoot":
        return this.isKey("KeyF");
      default:
        return false;
    }
  }

  update() {}
}
