import { Color } from "../../color/Color.js";
import { FrameBuffer } from "../../framebuffer/FrameBuffer.js";
import { Rasterize } from "../../pipeline/Rasterize.js";
import { LineSegment } from "../../scene/LineSegment.js";
import { Matrix } from "../../scene/Matrix.js";
import { Model } from "../../scene/Model.js";
import { ModelShading } from "../../scene/ModelShading.js";
import { Position } from "../../scene/Position.js";
import { Pipeline } from "../../pipeline/Pipeline.js";
import { Scene } from "../../scene/Scene.js";
import { Vertex } from "../../scene/Vertex.js";

/**
   Draw an interactive robot arm with shoulder, elbow, wrist, and finger joints.
<p>
   The tree for this scene is shown below.
<p>
   Remember that every position node in the tree contains a matrix,
   a model and a list of nested positions. The model may be empty,
   and the list of nested positions may also be empty, but the matrix
   cannot be "empty" (if you don't give it a value, then it is the
   identity matrix, I).
<p>
<pre>{@code
          Scene
         /     \
        /       \
  Camera   List<Position>
               |
               |
            Position
            /  |    \
           /   |     \
     Matrix  Model   List<Position>
       R    shoulder       |
                           |
                       Position
                       /   |   \
                      /    |    \
                 Matrix  Model   List<Position>
                  TR     elbow         |
                                       |
                                    Position
                                    /  |   \
                                   /   |    \
                             Matrix  Model   List<Position>
                              TR     wrist         |
                                                   |
                                                Position
                                                /  |   \
                                               /   |    \
                                         Matrix  Model   List<Position>
                                          TR     finger         |
                                                              empty
</pre>
*/

const resizer = document.getElementById("resizer");
const ctx = document.getElementById("pixels").getContext("2d");
var fb = new FrameBuffer(undefined, resizer.offsetWidth, resizer.offsetHeight);

var shoulderRotation = 0.0;
var elbowRotation = 0.0;
var wristRotation = 0.0;
var fingerRotation = 0.0;

var shoulderLength = 0.4;
var elbowLength = 0.3;
var wristLength = 0.2;
var fingerLength = 0.1;

var scene;
var shoulder;
var elbow;
var wrist;
var finger;

var scene = new Scene();
scene.camera.projOrthoReset();

// Create a Position object that will hold the robot arm.
const arm_p = new Position();

// Add the Position object to the scene.
scene.addPosition([arm_p]);

// Push the position away from where the camera is.
arm_p.matrix = Matrix.translate(0, 0, -1);

/*
	Be sure to draw a picture of the (simple) tree that this code creates.
*/
shoulder = new Model();
shoulder.addVertex([new Vertex(0, 0, 0)]);
shoulder.addVertex([new Vertex(shoulderLength, 0, 0)]);
shoulder.addLineSegment([new LineSegment(0, 1)]);
// Add the shoulder Model to the Scene's Position.
arm_p.model = shoulder;

elbow = new Model();
elbow.addVertex([new Vertex(0, 0, 0)]);
elbow.addVertex([new Vertex(elbowLength, 0, 0)]);
elbow.addLineSegment([new LineSegment(0, 1)]);
shoulder.nestedModels.push( elbow );

wrist = new Model();
wrist.addVertex([new Vertex(0, 0, 0)]);
wrist.addVertex([new Vertex(wristLength, 0, 0)]);
wrist.addLineSegment([new LineSegment(0, 1)]);
elbow.nestedModels.push( wrist );

finger = new Model();
finger.addVertex([new Vertex(0, 0, 0)]);
finger.addVertex([new Vertex(fingerLength, 0, 0)]);
finger.addLineSegment([new LineSegment(0, 1)]);
wrist.nestedModels.push( finger );

// Initialize the nested matrices for the sub models.
elbow.nestedMatrix  = Matrix.translate(shoulderLength, 0, 0);
wrist.nestedMatrix  = Matrix.translate(elbowLength,    0, 0);
finger.nestedMatrix = Matrix.translate(wristLength,    0, 0);

ModelShading.setColor(shoulder, Color.Blue);

print_help_message();
display(true);

/**
 * Render the FrameBuffer and display it on the canvas.
 * @param {boolean} b Whether to reuse the current FrameBuffer object or not.
 */
function display(b){
	if (ctx == null) {
		console.log("cn.getContext(2d) is null");
		return;
	}
    if (b){
        fb.clearFB();
    } else {
        const w = resizer.offsetWidth;
        const h = resizer.offsetHeight;
        ctx.canvas.width = w;
        ctx.canvas.height = h;
        fb = new FrameBuffer(undefined, w, h);
    }
	Pipeline.render(scene, fb.vp);

	ctx.putImageData(new ImageData(fb.pixel_buffer,fb.width, fb.height), fb.vp.vp_ul_x, fb.vp.vp_ul_y);
}

