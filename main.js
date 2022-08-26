import { CSS3DObject } from "../../libs/three.js-r132/examples/jsm/renderers/CSS3DRenderer.js";
import { mockWithVideo, mockWithImage } from "../../libs/camera-mock.js";

import { loadTextures, loadVideo } from "../../libs/loader.js";

const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener("DOMContentLoaded", () => {
  const start = async () => {
    // mockWithImage("./assets/card.jpg");

    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: "./assets/targets/card.mind",
    });
    const { renderer, cssRenderer, scene, cssScene, camera } = mindarThree;

    /*const obj = new CSS3DObject(document.querySelector("#ar-div"));

    obj.position.x = 0;
    obj.position.y = -50;*/

    const [
      cardTexture,
      emailTexture,
      locationTexture,
      webTexture,
      phoneTexture,
      facebookTexture,
      instagramTexture,
      photoTexture,
    ] = await loadTextures([
      "./assets/card.jpg",
      "./assets/email.png",
      "./assets/gps.png",
      "./assets/web.png",
      "./assets/phone.png",
      "./assets/facebook.png",
      "./assets/instagram.png",
      "./assets/girl.jpg",
    ]);

    // CARD
    const planeGeometry = new THREE.PlaneGeometry(1, 0.455);
    const cardMaterial = new THREE.MeshBasicMaterial({ map: cardTexture });
    const card = new THREE.Mesh(planeGeometry, cardMaterial);
    // END CARD

    // ICONS
    const iconGeometry = new THREE.CircleGeometry(0.075, 32);

    // Material
    const emailMaterial = new THREE.MeshBasicMaterial({ map: emailTexture });
    const locationMaterial = new THREE.MeshBasicMaterial({
      map: locationTexture,
    });
    const webMaterial = new THREE.MeshBasicMaterial({ map: webTexture });
    const phoneMaterial = new THREE.MeshBasicMaterial({
      map: phoneTexture,
    });
    // Icon
    const emailIcon = new THREE.Mesh(iconGeometry, emailMaterial);
    const locationIcon = new THREE.Mesh(iconGeometry, locationMaterial);
    const webIcon = new THREE.Mesh(iconGeometry, webMaterial);
    const phoneIcon = new THREE.Mesh(iconGeometry, phoneMaterial);

    emailIcon.position.set(0.14, -0.5, 0);
    locationIcon.position.set(0.42, -0.5, 0);
    webIcon.position.set(-0.14, -0.5, 0);
    phoneIcon.position.set(-0.42, -0.5, 0);
    // END ICONS

    // PHOTO AND NAME
    const iconGeometryBig = new THREE.CircleGeometry(0.15, 200);
    const photoMaterial = new THREE.MeshBasicMaterial({ map: photoTexture });
    const photoIcon = new THREE.Mesh(iconGeometryBig, photoMaterial);
    var xPhoto = 0.5;
    photoIcon.material.transparent = true;
    photoIcon.material.opacity = 0;
    photoIcon.position.set(0.5, 0.1, 0);
    // 0.75

    const textPhoto = document.createElement("div");
    const textObjPhoto = new CSS3DObject(textPhoto);
    textObjPhoto.position.set(1100, 140, 0);
    textObjPhoto.true = false;
    textPhoto.style.padding = "30px";
    textPhoto.style.fontSize = "100px";
    textPhoto.innerHTML = "Astrid<br>Narvaez";
    // END PHOTO AND NAME

    // SOCIAL MEDIA
    const iconGeometrySmall = new THREE.CircleGeometry(0.04, 20);

    // Material
    const faceMaterial = new THREE.MeshBasicMaterial({ map: facebookTexture });
    const instaMaterial = new THREE.MeshBasicMaterial({
      map: instagramTexture,
    });
    // Icon
    const faceIcon = new THREE.Mesh(iconGeometrySmall, faceMaterial);
    const instaIcon = new THREE.Mesh(iconGeometrySmall, instaMaterial);

    faceIcon.position.set(0.8, -0.18, 0);
    instaIcon.position.set(1, -0.18, 0);

    // END SOCIAL MEDIA

    // VIDEO
    const video = await loadVideo("../../assets/videos/sintel/sintel.mp4");
    video.muted = true;
    const videoTexture = new THREE.VideoTexture(video);

    const videoGeometry = new THREE.PlaneGeometry(1, 204 / 480);
    const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
    const itemVideo = new THREE.Mesh(videoGeometry, videoMaterial);
    itemVideo.position.set(0, 0.5, 0);
    // ENDVIDEO

    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(card);
    anchor.group.add(emailIcon);
    anchor.group.add(locationIcon);
    anchor.group.add(webIcon);
    anchor.group.add(phoneIcon);
    anchor.group.add(photoIcon);
    anchor.group.add(faceIcon);
    anchor.group.add(instaIcon);
    anchor.group.add(itemVideo);

    anchor.onTargetFound = () => {
      video.play();
      xPhoto = 0.5;
      photoIcon.material.opacity = 0;
    };

    anchor.onTargetLost = () => {
      video.pause();
    };

    video.addEventListener("play", () => {
      video.currentTime = 6;
    });

    // ICON TEXT ELEMENT
    const textElement = document.createElement("div");
    const textObj = new CSS3DObject(textElement);
    textObj.position.set(0, -700, 0);
    textObj.visible = false;
    textElement.style.background = "#FFFFFF";
    textElement.style.padding = "30px";
    textElement.style.fontSize = "60px";
    // END TEXT ELEMENT

    const cssAnchor = mindarThree.addCSSAnchor(0);
    cssAnchor.group.add(textObj);
    cssAnchor.group.add(textObjPhoto);

    emailIcon.userData.clickable = true;
    locationIcon.userData.clickable = true;
    webIcon.userData.clickable = true;
    phoneIcon.userData.clickable = true;
    faceIcon.userData.clickable = true;
    instaIcon.userData.clickable = true;

    listenClicks(
      camera,
      scene,
      emailIcon,
      locationIcon,
      webIcon,
      phoneIcon,
      textObj,
      textElement,
      faceIcon,
      instaIcon
    );

    const clock = new THREE.Clock();
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const iconScale = 1 + 0.2 * Math.sin(elapsed * 5);

      [
        webIcon,
        emailIcon,
        phoneIcon,
        locationIcon,
        faceIcon,
        instaIcon,
      ].forEach((icon) => {
        icon.scale.set(iconScale, iconScale, iconScale);
      });

      if (xPhoto < 0.75) {
        xPhoto += 0.008;
        photoIcon.position.set(xPhoto, 0.1, 0);
        photoIcon.material.opacity += 0.01;
      } else photoIcon.material.opacity = 1;

      renderer.render(scene, camera);
      cssRenderer.render(cssScene, camera);
    });
  };
  start();
});

