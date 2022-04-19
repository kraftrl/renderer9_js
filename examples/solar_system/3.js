import { Scene } from '../../scene/Scene.js';
import { ModelShading } from '../../scene/ModelShading.js';
import { Matrix } from '../../scene/Matrix.js';
import { Position } from '../../scene/Position.js';
import { Pipeline } from '../../pipeline/Pipeline.js';
import { FrameBuffer } from '../../framebuffer/FrameBuffer.js';
import { Color } from '../../color/Color.js';
import { Sphere } from '../../models/Sphere.js';
import { Rasterize } from "../../pipeline/Rasterize.js";
import { Model } from "../../scene/Model.js";
import { Clip } from '../../pipeline/Clip.js';

/**
   Draw an animation of a solar system with a sun, planet, and moon.
<p>
   In this version, the orbit of the planet is independent of the
   rotation of the sun, and the orbit of the moon is independent
   of the rotation of the planet. This version has the exact same
   scene graph structure as v2a, but this version uses different matrices.
<pre>{@code
           Scene
             |
             |
          Position
         /   |     \
        /    |      \
  Matrix   Model    nested Positions
    T     /  |  \                  \
         /   |   \                  \
   Matrix  empty  \                  empty
     R             \
                    nested Models
                     /           \
                    /             \
                Model             Model
               /  |              /  |  \
              /   |             /   |   \
        Matrix   sun      Matrix  empty  \
          R                 T             \
                                         nested Models
                                          /          \
                                         /            \
                                     Model            Model
                                    /  |             /   |
                                   /   |            /    |
                             Matrix  planet    Matrix   moon
                               R                 TR
}</pre>
*/

var fps;
var timer = null;

var planetOrbitRadius = 5.0;
var moonOrbitRadius = 1.0;

var planetOrbitRot = 0.0;
var moonOrbitRot = 0.0;

var sunAxisRot = 0.0;
var planetAxisRot = 0.0;
var moonAxisRot = 0.0;

var ecliptic = 7.0; // angle of the ecliptic plane

var solarSystem = null;
var sun = null;
var planetMoon = null;
var planet = null;
var moon = null;

/*
    See the above picture of the tree that this code creates.
*/

// Create the Scene object that we shall render
const scene = new Scene();

const right  = 6;
const left   = -right;
const top    = 6;
const bottom = -top;
const near = 2;
scene.camera.projOrtho(left, right, bottom, top);

// Create a Position object that will hold the solar system.
const solarSystem_p = new Position();

// Add the Position object to the scene.
scene.addPosition([solarSystem_p]);

// Push the position away from where the camera is.
solarSystem_p.matrix = Matrix.translate(0, 0, -8);

// Create the Model that holds the whole solar system.
solarSystem = new Model();  // A Solar System
// Add the solar system model to the Scene's Position.
solarSystem_p.model = solarSystem;

// Create the sun.
sun = new Sphere(1.0, 10, 10);
ModelShading.setColor(sun, Color.Yellow);
// Add the sun Model to the solar system Model.
solarSystem.nestedModels.push(sun);

// Create the Model that holds the planet-moon system.
planetMoon = new Model();
// Add the planet-moon Model to the solar system Model.
solarSystem.nestedModels.push(planetMoon);

// Create the planet.
planet = new Sphere(0.5, 10, 10);
ModelShading.setColor(planet, Color.Blue);
// Add the planet Model to the planet-moon Model.
planetMoon.nestedModels.push(planet);

// Create the moon.
moon = new Sphere(0.2, 10, 10);
ModelShading.setColor(moon, Color.Green);
// Add the moon Model to the planet-moon Model.
planetMoon.nestedModels.push(moon);


print_help_message();

fps = 20;
timer = setInterval(function() {
	rotateModels();
	display();
}, 1000/fps);

document.addEventListener('keypress', keyPressed);

