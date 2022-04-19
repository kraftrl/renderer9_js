/*

*/

import { Scene } from '../../scene/Scene.js';
import { ModelShading } from '../../scene/ModelShading.js';
import { Matrix } from '../../scene/Matrix.js';
import { Position } from '../../scene/Position.js';
import { Pipeline } from '../../pipeline/Pipeline.js';
import { FrameBuffer } from '../../framebuffer/FrameBuffer.js';
import { Color } from '../../color/Color.js';
import { PanelXZ } from '../../models/PanelXZ.js';
import { TriangularPrism} from '../../models/TriangularPrism.js';
import { Model } from '../../scene/Model.js';

/**
   This is a nested (hierarchical) model made
   up of four prisms connected into a ring.
<p>
   Here is a sketch of this model's scene graph.
<pre>{@code
            Prisms Model
            /    |     \
           /     |      \
     Matrix   geometry   nested Models
       I      (empty)      / |  | \
                          /  |  |  \
                        m1  m2  m3  m4
                          \  |  |  /
                           \ |  | /
                        TriangularPrism
}</pre>
*/
class Prisms_v2 extends Model {
  constructor() {
    super();

    const sqrt3 = Math.sqrt(3.0);

    const m1 = new Model();
    const m2 = new Model();
    const m3 = new Model();
    const m4 = new Model();

    this.nestedModels.push(m1);
    this.nestedModels.push(m2);
    this.nestedModels.push(m3);
    this.nestedModels.push(m4);

    // Create a TriangularPrism object.
    const m5 = new TriangularPrism(1.0/sqrt3, 2.0, Math.PI/4.0, 25, true);
    ModelShading.setColor(m5, Color.Blue);

    // right
    m1.nestedModels.push(m5);
    m1.nestedMatrix = Matrix.translate(2+0.5/sqrt3, 0, 0);
    // left
    m2.nestedModels.push(m5);
    m2.nestedMatrix = Matrix.translate(-2-0.5/sqrt3, 0, 0)
                      .timesMatrix(Matrix.rotateZ(180));
    // top
    m3.nestedModels.push(m5);
    m3.nestedMatrix = Matrix.rotateZ(90)
                      .timesMatrix(Matrix.translate(2+0.5/sqrt3, 0, 0));
    // bottom
    m4.nestedModels.push(m5);
    m4.nestedMatrix = Matrix.rotateZ(-90)
                      .timesMatrix(Matrix.translate(2+0.5/sqrt3, 0, 0));
  }
}

/**
   This is a nested (hierarchical) model made
   up of two linked four-prism rings.
<p>
   Here is a sketch of this model's scene graph.
<pre>{@code
            Links Model
            /    |     \
           /     |      \
     Matrix   geometry   nested Models
       I      (empty)        /  \
                            /    \
                          m1      m2
                            \    /
                             \  /
                            Prisms
}</pre>
*/
class Links extends Model {
  constructor() {
    super();

    const m1 = new Model();
    const m2 = new Model();

    this.nestedModels.push(m1);
    this.nestedModels.push(m2);

    const m3 = new Prisms_v2();

    // link 1
    m1.nestedModels.push(m3);
    // link 2
    m2.nestedModels.push(m3);
    m2.nestedMatrix = Matrix.translate(2, 0, 0)
                      .timesMatrix(Matrix.rotateX(90));
  }
}

/**
   Here is a sketch of this program's scene graph.
<pre>{@code
                 Scene
                   |
                   |
               Position
              /    |    \
             /     |     \
       Matrix    Links    nested Positions
        RT     /  |   \
              /   |    \
             /    |     \
      Matrix   geometry  nested Models
        I      (empty)       /  \
                            /    \
                          m1      m2
                            \    /
                             \  /
                         Prisms Model
                         /    |     \
                        /     |      \
                  Matrix   geometry   nested Models
                    I       (empty)      / |  | \
                                        /  |  |  \
                                      m1  m2  m3  m4
                                        \  |  |  /
                                         \ |  | /
                                      TriangularPrism
}</pre>
*/

// Timer for frames.
var timer = null;

// Create the Scene object that we shall render.
const scene = new Scene();

// Create the top level Position.
const top_p = new Position();

// Add the top level Position to the Scene.
scene.addPosition([top_p]);

const links = new Links();
ModelShading.setColor(links, Color.Blue);
top_p.model = links;

// Create a floor Model.
const floor = new PanelXZ(-4, 4, -4, 4);
ModelShading.setColor(floor, Color.Black);
const floor_p = new Position(floor);
// Push this model away from where the camera is.
floor_p.matrix = Matrix.translate(0, -4, -5);
// Add the floor to the Scene.
scene.addPosition([floor_p]);


// Create a framebuffer to render our scene into.
const vp_width  = 1024;
const vp_height = 1024;
const fb = new FrameBuffer(undefined, vp_width, vp_height);
// Give the framebuffer a nice background color.
fb.clearFB(Color.Gray);

var right  = 1.0;
var left   = -right;
var top    = 1.0;
var bottom = -top;
var near   = 1.0;
scene.camera.projPerspective(left, right, bottom, top, near);

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
	const fb = new FrameBuffer(undefined, w, h, Color.Gray);
	Pipeline.render(scene, fb.vp);

	ctx.putImageData(new ImageData(fb.pixel_buffer,fb.width, fb.height), fb.vp.vp_ul_x, fb.vp.vp_ul_y);
}

function displayNextFrame() {
   timer = setInterval(function() {
   rotateModels();
   display();
   }, 1000/30);
}

var i = 0;
function rotateModels() {
  top_p.matrix2Identity();
  // Push the model away from where the camera is.
  top_p.matrix.mult( Matrix.translate(0, 0, -8) )
              .mult( Matrix.rotateX(2*i) )
              .mult( Matrix.rotateY(2*i) )
              .mult( Matrix.rotateZ(2*i) );

   if (i == 180) {i = 0;} else {i++;}
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