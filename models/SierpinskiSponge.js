/*

*/

import { LineSegment } from "../scene/LineSegment.js";
import { Matrix } from "../scene/Matrix.js";
import { Model } from "../scene/Model.js";
import { Vertex } from "../scene/Vertex.js";

/**
   Create a wireframe model of a Sierpinski Sponge centered at the origin.
<p>
   See <a href="https://en.wikipedia.org/wiki/Sierpi%C5%84ski_triangle#Analogues_in_higher_dimensions" target="_top">
                https://en.wikipedia.org/wiki/Sierpi%C5%84ski_triangle#Analogues_in_higher_dimensions</a>
*/
export class SierpinskiSponge extends Model {

    /**
        Create a Sierpinski Sponge centered at the origin
        using {@code n} recursive iterations.

        @param n  number of recursive iterations
    */
    constructor(n = 5) {
        super("SierpinskiSponge");
        if (0 == n) {
            // Create a tetrahedron geometry.
            // It has 4 vertices and 6 edges.
            this.addVertex([new Vertex( 1,  1,  1),
                    new Vertex(-1,  1, -1),
                    new Vertex( 1, -1, -1),
                    new Vertex(-1, -1,  1)]);

            // Create 6 line segments.
            this.addLineSegment([new LineSegment(0, 1), //top (bottom) edge
                        new LineSegment(2, 3), //bottom (top) edge
                        new LineSegment(0, 2),
                        new LineSegment(0, 3),
                        new LineSegment(1, 2),
                        new LineSegment(1, 3)]);
        }
        else {
            this.nestedModels.push( this.subSponges(n - 1,  1,  1,  1) );
            this.nestedModels.push( this.subSponges(n - 1, -1,  1, -1) );
            this.nestedModels.push( this.subSponges(n - 1,  1, -1, -1) );
            this.nestedModels.push( this.subSponges(n - 1, -1, -1,  1) );
        }
    }

   /**
        Recursive helper function.
        <p>
        This function builds the four sub models needed
        for one recusive step.

        @param n    number of recursive iterations
        @param pmX  plus or minus 1 for x-direction
        @param pmY  plus or minus 1 for y-direction
        @param pmZ  plus or minus 1 for z-direction
        @return     {@link Model} holding sub tree of sponges
   */
   subSponges(n, pmX, pmY, pmZ) {
        const model = new Model(`Sierpinski Sponge: level ${n} (${pmX}, ${pmY}, ${pmZ})`);
        const scale = Matrix.scale(0.5, 0.5, 0.5);
        const translate = Matrix.translate(pmX*0.5, pmY*0.5, pmZ*0.5);
        model.nestedMatrix = translate.timesMatrix(scale);
        if (0 == n) { // stop the recursion
            // Create a tetrahedron geometry.
            // It has 4 vertices and 6 edges.
            model.addVertex([new Vertex( 1,  1,  1),
                            new Vertex(-1,  1, -1),
                            new Vertex( 1, -1, -1),
                            new Vertex(-1, -1,  1)]);

            // Create 6 line segments.
            model.addLineSegment([new LineSegment(0, 1), //top (bottom) edge
                                new LineSegment(2, 3), //bottom (top) edge
                                new LineSegment(0, 2),
                                new LineSegment(0, 3),
                                new LineSegment(1, 2),
                                new LineSegment(1, 3)]);
        }
        else {
            model.nestedModels.push( this.subSponges(n - 1,  1,  1,  1) );
            model.nestedModels.push( this.subSponges(n - 1, -1,  1, -1) );
            model.nestedModels.push( this.subSponges(n - 1,  1, -1, -1) );
            model.nestedModels.push( this.subSponges(n - 1, -1, -1,  1) );
        }
        return model;
   }
}//SierpinskiSponge
