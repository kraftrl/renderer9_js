import { Vertex } from './../scene/Vertex.js';
import { Pipeline } from './Pipeline.js';

/**
   Clip a (projected) {@link LineSegment} that sticks out of the
   view rectangle in the image plane. Interpolate {@link Vertex}
   color from any clipped off {@code Vertex} to the new {@code Vertex}.
<p>
   This clipping algorithm is a simplification of the Liang-Barsky
   Parametric Line Clipping algorithm.
<p>
   This algorithm assumes that all {@code Vertex} objects have been
   projected onto the {@link renderer.scene.Camera}'s image plane,
   {@code z = -1}. This algorithm also assumes that the camera's view
   rectangle in the image plane is
   <pre>{@code
      -1 <= x <= +1  and
      -1 <= y <= +1.
   }</pre>
<p>
   If a line segment's projected vertex has an {@code x} or {@code y}
   coordinate with absolute value greater than 1, then that vertex
   "sticks out" of the view rectangle. This algorithm will clip the
   line segment so that both of the line segment's vertices are within
   the view rectangle.
<p>
   Here is an outline of the clipping algorithm.
<p>
   Recursively process each line segment, using the following steps.
<p>
     1) Test if the line segment no longer needs to be clipped, i.e.,
        both of its vertices are within the view rectangle. If this is
        the case, then return true.
        <pre>{@code
               x=-1        x=+1
                 |          |
                 |          |
             ----+----------+----- y = +1
                 |     v1   |
                 |    /     |
                 |   /      |
                 |  /       |
                 | v0       |
             ----+----------+----- y = -1
                 |          |
                 |          |
        }</pre>
<p>
     2) Test if the line segment should be "trivially rejected". A line
        segment is "trivially rejected" if it is on the wrong side of any
        of the four lines that bound the view rectangle (i.e., the four
        lines {@code x = 1}, {@code x = -1}, {@code y = 1}, {@code y = -1}).
        If so, then return {@code false} (so the line segment will not be
        rasterized into the framebuffer).
<p>
        Notice that a line like the following one is trivially rejected
        because it is on the "wrong" side of the line {@code x = 1}.
        <pre>{@code
                           x=1
                            |            v1
                            |            /
                 +----------+           /
                 |          |          /
                 |          |         /
                 |          |        /
                 |          |       /
                 |          |      /
                 +----------+     /
                            |    /
                            |  v0
        }</pre>
        But the following line is NOT trivially rejected because, even
        though it is completely outside of the view rectangle, this line
        is not entirely on the wrong side of any one of the four lines
        {@code x = 1}, {@code x = -1}, {@code y = 1}, or {@code y = -1}.
        The line below will get clipped at least one time (either on the
        line {@code x = 1} or the line {@code y = -1}) before it is
        (recursively) a candidate for "trivial rejection". Notice that
        the line below could even be clipped twice, first on {@code y = 1},
        then on {@code x = 1}, before it can be trivially rejected (by
        being on the wrong side of {@code y = -1}).
        <pre>{@code
                           x=1
                            |          v1
                            |         /
                 +----------+        /
                 |          |       /
                 |          |      /
                 |          |     /
                 |          |    /
                 |          |   /
                 +----------+  /
                            | /
                            |/
                            /
                           /|
                          / |
                        v0
        }</pre>
<p>
     3) If the line segment has been neither accepted nor rejected, then
        it needs to be clipped. So we test the line segment against each
        of the four clipping lines, {@code x = 1}, {@code x = -1},
        {@code y = 1}, and {@code y = -1}, to determine if the line segment
        crosses one of those lines. We clip the line segment against the
        first line which we find that it crosses. Then we recursively clip
        the resulting clipped line segment. Notice that we only clip against
        the first clipping line which the segment is found to cross. We do
        not continue to test against the other clipping lines. This is
        because it may be the case, after just one clip, that the line
        segment is now a candidate for trivial accept or reject. So rather
        than test the line segment against several more clipping lines
        (which may be useless tests) it is more efficient to recursively
        clip the line segment, which will then start with the trivial accept
        or reject tests.
<p>
        When we clip a line segment against a clipping line, it is always
        the case that one endpoint of the line segment is on the "right"
        side of the clipping line and the other endpoint is on the "wrong"
        side of the clipping line. In the following picture, assume that
        {@code v0} is on the "wrong" side of the clipping line({@code x = 1})
        and {@code v1} is on the "right" side. So {@code v0} needs to be
        clipped off the line segment and replaced by a new vertex.
        <pre>{@code
                             x=1
                         v1   |
                           \  |
                            \ |
                             \|
                              \
                              |\
                              | \
                              |  \
                              |   v0
        }</pre>
        Represent points {@code p(t)} on the line segment between {@code v0}
        and {@code v1} with the following parametric equation.
        <pre>{@code
                  p(t) = (1-t) * v0 + t * v1  with  0 <= t <= 1
        }</pre>
        Notice that this equation parameterizes the line segment starting
        with {@code v0} at {@code t=0} (on the "wrong side") and ending
        with {@code v1} at {@code t=1} (on the "right side"). We need to
        find the value of {@code t} when the line segment crosses the
        clipping line {@code x = 1}. Let {@code v0 = (x0, y0)} and let
        {@code v1 = (x1, y1)}. Then the above parametric equation becomes
        the two component equations
        <pre>{@code
                 x(t) = (1-t) * x0 + t * x1,
                 y(t) = (1-t) * y0 + t * y1,  with  0 <= t <= 1.
        }</pre>
        Since the clipping line in this example is {@code x = 1}, we need
        to solve the equation {@code x(t) = 1} for {@code t}. So we need
        to solve
        <pre>{@code
                  1 = (1-t) * x0 + t * x1
        }</pre>
        for {@code t}. Here are a few algebra steps.
        <pre>{@code
                  1 = x0 - t * x0 + t * x1
                  1 = x0 + t * (x1 - x0)
                  1 - x0 = t * (x1 - x0)
                       t = (1 - x0)/(x1 - x0)
        }</pre>
        We get similar equations for {@code t} if we clip against the other
        clipping lines ({@code x = -1}, {@code y = 1}, or {@code y = -1})
        and we assume that {@code v0} is on the "wrong side" and {@code v1}
        is on the "right side".
<p>
        Let {@code t0} denote the above value for {@code t}. With this value
        for {@code t}, we can compute the y-coordinate of the new vertex
        {@code p(t0)} that replaces {@code v0}.
        <pre>{@code
                             x=1
                        v1    |
                          \   |
                           \  |
                            \ |
                              p(t0)=(1, y(t0))
                              |
                              |
                              |
         }</pre>
         Here is the algebra.
         <pre>{@code
                  y(t0) = (1-t0) * y0 + t0 * y1
                        = y0 + t0 * (y1 - y0)
                        = y0 + (1 - x0)*((y1 - y0)/(x1 - x0))
         }</pre>
         Finally, the new line segment between {@code v1} and the new
         vertex {@code p(t0)} is recursively clipped so that it can be
         checked to see if it should be trivially accepted, trivially
         rejected, or clipped again.
*/

