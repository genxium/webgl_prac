// Define the data that is needed to make a 3d cube
MDN.createCubeData = function() {

  var positions = [
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

  var colors = [];

  for (var j=0; j<6; j++) {
    var polygonColor = colorsOfFaces[j];

    for (var i=0; i<4; i++) {
      colors = colors.concat( polygonColor );
    }
  }

  var elements = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23    // left
  ]

  return {
positions: positions,
           elements: elements,
           colors: colors
  }
}

// Take the data for a cube and bind the buffers for it.
// Return an object collection of the buffers
MDN.createBuffersForCube = function( gl, cube ) {

  var positions = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positions);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.positions), gl.STATIC_DRAW);

  var colors = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colors);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.colors), gl.STATIC_DRAW);

  var elements = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube.elements), gl.STATIC_DRAW);

  return {
positions: positions,
             colors: colors,
             elements: elements
  }
}

function CubeDemo (projMatCal, scaleX, scaleY, scaleZ, posX, posY, posZ) {
  // Projection matrix calculation lambda
  this.projMatCal = projMatCal;

  // initial scale and pos
  this.scaleX = scaleX;
  this.scaleY = scaleY;
  this.scaleZ = scaleZ;
  this.posX = posX; 
  this.posY = posY; 
  this.posZ = posZ; 

  // Prep the canvas
  this.canvas = document.getElementById("canvas");
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;

  // Grab a context
  this.gl = MDN.createContext(this.canvas);

  this.transforms = {}; // All of the matrix transforms
  this.locations = {}; //All of the shader locations

  // Get the rest going
  this.buffers = MDN.createBuffersForCube(this.gl, MDN.createCubeData() );
  this.webglProgram = this.setupProgram();

}

CubeDemo.prototype.setupProgram = function() {

  var gl = this.gl;

  // Setup a WebGL program
  var webglProgram = MDN.createWebGLProgramFromIds(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(webglProgram);

  // Save the attribute and uniform locations
  this.locations.model = gl.getUniformLocation(webglProgram, "model");
  this.locations.projection = gl.getUniformLocation(webglProgram, "projection");
  this.locations.position = gl.getAttribLocation(webglProgram, "position");
  this.locations.color = gl.getAttribLocation(webglProgram, "color");

  // Tell WebGL to test the depth when drawing
  gl.enable(gl.DEPTH_TEST);

  return webglProgram;
};

CubeDemo.prototype.computeModelMatrix = function( now ) {

  var scale = MDN.scaleMatrix(this.scaleX, this.scaleY, this.scaleZ);

  var rotateX = MDN.rotateXMatrix( now * 0.0003 );

  var rotateY = MDN.rotateYMatrix( now * 0.0005 );

  var position = MDN.translateMatrix(this.posX, this.posY, this.posZ);

  // Multiply together, make sure and read them in opposite order
  this.transforms.model = MDN.multiplyArrayOfMatrices([
      position, // step 4
      rotateY,  // step 3
      rotateX,  // step 2
      scale     // step 1
  ]);

  // Performance caveat: in real production code it's best not to create
  // new arrays and objects in a loop. This example chooses code clarity
  // over performance.
};

CubeDemo.prototype.draw = function() {

  var gl = this.gl;
  var now = Date.now();

  // Compute our matrices
  this.computeModelMatrix( now );
  this.transforms.projection = this.projMatCal(); 

  // Update the data going to the GPU
  this.updateAttributesAndUniforms();

  // Perform the actual draw
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

  // Run the draw as a loop
  requestAnimationFrame( this.draw.bind(this) );
};

CubeDemo.prototype.updateAttributesAndUniforms = function() {

  var gl = this.gl;

  // Setup the color uniform that will be shared across all triangles
  gl.uniformMatrix4fv(this.locations.model, false, new Float32Array(this.transforms.model));
  gl.uniformMatrix4fv(this.locations.projection, false, new Float32Array(this.transforms.projection));

  // Set the positions attribute
  gl.enableVertexAttribArray(this.locations.position);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.positions);
  gl.vertexAttribPointer(this.locations.position, 3, gl.FLOAT, false, 0, 0);

  // Set the colors attribute
  gl.enableVertexAttribArray(this.locations.color);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.colors);
  gl.vertexAttribPointer(this.locations.color, 4, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.elements );

};
