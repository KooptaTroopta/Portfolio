import * as THREE from 'three';
import './style.scss'
import { OrbitControls } from './utils/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from "gsap"

const canvas = document.querySelector("#experience-canvas");
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const modals = {
  portfolio: document.querySelector(".modal.portfolio"),
  about: document.querySelector(".modal.about"),
  contact: document.querySelector(".modal.contact"),
};

let touchOccurred = false;
document.querySelectorAll(".modal-exit-button").forEach((button) => {
  button.addEventListener("touchend", (e) => {
    touchOccurred = true;
    const modal = e.target.closest(".modal");
    hideModal(modal);
  }, {passive: false});
  button.addEventListener("click", (e) => {
    if (touchOccurred) return;
    const modal = e.target.closest(".modal");
    hideModal(modal);
  }, {passive: false});
});

let modalOpen = false;
let currentModal = null;
const showModal = (modal) => {
  if (currentModal && currentModal !== modal) return;
  currentModal = modal;
  modalOpen = true;
  controls.enabled = false;
  document.body.style.cursor = "default";
  if (currentHovered) {
    const prevKey = currentHovered.name.includes("GitHub") ? "GitHub"
    : currentHovered.name.includes("LinkedIn") ? "LinkedIn"
    : null;
    hoverAnimation(prevKey ? hoverGroups[prevKey] : [currentHovered], false);
    currentHovered = null;
  }
  currentIntersects = [];
  modal.style.display = "flex";
  gsap.set(modal, { opacity: 0 });
  gsap.to(modal, { opacity: 1, duration: 0.5, });
};

const hideModal = (modal) => {
  currentModal = null;
  modalOpen = false;
  controls.enabled = true;
  if (modal == modals.portfolio) {
    camera.position.copy(currentCameraPos);
    controls.target.copy(currentTargetPos);
  }
  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      modal.style.display = "none";
    }
  });
};

document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("click", (e) => {
    if (e.target.closest(".project-github-link")) return;

    const isExpanded = card.classList.contains("is-expanded");

    document.querySelectorAll(".project-card.is-expanded").forEach((open) => {
      if (open !== card) open.classList.remove("is-expanded");
    });
    card.classList.toggle("is-expanded", !isExpanded);
  });
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI/2;
controls.minAzimuthAngle = Math.PI/2;
controls.maxAzimuthAngle = Math.PI;

const currentCameraPos = new THREE.Vector3(28.077387785828126, 21.950782007930037, -28.256596388952136);
const currentTargetPos = new THREE.Vector3(-1.8116896998071725, 4.772175024448581, 1.6579637735594335);

camera.position.copy(currentCameraPos);
controls.target.copy(currentTargetPos);

if (window.innerWidth < 768) {
  controls.minDistance = 0;
  controls.maxDistance = 75;
} else {
  controls.minDistance = 0;
  controls.maxDistance = 50;
}

controls.update();

// Loaders
const manager = new THREE.LoadingManager();
const loadingScreen = document.querySelector(".loading-screen");
const loaderFill = document.querySelector(".loader-bar-fill");
const loaderPercent = document.querySelector(".loader-percent");

manager.onProgress = (url, loaded, total) => {
    const pct = Math.round((loaded / total) * 100);
    loaderFill.style.width = `${pct}%`;
    loaderPercent.textContent = `${pct}%`;
};
manager.onLoad = () => {
  loaderFill.style.width = "100%";
  loaderPercent.textContent = "100%";
  const tl = gsap.timeline();
  tl.to(loadingScreen, {
    opacity: 0,
    delay: 0.5,
    onComplete: () => {
      loadingScreen.remove();
    },
  });
};
const textureLoader = new THREE.TextureLoader();

const introOverlay = document.getElementById("intro");
const mainNav = document.getElementById("main-nav");
const enterButton = document.querySelector(".intro-enter-button");
let time = 1;

const enterSite = () => {
  gsap.to(introOverlay, {
    opacity: 0,
    duration: 0.6,
    onComplete: () => {
      introOverlay.classList.add("is-hidden");
      mainNav.classList.add("is-visible");
      playIntro();
    },
  });
};

