import type { IInputSource } from "./IInputSource";
import type { ActionName, AxisName } from "./types";

interface AxisBinding {
  positive: ActionName;
  negative: ActionName;
}

class InputManager {
  private static _instance: InputManager;

  /** action name → set of key codes (e.g. "jump" → {"Space", "KeyE"}) */
  private actionMap = new Map<ActionName, Set<string>>();

  /** axis name → positive/negative action pair */
  private axisMap = new Map<AxisName, AxisBinding>();

  /** currently held key codes */
  private pressedKeys = new Set<string>();

  /** extra input sources (joystick, touch buttons, gamepad…) */
  private sources: IInputSource[] = [];

  private constructor() {
    window.addEventListener("keydown", (e) => this.pressedKeys.add(e.code));
    window.addEventListener("keyup", (e) => this.pressedKeys.delete(e.code));
  }

  static get instance(): InputManager {
    if (!InputManager._instance) {
      InputManager._instance = new InputManager();
    }
    return InputManager._instance;
  }

  // ─── Action map ───────────────────────────────────────────────────────────

  /**
   * Register an action and bind one or more key codes to it.
   *
   * @example
   * Input.addAction("jump",       ["Space"]);
   * Input.addAction("move_right", ["KeyD", "ArrowRight"]);
   */
  addAction(name: ActionName, keys: string[]): this {
    if (!this.actionMap.has(name)) {
      this.actionMap.set(name, new Set());
    }
    const set = this.actionMap.get(name)!;
    keys.forEach((k) => set.add(k));
    return this;
  }

  /** Add a single key to an existing action (or create the action). */
  addKey(action: ActionName, key: string): this {
    return this.addAction(action, [key]);
  }

  /** Remove a key binding from an action. */
  removeKey(action: ActionName, key: string): this {
    this.actionMap.get(action)?.delete(key);
    return this;
  }

  /** Remove all bindings for an action. */
  clearAction(action: ActionName): this {
    this.actionMap.delete(action);
    return this;
  }

  // ─── Axis map ─────────────────────────────────────────────────────────────

  /**
   * Map an axis to a positive/negative action pair.
   * Result is clamped to [-1, 1].
   *
   * @example
   * Input.addAxis("moveX", "move_right", "move_left");
   * Input.addAxis("moveY", "move_forward", "move_back");
   */
  addAxis(name: AxisName, positive: ActionName, negative: ActionName): this {
    this.axisMap.set(name, { positive, negative });
    return this;
  }

  removeAxis(name: AxisName): this {
    this.axisMap.delete(name);
    return this;
  }

  // ─── Extra sources (joystick / touch) ────────────────────────────────────

  addSource(source: IInputSource): this {
    this.sources.push(source);
    return this;
  }

  removeSource(source: IInputSource): this {
    this.sources = this.sources.filter((s) => s !== source);
    return this;
  }

  // ─── Query ────────────────────────────────────────────────────────────────

  /**
   * Returns true if any key bound to `name` is currently held,
   * or if any extra source reports it pressed.
   */
  isActionPressed(name: ActionName): boolean {
    const keys = this.actionMap.get(name);
    if (keys) {
      for (const key of keys) {
        if (this.pressedKeys.has(key)) return true;
      }
    }
    return this.sources.some((s) => s.isActionPressed(name));
  }

  /**
   * Returns a value in [-1, 1] for the named axis.
   * Checks the axis map first, then falls back to extra sources.
   */
  getAxis(name: AxisName): number {
    const binding = this.axisMap.get(name);
    if (binding) {
      const pos = this.isActionPressed(binding.positive) ? 1 : 0;
      const neg = this.isActionPressed(binding.negative) ? 1 : 0;
      const keyValue = pos - neg;

      // Also accumulate from sources (e.g. joystick)
      let sourceValue = 0;
      for (const s of this.sources) {
        sourceValue += s.getAxis(name);
      }

      return Math.max(-1, Math.min(1, keyValue + sourceValue));
    }

    // No axis binding — query sources directly
    let value = 0;
    for (const s of this.sources) value += s.getAxis(name);
    return Math.max(-1, Math.min(1, value));
  }

  /**
   * Returns a normalized {x, y} vector for two axes.
   * Fixes the diagonal speed bug — raw diagonal input has magnitude √2,
   * this clamps it back to 1 so all directions feel equally fast.
   *
   * @example
   * const { x, y } = Input.getVector2("moveX", "moveY");
   * mesh.locallyTranslate(new Vector3(x * speed * dt, 0, y * speed * dt));
   */
  getVector2(axisX: AxisName, axisY: AxisName): { x: number; y: number } {
    const x = this.getAxis(axisX);
    const y = this.getAxis(axisY);
    const length = Math.sqrt(x * x + y * y);
    if (length > 1) {
      return { x: x / length, y: y / length };
    }
    return { x, y };
  }

  /** Call once per frame (updates all extra sources). */
  update(): void {
    this.sources.forEach((s) => s.update());
  }
}

/** Singleton — import and use anywhere without passing instances around. */
export const Input = InputManager.instance;
export { InputManager };
