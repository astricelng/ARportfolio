import { loadGLTF } from "../../libs/loader.js";
import * as THREE from "../../libs/three.js-r132/build/three.module.js";
import { ARButton } from "../../libs/three.js-r132/examples/jsm/webxr/ARButton.js";

const normalizeModel = (obj, height) => {
  // scale it according to height
  const bbox = new THREE.Box3().setFromObject(obj);
  const size = bbox.getSize(new THREE.Vector3());
  obj.scale.multiplyScalar(height / size.y);

  // reposition to center
  const bbox2 = new THREE.Box3().setFromObject(obj);
  const center = bbox2.getCenter(new THREE.Vector3());
  obj.position.set(-center.x, -center.y, -center.z);
};

document.addEventListener("DOMContentLoaded", () => {
  const initialize = async () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // anillo en el piso
    const reticleGeometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(
      -Math.PI / 2
    );
    const reticleMaterial = new THREE.MeshBasicMaterial();
    const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    const arButton = ARButton.createButton(renderer, {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ["dom-overlay"],
      domOverlay: { root: document.body },
    });
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(arButton);

    const model = await loadGLTF("../../assets/models/coffee-table/scene.gltf");
    normalizeModel(model.scene, 0.3);
    const item = new THREE.Group();
    item.add(model.scene);
    item.visible = false;
    //setOpacity(item, 0.5);
    //items.push(item);
    scene.add(item);

    let prevTouchPosition = null;
    let touchDown = false;
    let selectedItem = item;

    const itemButtons = document.querySelector("#item-buttons");
    itemButtons.style.display = "block";

    const controller = renderer.xr.getController(0);
    scene.add(controller);
    controller.addEventListener("selectstart", (e) => {
      touchDown = true;
    });
    controller.addEventListener("selectend", (e) => {
      touchDown = false;
      prevTouchPosition = null;
    });

    renderer.xr.addEventListener("sessionstart", async () => {
      const session = renderer.xr.getSession();

      // kind of coordinate system, the origin is the current position of the viewer, which keeps changing
      // viewer is the person or the device
      const viewerReferenceSpace = await session.requestReferenceSpace(
        "viewer"
      );
      // care about the current position
      const hitTestSource = await session.requestHitTestSource({
        space: viewerReferenceSpace,
      });

      renderer.setAnimationLoop((timestamp, frame) => {
        if (!frame) return;

        const referenceSpace = renderer.xr.getReferenceSpace();

        if (selectedItem) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);

          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const hitPose = hit.getPose(referenceSpace);

            reticle.visible = true;
            reticle.matrix.fromArray(hitPose.transform.matrix);

            selectedItem.visible = true;
            selectedItem.position.setFromMatrixPosition(
              new THREE.Matrix4().fromArray(hitPose.transform.matrix)
            );
          } else {
            reticle.visible = false;
            selectedItem.visible = false;
          }
        }

        renderer.render(scene, camera);
      });
    });

    renderer.xr.addEventListener("sessionend", async () => {});
  };

  initialize();
});
