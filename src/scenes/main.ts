import type { Engine, Scene } from "@babylonjs/core";
import { gameScene } from "./gameScene";

export async function main(engine: Engine, currentScene: Scene) {
  let scene: Scene = currentScene;
  // let currentState = "gameScene";

  // switch (currentState) {
  //   case "gameScene":
  //     await gameScene(Babylon, engine, currentScene);
  //     break;
  // }

  scene = await gameScene(engine, currentScene);

  engine.runRenderLoop(() => {
    scene.render();
  });
}
