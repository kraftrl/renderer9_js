import { Color } from "../../color/Color.js";
import { FrameBuffer } from "../../framebuffer/FrameBuffer.js";
import { Matrix } from "../../scene/Matrix.js";
import { ModelShading } from "../../scene/ModelShading.js";
import { Position } from "../../scene/Position.js";
import { Pipeline } from "../../pipeline/Pipeline.js";
import { Scene } from "../../scene/Scene.js";
import { Arm } from "./Arm.js";

/**
   Draw two interactive robot arms with
   shoulder, elbow, wrist, and finger joints.
<p>
   Here is a simplified version of this program's scene graph.
<p>
<pre>{@code
                        Scene
                        /   \
                /------/     \------\
               /                     \
        Position                     Position
        / | \                         / |   \
       /  |  \                       /  |    \
 Matrix   |   \                Matrix   |     \
  TRS    /  Position            TRS    /   Position
        /     / |  \                  /     / |  \
       /     /  |   \                /     /  |   \
      / Matrix  |    \              / Matrix  |    \
     /   TRS   /    Position       |   TRS   /    Position
     \        /      / |  \        |        /      / |  \
      \      /      /  |   \       |       /      /  |   \
       \    /  Matrix  |    \      |      /  Matrix  |    \
        \   \   TRS   /   Position |      |   TRS   /   Position
         \   \       /      /  |   |      |        /      /   /
          \   \     /      /   |   |      |       /      /   /
           \   \   /  Matrix   |   |     /       /  Matrix  /
            \   \  \   TRS     |   |    /       /    TRS   /
             \   \  \          |   |   /       /          /
              \   \  \------\  |   |  /       /          /
               \   \---------\ |   | /-------/          /
                \-------------\|   |/------------------/
                               Model
                             armSegment
</pre>
*/

const resizer = document.getElementById("resizer");
const ctx = document.getElementById("pixels").getContext("2d");
var fb = new FrameBuffer(undefined, resizer.offsetWidth, resizer.offsetHeight);

var xTranslation1 = 0.0;
var yTranslation1 = 0.5;
var xTranslation2 = 0.0;
var yTranslation2 = -0.5;

var rotate = true;
var shoulderRotation1 = 0.0;
var shoulderRotation2 = 0.0;
var elbowRotation1 = 0.0;
var elbowRotation2 = 0.0;
var wristRotation1 = 0.0;
var wristRotation2 = 0.0;
var fingerRotation1 = 0.0;
var fingerRotation2 = 0.0;

var shoulderLength1 = 0.4;
var shoulderLength2 = 0.4;
var elbowLength1 = 0.3;
var elbowLength2 = 0.3;
var wristLength1 = 0.2;
var wristLength2 = 0.2;
var fingerLength1 = 0.1;
var fingerLength2 = 0.1;

// Create the Scene object that we shall render.
var scene = new Scene();
scene.camera.projOrthoReset();

// Create two Position objects that will each hold a robot arm.
const arm1_p = new Position();
const arm2_p = new Position();

// Add the Position objects to the scene.
scene.addPosition([arm1_p, arm2_p]);

// Push the positions away from where the camera is.
arm1_p.matrix = Matrix.translate(xTranslation1, yTranslation1, -1);
arm2_p.matrix = Matrix.translate(xTranslation2, yTranslation2, -1);

// Create two robot arms.
const arm1 = new Arm();
const arm2 = new Arm();
ModelShading.setColor(arm1, Color.Blue);
ModelShading.setColor(arm2, Color.Red);
// Add the arms to the scene's positions.
arm1_p.model = arm1;
arm2_p.model = arm2;

// Initialize the nested matrices for the sub models of arm1.
arm1.nestedMatrix = Matrix.scale(shoulderLength1,
								 shoulderLength1,
								 1);
arm1.elbow.nestedMatrix = Matrix.translate(1, 0, 0)
						.timesMatrix(Matrix.scale(elbowLength1/shoulderLength1,
												  elbowLength1/shoulderLength1,
												  1));
arm1.wrist.nestedMatrix = Matrix.translate(1, 0, 0)
						.timesMatrix(Matrix.scale(wristLength1/elbowLength1,
												  wristLength1/elbowLength1,
												  1));
arm1.finger.nestedMatrix = Matrix.translate(1, 0, 0)
						.timesMatrix(Matrix.scale(fingerLength1/wristLength1,
												  fingerLength1/wristLength1,
												  1));

