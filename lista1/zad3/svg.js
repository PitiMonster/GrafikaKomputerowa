var mySvg = document.getElementById("mySvg");
var cmdInput = document.getElementById("cmdInput");

cmdInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    readInput();
  }
});

// board's size
var minX = 0;
var maxX = 500;
var minY = 0;
var maxY = 500;

// current turtle's position
var posX;
var posY;

// current angle (degrees)
var angle;

// false -> draw; true -> just move turtle without trace
var isPenUp = false;

let lineVar;

let trackWidth = 2;
let trackColor = "black";

// create html line component
var line = (x1, y1, x2, y2) =>
  `<line x1=${x1} y1=${y1} x2=${x2} y2=${y2} style="stroke: ${trackColor}; stroke-width: ${trackWidth}"/>`;

// scale coordinates to canvas size
var rx = (x) => {
  return ((x - minX) / (maxX - minX)) * maxX;
};
var ry = (y) => ((y - minY) / (maxY - minY)) * maxX;

var initTurtle = () => {
  posX = (250 / (maxX - minX)) * maxX;
  posY = (250 / (maxY - minY)) * maxY;
  angle = 0;

  //   ctx.moveTo(posX, posY);
};

// checks whether new coordiantes fit canvas box
var coordsValidation = (x, y) => x < maxX && x > 0 && y > 0 && y < maxY;

var fd = (value) => {
  var radians = (angle * Math.PI) / 180.0;
  var dx = rx(value) * Math.sin(radians);
  var dy = ry(value) * Math.cos(radians);
  var newX = posX + dx;
  var newY = posY - dy; // subtract because we want to move upper
  console.log(posX, posY);
  console.log(dx, dy);
  console.log(newX, newY);
  if (!coordsValidation(newX, newY)) return;

  if (!isPenUp) {
    // ctx.beginPath();
    // ctx.moveTo(posX, posY);
    // ctx.lineTo(newX, newY);
    // ctx.stroke();
    lineVar = line(posX, posY, newX, newY);
    mySvg.innerHTML += lineVar;
  }
  posX = newX;
  posY = newY;
};

var bk = (value) => {
  var radians = (angle * Math.PI) / 180.0;
  var dx = rx(value) * Math.sin(radians);
  var dy = ry(value) * Math.cos(radians);

  var newX = posX - dx;
  var newY = posY + dy; // sum because we want to move lower

  if (!coordsValidation(newX, newY)) return;

  if (!isPenUp) {
    // ctx.beginPath();
    // ctx.moveTo(posX, posY);
    // ctx.lineTo(newX, newY);
    // ctx.stroke();
    lineVar = line(posX, posY, newX, newY);
    mySvg.innerHTML += lineVar;
  }

  posX = newX;
  posY = newY;
};

// turn the turtle to the left side
var lt = (value) => (angle = (angle - value) % 360);

// turn the turtle to the right side
var rt = (value) => (angle = (angle + value) % 360);

// change color of trace
var sc = (value) => {
  try {
    trackColor = `${value}`;
  } catch (err) {
    // handle changing to incorrect color
    return;
  }
};

// change thickness of track
var ss = (value) => {
  if (value >= 1 && value <= 7) trackWidth = value;
};

// put the pen up
var pu = () => (isPenUp = true);

// put the pen down
var pd = () => (isPenUp = false);

var koch = async (level, length) => {
  if (level < 1) {
    await new Promise((r) => setTimeout(r, 100));
    fd(length);
  } else {
    await koch(level - 1, length / 3.0);
    lt(60);
    await koch(level - 1, length / 3.0);
    rt(120);
    await koch(level - 1, length / 3.0);
    lt(60);
    await koch(level - 1, length / 3.0);
  }
};

var sierp = (level, length, height) => {
  if (!level) {
    return;
  } else {
    var currX, currY, currAngle;
    lt(150);
    // stroke
    fd(length);
    lt(120);
    fd(length);
    lt(120);
    fd(length);
    lt(150);

    currX = posX;
    currY = posY;
    currAngle = angle;

    rt(180);
    sierp(level - 1, length / 2, height / 2); // upper triangle
    posX = currX;
    posY = currY;
    angle = currAngle;

    pu();
    fd(height);
    pd();
    lt(150);
    fd(length / 2);

    currX = posX;
    currY = posY;
    currAngle = angle;

    rt(330);
    sierp(level - 1, length / 2, height / 2); // right triangle
    posX = currX;
    posY = currY;
    angle = currAngle;

    lt(120);
    fd(length / 2);

    currX = posX;
    currY = posY;
    currAngle = angle;

    lt(270);
    sierp(level - 1, length / 2, height / 2); // left tirangle
    posX = currX;
    posY = currY;
    angle = currAngle;

    lt(120);
    fd(length / 2);
  }
};

// run given command
var runCmd = async (cmd) => {
  var value;
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

      if (level > 5) {
        break;
      }

      pu();
      lt(90);
      fd(100);
      rt(90);
      pd();

      for (var i = 0; i < 3; i++) {
        await koch(level, length);
        rt(120);
      }
      break;
    case "sierp":
      var level, length, height;
      level = cmd[1];
      length = cmd[2];
      height = (length * Math.sqrt(3)) / 2;
      pu();
      fd(300);
      pd();
      sierp(level, length, height);

      break;
    case "sc":
      sc(cmd[1]);
      break;
    case "ss":
      ss(cmd[1]);
    default:
      break;
  }
};

// reading and handling input
var readInput = () => {
  var input = cmdInput.value;
  cmdInput.value = "";

  input = input.split(";");

  for (let i = 0; i < input.length; i++) {
    let cmd = input[i];
    cmd = cmd.toLowerCase().trim();
    cmd = cmd.split(" ");

    if (cmd[0] === "repeat") {
      var value = parseInt(cmd[1]);
      for (let j = 0; j < value; j++) {
        k = i + 1; // get next command after repeat statement
        cmd = input[k];
        while (cmd.trim() != "end") {
          cmd = cmd.toLowerCase().trim();
          cmd = cmd.split(" ");
          runCmd(cmd);
          k++;
          cmd = input[k];
        }
      }
      i = k;
    } else {
      runCmd(cmd);
    }
  }
};

// initialize
initTurtle();
