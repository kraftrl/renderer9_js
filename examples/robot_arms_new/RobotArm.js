import { LineSegment } from "../../scene/LineSegment.js";
import { Matrix } from "../../scene/Matrix.js";
import { Model } from "../../scene/Model.js";
import { Vertex } from "../../scene/Vertex.js";

/**
     A robot arm model with one shoulder, one elbow,
    one wrist, and one finger joint.
*/
export class RobotArm extends Model {

    constructor(shoulderLength, elbowLength, wristLength, fingerLength) {
        super();

        this.shoulderRotation = 0.0;
        this.elbowRotation = 0.0;
        this.wristRotation = 0.0;
        this.fingerRotation = 0.0;

        this.elbow = new Model();
        this.wrist = new Model();
        this.finger = new Model();

        this.shoulderLength = shoulderLength;
        this.elbowLength = elbowLength;
        this.wristLength = wristLength;
        this.fingerLength = fingerLength;

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

        this.updateMatrices();
    }

    updateMatrices() {
        // Set the nested matrices for the sub models.
        this.nestedMatrix = Matrix.rotateZ(this.shoulderRotation)
                    .timesMatrix(Matrix.scale(this.shoulderLength,
                                              this.shoulderLength,
                                              1));

        this.elbow.nestedMatrix = Matrix.translate(1, 0, 0)
                    .timesMatrix(Matrix.rotateZ(this.elbowRotation))
                    .timesMatrix(Matrix.scale(this.elbowLength/this.shoulderLength,
                                              this.elbowLength/this.shoulderLength,
                                              1));

        this.wrist.nestedMatrix = Matrix.translate(1, 0, 0)
                    .timesMatrix(Matrix.rotateZ(this.wristRotation))
                    .timesMatrix(Matrix.scale(this.wristLength/this.elbowLength,
                                              this.wristLength/this.elbowLength,
                                              1));

        this.finger.nestedMatrix = Matrix.translate(1, 0, 0)
                    .timesMatrix(Matrix.rotateZ(this.fingerRotation))
                    .timesMatrix(Matrix.scale(this.fingerLength/this.wristLength,
                                              this.fingerLength/this.wristLength,
                                              1));
    }
}