export class TouchButton {
  private pressed = false;
  private element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
    this.element.addEventListener("pointerdown", () => (this.pressed = true));
    window.addEventListener("pointerup", () => (this.pressed = false));
    this.element.style.touchAction = "none";
  }

  isPressed(): boolean {
    return this.pressed;
  }
}
