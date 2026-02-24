import { main } from "./scenes/main";
import "./style.css";
import * as BABYLON from "@babylonjs/core";

const canvas = document.querySelector("canvas");

let engine = new BABYLON.Engine(canvas, true);
let currentScene = new BABYLON.Scene(engine);

const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, 0), currentScene);

await main(engine, currentScene);

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
