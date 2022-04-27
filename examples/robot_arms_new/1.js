import { Color } from "../../color/Color.js";
import { FrameBuffer } from "../../framebuffer/FrameBuffer.js";
import { Matrix } from "../../scene/Matrix.js";
import { ModelShading } from "../../scene/ModelShading.js";
import { Position } from "../../scene/Position.js";
import { Pipeline } from "../../pipeline/Pipeline.js";
import { Scene } from "../../scene/Scene.js";
import { RobotArm } from "./RobotArm.js";
import { Rasterize } from "../../pipeline/Rasterize.js";
import { Clip } from "../../pipeline/Clip.js";

/**
   	Draw two interactive robot arms with shoulder, elbow, wrist, and finger joints.
*/
const resizer = document.getElementById("resizer");
const ctx = document.getElementById("pixels").getContext("2d");
var fb = new FrameBuffer(undefined, resizer.offsetWidth, resizer.offsetHeight);

var xTranslation = [0.0,  0.0];
var yTranslation = [0.5, -0.5];

var rotate = true;
var arm = [];
var currentArm = 0;

// Create the Scene object that we shall render.
var scene = new Scene();
scene.camera.projOrthoReset();

// Create robot arm models.
arm[0] = new RobotArm(0.4, 0.3, 0.2, 0.1);
arm[1] = new RobotArm(0.4, 0.3, 0.2, 0.1);

ModelShading.setColor(arm[0], Color.Blue);
ModelShading.setColor(arm[1], Color.Red);

// Create a Position object for each robot arm.
scene.addPosition([new Position(arm[0]),
				   new Position(arm[1])]);

// Push the positions away from where the camera is.
scene.getPosition(0).matrix = Matrix.translate(xTranslation[0],
												yTranslation[0],
												-1);
scene.getPosition(1).matrix = Matrix.translate(xTranslation[1],
												yTranslation[1],
												-1);

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
	else if ('/' == c) {
		currentArm = (currentArm + 1) % 2;
	}
	else if('d' == c) {
		Pipeline.debug = ! Pipeline.debug;
		Clip.debug = ! Clip.debug;
		console.log("Debugging is turned " + (Pipeline.debug? "On" : "Off"));
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
		// Change the solid random color of the robot arms.
		ModelShading.setRandomColor(arm[currentArm]);
	}
	else if ('C' == c) {
		// Change the solid random color of each segment of the robot arms.
		ModelShading.setRandomColor(arm[currentArm]);
		ModelShading.setRandomColor(arm[currentArm].elbow);
		ModelShading.setRandomColor(arm[currentArm].wrist);
		ModelShading.setRandomColor(arm[currentArm].finger);
	}
	else if ('r' == c) {
		// Change the random color at each end of each segment of the robot arms.
		ModelShading.setRainbowLineSegmentColors(arm[currentArm]);
	}
	else if ('R' == c) {
		// Change the random color at each vertex of the robot arm.
		const c1 = ModelShading.randomColor();
		const c2 = ModelShading.randomColor();
		const c3 = ModelShading.randomColor();
		const c4 = ModelShading.randomColor();
		const c5 = ModelShading.randomColor();
		arm[currentArm].colorList        = [c1, c2];
		arm[currentArm].elbow.colorList  = [c2, c3];
		arm[currentArm].wrist.colorList  = [c3, c4];
		arm[currentArm].finger.colorList = [c4, c5];
		arm[currentArm].lineSegmentList[0].setColors(0, 1);
		arm[currentArm].elbow.lineSegmentList[0].setColors(0, 1);
		arm[currentArm].wrist.lineSegmentList[0].setColors(0, 1);
		arm[currentArm].finger.lineSegmentList[0].setColors(0, 1);
	}
	else if ('=' == c) {
		xTranslation[currentArm] = 0.0;
		if (0 == currentArm)
		   yTranslation[0] = 0.5;
		else
		   yTranslation[1] = -0.5;

		arm[currentArm].shoulderRotation = 0.0;
		   arm[currentArm].elbowRotation = 0.0;
		   arm[currentArm].wristRotation = 0.0;
		  arm[currentArm].fingerRotation = 0.0;

		  arm[currentArm].shoulderLength = 0.4;
			 arm[currentArm].elbowLength = 0.3;
			 arm[currentArm].wristLength = 0.2;
			arm[currentArm].fingerLength = 0.1;
	}
	else if ('x' == c) {
	   xTranslation[currentArm] += 0.02;
	}
	else if ('X' == c) {
	   xTranslation[currentArm] -= 0.02;
	}
	else if ('y' == c) {
	   yTranslation[currentArm] += 0.02;
	}
	else if ('Y' == c) {
	   yTranslation[currentArm] -= 0.02;
	}
	else if (rotate) {
		if ('s' == c) {
		   arm[currentArm].shoulderRotation += 2.0;
		}
		else if ('S' == c) {
		   arm[currentArm].shoulderRotation -= 2.0;
		}
		else if ('e' == c) {
		   arm[currentArm].elbowRotation += 2.0;
		}
		else if ('E' == c) {
		   arm[currentArm].elbowRotation -= 2.0;
		}
		else if ('w' == c) {
		   arm[currentArm].wristRotation += 2.0;
		}
		else if ('W' == c) {
		   arm[currentArm].wristRotation -= 2.0;
		}
		else if ('f' == c) {
		   arm[currentArm].fingerRotation += 2.0;
		}
		else if ('F' == c) {
		   arm[currentArm].fingerRotation -= 2.0;
		}
	} else if (!rotate) {
		if ('s' == c) {
		   arm[currentArm].shoulderLength += .02;
		}
		else if ('S' == c) {
		   arm[currentArm].shoulderLength -= .02;
		}
		else if ('e' == c) {
		   arm[currentArm].elbowLength += .02;
		}
		else if ('E' == c) {
		   arm[currentArm].elbowLength -= .02;
		}
		else if ('w' == c) {
		   arm[currentArm].wristLength += .02;
		}
		else if ('W' == c) {
		   arm[currentArm].wristLength -= .02;
		}
		else if ('f' == c) {
		   arm[currentArm].fingerLength += .02;
		}
		else if ('F' == c) {
		   arm[currentArm].fingerLength -= .02;
		}
	}

      // Translate the arm using the Position object.
      scene.getPosition(currentArm).matrix = Matrix.translate(
                                                xTranslation[currentArm],
                                                yTranslation[currentArm],
                                                -1);
      // Set the nested matrices for the sub models of the arm.
      arm[currentArm].updateMatrices();

	// Render again.
    display(true);
}

