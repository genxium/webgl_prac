// Holds the "anchor position", "polygon local coordinates" and "scale" of the cube  
function Cube (scaleX, scaleY, scaleZ, posX, posY, posZ) {
  // initial scale and pos
  this.scaleX = scaleX;
  this.scaleY = scaleY;
  this.scaleZ = scaleZ;
  this.posX = posX; 
  this.posY = posY; 
  this.posZ = posZ; 

  this.points = [
    // Front face
    -1.0, -1.0,  1.0,
    1.0, -1.0,  1.0,
    1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
    1.0,  1.0, -1.0,
    1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
    1.0,  1.0,  1.0,
    1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
    1.0, -1.0, -1.0,
    1.0,  1.0, -1.0,
    1.0,  1.0,  1.0,
    1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0
  ];

  var colorsOfFaces = [
    [0.3,  1.0,  1.0,  1.0],    // Front face: cyan
    [1.0,  0.3,  0.3,  1.0],    // Back face: red
    [0.3,  1.0,  0.3,  1.0],    // Top face: green
    [0.3,  0.3,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.3,  1.0],    // Right face: yellow
    [1.0,  0.3,  1.0,  1.0]     // Left face: purple
  ];

  this.colors = [];

  for (var j=0; j<6; j++) {
    var polygonColor = colorsOfFaces[j];

    for (var i=0; i<4; i++) {
      this.colors = this.colors.concat( polygonColor );
    }
  }

  this.elements = [
    0,  1,  2,      0,  2,  3,    // front: break the front face into 2 triangles, one with "(points[0], points[1], points[2])", another with "(points[0], points[2], points[3])" 
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23    // left
  ]
}

function setupShaderPrograms(gl) {
  // Setup a WebGL program
  var webglProgram = MDN.createWebGLProgramFromIds(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(webglProgram);

  // Tell WebGL to test the depth when drawing
  gl.enable(gl.DEPTH_TEST);

  var vsVars = {
    toWorld: gl.getUniformLocation(webglProgram, "toWorld"),
    toCam: gl.getUniformLocation(webglProgram, "toCam"),
    point: gl.getAttribLocation(webglProgram, "point"),
    faceColor: gl.getAttribLocation(webglProgram, "faceColor"), 
  };

  return {
    vsVars: vsVars
  };
};

function computeToWorldMatrix( now, cube ) {

  var scale = MDN.scaleMatrix(cube.scaleX, cube.scaleY, cube.scaleZ);

  var rotateX = MDN.rotateXMatrix( now * 0.0003 );

  var rotateY = MDN.rotateYMatrix( now * 0.0005 );

  var position = MDN.translateMatrix(cube.posX, cube.posY, cube.posZ);

  // Multiply together, make sure and read them in opposite order
  return MDN.multiplyArrayOfMatrices([
      position, // step 4
      rotateY,  // step 3
      rotateX,  // step 2
      scale     // step 1
  ]);

  // Performance caveat: in real production code it's best not to create
  // new arrays and objects in a loop. This example chooses code clarity
  // over performance.
};

function draw( gl, vsVars, buffers, toWorldMat, toCamMat ) {
  // In this basic example, only "toWorld" matrix will be updated every frame

  // Update the data going to the GPU
  gl.uniformMatrix4fv(vsVars.toWorld, false, new Float32Array(toWorldMat));
  gl.uniformMatrix4fv(vsVars.toCam, false, new Float32Array(toCamMat));

  // Set the points and colors into vs, note that nothing in "buffers" would change in this basic example
  gl.enableVertexAttribArray(vsVars.point);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.points);
  gl.vertexAttribPointer(vsVars.point, 3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(vsVars.faceColor);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colors);
  gl.vertexAttribPointer(vsVars.faceColor, 4, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.elements);

  // Perform the actual draw
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

  // compute "nextToWorldMat"
  var now = Date.now();
  var nextToWorldMat = computeToWorldMatrix(now, cube);

  // // Run recursively
  requestAnimationFrame( draw.bind(null, gl, vsVars, buffers, nextToWorldMat, toCamMat) );
}
