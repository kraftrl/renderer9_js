import { Color } from "./color/Color.js";
import { FrameBuffer } from "./framebuffer/FrameBuffer.js";
import { Matrix } from "./scene/Matrix.js";
import { Scene } from "./scene/Scene.js";
import { SierpinskiTriangle } from "./models/SierpinskiTriangle.js";
import { Position } from "./scene/Position.js";
import { ModelShading } from "./scene/ModelShading.js";
import { Pipeline } from "./pipeline/Pipeline.js";

  
var timer = null;

// Create the Scene object that we shall render.
var scene = new Scene();

// Create a Position object that will hold the Sierpinski triangle.
const top_p = new Position();

// Add the Position object to the scene.
scene.addPosition([top_p]);

// Push the position away from where the camera is.
top_p.matrix.mult( Matrix.translate(0, -0.2, -1) );
top_p.matrix.mult( Matrix.rotateZ(90) );

// Create the Model object.
var sierpinskiTriangle = new SierpinskiTriangle(8);
ModelShading.setColor(sierpinskiTriangle.nestedModels[0], Color.Blue);
ModelShading.setColor(sierpinskiTriangle.nestedModels[1], Color.Red);
ModelShading.setColor(sierpinskiTriangle.nestedModels[2], Color.Magenta);

// Add the model to the position.
top_p.model = sierpinskiTriangle;

// Set up the camera's view frustum.
var right  = 2.0;
var left   = -right;
var top    = 1.0;
var bottom = -top;
var near   = 1.0;
scene.camera.projPerspective(left, right, bottom, top, near);

displayNextFrame();

function displayNextFrame() {
    timer = setInterval(function() {
        updateNestedMatrices(sierpinskiTriangle, true);
        display();
    }, 1000/30);
}

function updateNestedMatrices(model, both) {
    if (model.nestedModels.length) {
        if (both) {
            model.nestedModels[1].nestedMatrix.mult(Matrix.rotateZ( 0.5));
            model.nestedModels[2].nestedMatrix.mult(Matrix.rotateZ(-0.5));
        } else {
            model.nestedModels[0].nestedMatrix.mult(Matrix.rotateZ( 0.5));
        }
        for (var m of model.nestedModels) { updateNestedMatrices(m, both); }
    }
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

	ctx.putImageData(new ImageData(fb.pixel_buffer, fb.width, fb.height), fb.vp.vp_ul_x, fb.vp.vp_ul_y);
}

var played = true;
document.addEventListener('keypress', keyPressed);
function keyPressed(event) {
    const c = event.key;
    //var played = true;
    if ('f' == c) {
        if (!played) {
            updateNestedMatrices(sierpinskiTriangle, true);
            display();
        }
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
}

var resizer = new ResizeObserver(display);
resizer.observe(document.getElementById("resizer"));