enterButton.addEventListener("click", enterSite);

document.getElementById("nav-home").addEventListener("click", () => {
  introOverlay.classList.remove("is-hidden");
  gsap.fromTo(introOverlay, { opacity: 0 }, { opacity: 1, duration: 0.4 });
});

document.getElementById("nav-nightmode").addEventListener("click", () => {
  time *= -1;
  setTime();
  mainNav.classList.toggle("is-night", time === -1);
  document.getElementById("nav-nightmode").classList.toggle("is-active", newTime === -1);
});

document.getElementById("nav-portfolio").addEventListener("click", () => showModal(modals.portfolio));
document.getElementById("nav-about").addEventListener("click", () => showModal(modals.about));
document.getElementById("nav-contact").addEventListener("click", () => showModal(modals.contact));


// Model Loaders
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const loader = new GLTFLoader(manager);
loader.setDRACOLoader(dracoLoader);

const environmentMap = new THREE.CubeTextureLoader()
  .setPath('textures/sky/')
  .load(["px.webp", "nx.webp", "py.webp", "ny.webp", "pz.webp", "nz.webp"]);


const textureMap = {
  First: {
    day: "/textures/room/day/TextureSetOneDay.webp",
    night: "/textures/room/night/TextureSetOneNight.webp",
  },
  Second: {
    day: "/textures/room/day/TextureSetTwoDay.webp",
    night: "/textures/room/night/TextureSetTwoNight.webp",
  },
  Third: {
    day: "/textures/room/day/TextureSetThreeDay.webp",
    night: "/textures/room/night/TextureSetThreeNight.webp",
  },
  Fourth: {
    day: "/textures/room/day/TextureSetFourDay.webp",
    night: "/textures/room/night/TextureSetFourNight.webp",
  }
};

const loadedTextures = {
  day: {},
  night: {},
};

Object.entries(textureMap).forEach(([key, paths]) => {
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.day[key] = dayTexture;

  const nightTexture = textureLoader.load(paths.night);
  nightTexture.flipY = false;
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.night[key] = nightTexture;
});

const links = {
  GitHub: "https://github.com/KooptaTroopta",
  LinkedIn: "https://linkedin.com/in/jacob-yen",
}

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.1,
  roughness: 0,
  ior: 1,
  thickness: 0.01,
  specularIntensity: 1,
  specularColor: 0xffffff,
  envMap: environmentMap,
});

const metalMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x0f0f0f,
  transparent: false,
  opacity: 1,
  roughness: 0,
  ior: 1,
  specularIntensity: 1,
  specularColor: 0xffffff,
  envMap: environmentMap,
});

const projectImages = [
  "/images/Inferno.webp",
  "/images/social-graph.webp",
  "/images/truss-simulation.webp",
  "/images/dispenser.webp",
  "/images/portfolio-day.webp",
];

const randomSrc = projectImages[Math.floor(Math.random() * projectImages.length)];

const monitorImage = new Image();
monitorImage.src = randomSrc;

const monitorTexture = new THREE.Texture(monitorImage);
monitorTexture.colorSpace = THREE.SRGBColorSpace;
monitorTexture.flipY = false;
monitorTexture.wrapS = THREE.ClampToEdgeWrapping;
monitorTexture.wrapT = THREE.ClampToEdgeWrapping;

monitorTexture.repeat.set(0.9, 2);
monitorTexture.offset.set(0.05, -0.45);

monitorImage.onload = () => {
  monitorTexture.needsUpdate = true;
};

const videoElement = document.createElement("video");
videoElement.src = "/textures/video/Laptop1.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.autoplay = true;
videoElement.play();

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;
videoTexture.wrapS = THREE.ClampToEdgeWrapping;
videoTexture.wrapT = THREE.ClampToEdgeWrapping;

videoTexture.repeat.set(1.3, 1.6);
videoTexture.offset.set(-0.0, -0.5);

const fans = [];

