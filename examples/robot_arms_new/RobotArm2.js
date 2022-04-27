import { LineSegment } from "../../scene/LineSegment.js";
import { Matrix } from "../../scene/Matrix.js";
import { Model } from "../../scene/Model.js";
import { Vertex } from "../../scene/Vertex.js";

/**
     A robot arm model with one shoulder, two elbow,
    two wrist, and two finger joints.
*/
export class RobotArm2 extends Model {

    constructor(shoulderLength,
                elbowLength1,
                wristLength1,
                fingerLength1,
                elbowLength2,
                wristLength2,
                fingerLength2) {
        super();

        this.shoulderRotation = 0.0;
        this.elbowRotation1 = 0.0;
        this.elbowRotation2 = 0.0;
        this.wristRotation1 = 0.0;
        this.wristRotation2 = 0.0;
        this.fingerRotation1 = 0.0;
        this.fingerRotation2 = 0.0;

        this.elbow1 = new Model();
        this.elbow2 = new Model();
        this.wrist1 = new Model();
        this.wrist2 = new Model();
        this.finger1 = new Model();
        this.finger2 = new Model();

        this.shoulderLength = shoulderLength;
        this.elbowLength1 = elbowLength1;
        this.elbowLength2 = elbowLength2;
        this.wristLength1 = wristLength1;
        this.wristLength2 = wristLength2;
        this.fingerLength1 = fingerLength1;
        this.fingerLength2 = fingerLength2;

        /*
            Be sure to draw a picture of the (simple) tree that this code creates.
        */
        const v0 = new Vertex(0, 0, 0);
        const v1 = new Vertex(1, 0, 0);
        this.addVertex([v0, v1]);
        this.addLineSegment([new LineSegment(0, 1)]);

        this.elbow1.addVertex([v0, v1]);
        this.elbow1.addLineSegment([new LineSegment(0, 1)]);
        this.nestedModels.push( this.elbow1 );

        this.elbow2.addVertex([v0, v1]);
        this.elbow2.addLineSegment([new LineSegment(0, 1)]);
        this.nestedModels.push( this.elbow2 );

        this.wrist1.addVertex([v0, v1]);
        this.wrist1.addLineSegment([new LineSegment(0, 1)]);
        this.elbow1.nestedModels.push( this.wrist1 );

        this.wrist2.addVertex([v0, v1]);
        this.wrist2.addLineSegment([new LineSegment(0, 1)]);
        this.elbow2.nestedModels.push( this.wrist2 );

        this.finger1.addVertex([v0, v1]);
        this.finger1.addLineSegment([new LineSegment(0, 1)]);
        this.wrist1.nestedModels.push( this.finger1 );

        this.finger2.addVertex([v0, v1]);
        this.finger2.addLineSegment([new LineSegment(0, 1)]);
        this.wrist2.nestedModels.push( this.finger2 );

        this.updateMatrices();
    }

    updateMatrices() {
        // Set the nested matrices for the sub models.
        this.nestedMatrix = Matrix.rotateZ(this.shoulderRotation)
                    .timesMatrix(Matrix.scale(this.shoulderLength,
                                              this.shoulderLength,
                                              1));

        this.elbow1.nestedMatrix = Matrix.translate(1, 0, 0)
                    .timesMatrix(Matrix.rotateZ(this.elbowRotation1))
                    .timesMatrix(Matrix.scale(this.elbowLength1/this.shoulderLength,
                                              this.elbowLength1/this.shoulderLength,
                                              1));

        this.wrist1.nestedMatrix = Matrix.translate(1, 0, 0)
                    .timesMatrix(Matrix.rotateZ(this.wristRotation1))
                    .timesMatrix(Matrix.scale(this.wristLength1/this.elbowLength1,
                                              this.wristLength1/this.elbowLength1,
                                              1));

        this.finger1.nestedMatrix = Matrix.translate(1, 0, 0)
                    .timesMatrix(Matrix.rotateZ(this.fingerRotation1))
                    .timesMatrix(Matrix.scale(this.fingerLength1/this.wristLength1,
                                              this.fingerLength1/this.wristLength1,
                                              1));

        this.elbow2.nestedMatrix = Matrix.translate(1, 0, 0)
                    .timesMatrix(Matrix.rotateZ(this.elbowRotation2))
                    .timesMatrix(Matrix.scale(this.elbowLength2/this.shoulderLength,
                                              this.elbowLength2/this.shoulderLength,
                                              1));

        this.wrist2.nestedMatrix = Matrix.translate(1, 0, 0)
                    .timesMatrix(Matrix.rotateZ(this.wristRotation2))
                    .timesMatrix(Matrix.scale(this.wristLength2/this.elbowLength2,
                                              this.wristLength2/this.elbowLength2,
                                              1));

        this.finger2.nestedMatrix = Matrix.translate(1, 0, 0)
                    .timesMatrix(Matrix.rotateZ(this.fingerRotation2))
                    .timesMatrix(Matrix.scale(this.fingerLength2/this.wristLength2,
                                              this.fingerLength2/this.wristLength2,
                                              1));
    }
}