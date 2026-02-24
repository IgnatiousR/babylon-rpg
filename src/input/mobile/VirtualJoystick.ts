export class VirtualJoystick {
  private active = false;
  private origin = { x: 0, y: 0 };
  private value = { x: 0, y: 0 };
  private maxDistance = 60;

  private base: HTMLElement;
  private stick: HTMLElement;

  constructor(base: HTMLElement, stick: HTMLElement) {
    this.base = base;
    this.stick = stick;

    this.base.addEventListener("pointerdown", this.start);
    window.addEventListener("pointermove", this.move);
    window.addEventListener("pointerup", this.end);

    this.base.style.touchAction = "none";
  }

  private start = (e: PointerEvent) => {
    this.active = true;
    this.origin = { x: e.clientX, y: e.clientY };
  };

  private move = (e: PointerEvent) => {
    if (!this.active) return;

    const dx = e.clientX - this.origin.x;
    const dy = e.clientY - this.origin.y;

    const clampedX = Math.max(-this.maxDistance, Math.min(this.maxDistance, dx));
    const clampedY = Math.max(-this.maxDistance, Math.min(this.maxDistance, dy));

    this.value.x = clampedX / this.maxDistance;
    this.value.y = clampedY / this.maxDistance;

    this.stick.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
  };

  private end = () => {
    this.active = false;
    this.value = { x: 0, y: 0 };
    this.stick.style.transform = "translate(0,0)";
  };

  getAxis() {
    return { ...this.value };
  }

  destroy() {
    this.base.removeEventListener("pointerdown", this.start);
    window.removeEventListener("pointermove", this.move);
    window.removeEventListener("pointerup", this.end);
  }
}