// Initialize the nested matrices for the sub models of arm2.
arm2.nestedMatrix = Matrix.scale(shoulderLength2,
								 shoulderLength2,
								 1);
arm2.elbow.nestedMatrix = Matrix.translate(1, 0, 0)
						.timesMatrix(Matrix.scale(elbowLength2/shoulderLength2,
												  elbowLength2/shoulderLength2,
												  1));
arm2.wrist.nestedMatrix = Matrix.translate(1, 0, 0)
						.timesMatrix(Matrix.scale(wristLength2/elbowLength2,
												  wristLength2/elbowLength2,
												  1));
arm2.finger.nestedMatrix = Matrix.translate(1, 0, 0)
						.timesMatrix(Matrix.scale(fingerLength2/wristLength2,
												  fingerLength2/wristLength2,
												  1));

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
	// else if ('a' == c) {
	// 	Rasterize.doAntialiasing = ! Rasterize.doAntialiasing;
	// 	console.log("Anti-aliasing is turned " + (Rasterize.doAntialiasing ? "On" : "Off"));
	// }
	// else if ('g' == c) {
	// 	Rasterize.doGamma = ! Rasterize.doGamma;
	// 	console.log("Gamma correction is turned " + (Rasterize.doGamma ? "On" : "Off"));
	// }
	else if ('c' == c) {
		// Change the solid random color of the robot arm.
		ModelShading.setRandomColor(arm1);
		ModelShading.setRandomColor(arm2);
	}
	else if ('C' == c) {
		// Change the solid random color of each segment of the robot arm.
         ModelShading.setRandomColor(arm1);
         ModelShading.setRandomColor(arm1.elbow);
         ModelShading.setRandomColor(arm1.wrist);
         ModelShading.setRandomColor(arm1.finger);
         ModelShading.setRandomColor(arm2);
         ModelShading.setRandomColor(arm2.elbow);
         ModelShading.setRandomColor(arm2.wrist);
         ModelShading.setRandomColor(arm2.finger);
	}
	else if ('r' == c) {
		// Change the random color at each end of each segment of the robot arm.
         ModelShading.setRainbowLineSegmentColors(arm1);
         ModelShading.setRainbowLineSegmentColors(arm2);
	}
	else if ('R' == c) {
		// Change the random color at each vertex of the robot arm.
		var c1 = ModelShading.randomColor();
		var c2 = ModelShading.randomColor();
		var c3 = ModelShading.randomColor();
		var c4 = ModelShading.randomColor();
		var c5 = ModelShading.randomColor();
			   arm1.colorList = [c1, c2];
		 arm1.elbow.colorList = [c2, c3];
		 arm1.wrist.colorList = [c3, c4];
		arm1.finger.colorList = [c4, c5];
			   arm1.lineSegmentList[0].setColors(0, 1);
		 arm1.elbow.lineSegmentList[0].setColors(0, 1);
		 arm1.wrist.lineSegmentList[0].setColors(0, 1);
		arm1.finger.lineSegmentList[0].setColors(0, 1);
		
		c1 = ModelShading.randomColor();
		c2 = ModelShading.randomColor();
		c3 = ModelShading.randomColor();
		c4 = ModelShading.randomColor();
		c5 = ModelShading.randomColor();
			   arm2.colorList = [c1, c2];
		 arm2.elbow.colorList = [c2, c3];
		 arm2.wrist.colorList = [c3, c4];
		arm2.finger.colorList = [c4, c5];
			   arm2.lineSegmentList[0].setColors(0, 1);
		 arm2.elbow.lineSegmentList[0].setColors(0, 1);
		 arm2.wrist.lineSegmentList[0].setColors(0, 1);
		arm2.finger.lineSegmentList[0].setColors(0, 1);
	}
	else if ('=' == c) {
		xTranslation1 =  0.0;
		yTranslation1 =  0.5;
		xTranslation2 =  0.0;
		yTranslation2 = -0.5;

	   shoulderRotation1 = 0.0;
	   shoulderRotation2 = 0.0;
		  elbowRotation1 = 0.0;
		  elbowRotation2 = 0.0;
		  wristRotation1 = 0.0;
		  wristRotation2 = 0.0;
		 fingerRotation1 = 0.0;
		 fingerRotation2 = 0.0;

		 shoulderLength1 = 0.4;
		 shoulderLength2 = 0.4;
			elbowLength1 = 0.3;
			elbowLength2 = 0.3;
			wristLength1 = 0.2;
			wristLength2 = 0.2;
		   fingerLength1 = 0.1;
		   fingerLength2 = 0.1;
	}
	else if ('x' == c) {
	   xTranslation1 += 0.02;
	}
	else if ('X' == c) {
	   xTranslation1 -= 0.02;
	}
	else if ('y' == c) {
	   yTranslation1 += 0.02;
	}
	else if ('Y' == c) {
	   yTranslation1 -= 0.02;
	}
	else if ('u' == c) {
	   xTranslation2 += 0.02;
	}
	else if ('U' == c) {
	   xTranslation2 -= 0.02;
	}
	else if ('v' == c) {
	   yTranslation2 += 0.02;
	}
	else if ('V' == c) {
	   yTranslation2 -= 0.02;
	}
	else if (rotate) {
		if ('s' == c) {
			shoulderRotation1 += 2.0;
		}
		else if ('S' == c) {
			shoulderRotation1 -= 2.0;
		}
		else if ('e' == c) {
			elbowRotation1 += 2.0;
		}
		else if ('E' == c) {
			elbowRotation1 -= 2.0;
		}
		else if ('w' == c) {
			wristRotation1 += 2.0;
		}
		else if ('W' == c) {
			wristRotation1 -= 2.0;
		}
		else if ('f' == c) {
			fingerRotation1 += 2.0;
		}
		else if ('F' == c) {
			fingerRotation1 -= 2.0;
		}
		else if ('a' == c) {
			shoulderRotation2 += 2.0;
		}
		else if ('A' == c) {
			shoulderRotation2 -= 2.0;
		}
		else if ('q' == c) {
			elbowRotation2 += 2.0;
		}
		else if ('Q' == c) {
			elbowRotation2 -= 2.0;
		}
		else if ('z' == c) {
			wristRotation2 += 2.0;
		}
		else if ('Z' == c) {
			wristRotation2 -= 2.0;
		}
		else if ('d' == c) {
			fingerRotation2 += 2.0;
		}
		else if ('D' == c) {
			fingerRotation2 -= 2.0;
		}
	} else if (!rotate) {
		if ('s' == c) {
			shoulderLength1 += 0.02;
		}
		else if ('S' == c) {
			shoulderLength1 -= 0.02;
		}
		else if ('e' == c) {
			elbowLength1 += 0.02;
		}
		else if ('E' == c) {
			elbowLength1 -= 0.02;
		}
		else if ('w' == c) {
			wristLength1 += 0.02;
		}
		else if ('W' == c) {
			wristLength1 -= 0.02;
		}
		else if ('f' == c) {
			fingerLength1 += 0.02;
		}
		else if ('F' == c) {
			fingerLength1 -= 0.02;
		}
		else if ('a' == c) {
			shoulderLength2 += 0.02;
		}
		else if ('A' == c) {
			shoulderLength2 -= 0.02;
		}
		else if ('d' == c) {
			elbowLength2 += 0.02;
		}
		else if ('D' == c) {
			elbowLength2 -= 0.02;
		}
		else if ('z' == c) {
			wristLength2 += 0.02;
		}
		else if ('Z' == c) {
			wristLength2 -= 0.02;
		}
		else if ('d' == c) {
			fingerLength2 += 0.02;
		}
		else if ('D' == c) {
			fingerLength2 -= 0.02;
		}
	}

	// Push the positions away from where the camera is.
	arm1_p.matrix = Matrix.translate(xTranslation1, yTranslation1, -1);
	arm2_p.matrix = Matrix.translate(xTranslation2, yTranslation2, -1);

	// Set the nested matrices for the sub models of arm1.
	arm1.nestedMatrix = Matrix.rotateZ(shoulderRotation1)
					   .timesMatrix(Matrix.scale(shoulderLength1,
										    	 shoulderLength1,
										    	 1));

	arm1.elbow.nestedMatrix = Matrix.translate(1, 0, 0)
							 .timesMatrix(Matrix.rotateZ(elbowRotation1))
							 .timesMatrix(Matrix.scale(elbowLength1/shoulderLength1,
													   elbowLength1/shoulderLength1,
													   1));

	arm1.wrist.nestedMatrix = Matrix.translate(1, 0, 0)
							 .timesMatrix(Matrix.rotateZ(wristRotation1))
							 .timesMatrix(Matrix.scale(wristLength1/elbowLength1,
													   wristLength1/elbowLength1,
													   1));

	arm1.finger.nestedMatrix = Matrix.translate(1, 0, 0)
							  .timesMatrix(Matrix.rotateZ(fingerRotation1))
							  .timesMatrix(Matrix.scale(fingerLength1/wristLength1,
													    fingerLength1/wristLength1,
													    1));

	// Set the nested matrices for the sub models of arm2.
	arm2.nestedMatrix = Matrix.rotateZ(shoulderRotation2)
					   .timesMatrix(Matrix.scale(shoulderLength2,
										  		 shoulderLength2,
										  		 1));

	arm2.elbow.nestedMatrix = Matrix.translate(1, 0, 0)
							 .timesMatrix(Matrix.rotateZ(elbowRotation2))
							 .timesMatrix(Matrix.scale(elbowLength2/shoulderLength2,
													   elbowLength2/shoulderLength2,
													   1));

	arm2.wrist.nestedMatrix = Matrix.translate(1, 0, 0)
							 .timesMatrix(Matrix.rotateZ(wristRotation2))
							 .timesMatrix(Matrix.scale(wristLength2/elbowLength2,
													   wristLength2/elbowLength2,
													   1));

	arm2.finger.nestedMatrix = Matrix.translate(1, 0, 0)
							  .timesMatrix(Matrix.rotateZ(fingerRotation2))
							  .timesMatrix(Matrix.scale(fingerLength2/wristLength2,
													    fingerLength2/wristLength2,
													    1));

	// Render again.
    display(true);
}

