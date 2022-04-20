/*

*/

import { Scene } from '../../../scene/Scene.js';
import { ModelShading } from '../../../scene/ModelShading.js';
import { Matrix } from '../../../scene/Matrix.js';
import { Position } from '../../../scene/Position.js';
import { Pipeline } from '../../../pipeline/Pipeline.js';
import { FrameBuffer } from '../../../framebuffer/FrameBuffer.js';
import { Color } from '../../../color/Color.js';
import { PanelXZ } from '../../../models/PanelXZ.js';
import { TriangularPrism} from '../../../models/TriangularPrism.js';
import { Model } from '../../../scene/Model.js';

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
class Prisms extends Model {
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
      ModelShading.setColor(m5, Color.Red);

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
 Here is a sketch of this program's scene graph.
 Only the Prisml node holds any geometry. All of
 the other nodes hold only a matrix.
<pre>{@code
               Scene
                 |
                 |
             Position
            /    |    \
           /     |     \
     Matrix   Prisms    nested Positions
      RT     /  |   \
            /   |    \
      Matrix  empty   nested Models
        I               / |  | \
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

const prisms = new Prisms();
ModelShading.setColor(prisms, Color.Red);
top_p.model = prisms;

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

// Set up the camera's view frustum.
var right  = 1.0;
var left   = -right;
var top    = 1.0;
var bottom = -top;
var near   = 1.0;
scene.camera.projPerspective(left, right, bottom, top, near);

// Spin the model 360 degrees arond two axes.
for (var i = 0; i <= 180; i++) {
  top_p.matrix2Identity();
  // Push the model away from where the camera is.
  top_p.matrix.mult( Matrix.translate(0, 0, -8) )
              .mult( Matrix.rotateX(2*i) )
              .mult( Matrix.rotateY(2*i) )
              .mult( Matrix.rotateZ(2*i) );

  // Render again.
  fb.clearFB(Color.Gray);
  Pipeline.render(scene, fb.vp);
  fb.dumpFB2File(`PPM_NestedPrism_v1_Frame_${i.toString().padStart(3,'0')}.ppm`);
}