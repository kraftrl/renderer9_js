/*

*/

import { Model_1 } from "./Model_1.js";
import { Model } from "../../scene/Model.js";
import { ModelShading } from "../../scene/ModelShading.js";
import { Matrix } from "../../scene/Matrix.js";

/**
   This file defines a nested model out of two copies of Model_1.
<p>
   The tree for this model is shown below.
<p>
   Remember that every model node in the tree contains a matrix,
   geometry (vertices and line-segments) and a list of nested models.
   The geometry may be empty, and the list of nested models may also
   be empty, but the matrix cannot be "empty" (if you don't give it
   a value, then it is the identity matrix, I).
<p>
<pre>{@code
               Model_2
              /   |   \
             /    |    \
       Matrix   empty   nested Models
         I               /         \
                        /           \
                       /             \
                   Model_1           Model_1
                  /    |            /    |
                 /     |           /     |
           Matrix     geom     Matrix   geom
             I                  TSR
}</pre>
*/
export class Model_2 extends Model {
    constructor(c1, c2) {
        super("Model_2");

        let m1 = new Model_1();
        let m2 = new Model_1();
        ModelShading.setColor(m1, c1);
        ModelShading.setColor(m2, c2);

        m2.nestedMatrix = Matrix.translate(1, -2-Math.sqrt(2), 0)
                        .timesMatrix(Matrix.scale(0.5, 0.5, 1))
                        .timesMatrix(Matrix.rotateZ(-45));

        this.nestedModels.push(m1);
        this.nestedModels.push(m2);
    }
}
