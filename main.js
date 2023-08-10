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
  const loader = new GLTFLoader();
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

  const mesh = loadModel()
  threeStuffs.faceObject.add(mesh);


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