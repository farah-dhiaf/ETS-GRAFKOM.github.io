function main() {
  var canvas = document.getElementById("myCanvas");
  var gl = canvas.getContext("webgl");

  // var vertexShaderCode = `
  //   attribute vec2 aPosition; //menggantikan titik x dan y
  //   attribute vec3 aColor;
  //   uniform mat4 uMatrix;
  //   uniform mat4 uProj;
  //   uniform mat4 uView;
  //   uniform mat4 uModel;
  //   varying vec3 vColor;
  //       void main(){
  //           vColor = aColor;
  //           gl_Position = uProj*uView*uModel*vec4(aPosition,  1.0);
  //       }
  //       `;

  // var fragmentShaderCode = `
  //   precision mediump float;
  //   varying vec3 vColor;
  //       void main (){
  //           gl_FragColor = vec4(vColor, 1.0);
  //       }
  //       `;

  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // buat vertex shader
  var vertexShaderCode = document.getElementById("vertexShaderCode").text;
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderCode);
  gl.compileShader(vertexShader);

  //buat fragment shader
  var fragmentShaderCode = document.getElementById("fragmentShaderCode").text;
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderCode);
  gl.compileShader(fragmentShader);

  //menambah info shader ke package agar bisa dicompile
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  //menambah vertices ke dalam aPosition dan aColor untuk digambar
  //position
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  var aPosition = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  //color
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  var aColor = gl.getAttribLocation(program, "aColor");
  gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColor);

  var Pmatrix = gl.getUniformLocation(program, "uProj");
  var Vmatrix = gl.getUniformLocation(program, "uView");
  var Mmatrix = gl.getUniformLocation(program, "uModel");
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  var projmatrix = glMatrix.mat4.create();
  var modmatrix = glMatrix.mat4.create();
  var viewmatrix = glMatrix.mat4.create();

  glMatrix.mat4.perspective(
    projmatrix,
    glMatrix.glMatrix.toRadian(90),
    1.0, //aspect ratio
    0.5, //near
    10.0 //far
  );

  glMatrix.mat4.lookAt(
    viewmatrix,
    [0.0, 0.0, 2.0], //posisi depan kamera (posisi)
    [0.0, 0.0, -2.0], //arah kamera menghadap (vektor)
    [0.0, 1.0, 0.0] //arah atas kamera (vektor)
  );

  var scale = 1.0;
  var previousTime = 0.0;
  var theta = glMatrix.glMatrix.toRadian(1); //sudut 1 derajat
  function animate(currentTime) {
    var deltaTime = currentTime - previousTime;
    previousTime = currentTime;
    if (!freeze) {
      glMatrix.mat4.identity(modmatrix); //mengembalikan matriks modmatrix ke identitas
      glMatrix.mat4.scale(modmatrix, modmatrix, [scale, scale, scale]); // membuat objek membesar/mengecil
      // glMatrix.mat4.rotate(modmatrix, modmatrix, theta, [1.0, 1.0, 1.0]);
    }

    glMatrix.mat4.rotate(modmatrix, modmatrix, theta, [1.0, 1.0, 1.0]); //membuat objek berotasi
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clearColor(0.7, 0.05, 0.5, 0.15);
    gl.clearDepth(1.0);

    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(Pmatrix, false, projmatrix);
    gl.uniformMatrix4fv(Vmatrix, false, viewmatrix);
    gl.uniformMatrix4fv(Mmatrix, false, modmatrix);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    window.requestAnimationFrame(animate);
  }

  var lastMouseX, lastMouseY;
  var dragging = false;

  canvas.addEventListener("mousedown", function (e) {
    dragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  canvas.addEventListener("mouseup", function (e) {
    dragging = false;
  });

  canvas.addEventListener("mousemove", function (e) {
    if (!dragging) {
      return;
    }

    var deltaX = e.clientX - lastMouseX;
    var deltaY = e.clientY - lastMouseY;

    // atur rotasi objek berdasarkan drag mouse
    var sensitivity = 0.5;
    var thetaX = glMatrix.glMatrix.toRadian(deltaX * sensitivity);
    var thetaY = glMatrix.glMatrix.toRadian(deltaY * sensitivity);

    // rotasi objek berdasarkan sumbu x
    glMatrix.mat4.rotate(modmatrix, modmatrix, thetaX, [0.0, 1.0, 0.0]);
    // rotasi objek berdasarkan sumbu y
    glMatrix.mat4.rotate(modmatrix, modmatrix, thetaY, [1.0, 0.0, 0.0]);

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  function handleKeyDown(event) {
    if (event.keyCode == 90) {
      // ketika key z ditekan, objek akan diperbesar
      scale += 0.1;
    }
    if (event.keyCode == 88) {
      // jika key x ditekan, objek akan diperkecil dengan syarat skala masih lebih besar dari 0
      if (scale > 0) {
        scale -= 0.1;
      }
    }
  }

  document.addEventListener("keydown", handleKeyDown);

  animate(0);
}
