import { LineSegment } from "../../scene/LineSegment.js";
import { Model } from "../../scene/Model.js";
import { Vertex } from "../../scene/Vertex.js";

/**
   A robot arm model that we can make multiple instances of.
*/
export class Arm extends Model {
    constructor(){
        super();

        this.elbow = new Model();
        this.wrist = new Model();
        this.finger = new Model();

        /*
            Be sure to draw a picture of the (simple) tree that this code creates.
        */
        const v0 = new Vertex(0, 0, 0);
        const v1 = new Vertex(1, 0, 0);
        this.addVertex([v0, v1]);
        this.addLineSegment([new LineSegment(0, 1)]);

        this.elbow.addVertex([v0, v1]);
        this.elbow.addLineSegment([new LineSegment(0, 1)]);
        this.nestedModels.push( this.elbow );

        this.wrist.addVertex([v0, v1]);
        this.wrist.addLineSegment([new LineSegment(0, 1)]);
        this.elbow.nestedModels.push( this.wrist );

        this.finger.addVertex([v0, v1]);
        this.finger.addLineSegment([new LineSegment(0, 1)]);
        this.wrist.nestedModels.push( this.finger );
    }
}