const raycasterObjects = [];
let currentIntersects = [];
let currentHovered = null;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const timeObjects = [];

const hoverGroups = {};

const introObjects = [];

loader.load("/models/RoomPortfolio-v1.glb", (glb) => {
  glb.scene.traverse(child => {
    if (child.isMesh) {
      if (child.name.includes("Raycaster")) {
        raycasterObjects.push(child);
      }
      if (child.name.includes("Hover")) {
        child.userData.initialScale = child.scale.clone();
        child.userData.initialRotation = child.rotation.clone();
        if (child.name.includes("HoverI")) {
          child.scale.set(0, 0, 0);
          introObjects.push(child);
        }
      }
      if (child.name.includes("GitHub") || child.name.includes("LinkedIn")) {
        const key = child.name.includes("GitHub") ? "GitHub" : "LinkedIn";
        if (!hoverGroups[key]) hoverGroups[key] = [];
        hoverGroups[key].push(child);
      }

      if (child.name.includes("Glass") || child.name.includes("Plate")) {
        child.material = glassMaterial;
      } else if (child.name.includes("Metal")) {
        child.material = metalMaterial;
      } else if (child.name == "Laptop_Screen") {
        child.material = new THREE.MeshBasicMaterial({
          map: videoTexture,
        });
      } else if (child.name.includes("Monitor")) {
        child.material = new THREE.MeshBasicMaterial({
          map: monitorTexture,
        });
      } else {
        Object.keys(textureMap).forEach(key => {
          if (child.name.includes(key)) {
            const material = new THREE.MeshBasicMaterial({
              map: loadedTextures.day[key],
            });
            child.material = material;
            timeObjects.push({ mesh: child, key });

            if (child.name.includes("Fan_First")) {
              fans.push(child);
            }

            if (child.material.map) {
              child.material.map.minFilter = THREE.LinearFilter;
            }
          }
        });
      }
    }
  });
  scene.add(glb.scene);
  Object.values(loadedTextures.night).forEach(texture => {
    renderer.initTexture(texture);
  });
});

function playIntro() {
  const tl = gsap.timeline({
    defaults: {
      duration: 2.5,
      ease: "bounce.out",
    }
  });
  introObjects.forEach((obj) => {
    tl.to(obj.scale, {
      x: 1.3,
      y: 1.3,
      z: 1.3,
    }, 0);
  });
}

const setTime = () => {
  const mode = time === 1 ? "day" : "night";
  timeObjects.forEach(({ mesh, key }) => {
    mesh.material.map = loadedTextures[mode][key];
    mesh.material.needsUpdate = true;
  });
};

// Event Listeners
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update Camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update Renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

