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
  let moveForward = 0;
  let moveRight = 0;
  // Keyboard handling
  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (key === "w" || key === "arrowup") moveForward = 1;
    if (key === "s" || key === "arrowdown") moveForward = -1;
    if (key === "a" || key === "arrowleft") moveRight = -1;
    if (key === "d" || key === "arrowright") moveRight = 1;
  });

  window.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    if (key === "w" || key === "arrowup" || key === "s" || key === "arrowdown") moveForward = 0;
    if (key === "a" || key === "arrowleft" || key === "d" || key === "arrowright") moveRight = 0;
  });

  // ←←← SMOOTH MOVEMENT WITH DELTA TIME ←←←
  const speed = 15; // units per second (feel free to tweak)

  scene.onBeforeRenderObservable.add(() => {
    const deltaTime = engine.getDeltaTime() / 1000; // seconds

    cameraContainer.locallyTranslate(
      new Vector3(moveRight * speed * deltaTime, 0, moveForward * speed * deltaTime),
    );
  });
  await scene.whenReadyAsync();
  currentScene.dispose();
  return scene;
}
