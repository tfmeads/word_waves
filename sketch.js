const NUM_LETTERS = 333;
const MAX_SPEED = 35;
const PADDING = 333;
const MAX_TEXT_SIZE = 64;

let letters = [];
let grabbedLetters = [];
let words = [];
let wind,gravity;
let mouseStart, mouseHeldTime, mouseActive;

let grabThreshold;
let mouse;


let debug = false;

function setup() {
  createCanvas(windowWidth, windowHeight); for(let i = 0; i < NUM_LETTERS; i++){
    letters[i] = new Letter();
  }
  
  wind = createVector(random(-0.1, 0.1), 0);
  gravity = createVector(0, -.005);
}

function draw() {
  background(255);

  mouse = createVector(mouseX,mouseY);

  if(mouseIsPressed){
    if(!mouseActive){
      mouseStart = millis();
      mouseActive = true;
    }

    mouseHeldTime = millis() - mouseStart;
  }
  else{
    mouseActive = false;
    //mouseHeldTime = 0;
  }

  grabThreshold = map(mouseHeldTime,0,10000,55,3333);

  
  wind.x = map(mouseX, 0, width, -0.1, 0.1);
  gravity.y = map(mouseY,height,0,.05,-.05);
  
  for(let i = 0; i < NUM_LETTERS; i++){
    letters[i].display();
    letters[i].move();
  }
}

function keyTyped() {
  if (key === 'd') {
    debug = !debug;
  }  

  return false;
}

async function getFile(fileURL){
  let fileContent = await fetch(fileURL);
  fileContent = await  fileContent.text();
  return fileContent;
}

// Passing file url 
getFile('5letterwords.txt').then(content =>{
 // Using split method and passing "\n" as parameter for splitting
words =  content.trim().split("\n");

//add all permutations of word 
for (let i = 0; i < words.length; i++) {
  let word = words[i];
  for(let j = 2; j < word.length; j++){
    let str = word.substr(0,j);
    //console.log(str);
    if(words.indexOf(str) === -1){
      words.push(str);
    }
  }
}

//console.log(words);

}).catch(error =>{
  console.log(error);
});

class Letter {
  
  constructor(){
    this.init(true);

    textAlign(CENTER, CENTER);
  }

  init(first){
    //distribute around edges
    let x = random(-PADDING,PADDING);
    let y = random(-PADDING,PADDING);

    //randomly distribute when first launched
    if(first){
      x += random(width);
      y += random(height);
    }
    this.location = createVector(x,y);
    this.velocity = createVector(random(-5,5), 0);
    this.char = char(random(65, 90));
    this.textSize = random(MAX_TEXT_SIZE/2,MAX_TEXT_SIZE);
    this.fill = random(200,255);
    this.grabbed = false;
    this.setMaxSpeed();
  }

  checkGrabbed(){
    if(!mouseIsPressed){return;}

    let dist = Math.pow(Math.pow(mouseX - this.location.x,2) + Math.pow(mouseY - this.location.y,2),.5);

    //console.log(dist);
    
    this.grabbed = dist < grabThreshold;

    if(this.grabbed && grabbedLetters.indexOf(this) === -1){
      grabbedLetters.push(this);
    }
    else{
      this.grabbed = false;
      grabbedLetters.splice(grabbedLetters.indexOf(this), 1);
    }
  }

  checkCollisions(element){

    if(this === element){return;}

    let hit = collidePointPointVector(this.location, element.location, 55);

    if(hit){

      let newStr = this.char + element.char;

      let found = words.indexOf(newStr);

      if(found >= 0){
        if(debug){
          console.log(newStr + ": " + this.char + " hit " + element.char);
        }

        this.char = newStr;
        this.textSize = (this.textSize + element.textSize) / 2;
        this.setMaxSpeed();

        grabbedLetters.splice(grabbedLetters.indexOf(element), 1);
        element.init();
      }
    }

  }

  setMaxSpeed(){
    this.maxSpeed = map(this.textSize,MAX_TEXT_SIZE/2,MAX_TEXT_SIZE,MAX_SPEED,MAX_SPEED/2);
    this.windFactor =  map(this.textSize,MAX_TEXT_SIZE/2,MAX_TEXT_SIZE,1.2,.5);
  }

  move(){

    this.checkGrabbed();

    if(this.grabbed){
      this.location.slerp(mouse,.02);
      if(debug){
        line(this.location.x,this.location.y,mouseX,mouseY);
      }
    }
    else{
      this.velocity.add(p5.Vector.mult(wind,this.windFactor));
      this.velocity.add(gravity);
    }

    this.velocity.limit(this.maxSpeed);

    this.location.add(this.velocity);

    this.clampPos();

    if(this.grabbed){
      grabbedLetters.forEach(this.checkCollisions,this);
    }
  }

  clampPos(){
    if(this.location.y > height + PADDING){
      this.location.y = 0;
    }
    if(this.location.y < 0 - PADDING){
      this.location.y = height;
    }
    if(this.location.x > width + PADDING){
      this.location.x = 0;
    }
    if(this.location.x < 0 - PADDING){
      this.location.x = width;
    }
  }

  
  
  display(){
    fill(0,this.fill);
    textSize(this.textSize);
    text(this.char, this.location.x,this.location.y);

  }
}