export class Clip {
   static debug = false;

    /**
        If the {@link LineSegment} sticks out of the view rectangle,
        then clip it so that it is contained in the view rectangle.

        @param model  {@link Model} that the {@link LineSegment} {@code ls} comes from
        @param ls     {@link LineSegment} to be clipped
        @return a boolean that indicates if this line segment is within the view rectangle
    */
    static clip(model,  ls) {
        var debug = Clip.debug && (Pipeline.debug || model.debug);

        // Make local copies of several values.
        var v0 = model.vertexList[ ls.vIndex[0] ];
        var v1 = model.vertexList[ ls.vIndex[1] ];

        var x0 = v0.x,  y0 = v0.y;
        var x1 = v1.x,  y1 = v1.y;

        // 1. Check for trivial accept.
        if ( ! ( Math.abs( x0 ) > 1
                || Math.abs( y0 ) > 1
                || Math.abs( x1 ) > 1
                || Math.abs( y1 ) > 1 ) ) {
            if (debug) console.log("-Trivial accept.");
            return true;
        }
        // 2. Check for trivial delete.
        else if ( (x0 >  1 && x1 >  1)   // to the right of the line x = 1
                || (x0 < -1 && x1 < -1)   // to the left of the line x = -1
                || (y0 >  1 && y1 >  1)   // above the line y = 1
                || (y0 < -1 && y1 < -1) ) { // below the line y = -1
            if (debug) console.log("-Trivial delete.");
            return false;
        }
        // 3. Need to clip this line segment.
        else if (x0 > 1 || x1 > 1) { // ls crosses the line x = 1
            if (x1 > 1) {
                if (debug) console.log("-Clip off v1 at x = 1.");
                // Create a new Vertex between v0 and v1.
                Clip.interpolateNewVertex(model, ls, 1, 1);
            }
            else { // (x0 > 1)
                if (debug) console.log("-Clip off v0 at x = 1.");
                // Create a new Vertex between v1 and v0.
                Clip.interpolateNewVertex(model, ls, 0, 1);
            }
        }
        else if (x0 < -1 || x1 < -1) { // ls crosses the line x = -1
            if (x1 < -1) {
                if (debug) console.log("-Clip off v1 at x = -1.");
                // Create a new Vertex between v0 and v1.
                Clip.interpolateNewVertex(model, ls, 1, 2);
            }
            else { // (x0 < -1)
                if (debug) console.log("-Clip off v0 at x = -1.");
                // Create a new Vertex between v1 and v0.
                Clip.interpolateNewVertex(model, ls, 0, 2);
            }
        }
        else if (y0 > 1 || y1 > 1) { // ls crosses the line y = 1
            if (y1 > 1) {
                if (debug) console.log("-Clip off v1 at y = 1.");
                // Create a new Vertex between v0 and v1.
                Clip.interpolateNewVertex(model, ls, 1, 3);
            }
            else { // (y0 > 1)
                if (debug) console.log("-Clip off v0 at y = 1.");
                // Create a new Vertex between v1 and v0.
                Clip.interpolateNewVertex(model, ls, 0, 3);
            }
        }
        else if (y0 < -1 || y1 < -1) {  // ls crosses the line y = -1
            if (y1 < -1) {
                if (debug) console.log("-Clip off v1 at y = -1.");
                // Create a new Vertex between v0 and v1.
                Clip.interpolateNewVertex(model, ls, 1, 4);
            }
            else { // (y0 < -1)
                if (debug) console.log("-Clip off v0 at y = -1.");
                // Create a new Vertex between v1 and v0.
                Clip.interpolateNewVertex(model, ls, 0, 4);
            }
        }
        else { // We should never get here.
            console.log("Clipping Error!");
            throw new Error();
        }
        return Clip.clip(model, ls); // recursively clip this line segment again
    }