function print_help_message()
{
	console.log("Use the 'd' key to toggle debugging information on and off.");
    console.log("Use the 'a' key to toggle antialiasing on and off.");
    console.log("Use the 'g' key to toggle gamma correction on and off.");
    console.log("Use the 'c' key to change the random solid arm color.");
    console.log("Use the 'C' key to randomly change arm segment colors.");
    console.log("Use the 'r' key to randomly change arm segment end colors.");
    console.log("Use the 'R' key to randomly change arm hinge colors.");
	if (rotate){
		console.log("Use the s/S keys to rotate the arm at the shoulder.");
		console.log("Use the e/E keys to rotate the arm at the elbow.");
		console.log("Use the w/W keys to rotate the arm at the wrist.");
		console.log("Use the f/F keys to rotate the arm at the finger.");
	} else {
		console.log("Use the s/S keys to extend the length of the arm at the shoulder.");
		console.log("Use the e/E keys to extend the length of the arm at the elbow.");
		console.log("Use the w/W keys to extend the length of the arm at the wrist.");
		console.log("Use the f/F keys to extend the length of the arm at the finger.");
	}
	console.log("Use the x/X keys to translate the arm along the x-axis.");
	console.log("Use the y/Y keys to translate the arm along the y-axis.");
    console.log("Use the '=' key to reset the robot arm.");
    console.log("Use the 'h' key to redisplay this help message.");
}

var rotateElement = document.getElementById("rotate");
rotateElement.onclick = function () {
	rotate = ! rotate;
	rotateElement.innerText = (rotate ? "Rotate" : "Lengthen");
	document.getElementById("rotateHelp").style.display = rotate ? "block" : "none";
	document.getElementById("lengthenHelp").style.display = rotate ? "none"  : "block";
}
document.addEventListener("keypress", keyPressed);
var resizeObserver = new ResizeObserver(function () { display(false); });
resizeObserver.observe(document.getElementById("resizer"));