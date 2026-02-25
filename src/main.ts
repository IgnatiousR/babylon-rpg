import { Engine, Scene } from "@babylonjs/core";
import { Input } from "./input";
import { main } from "./scenes/main";
import "./style.css";

// const canvas = document.querySelector("canvas");
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

let engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
let currentScene = new Scene(engine);

// ─── Define your input map once, anywhere before the game loop ───────────────
//
//  This mirrors Godot's Project > Input Map.
//  Actions are plain strings — add as many as you like.
//
Input
  // Movement actions used by the "moveX" / "moveY" axes
  .addAction("move_right", ["KeyD", "ArrowRight"])
  .addAction("move_left", ["KeyA", "ArrowLeft"])
  .addAction("move_forward", ["KeyW", "ArrowUp"])
  .addAction("move_back", ["KeyS", "ArrowDown"])

  // One-shot actions
  .addAction("jump", ["Space"])
  .addAction("shoot", ["KeyF", "Mouse0"])

  // Axes derived from action pairs  →  getAxis("moveX") / getAxis("moveY")
  .addAxis("moveX", "move_right", "move_left")
  .addAxis("moveY", "move_forward", "move_back");

// ─── Optional: virtual joystick for mobile ────────────────────────────────────
//
// import { VirtualJoystick, VirtualJoystickInput } from "../input";
//
// const joystick = new VirtualJoystick(
//   document.getElementById("joystick-base")!,
//   document.getElementById("joystick-stick")!,
// );
// Input.addSource(new VirtualJoystickInput(joystick));   // uses "moveX"/"moveY" by default
//
// ─── Optional: jump button for mobile ────────────────────────────────────────
//
// import { TouchButton } from "../input";
//
// const jumpBtn = new TouchButton(document.getElementById("jump-btn")!);
// Input.addSource({
//   getAxis:         () => 0,
//   isActionPressed: (name) => name === "jump" && jumpBtn.isPressed(),
//   update:          () => {},
// });

// const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, 0), currentScene);

await main(engine, currentScene);

window.addEventListener("resize", function () {
  engine.resize();
});

// import * as BABYLON from "babylonjs";
// import {
//   InputManager,
//   KeyboardInput,
//   VirtualJoystick,
//   VirtualJoystickInput,
//   TouchButton
// } from "./input";

// const input = new InputManager();

// input.addSource(new KeyboardInput());

// const joystick = new VirtualJoystick(
//   document.getElementById("joystick-base")!,
//   document.getElementById("joystick-stick")!
// );

// input.addSource(new VirtualJoystickInput(joystick));

// const jumpButton = new TouchButton(
//   document.getElementById("jump-btn")!
// );

// input.addSource({
//   getAxis: () => 0,
//   isActionPressed: name =>
//     name === "jump" ? jumpButton.isPressed() : false,
//   update: () => {}
// });

// scene.onBeforeRenderObservable.add(() => {
//   input.update();

//   const moveX = input.getAxis("moveX");
//   const moveY = input.getAxis("moveY");

//   const speed = 0.15;

//   player.moveWithCollisions(
//     new BABYLON.Vector3(moveX * speed, 0, moveY * speed)
//   );

//   if (input.isActionPressed("jump")) {
//     jump();
//   }
// });
