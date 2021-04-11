// plik generujący parę przykładowych figur w 3D


// obiekt wierzchołka w 3D
class Vertex3D {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

// obiekt wierzchołka w 2D
class Vertex2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// obiekt szcześcianu
class Cube {
  // stworzenie szcześcianu o środku w [center] i długości krawędzi [size] oraz kolorze krawędzi [color]
  constructor(center, size, color = "rgba(0,0,0,1)") {
    this.center = center;
    this.size = size;
    this.color = color;
    const d = size / 2;

    // towrzenie minimalnych i maksymalnych odchyleń sześcianu w 3 płaszczynach
    this.minX = center.x - d;
    this.maxX = center.x + d;
    this.minY = center.y - d;
    this.maxY = center.y + d;
    this.minZ = center.z - d;
    this.maxZ = center.z + d;

    // towrzenie 8 wierzchołków szcześcianu
    this.vertices = [
      new Vertex3D(this.minX, this.minY, this.maxZ),
      new Vertex3D(this.minX, this.minY, this.minZ),
      new Vertex3D(this.maxX, this.minY, this.minZ),
      new Vertex3D(this.maxX, this.minY, this.maxZ),
      new Vertex3D(this.maxX, this.maxY, this.maxZ),
      new Vertex3D(this.maxX, this.maxY, this.minZ),
      new Vertex3D(this.minX, this.maxY, this.minZ),
      new Vertex3D(this.minX, this.maxY, this.maxZ),
    ];

    // tworzenie mapy konekcji wierzchołków
    this.edges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [1, 6],
      [2, 5],
      [3, 4],
      [0, 7],
    ];

    // funkcja sprawdzająca czy sześcian koliduje z danym punktem
    this.isPointColiding = (point) =>
      this.minX <= point.x &&
      point.x <= this.maxX &&
      this.minY <= point.y &&
      point.y <= this.maxY &&
      this.minZ <= point.z &&
      point.z <= this.maxZ;
  }
}

// obiekt linii
class Line {
  // stowrzenie linii od punktu [p1] do [p2] o kolorze [color]
  constructor(p1, p2, color = "rgba(0,0,0,1)") {
    this.p1 = p1;
    this.p2 = p2;
    this.color = color;

    // tworzenie wierzchołków linii
    this.vertices = [
      new Vertex3D(this.p1.x, this.p1.y, this.p1.z),
      new Vertex3D(this.p2.x, this.p2.y, this.p2.z),
    ];

    // tworzenie mapy konekcji wierzchołków
    this.edges = [[0, 1]];

    this.isPointColiding = (point) => false;
  }
}

// obiekt rzutujący 2D na 3D
class PerspectiveProjection {
  project(a, c, distance) {
    const d = new Vertex3D(a.x - c.x, a.y - c.y, a.z - c.z);
    const r = distance / d.y;
    return new Vertex3D(r * d.x, r * d.z, d.y);
  }
}

// obiekt kamery
class Camera {
  constructor(position, distance, projection) {
    this.position = position; // pozycja inicjalizacyjna
    this.distance = distance; // zoom
    this.projection = projection; // obiekt projekcji
  }

  // wykonanie projekcji przez kamere
  project(vertex) {
    return this.projection.project(vertex, this.position, this.distance);
  }
}

// obiekt silnika
class Engine {
  constructor(canvas) {
    this.ctx = canvas.getContext("2d");
    this.dx = canvas.width / 2;
    this.dy = canvas.height / 2;
    this.ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    this.ctx.fillStyle = "rgba(0, 150, 255, 0.3)";
  }

  render(objects, camera) {
    // czyszczenie poprzedniej klatki
    this.ctx.clearRect(0, 0, 2 * this.dx, 2 * this.dy);
    // rysowanie każdego obiektu z objects
    for (let i = 0, n_obj = objects.length; i < n_obj; ++i) {
      this.ctx.strokeStyle = objects[i].color;

      for (let j = 0, n_edges = objects[i].edges.length; j < n_edges; ++j) {
        let obj = objects[i];
        let edge_indices = obj.edges[j];

        // rysowanie punktów krawędzi
        let point1 = camera.project(obj.vertices[edge_indices[0]]);
        let point2 = camera.project(obj.vertices[edge_indices[1]]);

        // zapobiegnięcie rysowania się punktów zostawionych w tyle
        if (point1.z < 0 || point2.z < 0) continue;

        // rysowanie w canvasie linii
        this.ctx.beginPath();
        this.ctx.moveTo(point1.x + this.dx, -point1.y + this.dy);
        this.ctx.lineTo(point2.x + this.dx, -point2.y + this.dy);
        this.ctx.closePath();
        this.ctx.stroke();
      }
    }
  }
}

const canvas = document.getElementById("turtleCanvas");
var ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
var dx = canvas.width / 2;
var dy = canvas.height / 2;
const engine = new Engine(canvas);
var camera;
var objects = [];

var cummulativeX = 0;
var cummulativeY = 0;

