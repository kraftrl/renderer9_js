/*

*/

import { Scene } from '../../scene/Scene.js';
import { Matrix } from '../../scene/Matrix.js';
import { Position } from '../../scene/Position.js';
import { Pipeline } from '../../pipeline/Pipeline.js';
import { FrameBuffer } from '../../framebuffer/FrameBuffer.js';
import { Color } from '../../color/Color.js';
import { Model_4 } from "./Model_4.js";

/**
   This program creates a hierarchical scene out of the
   hierarchical (nested) model, Model_4.
<p>
   Draw nine instances of Model_4 (where each instance
   of Model_4 contains four instances of Model_1).
<p>
   Be sure to draw a picture of the scene graph that this program creates.
*/

// Create a (single!) instance of Model_4.
const m4 = new Model_4();

// Create the Scene object that we shall render.
const scene = new Scene();

const right = 2;
const left = -right;
const top = 2;
const bottom = -top;
const near = 2;

scene.camera.projPerspective(left, right, bottom, top, near);

scene.addPosition([new Position(m4)]);

for (let i = 0; i < 1; i++) {
  const nestedPosition = new Position();
  nestedPosition.model = m4;
  nestedPosition.matrix = Matrix.rotateZ(i*45);
  nestedPosition.matrix.mult( Matrix.translate(0, -11, 0) );
  nestedPosition.matrix.mult( Matrix.scale(0.5) );
  scene.getPosition(0).addNestedPosition( [nestedPosition] );
}


// Setup a variabls for animation
let frame = 0;
let fps = 30;
let timer;

// Setup timer
timer = setInterval(function () {
  nextFrame();
  display();
}, 1000 / fps);

function nextFrame() {
  scene.getPosition(0).matrix = Matrix.identity();
  // Push the model away from where the camera is.
  scene.getPosition(0).matrix.mult( Matrix.translate(0, 0, -15) );

  scene.getPosition(0).matrix.mult( Matrix.rotateZ(10*frame) );

  // Update the parameters for the next frame.
  frame = (frame + 1) % 37;
}


// Display the Model on the page
function display() {
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
  const fb = new FrameBuffer(undefined, w, h, Color.White);
  Pipeline.render(scene, fb.vp);

  ctx.putImageData(new ImageData(fb.pixel_buffer, fb.width, fb.height), fb.vp.vp_ul_x, fb.vp.vp_ul_y);
}