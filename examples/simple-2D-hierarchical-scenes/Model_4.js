/*

*/

import { Model_2 } from "./Model_2.js";
import { Model } from "../../scene/Model.js";
import { Matrix } from "../../scene/Matrix.js";
import { Color } from "../../color/Color.js";

/**
   This file defines a nested model out of two copies of Model_2
   (so there are four copies of Model_1).
<p>
   Here is a graph of the hierarchical structure of Model_4
   in terms of Model_2. You should complete the graph of the
   hierarchical structure of Model_4 in terms of Model_1.
<p>
<pre>{@code
               Model_4
              /   |   \
             /    |    \
       Matrix   empty   nested Models
         I             /             \
                      /               \
                     /                 \
                    /                   \
               Model_2                 Model_2
              /   |   \               /   |   \
             /    |    \             /    |    \
       Matrix   empty  nested   Matrix  empty   nested
         T             Models     TR            Models
}</pre>
*/
export class Model_4 extends Model {
  constructor() {
    super("Model_4");

    let m1 = new Model_2(Color.Red,     Color.Black);
    let m2 = new Model_2(Color.Magenta, Color.Blue);

    m1.nestedMatrix = Matrix.translate(-2, -2, 0);

    m2.nestedMatrix = Matrix.translate(2, 2, 0)
                    .timesMatrix(Matrix.rotateZ(180));

    this.nestedModels.push(m1);
    this.nestedModels.push(m2);
  }
}
