import { Color } from "./color/Color.js";
import { FrameBuffer } from "./framebuffer/FrameBuffer.js";
import { Matrix } from "./scene/Matrix.js";
import { Scene } from "./scene/Scene.js";
import { SierpinskiTriangle } from "./models/SierpinskiTriangle.js";
import { Position } from "./scene/Position.js";
import { ModelShading } from "./scene/ModelShading.js";
import { Pipeline } from "./pipeline/Pipeline.js";

// Create the Scene object that we shall render.
var scene = new Scene();

// Create a Position object that will hold the Sierpinski triangle.
const top_p = new Position();

// Add the Position object to the scene.
scene.addPosition([top_p]);

// Push the position away from where the camera is.
top_p.matrix.mult( Matrix.translate(0, 0, -1) );
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

// Create a framebuffer to render our scene into.
const vp_width  = 800;
const vp_height = 800;
const fb = new FrameBuffer(undefined, vp_width, vp_height);

var startTime, stopTime;
startTime = new Date().getTime();

for (var k = 0; k < 720; k++) {
    console.log(k);
    fb.clearFB(Color.Black);
    Pipeline.render(scene, fb.vp);
    fb.dumpFB2File(`PPM_SierpinskiMovie_v1_Frame${k.toString().padStart(3,'0')}.ppm`);

    updateNestedMatrices(sierpinskiTriangle, true);
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

stopTime = new Date().getTime();
console.log("Wall-clock time: " + (stopTime - startTime));