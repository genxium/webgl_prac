// Define the MDN global
var MDN = {};

MDN.matrixArrayToCssMatrix = function (array) {
  return "matrix3d(" + array.join(',') + ")";
}

MDN.multiplyPoint = function (matrix, point) {

  var x = point[0], y = point[1], z = point[2], w = point[3];

  var c1r1 = matrix[ 0], c2r1 = matrix[ 1], c3r1 = matrix[ 2], c4r1 = matrix[ 3],
  c1r2 = matrix[ 4], c2r2 = matrix[ 5], c3r2 = matrix[ 6], c4r2 = matrix[ 7],
  c1r3 = matrix[ 8], c2r3 = matrix[ 9], c3r3 = matrix[10], c4r3 = matrix[11],
  c1r4 = matrix[12], c2r4 = matrix[13], c3r4 = matrix[14], c4r4 = matrix[15];

  return [
    x*c1r1 + y*c1r2 + z*c1r3 + w*c1r4,
    x*c2r1 + y*c2r2 + z*c2r3 + w*c2r4,
    x*c3r1 + y*c3r2 + z*c3r3 + w*c3r4,
    x*c4r1 + y*c4r2 + z*c4r3 + w*c4r4
  ];
}

MDN.multiplyMatrices = function (a, b) {

  // TODO - Simplify for explanation
  // currently taken from https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js#L306-L337

  var result = [];

  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
  a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
  a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
  a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  // Cache only the current line of the second matrix
  var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
  result[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  result[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  result[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  result[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
  result[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  result[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  result[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  result[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
  result[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  result[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  result[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  result[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
  result[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  result[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  result[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  result[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  return result;
}

MDN.multiplyArrayOfMatrices = function (matrices) {

  var inputMatrix = matrices[0];

  for(var i=1; i < matrices.length; i++) {
    inputMatrix = MDN.multiplyMatrices(inputMatrix, matrices[i]);
  }

  return inputMatrix;
}

MDN.rotateXMatrix = function (a) {

  var cos = Math.cos;
  var sin = Math.sin;

  return [
    1,       0,        0,     0,
    0,  cos(a),  -sin(a),     0,
    0,  sin(a),   cos(a),     0,
    0,       0,        0,     1
  ];
}

MDN.rotateYMatrix = function (a) {

  var cos = Math.cos;
  var sin = Math.sin;

  return [
    cos(a),   0, sin(a),   0,
    0,   1,      0,   0,
    -sin(a),   0, cos(a),   0,
    0,   0,      0,   1
  ];
}

MDN.rotateZMatrix = function (a) {

  var cos = Math.cos;
  var sin = Math.sin;

  return [
    cos(a), -sin(a),    0,    0,
    sin(a),  cos(a),    0,    0,
    0,       0,    1,    0,
    0,       0,    0,    1
  ];
}

MDN.translateMatrix = function (x, y, z) {
  return [
    1,    0,    0,   0,
    0,    1,    0,   0,
    0,    0,    1,   0,
    x,    y,    z,   1
  ];
}

MDN.scaleMatrix = function (w, h, d) {
  return [
    w,    0,    0,   0,
    0,    h,    0,   0,
    0,    0,    d,   0,
    0,    0,    0,   1
  ];
}

MDN.perspectiveMatrix = function (fieldOfViewInRadians, aspectRatio, near, far) {

  // Construct a perspective matrix

  /*
     Field of view - the angle in radians of what's in view along the Y axis
     Aspect Ratio - the ratio of the canvas, typically canvas.width / canvas.height
     Near - Anything before this point in the Z direction gets clipped (outside of the clip space)
     Far - Anything after this point in the Z direction gets clipped (outside of the clip space)
   */

  var f = 1.0 / Math.tan(fieldOfViewInRadians / 2);
  var rangeInv = 1 / (near - far);

  return [
    f / aspectRatio, 0,                          0,   0,
      0,               f,                          0,   0,
      0,               0,    (near + far) * rangeInv,  -1,
      0,               0,  near * far * rangeInv * 2,   0
  ];
}

MDN.orthographicMatrix = function(left, right, bottom, top, near, far) {

  // Each of the parameters represents the plane of the bounding box

  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);

  var row4col1 = (left + right) * lr;
  var row4col2 = (top + bottom) * bt;
  var row4col3 = (far + near) * nf;

  return [
    -2 * lr,        0,        0, 0,
    0,  -2 * bt,        0, 0,
    0,        0,   2 * nf, 0,
    row4col1, row4col2, row4col3, 1
  ];
}

MDN.createShader = function (gl, source, type) {

  // Compiles either a shader of type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER

  var shader = gl.createShader( type );
  gl.shaderSource( shader, source );
  gl.compileShader( shader );

  if ( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {

    var info = gl.getShaderInfoLog( shader );
    throw "Could not compile WebGL program. \n\n" + info;
  }

  return shader
}

MDN.linkProgram = function (gl, vertexShader, fragmentShader) {

  var program = gl.createProgram();

  gl.attachShader( program, vertexShader );
  gl.attachShader( program, fragmentShader );

  gl.linkProgram( program );

  if ( !gl.getProgramParameter( program, gl.LINK_STATUS) ) {
    var info = gl.getProgramInfoLog(program);
    throw "Could not compile WebGL program. \n\n" + info;
  }

  return program;
}

MDN.createWebGLProgram = function (gl, vertexSource, fragmentSource) {

  // Combines MDN.createShader() and MDN.linkProgram()

  var vertexShader = MDN.createShader( gl, vertexSource, gl.VERTEX_SHADER );
  var fragmentShader = MDN.createShader( gl, fragmentSource, gl.FRAGMENT_SHADER );

  return MDN.linkProgram( gl, vertexShader, fragmentShader );
}

MDN.createWebGLProgramFromIds = function (gl, vertexSourceId, fragmentSourceId) {

  var vertexSourceEl = document.getElementById(vertexSourceId);
  var fragmentSourceEl = document.getElementById(fragmentSourceId);

  return MDN.createWebGLProgram(
      gl,
      vertexSourceEl.innerHTML,
      fragmentSourceEl.innerHTML
      );
}

MDN.createContext = function (canvas) {

  var gl;

  try {
    // Try to grab the standard context. If it fails, fallback to experimental.
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  }
  catch(e) {}

  // If we don't have a GL context, give up now
  if (!gl) {
    var message = "Unable to initialize WebGL. Your browser may not support it.";
    alert(message);
    throw new Error(message);
    gl = null;
  }

  return gl;
}

MDN.computeNaiveProjectionMatrix = function() {
  var naiveScaleFactor = 0.5;
  return projection = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, naiveScaleFactor, // Note the extra scale factor here
    0, 0, 0, naiveScaleFactor
  ]

  // This matrix copies the point and sets the W component to 1 + (z * scaleFactor)
};


MDN.computePerspectiveMatrix = function() {
  return MDN.perspectiveMatrix(
    Math.PI * 0.5, // fieldOfViewInRadians
    (window.innerWidth / window.innerHeight), // aspectRatio
    1, // nearClippingPlaneDistance
    50, // farClippingPlaneDistance
  );
};
