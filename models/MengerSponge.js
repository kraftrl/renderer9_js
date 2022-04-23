/*

*/

import { LineSegment } from "../scene/LineSegment.js";
import { Matrix } from "../scene/Matrix.js";
import { Model } from "../scene/Model.js";
import { Vertex } from "../scene/Vertex.js";

/**
   Create a wireframe model of a Menger Sponge centered at the origin.
<p>
   See <a href="https://en.wikipedia.org/wiki/Menger_sponge" target="_top">
                https://en.wikipedia.org/wiki/Menger_sponge</a>
*/
export class MengerSponge extends Model {

    /**
        Create a Menger Sponge centered at the origin
        using {@code n} recursive iterations.

        @param n  number of recursive iterations
    */
    constructor(n = 3) {
        super("Menger Sponge");

        if (0 == n) {
            // Create a cube geometry.
            this.addVertex([new Vertex(-1, -1, -1), // four vertices around the bottom face
                    new Vertex( 1, -1, -1),
                    new Vertex( 1, -1,  1),
                    new Vertex(-1, -1,  1),
                    new Vertex(-1,  1, -1), // four vertices around the top face
                    new Vertex( 1,  1, -1),
                    new Vertex( 1,  1,  1),
                    new Vertex(-1,  1,  1)]);

            // Create 12 line segments.
            this.addLineSegment([new LineSegment(0, 1), // bottom face
                        new LineSegment(1, 2),
                        new LineSegment(2, 3),
                        new LineSegment(3, 0),
                        new LineSegment(4, 5), // top face
                        new LineSegment(5, 6),
                        new LineSegment(6, 7),
                        new LineSegment(7, 4),
                        new LineSegment(0, 4), // back face
                        new LineSegment(1, 5),
                        new LineSegment(3, 7), // front face
                        new LineSegment(2, 6)]);
        }
        else {
            if (true) { // provide a way to erase the extra line segments
                // create 24 vertices for 12 line segements
                this.addVertex([new Vertex(-1,       -1, -1.0/3.0), // eight vertices in the bottom face
                        new Vertex(-1,       -1,  1.0/3.0),
                        new Vertex( 1,       -1, -1.0/3.0),
                        new Vertex( 1,       -1,  1.0/3.0),
                        new Vertex(-1.0/3.0, -1, -1),
                        new Vertex( 1.0/3.0, -1, -1),
                        new Vertex(-1.0/3.0, -1,  1),
                        new Vertex( 1.0/3.0, -1,  1),
                        new Vertex(-1,        1, -1.0/3.0), // eight vertices in the top face
                        new Vertex(-1,        1,  1.0/3.0),
                        new Vertex( 1,        1, -1.0/3.0),
                        new Vertex( 1,        1,  1.0/3.0),
                        new Vertex(-1.0/3.0,  1, -1),
                        new Vertex( 1.0/3.0,  1, -1),
                        new Vertex(-1.0/3.0,  1,  1),
                        new Vertex( 1.0/3.0,  1,  1),
                        new Vertex(-1, -1.0/3.0, -1), // four vertices in the back face
                        new Vertex(-1,  1.0/3.0, -1),
                        new Vertex( 1, -1.0/3.0, -1),
                        new Vertex( 1,  1.0/3.0, -1),
                        new Vertex(-1, -1.0/3.0,  1), // four vertices in the front face
                        new Vertex(-1,  1.0/3.0,  1),
                        new Vertex( 1, -1.0/3.0,  1),
                        new Vertex( 1,  1.0/3.0,  1)]);

                // Create 12 line segments.
                this.addLineSegment([new LineSegment( 0,  1), // bottom face
                            new LineSegment( 2,  3),
                            new LineSegment( 4,  5),
                            new LineSegment( 6,  7),
                            new LineSegment( 8,  9), // top face
                            new LineSegment(10, 11),
                            new LineSegment(12, 13),
                            new LineSegment(14, 15),
                            new LineSegment(16, 17), // back face
                            new LineSegment(18, 19),
                            new LineSegment(20, 21), // front face
                            new LineSegment(22, 23)]);
            }

            this.nestedModels.push( this.subSponges(n - 1, -1, -1, -1) );
            this.nestedModels.push( this.subSponges(n - 1, -1, -1,  1) );
            this.nestedModels.push( this.subSponges(n - 1, -1,  1, -1) );
            this.nestedModels.push( this.subSponges(n - 1, -1,  1,  1) );
            this.nestedModels.push( this.subSponges(n - 1,  1, -1, -1) );
            this.nestedModels.push( this.subSponges(n - 1,  1, -1,  1) );
            this.nestedModels.push( this.subSponges(n - 1,  1,  1, -1) );
            this.nestedModels.push( this.subSponges(n - 1,  1,  1,  1) );
        }
    }


