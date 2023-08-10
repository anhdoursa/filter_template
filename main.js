let THREECAMERA = null;

// callback: launched if a face is detected or lost
function detect_callback(faceIndex, isDetected) {
  if (isDetected) {
    console.log('INFO in detect_callback(): DETECTED');
  } else {
    console.log('INFO in detect_callback(): LOST');
  }
}

function loadModel() {
  let mesh
  const loader = new THREE.GLTFLoader();
  // loader.setDRACOLoader(
  //   new DRACOLoader().setDecoderPath(
  //     "https://unpkg.com/three@0.154.0/examples/jsm/libs/draco/gltf/"
  //   )
  // );
  loader.load('./models/luffys_straw_hat.glb', function (gltf) {
    mesh = gltf.scene;
  });

  return mesh;
}


// build the 3D. called once when Jeeliz Face Filter is OK:
function init_threeScene(spec) {
  spec.threeCanvasId = 'threeCanvas'; // enable 2 canvas mode
  const threeStuffs = JeelizThreeHelper.init(spec, detect_callback);

  // CREATE A CUBE:
  // const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  // const cubeMaterial = new THREE.MeshNormalMaterial();
  // const threeCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  // threeCube.frustumCulled = false;
  // threeStuffs.faceObject.add(threeCube);

  // Create the JSONLoader for our hat:
  const loader = new THREE.BufferGeometryLoader();

  // Load our cool hat:
  loader.load(
    'models/luffys_hat.json',
    function (geometry, materials) {
      // we create our Hat mesh
      const mat = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("models/Texture.jpg")
      });
      const hatMesh = new THREE.Mesh(geometry, mat);

      hatMesh.scale.multiplyScalar(1.2);
      hatMesh.rotation.set(0, -40, 0);
      hatMesh.position.set(0.0, 0.6, 0.0);
      hatMesh.frustumCulled = false;
      hatMesh.side = THREE.DoubleSide;

      threeStuffs.faceObject.add(hatMesh);
    }
  )

  // CREATE LIGHT
  const ambientLight = new THREE.AmbientLight(0XFFFFFF, 0.8);
  threeStuffs.scene.add(ambientLight);


  // CREATE THE CAMERA:
  THREECAMERA = JeelizThreeHelper.create_camera();
}


// entry point:
function main() {
  JeelizResizer.size_canvas({
    canvasId: 'jeeFaceFilterCanvas',
    callback: function (isError, bestVideoSettings) {
      init_faceFilter(bestVideoSettings);
    }
  })
}


function init_faceFilter(videoSettings) {
  JEELIZFACEFILTER.init({
    antialias: false,
    canvasId: 'jeeFaceFilterCanvas',
    NNCPath: './neuralNets/', // root of NN_DEFAULT.json file
    maxFacesDetected: 1,
    callbackReady: function (errCode, spec) {
      if (errCode) {
        console.log('AN ERROR HAPPENS. ERR =', errCode);
        return;
      }

      console.log('INFO: JEELIZFACEFILTER IS READY');
      init_threeScene(spec);
    },

    // called at each render iteration (drawing loop):
    callbackTrack: function (detectState) {
      JeelizThreeHelper.render(detectState, THREECAMERA);
    }
  }); //end JEELIZFACEFILTER.init call
}


window.addEventListener('load', main);