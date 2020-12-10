// ------------------------------------------------
// BASIC SETUP
// ------------------------------------------------
const OrbitControls = 'OrbitControls.js';

// Create an empty scene
var scene = new THREE.Scene();
// Create a basic perspective camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;
camera.position.y = 30;
camera.position.x = 0;
camera.lookAt(0, 0, -5);

// Create a renderer with Antialiasing
var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
// Configure renderer clear color

renderer.setClearColor(new THREE.Color("rgb(20, 20, 20)"));

// Configure renderer size
renderer.setSize(window.innerWidth, window.innerHeight);

// Append Renderer to DOM
document.body.appendChild(renderer.domElement);

// Create Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Create point light at origin
const light = new THREE.PointLight(1000, 1, 100);
light.position.set(0, 0, 0);
scene.add(light);

// Create Axes at origin (REMOVE WHEN FINISHED)
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

// create the Cube
var centerMaterial = new THREE.MeshStandardMaterial({
    emissive: 0xf8ff8f
});
var center = new THREE.Mesh(new THREE.SphereBufferGeometry(0.5, 80, 80), centerMaterial);
center.position.set(0, 0, 0);
center.rotation.set(0, 0, 0);
// add the object to the scene
scene.add(center);

var constants = {
    m: 5.972 * Math.pow(10, 18),
    G: 6.67408 * Math.pow(10, -7),
    initParticleCount: 100,
    particlesPerTime: 1,
    initV: 1
};

// Emitter
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });

const linePoints = [];
linePoints.push(new THREE.Vector3(10, 0, 0));
linePoints.push(new THREE.Vector3(90, 0, 0));

const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);

const emitter = new THREE.Line(lineGeometry, lineMaterial);

scene.add(emitter);


// Create Clock
var clock = new THREE.Clock(true);

// Create variables for particles.
var particleSystem;
var pMaterial = new THREE.PointsMaterial({
    size: 1,
    map: THREE.ImageUtils.loadTexture(
        "images/particle3.png"
    ),
    blending: THREE.NormalBlending,
    transparent: true
});

class Particle {
    constructor(X, Y, Z) {
        this.position = new THREE.Vector3(X, Y, Z);
        this.calculateVelocity();
    }

    update() {
        var distance = new Array(this.position.x, this.position.y, this.position.z);

        var unitVector = new Array(distance[0] / Math.abs(distance[0] + distance[1] + distance[2]), distance[1] / Math.abs(distance[0] + distance[1] + distance[2]), distance[2] / Math.abs(distance[0] + distance[1] + distance[2]));

        var distanceSqr = Math.pow(distance[0], 2) + Math.pow(distance[1], 2) + Math.pow(distance[2], 2);

        var aTot = -1 * constants.G * (constants.m / Math.pow((1496000 / (distanceSqr * 10)), 2));

        var aArray = new Array(aTot * unitVector[0], aTot * unitVector[1], aTot * unitVector[2]);

        this.velocity.x += aArray[0] / 10000;
        this.velocity.y += aArray[1] / 10000;
        this.velocity.z += aArray[2] / 10000;

        this.position.x += this.velocity.x / 149600000;
        this.position.y += this.velocity.y / 149600000;
        this.position.z += this.velocity.z / 149600000;
    }

    calculateVelocity() {
        var distance = new Array(this.position.x, this.position.y, this.position.z);
        var distanceSqr = Math.pow(distance[0], 2) + Math.pow(distance[1], 2) + Math.pow(distance[2], 2);

        var vel = Math.sqrt((constants.G * constants.m) / (1496000 / (distanceSqr * 10)));


        if (this.position.x < 0) {
            console.log(vel);
            this.velocity = new THREE.Vector3(0, 0, +vel * 30 * constants.initV);
        } else {
            this.velocity = new THREE.Vector3(0, 0, -vel * 30 * constants.initV);
        }

    }
}

class ParticleSystem {
    constructor(material) {
        this.size = 0;
        this.points = new Array();
        this.particleGeometry = new THREE.Geometry();
        this.system = new THREE.Points(this.particleGeometry, material);
        this.material = material

    }

    add(x, y, z) {
        this.size += 1;
        var particle = new Particle(x, y, z);
        this.points.push(particle);
        this.particleGeometry.vertices.push(particle.position);
        this.system = new THREE.Points(this.particleGeometry, this.material);
    }

    update() {
        this.particleGeometry.dispose();
        this.particleGeometry = new THREE.Geometry();

        for (var i = 0; i < this.size; i++) {
            if (this.points[i].position.x > 200) {
                console.log("REMOVED");
                this.points.splice(i, 1);
                this.size -= 1;
                this.particleGeometry.vertices.pop();
            } else {
                this.points[i].update();
                this.particleGeometry.vertices.push(this.points[i].position);
            }
        }
        this.particleGeometry.verticesNeedUpdate = true;
        this.system.geometry = this.particleGeometry;
        this.system.geometry.geometryNeedUpdate = true;
    }

    init(amount) {
        // Make the points
        for (var i = 0; i < amount; i++) {
            var pX = Math.random() * 80 + 10;
            var pY = Math.random() * 4 - 2;
            var pZ = 0;

            //pY = 0;
            this.add(pX, pY, pZ);
        }
    }
}

function initSystem() {
    particleSystem = new ParticleSystem(pMaterial);
    particleSystem.init(constants.initParticleCount);
    scene.add(particleSystem.system);
}

initSystem();

// Create GUI
var gui = new dat.GUI();
gui.add(constants, "m", 1 * Math.pow(10, 24), 20 * Math.pow(10, 24));
gui.add(constants, "G", 3 * Math.pow(10, -11), 9 * Math.pow(10, -10));
gui.add(constants, "initParticleCount", 0, 1000);
gui.add(constants, "particlesPerTime", 0, 10);
gui.add(constants, "initV", 0, 10);

var resetButton = {
    reset: function() {
        scene.remove(particleSystem.system);
        initSystem();
    }
};

var pause = false;
var pauseButton = {
    pause: function() {
        pause = true;
    }
};

var runButton = {
    run: function() {
        pause = false;
        render();
    }
};

gui.add(resetButton, 'reset');
gui.add(pauseButton, 'pause');
gui.add(runButton, 'run');


// Render Loop
var render = function() {
    const t0 = performance.now();
    if (pause == false) {
        scene.remove(particleSystem.system);
        particleSystem.init(constants.particlesPerTime * Math.random());
        scene.add(particleSystem.system);
        particleSystem.update();
        requestAnimationFrame(render);

        // Render the scene
        renderer.render(scene, camera);
    }
    const t1 = performance.now();
    console.log(`Call to render took ${t1 - t0} milliseconds.`);
};

render();