import type { Engine, Scene } from "@babylonjs/core";
import * as BABYLON from "@babylonjs/core";
import { gameScene } from "./gameScene";

export async function main(
  Babylon: typeof BABYLON,
  engine: Engine,
  currentScene: Scene,
) {
  let scene: Scene = currentScene;
  // let currentState = "gameScene";

  // switch (currentState) {
  //   case "gameScene":
  //     await gameScene(Babylon, engine, currentScene);
  //     break;
  // }

  scene = await gameScene(Babylon, engine, currentScene);

  engine.runRenderLoop(() => {
    scene.render();
  });
}
