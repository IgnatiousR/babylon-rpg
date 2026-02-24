import type { IInputSource } from "../IInputSource";
import type { ActionName, AxisName } from "../types";
import { VirtualJoystick } from "./VirtualJoystick";

export class VirtualJoystickInput implements IInputSource {
  private joystick: VirtualJoystick;
  private axisX: AxisName;
  private axisY: AxisName;

  /**
   * @param joystick  The VirtualJoystick instance to read from.
   * @param axisX     Axis name that maps to the joystick's X value (default "moveX").
   * @param axisY     Axis name that maps to the joystick's Y value (default "moveY").
   */
  constructor(joystick: VirtualJoystick, axisX: AxisName = "moveX", axisY: AxisName = "moveY") {
    this.joystick = joystick;
    this.axisX = axisX;
    this.axisY = axisY;
  }

  getAxis(name: AxisName): number {
    const { x, y } = this.joystick.getAxis();
    if (name === this.axisX) return x;
    if (name === this.axisY) return -y; // invert Y so "up" is positive
    return 0;
  }

  isActionPressed(_: ActionName): boolean {
    return false;
  }

  update() {}
}
