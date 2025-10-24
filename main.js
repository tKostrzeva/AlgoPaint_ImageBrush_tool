let cnv;
let art;

let imgPosX = document.getElementById("imgPosX");
let imgPosY = document.getElementById("imgPosY");

let brushSize = document.getElementById("brushSize");

let brushWidth = document.getElementById("brushWidth");
let brushHeight = document.getElementById("brushHeight");

let brushRot = document.getElementById("brushRot");
let brushMov = document.getElementById("brushMov");

let gridRows = document.getElementById("gridRows");
let gridCols = document.getElementById("gridCols");

let TILES_X, TILES_Y;
let TILE_W, TILE_H;

let img, imgUp, currImage;

let sx, sy, sw, sh;
let dx, dy, dw, dh;

let mX, mY;
let prevX, prevY;
let rotationSensitivity;
let angleDeg;
let angleMapped;
let angleToggle;

let status = false;

let undoStack = [];  // UNDO stack

function preload() {
  img = loadImage("media/DPB883339.jpg");
}

function setup() {
  cnv = createCanvas(windowWidth - 250, windowHeight);
  cnv.parent("sketch-wrapper");

  frameRate(60);
  noStroke();
  noCursor();

  art = createGraphics(windowWidth - 250, windowHeight);
  art.pixelDensity(3);
  art.clear();
  art.rectMode(CENTER);
  art.imageMode(CENTER);

  grid = createGraphics(windowWidth - 250, windowHeight);
  grid.rectMode(CENTER);
  grid.noFill();
  grid.stroke("#222222");
  grid.strokeWeight(1);

  preview = createGraphics(windowWidth - 250, windowHeight);
  preview.imageMode(CENTER);

  let uploadElement = document.getElementById("imageUpload");
  uploadElement.addEventListener("change", handleImageUpload);

  document.querySelector("button").addEventListener("click", switch_status);

  imageMode(CENTER);
  rectMode(CENTER);

  prevX = mouseX;
  prevY = mouseY;
}

function handleImageUpload(event) {
  let file = event.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = function (e) {
      imgUp = loadImage(e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

function switch_status() {
  status = !status;
}

function draw() {
  if (imgUp != null) {
    currImage = imgUp;
  } else {
    currImage = img;
  }

  if (fixedAngle.checked) {
    angleToggle = brushRot.value;
  } else {
    angleToggle = angleDeg;
  }

  if (status == true) {
    art.clear();
    status = !status;
  }

  //////////////////// GRID
  TILES_X = gridRows.value;
  TILES_Y = gridCols.value;
  TILE_W = width / TILES_X;
  TILE_H = height / TILES_Y;

  grid.push();
  grid.clear();
  grid.translate(TILE_W / 2, TILE_H / 2);
  for (let x = 0; x < TILES_X; x++) {
    for (let y = 0; y < TILES_Y; y++) {
      grid.rect(x * TILE_W, y * TILE_H, TILE_W, TILE_H);
    }
  }
  grid.pop();

  //////////////////// KURZOR
  preview.push();
  preview.clear();
  preview.translate(mouseX, mouseY);
  preview.rotate(radians(angleToggle));
  preview.scale(brushSize.value);
  preview.image(currImage, sx, sy, sw, sh, dx, dy, dw, dh);
  preview.pop();

  clear();

  mX = mouseX - prevX;
  mY = mouseY - prevY;
  rotationSensitivity = brushMov.value;

  // výpočet uhla v stupňoch
  angleDeg = atan2(mY, mX) * rotationSensitivity;
  console.log("angleDeg:", angleDeg);

  angleMapped = map(angleDeg, 0, rotationSensitivity, 0, 1);

  sx = 0;
  sy = 0;
  sw = int(brushWidth.value);
  /* sh = 20; */
  sh = int(brushHeight.value);

  /////////// OVLADANIE zdroja 
  dx = int(map(imgPosX.value, 0, 1500, 0, currImage.width));
  dy = int(map(imgPosY.value, 0, 1500, 0, currImage.height));
  dw = int(map(brushWidth.value, 0, 1500, 0, currImage.width));
  /* dh = 20; */
  dh = int(map(brushHeight.value, 0, 1500, 0, currImage.height));

  if (mouseIsPressed == true) {
    art.push();
    art.translate(mouseX, mouseY);
    art.rotate(radians(angleToggle));
    art.scale(brushSize.value);
    art.image(currImage, sx, sy, sw, sh, dx, dy, dw, dh);
    art.pop();
  }

  image(grid, width / 2, height / 2); // grid
  image(art, width / 2, height / 2); // artboard
  image(preview, width / 2, height / 2); // kurzor

  // brush preview
  push();
  imageMode(CORNER);
  fill("#555555");
  textSize(12);
  textAlign(LEFT, CENTER);
  text("Brush preview:", 15, 15);
  translate(15, 30);
  scale(map(brushWidth.value, 20, 1000, 1, 0.2));
  image(currImage, 0, 0, sw, sh, dx, dy, dw, dh);
  pop();
}

function saveImage() {
  art.save();
}

function mousePressed() {
  undoStack.push(art.get());
  if (undoStack.length > 20) undoStack.shift(); // limit pamäte
}

function keyPressed() {
  if ((key === 'z' || key === 'Z') && undoStack.length > 0) {
    const prev = undoStack.pop();
    art.clear();
    art.image(prev, width / 2, height / 2);
  }

  if (key === 'c' || key === 'C') {
    status = !status;
  }

}

