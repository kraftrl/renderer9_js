import { Color } from "./color/Color.js";
import { FrameBuffer } from "./framebuffer/FrameBuffer.js";
import { Matrix } from "./scene/Matrix.js";
import { Scene } from "./scene/Scene.js";
import { SierpinskiTriangle } from "./models/SierpinskiTriangle.js";
import { Position } from "./scene/Position.js";
import { ModelShading } from "./scene/ModelShading.js";
import { Pipeline } from "./pipeline/Pipeline.js";

var startTime, stopTime;
startTime = new Date().getTime();

// Create a framebuffer to render our scene into.
const vp_width  = 800;
const vp_height = 800;
const fb = new FrameBuffer(undefined, vp_width, vp_height);

// Create the Scene object that we shall render.
var scene = new Scene();

// Set up the camera's view frustum.
var right  = 1.0;
var left   = -right;
var top    = 1.0;
var bottom = -top;
var near   = 1.0;
scene.camera.projPerspective(left, right, bottom, top, near);

// Create a Position object that will hold the Sierpinski triangle.
const top_p = new Position();

// Add the Position object to the scene.
scene.addPosition([top_p]);

// Push the position away from where the camera is.
top_p.matrix.mult( Matrix.translate(0, 0, -1) );
top_p.matrix.mult( Matrix.rotateZ(90) );

var counter = 0;
const angle = 1;
var sierpinskiTriangle;

initSierpinskiTriangle();
for (; counter < 120; counter++) {
    render();

    updateNestedMatrices1(sierpinskiTriangle, angle);
}

initSierpinskiTriangle();
for (; counter < 360; counter++) {
    render();

    updateNestedMatrices2(sierpinskiTriangle, angle);
}

initSierpinskiTriangle();
for (; counter < 600; counter++) {
    render();

    updateNestedMatrices3(sierpinskiTriangle, angle);
}

initSierpinskiTriangle();
for (; counter < 960; counter++) {
    render();
    
    updateNestedMatrices4(sierpinskiTriangle, true);
}

function initSierpinskiTriangle() {
    // Create the Model object.
    sierpinskiTriangle = new SierpinskiTriangle(8);
    ModelShading.setColor(sierpinskiTriangle.nestedModels[0], Color.Blue);
    ModelShading.setColor(sierpinskiTriangle.nestedModels[1], Color.Red);
    ModelShading.setColor(sierpinskiTriangle.nestedModels[2], Color.Magenta);
    // Add the model to the position.
    top_p.model = sierpinskiTriangle;
}

function render(){
    console.log(counter);
    fb.clearFB(Color.Black);
    Pipeline.render(scene, fb.vp);
    fb.dumpFB2File(`PPM_SierpinskiMovie_v2_Frame${counter.toString().padStart(3,'0')}.ppm`);
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

stopTime = new Date().getTime();
console.log("Wall-clock time: " + (stopTime - startTime));