function listenClicks(
  camera,
  scene,
  emailIcon,
  locationIcon,
  webIcon,
  phoneIcon,
  textObj,
  textElement,
  faceIcon,
  instaIcon
) {
  document.body.addEventListener("click", (e) => {
    // clientX from 0 to width of container but we want from -1 to 1
    const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -1 * ((e.clientY / window.innerHeight) * 2 - 1);
    const mouse = new THREE.Vector2(mouseX, mouseY);

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // check just one object
    //const intersects = raycaster.intersectObjects([raccoon.scene], true);
    // check multiple objects
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      let o = intersects[0].object;

      // o could be a descendant object, we have to check if it is a parent
      while (o.parent && !o.userData.clickable) {
        o = o.parent;
      }

      if (o.userData.clickable) {
        console.log(o);
        if (o === emailIcon) {
          textObj.visible = true;
          textElement.innerHTML = "astrid.narvaez@gluttonomy.com";
        } else if (o === locationIcon) {
          textObj.visible = true;
          textElement.innerHTML = "CDMX, Mexico";
        } else if (o === webIcon) {
          textObj.visible = true;
          textElement.innerHTML = "https://www.gluttonomy.com";
        } else if (o === phoneIcon) {
          textObj.visible = true;
          textElement.innerHTML = "+52 5522356985";
        } else if (o === faceIcon) {
          window.open("https://www.facebook.com", "_blank").focus();
        } else if (o === instaIcon) {
          window.open("http://www.instagram.com", "_blank").focus();
        }
      }
    }
  });
}
