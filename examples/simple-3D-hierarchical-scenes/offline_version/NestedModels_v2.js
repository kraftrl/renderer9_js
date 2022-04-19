/*

*/

import { Scene } from '../../../scene/Scene.js';
import { ModelShading } from '../../../scene/ModelShading.js';
import { Matrix } from '../../../scene/Matrix.js';
import { Position } from '../../../scene/Position.js';
import { Pipeline } from '../../../pipeline/Pipeline.js';
import { FrameBuffer } from '../../../framebuffer/FrameBuffer.js';
import { Color } from '../../../color/Color.js';
import { Model } from '../../../scene/Model.js';
import { Vertex } from '../../../scene/Vertex.js';
import { LineSegment } from '../../../scene/LineSegment.js';
import { PanelXZ } from '../../../models/PanelXZ.js';

/**
   This is a simple, nested (hierarchical) model
   made up of a triangle with another triangle
   attached to each vertex.
*/
export class SimpleModel_v2 extends Model {
  constructor() {
    super();

    // Add a single triangle to the geometry of this model.
    const sin2PIover3 = Math.sin(2*Math.PI/3);
    const v0 = new Vertex( 1,        0,       0);
    const v1 = new Vertex(-0.5,  sin2PIover3, 0);
    const v2 = new Vertex(-0.5, -sin2PIover3, 0);
    this.addVertex([v0, v1, v2]);
    this.addLineSegment([new LineSegment(0, 1),
                    new LineSegment(1, 2),
                    new LineSegment(2, 0)]);
    ModelShading.setColor(this, Color.Black);

    // Create three nested Models.
    const m1 = new Model();
    const m2 = new Model();
    const m3 = new Model();

    // Put the three nested Models into this Model.
    this.nestedModels.push(m1);
    this.nestedModels.push(m2);
    this.nestedModels.push(m3);

    // Give each of these nested Models a triangle as
    // a (deeper) nested Model.
    this.triangle = new Model();
    this.triangle.addVertex([v0, v1, v2]);
    this.triangle.addLineSegment([new LineSegment(0, 1),
                            new LineSegment(1, 2),
                            new LineSegment(2, 0)]);
    ModelShading.setColor( this.triangle, Color.Red);
    m1.nestedModels.push( this.triangle);
    m2.nestedModels.push( this.triangle);
    m3.nestedModels.push( this.triangle);

    // Place the three sub-models at the
    // corners of the this model's triangle.
    m1.nestedMatrix = Matrix.translate(1.5, 0, 0);
    m2.nestedMatrix = Matrix.rotateZ(120)
                      .timesMatrix(Matrix.translate(1.5, 0, 0));
    m3.nestedMatrix = Matrix.rotateZ(240)
                      .timesMatrix(Matrix.translate(1.5, 0, 0));
  }
}

/**
 This program uses the the hierarchical model
 defined just above.
<p>
 Here is a sketch of the scene graph for this example.
<pre>{@code
               Scene
                 |
                 |
             Position
            /    |    \
           /     |     \
          /      |      \
    Matrix  SimpleModel  nested Positions
     RT     /     |   \
           /      |    \
      Matrix     tri    nested Models
         I             /      |      \
                      /       |       \
                     /        |        \
                    /         |         \
               Model        Model        Model
              /   \         /   \        /   \
             /     \       /     \      /     \
       Matrix  nested  Matrix  nested  Matrix  nested
         T     Models    TR    Models    TR    Models
                     \           |            /
                       \         |          /
                         \       |        /
                           \     |      /
                             \   |    /
                               Model
                              /  |  \
                             /   |   \
                       Matrix   tri   nested
                         R            Models
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

// Create an instance of our hierarchical Model.
const mainModel = new SimpleModel_v2();
// Add the Moddel to the top level Position
top_p.model = mainModel;

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

// Set up the camera's view frustum.
var right  = 1.0;
var left   = -right;
var top    = 1.0;
var bottom = -top;
var near   = 1.0;
scene.camera.projPerspective(left, right, bottom, top, near);

for (var i = 0; i <= 72; i++) {
  // Rotate the triangles WITHIN the model.
  mainModel.triangle.nestedMatrix = mainModel.triangle.nestedMatrix.timesMatrix(Matrix.rotateX(5));

  // Rotate just one triangle WITHIN the scene.
  //mainModel.nestedModels.get(0).nestedMatrix = mainModel.nestedModels.get(0).nestedMatrix.times(Matrix.rotateX(5));

  // Translate and rotate the WHOLE model.
  top_p.matrix2Identity();
  // Push the whole model away from where the camera is.
  top_p.matrix.mult( Matrix.translate(0, 0, -5) );
  // Rotate and translate the whole model.
  top_p.matrix.mult( Matrix.rotateZ(5*i) );
  top_p.matrix.mult( Matrix.translate(2, 0, 0) );
  //         top_p.matrix.mult( Matrix.rotateY(5*i) );
  //         top_p.matrix.mult( Matrix.rotateX(5*i) );

  // Render
  fb.clearFB(Color.Gray);
  Pipeline.render(scene, fb.vp);
  fb.dumpFB2File(`PPM_NestedModels_v2_Frame${i}.ppm`);
}