const NUM_LETTERS = 333;
const MAX_SPEED = 35;
const PADDING = 0;
const MAX_TEXT_SIZE = 64;

let letters = [];
let grabbedLetters = [];
let words = [];
let wind,gravity;
let mouseStart, mouseHeldTime, mouseActive;

let grabThreshold;
let mouse;

let highestSpeed = 0;

let debug = false;

const CC_VELOCITY = 41;
var velocity = 64;
const CC_ACCEL = 42;
var acceleration = 64;
const CC_FADE = 51;
var fade = 255;
const CC_SIZE_A = 43;
var size_a =  120;
const CC_SIZE_B = 44;
var size_b = 7;
const CC_X1 = 61;
var X1 = 85;
const X1_MIN = 7;
const X1_MAX = 200;
const CC_X2 = 62;
var X2 = 10;

function setup() {
  createCanvas(windowWidth, windowHeight); 

  
  midiInput = new MIDIInput();
  // Override onMIDIMessage callback with custom function
  midiInput.onMIDIMessage = onMIDIMessage;
  
  for(let i = 0; i < NUM_LETTERS; i++){
    letters[i] = new Letter();
  }
  
  wind = createVector(random(-0.1, 0.1), 0);
  gravity = createVector(0, -.005);
}

function draw() {
  let blur = map(highestSpeed,0,MAX_SPEED,255,0);
  background(255,blur);

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
    mouseHeldTime = 0;
  }

  grabThreshold = map(mouseHeldTime,0,10000,0,3333);

  wind.x = map(mouseX, 0, width, -0.1, 0.1);
  gravity.y = map(mouseY,height,0,.05,-.05);

  highestSpeed = 0;
  
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




function onMIDIMessage(data) {
  msg = new MIDI_Message(data.data);


  switch(msg.note){
    case CC_VELOCITY:
      velocity = 64 - msg.velocity;
      console.log("Velocity " + velocity);
      break;
    case CC_ACCEL:
      acceleration = msg.velocity / 20 + .1;
      console.log("acceleration " + acceleration);
      break;
    case CC_FADE:
      fade = msg.velocity == 127 ? 255 : msg.velocity / 2;
      console.log("FADE " + msg.velocity);
      break;
    case CC_SIZE_A:
      size_a = msg.velocity;
      console.log("size_a " + msg.velocity);
      break;
    case CC_SIZE_B:
      size_b = msg.velocity;
      console.log("size_b " + msg.velocity);
      break;
    case CC_X1:
      X1 = map(msg.velocity,0,127,X1_MIN,X1_MAX);
      console.log("x1 " + msg.velocity);
      break;
    case CC_X2:
      X2 = msg.velocity;
      console.log("x2 " + msg.velocity);
      break;



    default:
      console.log(msg.note + " " + msg.velocity);
  }
}

