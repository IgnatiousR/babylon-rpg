import { main } from "./scenes/main";
import "./style.css";
import * as BABYLON from "@babylonjs/core";

const canvas = document.querySelector("canvas");

let engine = new BABYLON.Engine(canvas, true);
let currentScene = new BABYLON.Scene(engine);

const camera = new BABYLON.FreeCamera(
  "camera1",
  new BABYLON.Vector3(0, 0, 0),
  currentScene,
);

await main(BABYLON, engine, currentScene);