function print_help_message()
{
    // console.log("Use the 'a' key to toggle antialiasing on and off.");
    // console.log("Use the 'g' key to toggle gamma correction on and off.");
    console.log("Use the 'c' key to change the random solid arm color.");
    console.log("Use the 'C' key to randomly change arm segment colors.");
    console.log("Use the 'r' key to randomly change arm segment end colors.");
    console.log("Use the 'R' key to randomly change arm hinge colors.");
	if (rotate){
		console.log("Use the s/S keys to rotate arm 1 at its shoulder.");
		console.log("Use the e/E keys to rotate arm 1 at its elbow.");
		console.log("Use the w/W keys to rotate arm 1 at its wrist.");
		console.log("Use the f/F keys to rotate arm 1 at its finger.");
		console.log("Use the a/A keys to rotate arm 2 at its shoulder.");
		console.log("Use the q/Q keys to rotate arm 2 at its elbow.");
		console.log("Use the z/Z keys to rotate arm 2 at its wrist.");
		console.log("Use the d/D keys to rotate arm 2 at its finger.");
	} else {
		console.log("Use the s/S keys to extend the length of arm 1 at its shoulder.");
		console.log("Use the e/E keys to extend the length of arm 1 at its elbow.");
		console.log("Use the w/W keys to extend the length of arm 1 at its wrist.");
		console.log("Use the f/F keys to extend the length of arm 1 at its finger.");
		console.log("Use the a/A keys to extend the length of arm 2 at its shoulder.");
		console.log("Use the q/Q keys to extend the length of arm 2 at its elbow.");
		console.log("Use the z/Z keys to extend the length of arm 2 at its wrist.");
		console.log("Use the d/D keys to extend the length of arm 2 at its finger.");
	}
	console.log("Use the x/X keys to translate arm 1 along the x-axis.");
	console.log("Use the y/Y keys to translate arm 1 along the y-axis.");
	console.log("Use the u/U keys to translate arm 2 along the x-axis.");
	console.log("Use the v/V keys to translate arm 2 along the y-axis.");
    console.log("Use the '=' key to reset the robot arm.");
    console.log("Use the 'h' key to redisplay this help message.");
}

var rotateElement = document.getElementById("rotate");
rotateElement.onclick = function () {
	rotate = ! rotate;
	rotateElement.innerText = (rotate ? "Rotate" : "Lengthen");
	document.getElementById("rotateHelp").style.display = rotate ? "block" : "none";
	document.getElementById("lengthenHelp").style.display = rotate ? "none" : "block";
}
document.addEventListener("keypress", keyPressed);
var resizeObserver = new ResizeObserver(function () { display(false); });
resizeObserver.observe(document.getElementById("resizer"));