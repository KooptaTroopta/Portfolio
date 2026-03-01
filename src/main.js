import * as THREE from 'three';
import './style.scss'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.querySelector("#experience-canvas");
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, sizes.width / sizes.height, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

camera.position.set(28.077387785828126,21.950782007930037,-28.256596388952136);

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(-1.8116896998071725, 4.772175024448581, 1.6579637735594335);
controls.update();

// Loaders
const textureLoader = new THREE.TextureLoader();

// Model Loaders
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/draco/' );

const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader);

const environmentMap = new THREE.CubeTextureLoader()
  .setPath('textures/sky/')
  .load(["px.webp","nx.webp","py.webp","ny.webp","pz.webp","nz.webp"]);


const textureMap = {
  First: {
    day:"/textures/room/day/TextureSetOneDay.webp",
    night:"/textures/room/night/TextureSetOneNight.webp",
  },
  Second: {
    day:"/textures/room/day/TextureSetTwoDay.webp",
    night:"/textures/room/night/TextureSetTwoNight.webp",
  },
  Third: {
    day:"/textures/room/day/TextureSetThreeDay.webp",
    night:"/textures/room/night/TextureSetThreeNight.webp",
  }
};

const loadedTextures = {
  day: {},
  night: {},
};

Object.entries(textureMap).forEach(([key, paths])=> {
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.day[key] = dayTexture;

  const nightTexture = textureLoader.load(paths.night);
  nightTexture.flipY = false;
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.night[key] = nightTexture;
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.25,
  roughness: 0,
  ior: 1,
  thickness: 0.01,
  specularIntensity: 1,
  specularColor: 0xffffff,
  envMap: environmentMap,
});

const videoElement = document.createElement("video");
videoElement.src = "/textures/video/Laptop.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.autoplay = true;
videoElement.play();

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.flipY = false;
videoTexture.wrapS = THREE.ClampToEdgeWrapping;
videoTexture.wrapT = THREE.ClampToEdgeWrapping;

// Scale: higher = more zoomed out, lower = more zoomed in
videoTexture.repeat.set(0.9, 0.9);

// Offset: moves the video, range 0-1
videoTexture.offset.set(0, 0);

loader.load("/models/RoomPortfolio.glb", (glb)=>{ 
  glb.scene.traverse(child=>{
    if(child.isMesh) {
      if (child.name.includes("Glass") || child.name.includes("Plate")) {
        child.material = glassMaterial;
      } else if (child.name == "Monitor_Screen") {
        child.material = new THREE.MeshBasicMaterial({
          map: videoTexture,
        });
      } else if (child.name == "Laptop_Screen") {
        child.material = new THREE.MeshBasicMaterial({
          map: videoTexture,
        });
      } else {
        Object.keys(textureMap).forEach(key=>{
          if(child.name.includes(key)) {
            const material = new THREE.MeshBasicMaterial({
              map: loadedTextures.night[key],
            });
            child.material = material;
            if (child.material.map) {
              child.material.map.minFilter = THREE.LinearFilter;
            }
          }
        });
      }
    }
  });
  scene.add(glb.scene);
});

// Event Listeners
window.addEventListener("resize", ()=> {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update Camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update Renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

const render = () => {
  controls.update();

  // console.log(camera.position);
  //  console.log("Blud");
  //  console.log(controls.target);
  renderer.render( scene, camera );

  window.requestAnimationFrame(render);
}

render();