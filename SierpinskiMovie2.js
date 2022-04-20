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
var right  = 1.0;
var left   = -right;
var top    = 1.0;
var bottom = -top;
var near   = 1.0;
scene.camera.projPerspective(left, right, bottom, top, near);

var counter = 0;
const angle = 1;

displayNextFrame();

function displayNextFrame() {
    timer = setInterval(function() {
        display();
        counter++;
        updateNestedMatrices(sierpinskiTriangle, angle);
    }, 1000/30);
}

function updateNestedMatrices(model, angle){
    if (counter < 120) updateNestedMatrices1(model, angle);
    else if (counter < 360) updateNestedMatrices2(model, angle);
    else if (counter < 600) updateNestedMatrices3(model, angle);
    else if (counter < 960) updateNestedMatrices4(model, angle);
    else {
        counter = 0;
        updateNestedMatrices1(model, angle);
    }
}

function updateNestedMatrices1(model, angle) {
    if (model.nestedModels.length) {
        model.nestedModels[0].nestedMatrix.mult(Matrix.rotateZ(angle));
        model.nestedModels[1].nestedMatrix.mult(Matrix.rotateZ(angle));
        model.nestedModels[2].nestedMatrix.mult(Matrix.rotateZ(angle));
    }
    for (var m of model.nestedModels) { updateNestedMatrices1(m, angle); }
}

function updateNestedMatrices2(model, angle) {
    if (model.nestedModels.length) {
        model.nestedModels[0].nestedMatrix.mult(Matrix.rotateZ(angle));
    }
    for (var m of model.nestedModels) { updateNestedMatrices2(m, angle); }
}

function updateNestedMatrices3(model, angle) {
    if (model.nestedModels.length) {
        model.nestedModels[1].nestedMatrix.mult(Matrix.rotateZ( angle));
        model.nestedModels[2].nestedMatrix.mult(Matrix.rotateZ(-angle));
    }
    for (var m of model.nestedModels) { updateNestedMatrices3(m, angle); }
}

function updateNestedMatrices4(model, angle) {
    if (model.nestedModels.length) {
        model.nestedModels[1].nestedMatrix.mult(Matrix.rotateZ(-angle));
        model.nestedModels[2].nestedMatrix.mult(Matrix.rotateZ(-angle));
    }
    for (var m of model.nestedModels) { updateNestedMatrices4(m, angle); }
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
            updateNestedMatrices(sierpinskiTriangle, angle);
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