window.addEventListener("mousemove", (e) => {
  touchOccurred = false;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Clicks
window.addEventListener("click", raycasterInteraction);

window.addEventListener("touchstart",
  (e) => {
    if (modalOpen) return;
    e.preventDefault();
    pointer.x = (e.touches[0].clientX / sizes.width) * 2 - 1;
    pointer.y = -(e.touches[0].clientY / sizes.height) * 2 + 1;
  },
  {
    passive: false
  });
window.addEventListener("touchend",
  (e) => {
    if (modalOpen) return;
    e.preventDefault();
    raycasterInteraction();
  }, { passive: false }
);

function raycasterInteraction() {
  if (currentIntersects.length > 0) {
    const object = currentIntersects[0].object;
    Object.entries(links).forEach(([key, url]) => {
      if (object.name.includes(key)) {
        const newWindow = window.open();
        newWindow.opener = null;
        newWindow.location = url;
        newWindow.target = "_blank";
        newWindow.rel = "noopener noreferrer";
      }
    });

    if (object.name.includes("Monitor_Screen")) {
      showModal(modals.portfolio);
      currentCameraPos.copy(camera.position);
      currentTargetPos.copy(controls.target);
      camera.position.set(-1.0409331409147755, 8.496826246174045, 3.7459625416626547);
      controls.target.set(-2.344642085014835, 8.496826246174045, 3.7459625416626547);
    } else if (object.name.includes("Koopa")) {
      showModal(modals.about);
    } else if (object.name.includes("Basketball")) {
      showModal(modals.contact);
    } else if (object.name.includes("Boba")) {
      time *= -1;
      setTime();
    }
  }
}

function hoverAnimation(objects, hovering) {
  objects.forEach(object => {
    if (object.name.includes("Monitor")) {
      gsap.to(object.material.color, {
        r: hovering ? 1.7 : 1,
        g: hovering ? 1.7 : 1,
        b: hovering ? 1.7 : 1,
        duration: 1,
        ease: "power1.out",
      });
    } else {
      gsap.killTweensOf(object.scale);
      if (object.name.includes("HoverI")) {
        gsap.to(object.scale, {
          x: object.userData.initialScale.x * (hovering ? 1.8 : 1),
          y: object.userData.initialScale.y * (hovering ? 1.8 : 1),
          z: object.userData.initialScale.z * (hovering ? 1.8 : 1),
          duration: 1,
          ease: "power1.out",
        });
      } else if (object.name.includes("Chair")) {
        gsap.killTweensOf(object.rotation);
        gsap.to(object.rotation, {
          y: hovering ? object.userData.initialRotation.y - Math.PI / 6 : object.userData.initialRotation.y,
          duration: 2,
          ease: "power1.out",
        });
      } else if (object.name.includes("Backpack")) {
        gsap.to(object.scale, {
          x: object.userData.initialScale.x * (hovering ? 1.2 : 1),
          y: object.userData.initialScale.y * (hovering ? 1.2 : 1),
          z: object.userData.initialScale.z * (hovering ? 1.2 : 1),
          duration: 1,
          ease: "power1.out",
        });
      } else {
        gsap.to(object.scale, {
          x: object.userData.initialScale.x * (hovering ? 1.5 : 1),
          y: object.userData.initialScale.y * (hovering ? 1.5 : 1),
          z: object.userData.initialScale.z * (hovering ? 1.5 : 1),
          duration: 1,
          ease: "power1.out",
        });
      }
    }
  });
}

const render = () => {
  controls.update();

  // console.log(camera.position);
  // console.log("hi");
  // console.log(controls.target);

  // Animate fans
  fans.forEach((fan) => {
    fan.rotation.z += 0.02;
  });

  // Raycaster
  if (!modalOpen) {
    raycaster.setFromCamera(pointer, camera);
  
    currentIntersects = raycaster.intersectObjects(raycasterObjects);
  
    if (currentIntersects.length > 0) {
      const currentIntersectObject = currentIntersects[0].object;
  
      if (currentIntersectObject.name.includes("Hover")) {
        const key = currentIntersectObject.name.includes("GitHub") ? "GitHub"
        : currentIntersectObject.name.includes("LinkedIn") ? "LinkedIn"
        : null;
  
        const group = key ? hoverGroups[key] : [currentIntersectObject];
  
        if (currentIntersectObject != currentHovered) {
          if (currentHovered) {
            const prevKey = currentHovered.name.includes("GitHub") ? "GitHub"
            : currentHovered.name.includes("LinkedIn") ? "LinkedIn"
            : null;
            hoverAnimation(prevKey ? hoverGroups[prevKey] : [currentHovered], false);
          }
          hoverAnimation(group, true);
          currentHovered = currentIntersectObject;
        }
      }
  
      if (currentIntersectObject.name.includes("Monitor") || currentIntersectObject.name.includes("HoverI")) {
        document.body.style.cursor = "pointer";
      } else {
        document.body.style.cursor = "default";
      }
    } else {
      document.body.style.cursor = "default";
      if (currentHovered) {
        const prevKey = currentHovered.name.includes("GitHub") ? "GitHub"
        : currentHovered.name.includes("LinkedIn") ? "LinkedIn"
        : null;
        hoverAnimation(prevKey ? hoverGroups[prevKey] : [currentHovered], false);
        currentHovered = null;
      }
    }
  }


  renderer.render(scene, camera);

  window.requestAnimationFrame(render);
}

render();