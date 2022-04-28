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
   This file just shows what Model_4 looks like.
*/

// Create the Scene object that we shall render.
const scene = new Scene();

const right = 2;
const left = -right;
const top = 2;
const bottom = -top;
const near = 2;

scene.camera.projPerspective(left, right, bottom, top, near);

// Create an instance of Model_4.
const m = new Model_4();
// Add the model to the Scene.
scene.addPosition([new Position(m)]);

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
  scene.getPosition(0).matrix.mult( Matrix.translate(0, 0, -8) );

  scene.getPosition(0).matrix.mult( Matrix.rotateZ(10*frame) );
 
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
