import { Scene } from './scene/Scene.js';
import { ModelShading } from './scene/ModelShading.js';
import { Matrix } from './scene/Matrix.js';
import { Position } from './scene/Position.js';
import { Pipeline } from './pipeline/Pipeline.js';
import { FrameBuffer } from './framebuffer/FrameBuffer.js';
import { Color } from './color/Color.js';
import { Sphere } from './models/Sphere.js';
import { ObjSimpleModel } from "./models/ObjSimpleModel.js";
import { Box } from "./models/Box.js";
import { Axes3D } from "./models/Axes3D.js";
import { GRSModel } from './models/GRSModel.js';
import { Tetrahedron} from "./models/Tetrahedron.js";
import { Torus } from "./models/Torus.js";
import { Octahedron } from "./models/Octahedron.js";
import { Cone } from "./models/Cone.js";
import { PanelXZ } from "./models/PanelXZ.js";
import { Cylinder } from "./models/Cylinder.js";
import { ConeFrustum} from "./models/ConeFrustum.js";
import { TriangularPrism} from "./models/TriangularPrism.js";

/**
   This version creates a hierarchical Scene.
<p>
   Compare with
      http://threejs.org/examples/#webgl_geometries
   or
      https://stemkoski.github.io/Three.js/Shapes.html
   or
      http://www.smartjava.org/ltjs/chapter-02/04-geometries.html
*/

//Pipeline.debug = true;   
var timer = null;

// Create the Scene object that we shall render.
var scene = new Scene();

// Create a two-dimensional array of Positions holding Models.
var models = [[null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null]];

// row 0
models[0][0] = new Box(1.0, 1.0, 1.0);//new ObjSimpleModel("assets/great_rhombicosidodecahedron.obj");
ModelShading.setColor(models[0][0], Color.Red);

models[0][1] = new ConeFrustum(0.5, 1.0, 1.0, 10, 10);
ModelShading.setColor(models[0][1], Color.Orange);

models[0][2] = new Box(1.0, 1.0, 1.0);
ModelShading.setColor(models[0][2], Color.Gray);

models[0][3] = new Axes3D(0, 1, 0, 1, 0, 1, Color.Red, Color.Green, Color.Blue);

models[0][4] = new Sphere(1.0, 30, 30);
ModelShading.setColor(models[0][4], Color.Gray);

// row 1
models[1][0] = new Cylinder(0.5, 1.0, 30, 30);
ModelShading.setColor(models[1][0], Color.Blue);

models[1][1] = new Box(1.0, 1.0, 1.0);//new ObjSimpleModel("assets/horse.obj");
ModelShading.setColor(models[1][1], Color.Pink);

models[1][2] = new Box(1.0, 1.0, 1.0);//new GRSModel("assets/grs/vinci.grs");
ModelShading.setColor(models[1][2], Color.Blue);

models[1][3] = new Tetrahedron();
ModelShading.setColor(models[1][3], Color.Cyan);

models[1][4] = new Box(1.0, 1.0, 1.0);//new ObjSimpleModel("assets/small_rhombicosidodecahedron.obj");
ModelShading.setColor(models[1][4], Color.Magenta);

// row 2
models[2][0] = new TriangularPrism(0.5, 1.0, 0.5, 8.0, true);
ModelShading.setColor(models[2][0], Color.Green);

models[2][1] = new Box(1.0, 1.0, 1.0);//new GRSModel("assets/grs/bronto.grs");
ModelShading.setColor(models[2][1], Color.Red);

models[2][2] = new Torus(0.75, 0.25, 30, 30);
ModelShading.setRandomColors(models[2][2]);

models[2][3] = new Octahedron();
ModelShading.setColor(models[2][3], Color.Blue);

models[2][4] = new Cone(0.5, 1.0, 30, 30);
ModelShading.setColor(models[2][4], Color.Yellow);

// Create x, y and z axes
var xyzAxes = new Axes3D(6, -6, 6, 0, 7, -7,  Color.Red, Color.Red, Color.Red);

// Create a "top level" Model that holds a horizontal coordinate plane.
var topLevel = new PanelXZ(-6, 6, -7, 7);
ModelShading.setColor(topLevel, Color.Gray);

// Add all the models as nested models of the top level Model
for (var i = 0; i < models.length; i++)
    for (var j = 0; j < models[i].length; j++) {
        topLevel.nestedModels.push(models[i][j]);
    }
topLevel.nestedModels.push(xyzAxes);

// Add the top level Model to the Scene.
var topLevel_p = new Position(topLevel);
scene.addPosition([topLevel_p]);

// // Set up the camera's view frustum.
var right  = 2.0;
var left   = -right;
var top    = 1.0;
var bottom = -top;
var near   = 1.0;
scene.camera.projPerspective(left, right, bottom, top, near);

/*
var fov    = 90.0;
var aspect = 2.0;
var near   = 1.0;
scene.camera.projPerspective(fov, aspect, near);
*/

//displayNextFrame();

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

function displayNextFrame() {
    timer = setInterval(function() {
    rotateModels();
    display();
    }, 1000/30);
}

var k = 0;
function rotateModels() {
    // Place the top level Position in front of the camera.
    topLevel_p.matrix = Matrix.translate(0, -3, -10);
    // Rotate it.
    topLevel_p.matrix.mult( Matrix.rotateY(k) );

    // Place each model in the xz-plane and
    // also rotate each model on its own axis.
    for (var i = 0; i < models.length; i++)
    {
       for (var j = 0; j < models[i].length; j++)
       {
          // Place the model where it belongs in the xz-plane
          // and rotate the model on its own axis.
          models[i][j].nestedMatrix = Matrix.translate(4-4*i, 0, 6-3*j)
                                       .timesMatrix(Matrix.rotateX(3*k))
                                       .timesMatrix(Matrix.rotateY(3*k));
       }
    }

    if(k === 360) {k = 0;} else {k++;}
}

var played = true;
document.addEventListener('keypress', keyPressed);
function keyPressed(event) {
    const c = event.key;
    //var played = true;
    if ('f' == c)
    {
        if (!played)
            rotateModels();
    }
    else if ('p' == c) {
        if (played) {
            clearInterval(timer);
            played = false;
        } else {
            displayNextFrame();
            played = true;
        }
    }
    display();
}

var resizer = new ResizeObserver(display);
resizer.observe(document.getElementById("resizer"));