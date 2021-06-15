/** @type {HTMLCanvasElement} */
//* background image
const bgCanvas = document.getElementById("background-layer");
const bgCtx = bgCanvas.getContext("2d");
bgCanvas.width = window.innerWidth;
bgCanvas.height = window.innerHeight;
const img = new Image();
img.src = "../assets/maria-vojtovicova-snow.jpg";

// img.addEventListener("load", () => {});
// img.src = "../assets/maria-vojtovicova-snow.jpg";

//* snow layer
const snowCanvas = document.getElementById("snow-layer");
const snowCtx = snowCanvas.getContext("2d");
snowCanvas.width = window.innerWidth;
snowCanvas.height = window.innerHeight;

let hue = 0;

const snow = {
  snowArray: [],
  size: 3,
  amt: 15,
};

class Snow {
  constructor() {
    this.x = Math.floor(Math.random() * snowCanvas.width);
    this.y = Math.floor(Math.random() - 10) + 5;
    this.size = Math.floor(Math.random() * snow.size) + 1;
    this.velocityX = Math.random() * 3 - 1.5;
    this.velocityY = Math.random() * gravityPull + 0.5;
    this.color = `hsl(${hue}, 100%, 50%)`;
  }
  update() {
    this.x += Math.random() * 1 - 0.5; //* 2D vector creation
    this.y += this.velocityY;
  }
  draw() {
    snowCtx.fillStyle = this.color;
    snowCtx.beginPath(); //* like a paint path
    snowCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    snowCtx.fill();
    // bgCtx.drawImage(img, 0, this.y, 800, 600); //! Endless scroller?
  }
}