// Turtle section -------------------------------

// board's size
var minX = -1000;
var maxX = 1000;
var minY = -1000;
var maxY = 1000;
var minZ = -1000;
var maxZ = 1000;

// current position of turtle
var posX;
var posY;
var posZ;

//current angle (degrees).
var theta = 0; // [-180, 180)
var phi = 0; // [-90, 90]

// should turtle draw when moving
var isDrawing = true;

var initTurtle = () => {
  camera = new Camera(
    new Vertex3D(0, -2000, 0),
    350,
    new PerspectiveProjection()
  );
  cummulativeX = 0;
  cummulativeY = -90;
  objects = [];
  posX = (maxX + minX) / 2;
  posY = (maxY + minY) / 2;
  posZ = (maxZ + minZ) / 2;
  theta = 0;
  phi = 0;
};

var checkCoordinates = (x, y, z) =>
  x >= minX && x <= maxX && y >= minY && y <= maxY && z >= minZ && z <= maxZ;

var fd = (value) => {
  var thetaRadians = (theta * Math.PI) / 180.0;
  var phiRadians = (phi * Math.PI) / 180.0;
  var dx = value * Math.sin(thetaRadians) * Math.cos(phiRadians);
  var dy = value * Math.cos(thetaRadians) * Math.cos(phiRadians);
  var dz = value * Math.sin(phiRadians);

  var newX = posX + dx;
  var newY = posY - dy;
  var newZ = posZ + dz;

  if (!checkCoordinates(newX, newY, newZ)) {
    console.log(newX, newY, newZ);
    return;
  }
  console.log(newX, newY, newZ);

  if (isDrawing) {
    objects.push(
      new Line(new Vertex3D(posX, posY, posZ), new Vertex3D(newX, newY, newZ))
    );
  }

  posX = newX;
  posY = newY;
  posZ = newZ;
};

var bk = (value) => {
  var thetaRadians = (theta * Math.PI) / 180.0;
  var phiRadians = (phi * Math.PI) / 180.0;
  var dx = value * Math.sin(thetaRadians) * Math.cos(phiRadians);
  var dy = value * Math.cos(thetaRadians) * Math.cos(phiRadians);
  var dz = value * Math.sin(phiRadians);

  var newX = posX - dx;
  var newY = posY + dy;
  var newZ = posZ - dz;

  if (!checkCoordinates(newX, newY, newZ)) return;

  if (isDrawing) {
    objects.push(
      new Line(new Vertex3D(posX, posY, posZ), new Vertex3D(newX, newY, newZ))
    );
  }

  posX = newX;
  posY = newY;
  posZ = newZ;
};

var lt = (value) => {
  theta = (theta - value) % 360;
};

var rt = (value) => {
  theta = (theta + value) % 360;
};

var ut = (value) => {
  phi = (phi + value) % 180;
};

var dt = (value) => {
  phi = (phi - value) % 180;
};

var sc = (value) => {
  switch (value) {
    case "black":
      context.strokeStyle = "#000000";
      break;
    case "red":
      context.strokeStyle = "#FF0000";
      break;
    case "green":
      context.strokeStyle = "#00FF00";
      break;
    case "blue":
      context.strokeStyle = "#0000FF";
      break;
    case "yellow":
      context.strokeStyle = "#FFFF00";
      break;
    default:
      break;
  }
};

var ss = (thickness) => {
  if (thickness >= 1 && thickness <= 6) ctx.lineWidth = thickness;
};

var pu = () => (isDrawing = false);

var pd = () => (isDrawing = true);

var koch_line = (level, length) => {
  if (level < 1) {
    fd(length);
  } else {
    koch_line(level - 1, length / 3.0);
    lt(60);
    koch_line(level - 1, length / 3.0);
    rt(120);
    koch_line(level - 1, length / 3.0);
    lt(60);
    koch_line(level - 1, length / 3.0);
  }
};

var koch = (level, length) => {
  rt(30);
  koch_line(level, length);
  rt(120);
  koch_line(level, length);
  rt(120);
  koch_line(level, length);
  rt(120);
  lt(30);
};

var sierp = (level, length) => {
  if (level < 1) {
    return;
  } else {
    for (var i = 0; i < 3; i++) {
      sierp(level - 1, length / 2);
      fd(length);
      rt(120);
    }
  }
};

