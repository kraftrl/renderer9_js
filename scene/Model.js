import { Vertex } from './Vertex.js';
import { LineSegment } from './LineSegment.js';
import { Matrix } from './Matrix.js';

/**
   A {@code Model} data structure represents a distinct geometric object
   in a {@link Scene}. A {@code Model} data structure is mainly a {@link List}
   of {@link Vertex} objects, a list of {@link LineSegment} objects, and a
   list of {@link Color} objects. Each {@link LineSegment} object contains
   four integers that are the indices of two {@link Vertex} objects from the
   {@code Model}'s vertex list and two {@link Color} objects from the
   {@code Model}'s color list. The two {@link Vertex} objects contain the
   coordinates, in the model's local coordinate system, for each of the line
   segment's two endpoints. The two {@link Color} objects contain the rgb
   values for each of the line segment's two endpoints.
<p>
   A {@code Model} represent the geometric object as a "wire-frame" of line
   segments, that is, the geometric object is drawn as a collection of "edges".
   This is a fairly simplistic way of doing 3D graphics and we will
   improve this in later renderers.
<p>
   See
<br> <a href="http://en.wikipedia.org/wiki/Wire-frame_model" target="_top">
              http://en.wikipedia.org/wiki/Wire-frame_model</a>
<br>or
<br> <a href="https://www.google.com/search?q=graphics+wireframe&tbm=isch" target="_top">
              https://www.google.com/search?q=graphics+wireframe&tbm=isch</a>
*/
export class Model {
    constructor(name, vertexList = [], lineSegmentList = [], colorList = [], visible = true, debug = false, nestedMatrix = Matrix.identity(), nestedModels = []) {
        this.name = name;
        this.vertexList = vertexList;
        this.lineSegmentList = lineSegmentList;
        this.colorList = colorList;
        this.visible = visible;
        this.debug = debug;
        this.nestedMatrix = nestedMatrix;
        this.nestedModels = nestedModels;
        // console.log(this.name);
    }

    deepCopy() {
        var model = new Model();
        model.name    = this.name;
        model.visible = this.visible;
        model.debug   = this.debug;
        for (var v of this.vertexList) {
            model.vertexList.push(new Vertex(v.x, v.y, v.z, v.w)); // deep copy of each Vertex
        }
        for (var ls of this.lineSegmentList) {
            model.lineSegmentList.push(new LineSegment(ls.vIndex[0], ls.vIndex[1], ls.cIndex[0], ls.cIndex[1])); // deep copy of each LineSgement
        }
        for (var c of this.colorList) {
            model.colorList.push(c); // Color objects are immutable
        }
        model.nestedMatrix = Matrix.build(this.nestedMatrix.v1, this.nestedMatrix.v2, this.nestedMatrix.v3, this.nestedMatrix.v4);
        for (var m of this.nestedModels) {
            model.nestedModels.push( m.deepCopy() ); // deep copy of each nested Model
        }
        return model;
    }

    /**
        Add a {@link Vertex} (or vertices) to this {@code Model}'s
        {@link List} of vertices.

        @param vArray  array of {@link Vertex} objects to add to this {@code Model}
    */
    addVertex(addVertList) {
        for (var v of addVertList) {
            this.vertexList.push(v);
        }
    }

    /**
        Add a {@link LineSegment} (or LineSegments) to this {@code Model}'s
        {@link List} of line segments.
        <p>
        NOTE: This method does not add any vertices to the {@code Model}'s
        {@link Vertex} list. This method assumes that the appropriate vertices
        have been added to the {@code Model}'s {@link Vertex} list.

        @param lsArray  array of {@link LineSegment} objects to add to this {@code Model}
    */
    addLineSegment(addLSList) {
        for (var ls of addLSList) {
            this.lineSegmentList.push(ls);
        }
    }

    /**
        Add color(s) to the color list. Must be Uint8ClampedArrays.
    */
    addColor() {
        for (var c of arguments) {
            this.colorList.push(c);
        }
    }

    /**
        Loads a 3D model from a JSON file over AJAX. See /assets/Cube.json to see how the JSON model is formatted.

        @param fileName  the path of the file to load the 3D model from
    */
    static loadFromJSON(fileName) {
        var xhttp = new XMLHttpRequest();
        var data = {};
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                data = JSON.parse(xhttp.responseText);
            }
            else {
                return null;
            }
        };
        xhttp.open("GET", fileName, false);
        xhttp.send();
    
        var newVertexList = [];
        for (var v of data.vertexList) {
            newVertexList.push(new Vertex(v[0], v[1], v[2]));
        }

        var newLineSegmentList = [];
        for (var ls of data.lineSegmentList) {
            newLineSegmentList.push(new LineSegment(ls[0], ls[1]));
        }

        return new Model(data.name, newVertexList, newLineSegmentList);

    }

}
