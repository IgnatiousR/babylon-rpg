import type { Engine, Scene } from "@babylonjs/core";
import { Input } from "../input";

const CAM_PITCH = 45; // degrees — 0 = top-down, 90 = ground-level
const CAM_DISTANCE = 35;
const CAM_ORTHO_SIZE = 12;

async function createGround(scene: Scene) {
  const { MeshBuilder, StandardMaterial, Texture, Color3 } = await import("@babylonjs/core");
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

  groundMat.specularColor = new Color3(0, 0, 0);
  ground.material = groundMat;
  return ground;
}

export async function gameScene(engine: Engine, currentScene: Scene): Promise<Scene> {
  const [BABYLON_Core, HavokModule] = await Promise.all([
    import("@babylonjs/core"),
    import("@babylonjs/havok"),
  ]);

  const {
    Vector3,
    Camera,
    MeshBuilder,
    StandardMaterial,
    FreeCamera,
    HemisphericLight,
    DirectionalLight,
    ShadowGenerator,
    Color3,
    Scene,
    HavokPlugin,
    PhysicsCharacterController,
    PhysicsAggregate,
    PhysicsShapeType,
    CharacterSupportedState,
  } = BABYLON_Core;

  const scene = new Scene(engine);

  // --- Havok physics ---
  const havok = await HavokModule.default();
  const physicsPlugin = new HavokPlugin(true, havok);
  const gravity = new Vector3(0, -25, 0);
  scene.enablePhysics(gravity, physicsPlugin);

  // --- Camera ---
  const cam = new FreeCamera("camera", new Vector3(0, 35, -35), scene);
  cam.setTarget(Vector3.Zero());
  cam.mode = Camera.ORTHOGRAPHIC_CAMERA;

  const initOrtho = CAM_ORTHO_SIZE;
  const aspect = engine.getRenderWidth() / engine.getRenderHeight();
  cam.orthoTop = initOrtho;
  cam.orthoBottom = -initOrtho;
  cam.orthoLeft = -initOrtho * aspect;
  cam.orthoRight = initOrtho * aspect;

  engine.onResizeObservable.add(() => {
    const a = engine.getRenderWidth() / engine.getRenderHeight();
    cam.orthoLeft = -CAM_ORTHO_SIZE * a;
    cam.orthoRight = CAM_ORTHO_SIZE * a;
  });

  // --- Lights ---
  const ambientLight = new HemisphericLight("ambient", new Vector3(0, 1, 0), scene);
  ambientLight.intensity = 0.4;

  const dirLight = new DirectionalLight("dirLight", new Vector3(-1, -2, 1), scene);
  dirLight.intensity = 1.2;
  dirLight.position = new Vector3(20, 40, -20);

  // --- Static box obstacle ---
  const box = MeshBuilder.CreateBox("box", { size: 1.5 }, scene);
  box.position = new Vector3(2, 0.75, 2);
  // const boxAggregate =
  new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 0, restitution: 0 }, scene);

  // --- Ground ---
  // Havok needs a solid box — a zero-thickness ground plane has no volume
  const ground = await createGround(scene);
  const groundCollider = MeshBuilder.CreateBox(
    "groundCollider",
    { width: 50, depth: 50, height: 0.1 },
    scene,
  );
  groundCollider.position.y = -0.05;
  groundCollider.isVisible = false;
  // const groundAggregate =
  new PhysicsAggregate(groundCollider, PhysicsShapeType.BOX, { mass: 0, restitution: 0 }, scene);

  // --- Player capsule ---
  const player = MeshBuilder.CreateCapsule(
    "player",
    { radius: 0.4, height: 1.8, tessellation: 16 },
    scene,
  );
  player.position = new Vector3(0, 0.9, 0);

  const playerMat = new StandardMaterial("playerMat", scene);
  playerMat.diffuseColor = new Color3(0.2, 0.6, 1.0);
  playerMat.specularColor = new Color3(0.1, 0.1, 0.1);
  player.material = playerMat;

  // PhysicsCharacterController — we set desired velocity, Havok resolves collisions
  const controller = new PhysicsCharacterController(
    player.position.clone(),
    { capsuleHeight: 1.0, capsuleRadius: 0.4 },
    scene,
  );

  // --- Debug: show collider wireframes for all physics bodies ---
  // const physicsViewer = new PhysicsViewer(scene);
  // physicsViewer.showBody(boxAggregate.body);
  // physicsViewer.showBody(groundAggregate.body);

  // --- Soft shadows ---
  const shadowGen = new ShadowGenerator(1024, dirLight);
  shadowGen.useBlurExponentialShadowMap = true;
  shadowGen.blurKernel = 32;
  shadowGen.addShadowCaster(player);
  shadowGen.addShadowCaster(box);
  ground.receiveShadows = true;

  // --- Camera anchor (XZ only, Y driven by leva pitch) ---
  const cameraAnchor = MeshBuilder.CreateGround("cameraAnchor", { width: 0.1, height: 0.1 }, scene);
  cameraAnchor.isVisible = false;

  // --- Movement config ---
  const speed = 10;
  const jumpForce = 10;
  let velocityY = 0;

  scene.onBeforeRenderObservable.add(() => {
    Input.update();
    const dt = engine.getDeltaTime() / 1000;

    // Ground check
    const supportInfo = controller.checkSupport(dt, new Vector3(0, -1, 0));
    const isGrounded = supportInfo.supportedState === CharacterSupportedState.SUPPORTED;

    const { x, y } = Input.getVector2("moveX", "moveY");

    // Jump
    if (Input.isActionPressed("jump") && isGrounded) {
      velocityY = jumpForce;
    }

    // Gravity
    if (!isGrounded) {
      velocityY += gravity.y * dt;
    } else if (velocityY < 0) {
      velocityY = 0;
    }

    controller.setVelocity(new Vector3(x * speed, velocityY, y * speed));
    controller.integrate(dt, supportInfo, gravity);

    // Sync mesh to physics position
    player.position.copyFrom(controller.getPosition());

    // Respawn on fall
    if (player.position.y < -5) {
      velocityY = 0;
      controller.setPosition(new Vector3(0, 0.9, 0));
      player.position.copyFrom(controller.getPosition());
    }

    // Face direction of movement
    if (x !== 0 || y !== 0) {
      player.rotation.y = Math.atan2(x, y);
    }

    // --- Camera positioning ---
    const pitchRad = (CAM_PITCH * Math.PI) / 180;

    cameraAnchor.position.x = player.position.x;
    cameraAnchor.position.z = player.position.z;

    cam.position.x = player.position.x;
    cam.position.y = Math.sin(pitchRad) * CAM_DISTANCE;
    cam.position.z = player.position.z - Math.cos(pitchRad) * CAM_DISTANCE;
    cam.setTarget(new Vector3(player.position.x, 0, player.position.z));

    const a = engine.getRenderWidth() / engine.getRenderHeight();
    cam.orthoTop = CAM_ORTHO_SIZE;
    cam.orthoBottom = -CAM_ORTHO_SIZE;
    cam.orthoLeft = -CAM_ORTHO_SIZE * a;
    cam.orthoRight = CAM_ORTHO_SIZE * a;

    if (Input.isActionPressed("shoot")) {
      // shoot();
    }
  });

  await scene.whenReadyAsync();
  currentScene.dispose();
  return scene;
}
