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
  
// losowanie liczby z przedziały (min, max)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

// podpięcie okna przeglądarki do event listnera
window.addEventListener('load', () => {
    const canvas = document.getElementById("myCanvas");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
	var dy = canvas.height / 2;
    const engine = new Engine(canvas)
    var camera = new Camera(new Vertex3D(0,0,0), 500, new PerspectiveProjection())

    var x, y, z;

    var center;
    var destination; // obiekt powodujący wygraną
    var renderedObjects;  // lista wyrenderowanych obiektów
    var colliders;  // lista obiektów, które powodują przegraną
    
    reset();

    // inicjalizacja gry
    function reset() {
        // towrzenie nowego obiektu kamery - położenie, zoom, obiektu perspektywy 3D
        camera = new Camera(new Vertex3D(0,0,0), 500, new PerspectiveProjection())
        x = y = z = 0; // koordynaty
        // losowanie centrum sześcianu zwycięstwa
        center = new Vertex3D(getRandomInt(-100,100),5500, 0);
        // stowrzenie szcześcianu zwycięstwa o kolorze zielonym
        destination = new Cube(center, dy, "rgba(0,255,0,1)")
        renderedObjects = [destination]; 
        colliders = []   

        // tworzenie szcześcianów przegranej - będą one szare
        for(let i = 0; i < 52; i++){
            let newCenter = new Vertex3D(getRandomInt(-1500,1500), getRandomInt(500,5000), getRandomInt(-500,500));
            let newCube = new Cube(newCenter, dy, '#cccccc');
            colliders.push(newCube); // dodanie szcześcianu przegranej do colliderów
            renderedObjects.push(newCube);
        }
    }

    // sprawdzenie kolzji
    function collision(){
        // sprawdzenie czy wiechołek playera koliduje z jakimś szcześcianem przegranej
        let playerPosition = new Vertex3D(x,y,z);
        colliders.forEach(cube => {
            // jeśli wszedł przegrywa i reset gry
            if(cube.isPointColiding(playerPosition)){
                alert("You lost!");
                reset();
            }
        });
        
        // jeśli wszedł w szccześcian zwycięstwa to zwycięstwo i rest gry
        if(destination.isPointColiding(playerPosition)){
            alert("You won!");
            reset();
        }
    }

    // podpięcie sterowania pod odpowiednie klawisze
    var keyDownCallback=function (e){
        e.preventDefault(); // prevents browser from interpreting the keys for other tasks
        var code= e.which || e.keyCode;
        const val = 20;
        switch(code)
        {
        case 38: // arrow up
            y += val*2;
            break;
        case 40: // arrow down
            y -= val*2;
            break;
        case 39: // arrow right
            x += val;
            break;
        case 37: // arrow left
            x -= val;
            break;
        case 78: // N key
            z -= val;
            break;
        case 77: // M key
            z += val;
            break;
        }
        // stworzenie nowej kamery w nowych koordynatach
        camera = new Camera(new Vertex3D(x,y,z), 500, new PerspectiveProjection());
        collision(); // sprawdzenie kolizji
        // renedrowanie okna od nowa
        engine.render(renderedObjects, camera);
    };
    
    onkeydown=keyDownCallback;
    engine.render(renderedObjects, camera);
})