function keyPressed(e){
	const c = e.key;
	if ('h' == c) {
		print_help_message();
		return;
	}
	else if ('D' == c) {
		Rasterize.debug = ! Rasterize.debug;
	}
	else if ('a' == c) {
		Rasterize.doAntialiasing = ! Rasterize.doAntialiasing;
		console.log("Anti-aliasing is turned " + (Rasterize.doAntialiasing ? "On" : "Off"));
	}
	else if ('g' == c) {
		Rasterize.doGamma = ! Rasterize.doGamma;
		console.log("Gamma correction is turned " + (Rasterize.doGamma ? "On" : "Off"));
	}
	else if ('c' == c) {
		// Change the solid random color of the robot arm.
		ModelShading.setRandomColor(shoulder);
	}
	else if ('C' == c) {
		// Change the solid random color of each segment of the robot arm.
		ModelShading.setRandomColor(shoulder);
		ModelShading.setRandomColor(elbow);
		ModelShading.setRandomColor(wrist);
		ModelShading.setRandomColor(finger);
	}
	else if ('r' == c) {
		// Change the random color at each end of each segment of the robot arm.
		ModelShading.setRainbowLineSegmentColors(shoulder);
	}
	else if ('R' == c) {
		// Change the random color at each vertex of the robot arm.
		const c1 = ModelShading.randomColor();
		const c2 = ModelShading.randomColor();
		const c3 = ModelShading.randomColor();
		const c4 = ModelShading.randomColor();
		const c5 = ModelShading.randomColor();
		shoulder.colorList = [c1, c2];
		   elbow.colorList = [c2, c3];
		   wrist.colorList = [c3, c4];
		  finger.colorList = [c4, c5];
		shoulder.lineSegmentList[0].setColors(0, 1);
		   elbow.lineSegmentList[0].setColors(0, 1);
		   wrist.lineSegmentList[0].setColors(0, 1);
		  finger.lineSegmentList[0].setColors(0, 1);
	}
	else if ('=' == c) {
		shoulderRotation = 0.0;
		   elbowRotation = 0.0;
		   wristRotation = 0.0;
		  fingerRotation = 0.0;

		shoulderLength = 0.4;
           elbowLength = 0.3;
           wristLength = 0.2;
          fingerLength = 0.1;
	}
	else if ('s' == c) {
		shoulderRotation += 2.0;
	}
	else if ('S' == c) {
		shoulderRotation -= 2.0;
	}
	else if ('e' == c) {
		elbowRotation += 2.0;
	}
	else if ('E' == c) {
		elbowRotation -= 2.0;
	}
	else if ('w' == c) {
		wristRotation += 2.0;
	}
	else if ('W' == c) {
		wristRotation -= 2.0;
	}
	else if ('f' == c) {
		fingerRotation += 2.0;
	}
	else if ('F' == c) {
		fingerRotation -= 2.0;
	}

	// Set the nested matrices for the sub models.
	shoulder.nestedMatrix = Matrix.rotateZ(shoulderRotation);

	elbow.nestedMatrix = Matrix.translate(shoulderLength, 0, 0)
						.timesMatrix(Matrix.rotateZ(elbowRotation));

	wrist.nestedMatrix = Matrix.translate(elbowLength, 0, 0)
						.timesMatrix(Matrix.rotateZ(wristRotation));

	finger.nestedMatrix = Matrix.translate(wristLength, 0, 0)
						 .timesMatrix(Matrix.rotateZ(fingerRotation));

	// Render again.
    display(true);
}

function print_help_message()
{
    console.log("Use the 'a' key to toggle antialiasing on and off.");
    console.log("Use the 'g' key to toggle gamma correction on and off.");
    console.log("Use the 'c' key to change the random solid arm color.");
    console.log("Use the 'C' key to randomly change arm segment colors.");
    console.log("Use the 'r' key to randomly change arm segment end colors.");
    console.log("Use the 'R' key to randomly change arm hinge colors.");
    console.log("Use the s/S keys to rotate the arm at the shoulder.");
    console.log("Use the e/E keys to rotate the arm at the elbow.");
    console.log("Use the w/W keys to rotate the arm at the wrist.");
    console.log("Use the f/F keys to rotate the arm at the finger.");
    console.log("Use the '=' key to reset the robot arm.");
    console.log("Use the 'h' key to redisplay this help message.");
}

document.addEventListener("keypress", keyPressed);
var resizeObserver = new ResizeObserver(function () { display(false); });
resizeObserver.observe(document.getElementById("resizer"));