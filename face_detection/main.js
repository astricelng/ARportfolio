import { loadGLTF } from "../../libs/loader.js";
const THREE = window.MINDAR.FACE.THREE;

const capture = (mindarThree) => {
  const { video, renderer, scene, camera } = mindarThree;
  const renderCanvas = renderer.domElement;

  // output canvas
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = renderCanvas.width;
  canvas.height = renderCanvas.height;

  const sx =
    (((video.clientWidth - renderCanvas.clientWidth) / 2) * video.videoWidth) /
    video.clientWidth;
  const sy =
    (((video.clientHeight - renderCanvas.clientHeight) / 2) *
      video.videoHeight) /
    video.clientHeight;
  const sw = video.videoWidth - sx * 2;
  const sh = video.videoHeight - sy * 2;

  context.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  renderer.preserveDrawingBuffer = true;
  renderer.render(scene, camera); // empty if not run
  context.drawImage(renderCanvas, 0, 0, canvas.width, canvas.height);
  renderer.preserveDrawingBuffer = false;

  const data = canvas.toDataURL("image/png");
  return data;
};

const addOcluder = async (mindarThree) => {
  const occluder = await loadGLTF(
    "./assets/models/sparkar-occluder/headOccluder.glb"
  );

  // colorWrite = false, the object will hide everything behind it but render nothing to the canvas itself
  const occluderMaterial = new THREE.MeshBasicMaterial({ colorWrite: false });
  occluder.scene.traverse((o) => {
    if (o.isMesh) {
      o.material = occluderMaterial;
    }
  });
  // values by try/error
  occluder.scene.scale.multiplyScalar(0.065);
  occluder.scene.position.set(0, -0.3, 0);
  // rendered before the glasses
  occluder.scene.renderOrder = 0;
  const occluderAnchor = mindarThree.addAnchor(168);
  occluderAnchor.group.add(occluder.scene);
};

document.addEventListener("DOMContentLoaded", () => {
  const start = async () => {
    const mindarThree = new window.MINDAR.FACE.MindARThree({
      container: document.body,
    });
    const { renderer, scene, camera } = mindarThree;

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    addOcluder(mindarThree);

    const glasses = await loadGLTF("./assets/models/glasses/scene.gltf");
    glasses.scene.scale.multiplyScalar(0.065);
    glasses.scene.position.set(0, -0.3, 0);
    glasses.scene.rotation.set(0, Math.PI / 2, 0.2);
    glasses.scene.renderOrder = 1;
    const glassesanchor = mindarThree.addAnchor(168);
    glassesanchor.group.add(glasses.scene);

    const glasses2 = await loadGLTF("./assets/models/heart_glasses/scene.gltf");
    glasses2.scene.scale.multiplyScalar(0.25);
    glasses2.scene.position.set(-0.3, 0.15, 0);
    glasses2.scene.rotation.set(Math.PI / 6, 0, 0);
    glasses2.scene.renderOrder = 1;
    const glasses2anchor = mindarThree.addAnchor(168);
    glasses2anchor.group.add(glasses2.scene);

    const mask = await loadGLTF("./assets/models/joker_mask/scene.gltf");
    mask.scene.scale.multiplyScalar(6);
    mask.scene.position.set(0, 0.2, 0);
    mask.scene.renderOrder = 1;
    const maskanchor = mindarThree.addAnchor(1);
    maskanchor.group.add(mask.scene);

    const mask2 = await loadGLTF("./assets/models/venetian_mask/scene.gltf");
    mask2.scene.scale.multiplyScalar(0.7);
    mask2.scene.position.set(0, 0.35, 0);
    mask2.scene.renderOrder = 1;
    const mask2anchor = mindarThree.addAnchor(1);
    mask2anchor.group.add(mask2.scene);

    const hat = await loadGLTF("./assets/models/police_hat/scene.gltf");
    hat.scene.rotation.set(-0.1, -Math.PI / 2, 0);
    hat.scene.scale.multiplyScalar(0.9);
    hat.scene.position.set(0, -0.1, -0.5);
    hat.scene.renderOrder = 1;
    const hatanchor = mindarThree.addAnchor(8);
    hatanchor.group.add(hat.scene);

    const hat2 = await loadGLTF("./assets/models/witch_hat/scene.gltf");
    hat2.scene.scale.multiplyScalar(0.6);
    hat2.scene.position.set(0, 0, -1.1);
    hat2.scene.renderOrder = 1;
    const hat2anchor = mindarThree.addAnchor(8);
    hat2anchor.group.add(hat2.scene);

    const buttons = [
      "#glasses",
      "#glasses2",
      "#mask",
      "#mask2",
      "#hat",
      "#hat2",
    ];
    const models = [
      [glasses.scene],
      [glasses2.scene],
      [mask.scene],
      [mask2.scene],
      [hat.scene],
      [hat2.scene],
    ];
    const visibles = [true, false, false, false, true, false];

    const setVisible = (button, models, visible) => {
      if (visible) {
        button.classList.add("selected");
      } else {
        button.classList.remove("selected");
      }
      models.forEach((model) => {
        model.visible = visible;
      });
    };
    buttons.forEach((buttonId, index) => {
      const button = document.querySelector(buttonId);
      setVisible(button, models[index], visibles[index]);
      button.addEventListener("click", () => {
        visibles[index] = !visibles[index];
        setVisible(button, models[index], visibles[index]);
      });
    });

    const previewImage = document.querySelector("#preview-image");
    const previewClose = document.querySelector("#preview-close");
    const preview = document.querySelector("#preview");
    const previewShare = document.querySelector("#preview-share");

    document.querySelector("#capture").addEventListener("click", () => {
      const data = capture(mindarThree);
      preview.style.visibility = "visible";
      previewImage.src = data;
    });

    previewClose.addEventListener("click", () => {
      preview.style.visibility = "hidden";
    });

    previewShare.addEventListener("click", () => {
      const canvas = document.createElement("canvas");
      canvas.width = previewImage.width;
      canvas.height = previewImage.height;
      const context = canvas.getContext("2d");
      context.drawImage(previewImage, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const file = new File([blob], "photo.png", { type: "image/png" });
        const files = [file];
        if (navigator.canShare && navigator.canShare({ files })) {
          navigator.share({
            files: files,
            title: "AR Photo",
          });
        } else {
          const link = document.createElement("a");
          link.download = "photo.png";
          link.href = previewImage.src;
          link.click();
        }
      });
    });

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  };
  start();
});
