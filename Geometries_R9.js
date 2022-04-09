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
var position = [[null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null]];

// row 0
position[0][0] = new Position(new ObjSimpleModel("assets/great_rhombicosidodecahedron.obj"));
ModelShading.setColor(position[0][0].model, Color.Red);

position[0][1] = new Position(new ConeFrustum(0.5, 1.0, 1.0, 10, 10));
ModelShading.setColor(position[0][1].model, Color.Orange);

position[0][2] = new Position(new Box(1.0, 1.0, 1.0));
ModelShading.setColor(position[0][2].model, Color.Gray);

position[0][3] = new Position(new Axes3D(0, 1, 0, 1, 0, 1, Color.Red, Color.Green, Color.Blue));

position[0][4] = new Position(new Sphere(1.0, 30, 30));
ModelShading.setColor(position[0][4].model, Color.Gray);

// row 1
position[1][0] = new Position(new Cylinder(0.5, 1.0, 30, 30));
ModelShading.setColor(position[1][0].model, Color.Blue);

position[1][1] = new Position(new ObjSimpleModel("assets/horse.obj"));
ModelShading.setColor(position[1][1].model, Color.Pink);

position[1][2] = new Position(new GRSModel("assets/grs/vinci.grs"));
ModelShading.setColor(position[1][2].model, Color.Blue);

position[1][3] = new Position(new Tetrahedron());
ModelShading.setColor(position[1][3].model, Color.Cyan);

position[1][4] = new Position(new ObjSimpleModel("assets/small_rhombicosidodecahedron.obj"));
ModelShading.setColor(position[1][4].model, Color.Magenta);

// row 2
position[2][0] = new Position(new TriangularPrism(0.5, 1.0, 0.5, 8.0, true));
ModelShading.setColor(position[2][0].model, Color.Green);

position[2][1] = new Position(new GRSModel("assets/grs/bronto.grs"));
ModelShading.setColor(position[2][1].model, Color.Red);

position[2][2] = new Position(new Torus(0.75, 0.25, 30, 30));
ModelShading.setRandomColors(position[2][2].model);

position[2][3] = new Position(new Octahedron());
ModelShading.setColor(position[2][3].model, Color.Blue);

position[2][4] = new Position(new Cone(0.5, 1.0, 30, 30));
ModelShading.setColor(position[2][4].model, Color.Yellow);

// Create x, y and z axes
var xyzAxes = new Position(new Axes3D(6, -6, 6, 0, 7, -7,  Color.Red, Color.Red, Color.Red));

// Create a "top level" Position that holds a horizontal coordinate plane model.
var topLevel_p = new Position(new PanelXZ(-6, 6, -7, 7));
ModelShading.setColor(topLevel_p.model, Color.Gray);

// Add the other Positions as nested Positions of the top level Position.
for (var i = 0; i < position.length; i++)
    for (var j = 0; j < position[i].length; j++) {
        topLevel_p.addNestedPosition([position[i][j]]);
    }
topLevel_p.addNestedPosition([xyzAxes]);

// Add the top level Position to the Scene.
scene.addPosition( [topLevel_p] );

// Place the top level Position in front of the camera.
topLevel_p.matrix = Matrix.translate(0, -3, -10);

// Place each model in the xz-plane.
for (var i = 0; i < position.length; i++) {
    for (var j = 0; j < position[i].length; j++) {
        // Place the model where it belongs in the xz-plane.
        position[i][j].matrix.mult( Matrix.translate(4-4*i, 0, 6-3*j) );
    }
}

// Set up the camera's view frustum.
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

displayNextFrame();

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

function rotateModels() {
    // Rotate the top level Position one degree (accumulate the rotations).
    topLevel_p.matrix.mult( Matrix.rotateY(1) );
    //topLevel_p.matrix = Matrix.rotateZ(i).mult(Matrix.translate(0,0,20));

    // Rotate each model on its own axis.
    for (var i = 0; i < position.length; i++) {
        for (var j = 0; j < position[i].length; j++) {
            // Rotate the model on its own axis (accumulate the rotations).
            position[i][j].matrix.mult( Matrix.rotateX(3) );
            position[i][j].matrix.mult( Matrix.rotateY(3) );
        }
    }
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