/**
   Transform each {@link Vertex} of a {@link Model} from
   view coordinates to normalized camera coordinates.
<p>
   This stage transforms the {@link Camera}'s view volume from a
   user defined shape (in the view coordinate system) into the
   standard normalized view volume (in the camera coordinate system)
   used by the {@link Clip} pipeline stage.
<p>
   There are two standard normalized view volumes, one for perspective
   projection and one for orthographic projection.
<p>
   The standard normalized perspective view volume is the infinitely
   long pyramid with its apex at the origin and intersecting the plane
   {@code z = -1} at the corners {@code (-1, -1, -1)} and
   {@code (+1, +1, -1)}.
<p>
   The standard normalized orthographic view volume is the infinitely
   long parallelepiped centered on the z-axis and intersecting the
   xy-plane at the corners {@code (-1, -1, 0)} and {@code (+1, +1, 0)}.
<p>
   The user defined view volume (determined by the {@link Scene}'s
   {@link Camera} object) is either the infinitely long pyramid with its
   apex at the origin and intersecting the plane {@code z = -near} at the
   corners {@code (left, bottom, -near)} and {@code (right, top, -near)},
   or it is the infinitely long parallelepiped parallel to the z-axis and
   intersecting the xy-plane at the corners {@code (left, bottom, 0)}
   and {@code (right, top, 0)}.
<p>
   The view coordinate system is relative to the user defined view volume.
<p>
   The normalized camera coordinate system is relative to the normalized
   view volume.
<p>
   The {@link Matrix} that transforms the user defined view volume into the
   normalized view volume also transforms the view coordinate system into
   the normalized camera coordinate system.
*/
export class View2Camera {
   /**
      Use the {@link Camera}'s normalizing {@link Matrix} to transform each
      {@link Vertex} from the {@link Camera}'s view coordinate system to the
      normalized camera coordinate system.

      @param vertexList  {@link List} of {@link Vertex} objects to transform into normalized camera coordinates
      @param camera      the {@link Scene}'s {@link Camera} with the normalizing {@link Matrix}
   */
   static view2camera(vertexList, camera) {
      var normalizeMatrix = camera.normalizeMatrix;

      // Mutate each Vertex object so that it contains
      // normalized camera coordinates.
      for (var v of vertexList) {
         v.set( normalizeMatrix.timesVertex(v) );
      }
   }
}