var runCmd = async (cmd, time) => {
  console.log(cmd);
  var value;
  await new Promise((r) => setTimeout(r, time));
  switch (cmd[0]) {
    case "fd":
      value = parseInt(cmd[1]);
      fd(value);
      break;
    case "bk":
      value = parseInt(cmd[1]);
      bk(value);
      break;
    case "rt":
      value = parseInt(cmd[1]);
      rt(value);
      break;
    case "lt":
      value = parseInt(cmd[1]);
      lt(value);
      break;
    case "ut":
      value = parseInt(cmd[1]);
      ut(value);
      break;
    case "dt":
      value = parseInt(cmd[1]);
      dt(value);
      break;
    case "pu":
      pu();
      break;
    case "pd":
      pd();
      break;
    case "koch":
      var level, length;
      level = parseInt(cmd[1]);
      length = parseInt(cmd[2]);

      if (level > 6) {
        break;
      }

      koch(level, length);

      break;
    case "sierp":
      var level, length, height;
      level = cmd[1];
      length = cmd[2];
      rt(30);
      sierp(level, length);
      lt(30);
      break;
    case "sc":
      sc(cmd[1]);
      break;
    case "ss":
      ss(cmd[1]);
      break;
    case "cs":
      initTurtle();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    default:
      break;
  }
  update_graphics();
};

var readInput = async () => {
    // sześcian
  input = "repeat 4; ut 90; fd 400; bk 400; dt 90; fd 400; rt 90; end;";
  input += "ut 90; fd 400; dt 90;";
  input += "repeat 4; fd 400; rt 90; end;";

  input += "ut 90;";
  input += "pu; bk 500; dt 85; pd; koch 3 500;" // koch
  input += "pu; fd 100; pd; repeat 1080; fd 3; lt 1; end;" // sprężyna
  input = input.split(";");
  let time = 100;
  for (let i = 0; i < input.length; i++) {
    let cmd = input[i];
    cmd = cmd.toLowerCase().trim();
    cmd = cmd.split(" ");
    if (cmd[0] === "repeat") {
      if (cmd[1]%360 === 0) {
        time = 0;
      }

      var loopStart = i + 1;
      var k;
      var value = parseInt(cmd[1]);

      for (let j = 0; j < value; j++) {
        k = loopStart;
        cmd = input[k];
        while (cmd.trim() != "end") {
          cmd = cmd.trim().toLowerCase();
          cmd = cmd.split(" ");
          await runCmd(cmd, time);
          k++;
          cmd = input[k];
        }
      }
      time = 100;
      i = k - 1;
    } else {
      await runCmd(cmd, time);
    }
  }
};

// End of turtle section -------------------------

var x = 0;
var y = 0;
var z = 0;

// Initialize the movement

canvas.addEventListener("mousedown", initMove);
canvas.addEventListener("mousemove", move);
canvas.addEventListener("mouseup", stopMove);

canvas.addEventListener("touchstart", (event) => {
  event.preventDefault();
  initMove(event.touches[event.touches.length - 1]);
});
canvas.addEventListener("touchmove", (event) => {
  event.preventDefault();
  move(event.touches[event.touches.length - 1]);
});
canvas.addEventListener("touchcancel", (event) => {
  event.preventDefault();
  stopMove(event.touches[event.touches.length - 1]);
});

// Events
var mousedown = false;
var mx = 0;
var my = 0;

function initMove(evt) {
  mousedown = true;
  mx = evt.clientX;
  my = evt.clientY;
}

function update_graphics() {
  let _theta = (cummulativeX * Math.PI) / 360;
  let _phi = (cummulativeY * Math.PI) / 180;
  let rotatedObjects = JSON.parse(JSON.stringify(objects));

  rotatedObjects.forEach((obj) => {
    for (var i = 0; i < obj.vertices.length; ++i) {
      rotate(obj.vertices[i], mapCenter, _theta, _phi);
    }
  });

  engine.render(rotatedObjects, camera);
}

function move(evt) {
  if (mousedown) {
    cummulativeX += evt.clientX - mx;
    cummulativeY += evt.clientY - my;

    update_graphics();

    mx = evt.clientX;
    my = evt.clientY;
  }
}

function stopMove() {
  mousedown = false;
}

// Rotate a vertice
function rotate(vertex, center, theta, phi) {
  // Rotation matrix coefficients
  var ct = Math.cos(theta);
  var st = Math.sin(theta);
  var cp = Math.cos(phi);
  var sp = Math.sin(phi);

  // Rotation
  var x = vertex.x - center.x;
  var y = vertex.y - center.y;
  var z = vertex.z - center.z;

  vertex.x = ct * x - st * cp * y + st * sp * z + center.x;
  vertex.y = st * x + ct * cp * y - ct * sp * z + center.y;
  vertex.z = sp * y + cp * z + center.z;
}

var keyDownCallback = function (e) {
  e.preventDefault(); // prevents browser from interpreting the keys for other tasks
  var code = e.which || e.keyCode;
  const val = 10;
  switch (code) {
    case 87: // W
      fd(50);
      break;
    case 83: // S
      y -= val * 2;
      break;
    case 68: // D
      x += val;
      break;
    case 65: // A
      x -= val;
      break;
    case 81: // Q
      z -= val;
      break;
    case 69: // E
      z += val;
      break;
  }
  // update_graphics();
};

// onkeydown=keyDownCallback;
initTurtle();

const mapCenter = new Vertex3D(0, 0, 0);
// const cube = new Cube(mapCenter, dy);
// objects.push(cube)
update_graphics();
readInput();