    /**
        This method takes in two vertices, one that is on the "right" side
        of a clipping line and the other that is on the "wrong" side of the
        clipping line, and an integer which specifies which clipping line
        to use, where
        <pre>{@code
            eqn_number == 1 means clipping line x =  1
            eqn_number == 2 means clipping line x = -1
            eqn_number == 3 means clipping line y =  1
            eqn_number == 4 means clipping line y = -1
        }</pre>
        This method returns the vertex that is the intersection point
        between the given line segment and the given clipping line.
        <p>
        This method solves for the value of {@code t} for which the
        parametric equation
        <pre>{@code
                    p(t) = (1-t) * v_outside + t * v_inside
        }</pre>
        intersects the given clipping line. (Notice that the equation
        is parameterized so that we move from the outside vertex towards
        the inside vertex as {@code t} increases from 0 to 1.) The solved
        for value of {@code t} is then plugged into the parametric formula
        to get the coordinates of the intersection point.

        @param model       {@link Model} that the {@link LineSegment} {@code ls} comes from
        @param ls          the {@link LineSegment} being clipped
        @param outside     the index in {@code ls} of the {@link Vertex} that is outside the view rectangle
        @param eqn_number  the identifier of the view rectangle edge crossed by the line segment {@code ls}
    */
    static interpolateNewVertex(model,
                                ls,
                                outside,
                                eqn_number) {

        var debug = Clip.debug && (Pipeline.debug || model.debug);

        if (debug) console.log("-Create new vertex.");

        var inside = 1 - outside;

        // Make local copies of several values.
        // "i" for "inside"
        var vix = model.vertexList[ ls.vIndex[inside] ].x;
        var viy = model.vertexList[ ls.vIndex[inside] ].y;
        var ci =  model.colorList[ ls.cIndex[inside] ]; 
        // and "o" for "outside"
        var vox = model.vertexList[ ls.vIndex[outside] ].x;
        var voy = model.vertexList[ ls.vIndex[outside] ].y;
        var co =  model.colorList[ ls.cIndex[outside] ];

        // Interpolate between v_outside and v_inside.
        var t = 0.0;
        if (1 == eqn_number)            // clip to x = 1
            t = (1 - vox) / (vix - vox);
        else if (2 == eqn_number)       // clip to x = -1
            t = (-1 - vox) / (vix - vox);
        else if (3 == eqn_number)       // clip to y = 1
            t = (1 - voy) / (viy - voy);
        else if (4 == eqn_number)       // clip to y = -1
            t = (-1 - voy) / (viy - voy);

        // Use the value of t to interpolate the coordinates of the new vertex.
        var x = (1-t) * vox + t * vix;
        var y = (1-t) * voy + t * viy;

        var v_new = new Vertex(x, y, 0);

        // Use the value of t to interpolate the color of the new vertex.
        var t_ = t;
        var r = (1-t_) * co[0] + t_ * ci[0];
        var g = (1-t_) * co[1] + t_ * ci[1];
        var b = (1-t_) * co[2] + t_ * ci[2];

        var c_new = new Uint8ClampedArray([r, g, b, 255]);

        // Modify the Model and LineSegment to contain the new Vertex and Color.
        var vIndex = model.vertexList.length;
        var cIndex = model.colorList.length;
        model.vertexList.push(v_new);
        model.colorList.push(c_new);
        ls.vIndex[outside] = vIndex;
        ls.cIndex[outside] = cIndex;

        if (debug) {
            console.log(`- t = ${t}\n`);
            console.log(`- <x_o,y_o> = <${vox} ${voy}>\n`);
            console.log(`- <x_i,y_i> = <${vix} ${viy}>\n`);
            console.log(`- <x,  y>   = <${x} ${y}>\n`);
            console.log(`- <r_o,g_o,b_o> = <${co[0]} ${co[1]} ${co[2]}>\n`);
            console.log(`- <r_i,g_i,b_i> = <${ci[0]} ${ci[1]} ${ci[2]}>\n`);
            console.log(`- <r,  g,  b>   = <${r} ${g} ${b}>\n`);
        }
    }
}
