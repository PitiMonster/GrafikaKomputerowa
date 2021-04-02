var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");


// board's size
var minX = 0;
var maxX = 1000;
var minY = 0;
var maxY = 1000;

// current turtle's position
var posX;
var posY;

// current angle (degrees)
var angle;

// false -> draw; true -> just move turtle without trace
var isPenUp = false;


// scale coordinates to canvas size
var rx = (x) => {
  return ((x - minX) / (maxX - minX)) * ctx.canvas.width;
};
var ry = (y) =>
  ((y - minY) / (maxY - minY)) * ctx.canvas.width;

var initTurtle = () => {
  posX = 500/(maxX-minX)*ctx.canvas.width;
  posY = 500/(maxY-minY)*ctx.canvas.height;
  angle = 0;

  ctx.moveTo(posX, posY);
};

// checks whether new coordiantes fit canvas box
var coordsValidation = (x, y) => x < ctx.canvas.width && x > 0 && y > 0 && y < ctx.canvas.height;

var fd = (value) => {
  var radians = (angle * Math.PI) / 180.0;
  var dx = (rx(value) * Math.sin(radians));
  var dy = (ry(value) * Math.cos(radians));
  var newX = posX + dx;
  var newY = posY - dy; // subtract because we want to move upper

  if (!coordsValidation(newX, newY)) return;

  if (isPenUp) ctx.moveTo(newX, newY);
  else {
    ctx.beginPath();
    ctx.moveTo(posX, posY);
    ctx.lineTo(newX, newY);
    ctx.stroke();
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



  if (isPenUp) ctx.moveTo(newX, newY);
  else {
    ctx.beginPath();
    ctx.moveTo(posX, posY);
    ctx.lineTo(newX, newY);
    ctx.stroke();
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
    ctx.strokeStyle = `${value}`;
  } catch (err) {
    // handle changing to incorrect color
    return;
  }
};

// change thickness of track
var ss = (value) => {
  if (value >= 1 && value <= 7) ctx.lineWidth = value ;
};

// put the pen up
var pu = () => (isPenUp = true);

// put the pen down
var pd = () => (isPenUp = false);

var koch = function (level, length) {
  if (level < 1) {
      fd (length);
  } else {
      koch (level - 1, length / 3.0);
      lt (60);
      koch (level - 1, length / 3.0);
      rt (120);
      koch (level - 1, length / 3.0);
      lt (60);
      koch (level - 1, length / 3.0);
  }
};

// run given command
var runCmd = async (cmd, time) => {
  var value;
  await new Promise(r => setTimeout(r, time));
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
        koch(level, length);
        rt(120);
      }
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
var readInput = async () => {

  input = "repeat 2; fd 50; lt 90; sc #00ff00; ss 3; fd 50; lt 90; sc black; ss 1; end;"
  input += "pu; fd 100; pd; repeat 360; fd 1; lt 1; end;"
  input += "pu; bk 300; pd; repeat 3; fd 50; rt 120; end;"
    input = input.split(';')
    let time  = 500;
  for (let i = 0; i < input.length; i++) {
    let cmd = input[i]
    cmd = cmd.toLowerCase().trim();
    cmd = cmd.split(" ");

    if (cmd[0] === "repeat") {
        if (cmd[1] == 360) {
            time = 0;
        }
      var value = parseInt(cmd[1]);
      for (let j = 0; j < value; j++) {
        k = i + 1; // get next command after repeat statement
        cmd = input[k];
        while (cmd.trim() != "end") {
          cmd = cmd.toLowerCase().trim();
          cmd = cmd.split(" ");
          await runCmd(cmd, time);
          k++;
          cmd = input[k];
        }
      }
      time = 500;
      i = k;
    } else {
      await runCmd(cmd, time);
    }
  }
};

// initialize turtle
initTurtle();
readInput()