// ------------------------------------------------
// BASIC SETUP
// ------------------------------------------------
const OrbitControls = 'OrbitControls.js';
// Create an empty scene
var scene = new THREE.Scene();

// Create a basic perspective camera
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 5;
camera.position.y = 3;
camera.lookAt(0,0,-5);

// Create a renderer with Antialiasing
var renderer = new THREE.WebGLRenderer({antialias:true, alpha: true});

// Configure renderer clear color

renderer.setClearColor(new THREE.Color("rgb(20, 20, 20)"));

// Configure renderer size
renderer.setSize( window.innerWidth, window.innerHeight );

// Append Renderer to DOM
document.body.appendChild( renderer.domElement );

// Create Controls
const controls = new THREE.OrbitControls( camera, renderer.domElement );

// Create point light at origin
const light = new THREE.PointLight(1000, 1, 100 );
light.position.set( 0, 0, 0 );
scene.add( light );

// Create Axes at origin (REMOVE WHEN FINISHED)
const axesHelper = new THREE.AxesHelper( 1 );
scene.add( axesHelper );

// create the Cube
var center = new THREE.Mesh( new THREE.SphereBufferGeometry(1, 100, 100 ), new THREE.MeshStandardMaterial() );
center.position.set(0, 0, -5);
center.rotation.set(1, 0, -2);
// add the object to the scene
scene.add( center );

// Create variables for particles.
var particleCount = 3;
var particleGeometry =  new THREE.Geometry();
var pMaterial = new THREE.PointsMaterial({
  color: 0xFFFFFF,
  size: 1,
  map: THREE.ImageUtils.loadTexture(
          "images/particle.png"
            ),
  blending: THREE.AdditiveBlending,
  transparent: true
});

for (var i = 0; i < particleCount; i++) {
  var pX = Math.random() * 10 - 5;
  var pY = Math.random() * 6 - 3;
  var pZ = Math.random() * 10 - 5;

  var particle = new THREE.Vector3(pX, pY, pZ);

  particleGeometry.vertices.push(particle);
}

var particleSystem = new THREE.Points(particleGeometry, pMaterial);

scene.add(particleSystem);

// Render Loop
var render = function () {
  requestAnimationFrame( render );

  // Render the scene
  renderer.render(scene, camera);
};

render();