    /**
        Recursive helper function.
        <p>
        This function builds the eight sub models needed
        for one recusive step. These sub models will not
        be touching each other. In order to make the wireframe
        Menger Sponge look a bit better, we add line segments
        that connect some of the edges between the sub models.

        @param n    number of recursive iterations
        @param pmX  plus or minus 1 for x-direction
        @param pmY  plus or minus 1 for y-direction
        @param pmZ  plus or minus 1 for z-direction
        @return     {@link Model} holding sub tree of sponges
    */
    subSponges(n, pmX, pmY, pmZ) {
        const model = new Model(`Menger Sponge: level ${n} (${pmX}, ${pmY}, ${pmZ})`);
        const scale = Matrix.scale(1.0/3.0, 1.0/3.0, 1.0/3.0);
        const translate = Matrix.translate(pmX*2.0/3.0, pmY*2.0/3.0, pmZ*2.0/3.0);
        model.nestedMatrix = translate.timesMatrix(scale);
        if (0 == n) { // stop the recursion
            // Create a cube geometry.
            model.addVertex([new Vertex(-1, -1, -1), // four vertices around the bottom face
                            new Vertex( 1, -1, -1),
                            new Vertex( 1, -1,  1),
                            new Vertex(-1, -1,  1),
                            new Vertex(-1,  1, -1), // four vertices around the top face
                            new Vertex( 1,  1, -1),
                            new Vertex( 1,  1,  1),
                            new Vertex(-1,  1,  1)]);

            // Create 12 line segments.
            model.addLineSegment([new LineSegment(0, 1), // bottom face
                                new LineSegment(1, 2),
                                new LineSegment(2, 3),
                                new LineSegment(3, 0),
                                new LineSegment(4, 5), // top face
                                new LineSegment(5, 6),
                                new LineSegment(6, 7),
                                new LineSegment(7, 4),
                                new LineSegment(0, 4), // back face
                                new LineSegment(1, 5),
                                new LineSegment(3, 7), // front face
                                new LineSegment(2, 6)]);
        }
        else {
            if (true) { // provide a way to erase the extra line segments
            // create 24 vertices for 12 line segements
            model.addVertex([new Vertex(-1,       -1, -1.0/3.0), // eight vertices in the bottom face
                            new Vertex(-1,       -1,  1.0/3.0),
                            new Vertex( 1,       -1, -1.0/3.0),
                            new Vertex( 1,       -1,  1.0/3.0),
                            new Vertex(-1.0/3.0, -1, -1),
                            new Vertex( 1.0/3.0, -1, -1),
                            new Vertex(-1.0/3.0, -1,  1),
                            new Vertex( 1.0/3.0, -1,  1),
                            new Vertex(-1,        1, -1.0/3.0), // eight vertices in the top face
                            new Vertex(-1,        1,  1.0/3.0),
                            new Vertex( 1,        1, -1.0/3.0),
                            new Vertex( 1,        1,  1.0/3.0),
                            new Vertex(-1.0/3.0,  1, -1),
                            new Vertex( 1.0/3.0,  1, -1),
                            new Vertex(-1.0/3.0,  1,  1),
                            new Vertex( 1.0/3.0,  1,  1),
                            new Vertex(-1, -1.0/3.0, -1), // four vertices in the back face
                            new Vertex(-1,  1.0/3.0, -1),
                            new Vertex( 1, -1.0/3.0, -1),
                            new Vertex( 1,  1.0/3.0, -1),
                            new Vertex(-1, -1.0/3.0,  1), // four vertices in the front face
                            new Vertex(-1,  1.0/3.0,  1),
                            new Vertex( 1, -1.0/3.0,  1),
                            new Vertex( 1,  1.0/3.0,  1)]);

            // Create 12 line segments.
            model.addLineSegment([new LineSegment( 0,  1), // bottom face
                                new LineSegment( 2,  3),
                                new LineSegment( 4,  5),
                                new LineSegment( 6,  7),
                                new LineSegment( 8,  9), // top face
                                new LineSegment(10, 11),
                                new LineSegment(12, 13),
                                new LineSegment(14, 15),
                                new LineSegment(16, 17), // back face
                                new LineSegment(18, 19),
                                new LineSegment(20, 21), // front face
                                new LineSegment(22, 23)]);
            }

            model.nestedModels.push( this.subSponges(n - 1, -1, -1, -1) );
            model.nestedModels.push( this.subSponges(n - 1, -1, -1,  1) );
            model.nestedModels.push( this.subSponges(n - 1, -1,  1, -1) );
            model.nestedModels.push( this.subSponges(n - 1, -1,  1,  1) );
            model.nestedModels.push( this.subSponges(n - 1,  1, -1, -1) );
            model.nestedModels.push( this.subSponges(n - 1,  1, -1,  1) );
            model.nestedModels.push( this.subSponges(n - 1,  1,  1, -1) );
            model.nestedModels.push( this.subSponges(n - 1,  1,  1,  1) );
            
        }
        return model;
    }
}//MengerSponge
