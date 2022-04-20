import { LineSegment } from "../scene/LineSegment.js";
import { Matrix } from "../scene/Matrix.js";
import { Model } from "../scene/Model.js";
import { Vertex } from "../scene/Vertex.js";

/**
   Create a wireframe model of a Sierpinski Triangle centered at the origin.
<p>
   See <a href="https://en.wikipedia.org/wiki/Sierpi%C5%84ski_triangle" target="_top">
                https://en.wikipedia.org/wiki/Sierpi%C5%84ski_triangle</a>
*/
export class SierpinskiTriangle extends Model {


    /**
         Create a Sierpinski Triangle centered at the origin
        using {@code n} recursive iterations.

        @param n  number of recursive iterations
    */
    constructor(n = 5) {
        super("Sierpinski Triangle");

        if (0 == n) {
            // Create an elquilateral triangle.
            this.addVertex([new Vertex( 1.0,  0,     0),
                            new Vertex(-0.5,  0.866, 0),
                            new Vertex(-0.5, -0.866, 0)]);

            // Create 3 line segments.
            this.addLineSegment([new LineSegment(0, 1),
                                 new LineSegment(1, 2),
                                 new LineSegment(2, 0)]);
        } else {
            this.nestedModels.push( this.subTriangles(n - 1,  0.5,   0) );
            this.nestedModels.push( this.subTriangles(n - 1, -0.25,  0.433) );
            this.nestedModels.push( this.subTriangles(n - 1, -0.25, -0.433) );
        }
    }

    /**
         Recursive helper function.
        <p>
        This function builds the three sub models needed
        for one recusive step.

        @param n   number of recursive iterations
        @param tX  translation in the x-direction
        @param tY  translation in the y-direction
        @return    {@link Model} holding sub tree of triangles
    */
    subTriangles(n, tX, tY) {
        const model = new Model(`Sierpinski Triangle: level ${n} (${tX}, ${tY})`);
        const scale = Matrix.scale(0.5, 0.5, 0.5);
        const translate = Matrix.translate(tX, tY, 0);
        model.nestedMatrix = translate.timesMatrix(scale);
        if (0 == n) { // stop the recursion
            // Create an elquilateral triangle.
            model.addVertex([new Vertex( 1.0,  0,     0),
                             new Vertex(-0.5,  0.866, 0),
                             new Vertex(-0.5, -0.866, 0)]);

            // Create 3 line segments.
            model.addLineSegment([new LineSegment(0, 1),
                                  new LineSegment(1, 2),
                                  new LineSegment(2, 0)]);
        }
        else {
            model.nestedModels.push( this.subTriangles(n - 1,  0.5,   0) );
            model.nestedModels.push( this.subTriangles(n - 1, -0.25,  0.433) );
            model.nestedModels.push( this.subTriangles(n - 1, -0.25, -0.433) );
        }
        return model;
    }
}//SierpinskiTriangle