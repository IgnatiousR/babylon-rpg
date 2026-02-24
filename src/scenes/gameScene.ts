import {
  Vector3,
  MeshBuilder,
  StandardMaterial,
  FreeCamera,
  HemisphericLight,
  Scene,
  Engine,
  Texture,
  Color3,
} from "@babylonjs/core";
import { Input } from "../input";

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

function createGround(scene: Scene) {
  const ground = MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);

  const groundMat = new StandardMaterial("groundMat", scene);
  const diffuseTex = new Texture("/textures/coastSandRocks/diffuse_1k.webp", scene);
  const normalTex = new Texture("/textures/coastSandRocks/normal_gl_1k.webp", scene);
  groundMat.diffuseTexture = diffuseTex;
  groundMat.bumpTexture = normalTex;

  diffuseTex.uScale = 10;
  diffuseTex.vScale = 10;
  normalTex.uScale = 10;
  normalTex.vScale = 10;

  groundMat.specularColor = new Color3(0, 0, 0); //remove shinyness on the diffuse texture

  ground.material = groundMat;
}

export async function gameScene(
  // Babylon: typeof BABYLON,
  engine: Engine,
  currentScene: Scene,
): Promise<Scene> {
  const scene = new Scene(engine);

  const cam = new FreeCamera("camera", new Vector3(0, 0, -5), scene);
  // cam.attachControl();

  const light = new HemisphericLight("lightsa", new Vector3(0, 10, 0), scene);

  const box = MeshBuilder.CreateBox("box", { size: 1.5 }, scene);

  createGround(scene);

  const cameraContainer = MeshBuilder.CreateGround(
    "cameraContainer",
    { width: 0.5, height: 0.5 },
    scene,
  );
  cameraContainer.position = new Vector3(0, 15, 0);
  cam.parent = cameraContainer;
  cam.setTarget(new Vector3(0, -10, 0));

  // Movement flags
  // let moveForward = 0;
  // let moveRight = 0;

  // Keyboard handling
  // window.addEventListener("keydown", (e) => {
  //   const key = e.key.toLowerCase();
  //   if (key === "w" || key === "arrowup") moveForward = 1;
  //   if (key === "s" || key === "arrowdown") moveForward = -1;
  //   if (key === "a" || key === "arrowleft") moveRight = -1;
  //   if (key === "d" || key === "arrowright") moveRight = 1;
  // });

  // window.addEventListener("keyup", (e) => {
  //   const key = e.key.toLowerCase();
  //   if (key === "w" || key === "arrowup" || key === "s" || key === "arrowdown") moveForward = 0;
  //   if (key === "a" || key === "arrowleft" || key === "d" || key === "arrowright") moveRight = 0;
  // });

  // ←←← SMOOTH MOVEMENT WITH DELTA TIME ←←←
  const speed = 15; // units per second (feel free to tweak)

  scene.onBeforeRenderObservable.add(() => {
    // Must call update() once per frame so extra sources (joystick, etc.) tick
    Input.update();

    const dt = engine.getDeltaTime() / 1000; // seconds

    // cameraContainer.locallyTranslate(
    //   new Vector3(moveRight * speed * dt, 0, moveForward * speed * dt),
    // );

    // getAxis reads the axis map → action map → key state + any added sources
    // const moveX = Input.getAxis("moveX");
    // const moveY = Input.getAxis("moveY");
    // cameraContainer.locallyTranslate(new Vector3(moveX * speed * dt, 0, moveY * speed * dt));

    const { x, y } = Input.getVector2("moveX", "moveY");

    cameraContainer.locallyTranslate(new Vector3(x * speed * dt, 0, y * speed * dt));

    if (Input.isActionPressed("jump")) {
      // jump();
    }

    if (Input.isActionPressed("shoot")) {
      // shoot();
    }
  });
  await scene.whenReadyAsync();
  currentScene.dispose();
  return scene;
}