function keyPressed(event) {

	const c = event.key;
	if ('h' == c) {
		print_help_message();
	}
	else if ('p' == c) {
		scene.camera.perspective = ! scene.camera.perspective;
		let p = scene.camera.perspective ? "perspective" : "orthographic";
		console.log("Using " + p + " projection");
	}
	else if ('f' == c) {
	   fps -= 1;
	   clearInterval(timer);
	   if (0 >= fps) {
		   fps = 0;
		   clearInterval(timer);    
		} else {
			setFPS();
		}  
		console.log("fps = " + fps);
	}
	else if ('F' == c) {
	   fps += 1;
	   console.log("fps = " + fps);
	   clearInterval(timer);
	   setFPS();
	}
	else if ('e' == c) {
	   ecliptic -= 1;
	   console.log("ecliptic = " + ecliptic);
	}
	else if ('E' == c) {
	   ecliptic += 1;
	   console.log("ecliptic = " + ecliptic);
	}
	else if ('a' == c) {
		Rasterize.doAntialiasing = ! Rasterize.doAntialiasing;
		console.log("Anti-aliasing is turned " + (Rasterize.doAntialiasing ? "On" : "Off"));
	}
	else if ('g' == c) {
		Rasterize.doGamma = ! Rasterize.doGamma;
		console.log("Gamma correction is turned " + (Rasterize.doGamma ? "On" : "Off"));
	}
	else if('d' == c) {
		Pipeline.debug = ! Pipeline.debug;
		Clip.debug = ! Clip.debug;
		console.log("Debugging is turned " + (Pipeline.debug? "On" : "Off"));
	}

	// Set up the camera's view volume.
	if (scene.camera.perspective)
	{
	   scene.camera.projPerspective(-1, 1, -1, 1, 1);
	}
	else
	{
	   scene.camera.projOrtho(-6, 6, -6, 6);
	}
}

function setFPS() {
    	timer = setInterval(function() {
        rotateModels();
        display();
    }, 1000/fps);
}

function display(){
	const resizer = document.getElementById("resizer");
	const w = resizer.offsetWidth;
	const h = resizer.offsetHeight;
	const ctx = document.getElementById("pixels").getContext("2d");
	if (ctx == null) {
		console.log("cn.getContext(2d) is null");
		return;
	}
	ctx.canvas.width = w;
	ctx.canvas.height = h;
	const fb = new FrameBuffer(undefined, w, h);
	Pipeline.render(scene, fb.vp);

	ctx.putImageData(new ImageData(fb.pixel_buffer,fb.width, fb.height), fb.vp.vp_ul_x, fb.vp.vp_ul_y);
}

function rotateModels() {
	// Rotate the plane of the ecliptic
	// (rotate the solar system model's xz-plane about the x-axis).
	solarSystem.nestedMatrix = Matrix.rotateX(ecliptic);

	// Rotate the sun on it axis.
	sun.nestedMatrix = Matrix.rotateY(sunAxisRot);

	// Place the planet-moon in orbit around the sun.
	planetMoon.nestedMatrix = Matrix.translate(
		planetOrbitRadius * Math.sin(planetOrbitRot * Math.PI/180),
		0,
		planetOrbitRadius * Math.cos(planetOrbitRot * Math.PI/180));

	// Rotate the planet on it axis.
	planet.nestedMatrix = Matrix.rotateY(planetAxisRot);

	// Place the moon in orbit around the planet and rotate the moon on its axis.
	moon.nestedMatrix = Matrix.translate(
		moonOrbitRadius * Math.sin(moonOrbitRot * Math.PI/180),
		0,
		moonOrbitRadius * Math.cos(moonOrbitRot * Math.PI/180))
		.timesMatrix(Matrix.rotateY(moonAxisRot));

	// Update the parameters for the next frame.
	sunAxisRot -= 10.0;
	planetOrbitRot += 1.0;
	planetAxisRot -= 5.0;
	moonOrbitRot += 5.0;
	moonAxisRot += 10.0;

}

function print_help_message()
{
	console.log("Use the 'd' key to toggle debugging information on and off.");
	console.log("Use the 'a' key to toggle antialiasing on and off.");
	console.log("Use the 'g' key to toggle gamma correction on and off.");
	console.log("Use the f/F keys to slow down or speed up the frame rate.");
	console.log("Use the 'p' key to toggle between parallel and orthographic projection.");
	console.log("Use the e/E keys to change the angle of the ecliptic plane.");
	console.log("Use the 'h' key to redisplay this help message.");
}

// window.onresize = display;

var resizer = new ResizeObserver(display);
resizer.observe(document.getElementById("resizer"));