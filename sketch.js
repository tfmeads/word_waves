const NUM_LETTERS = 333;


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

const CC_MAX_SPEED = 41;
let MAX_SPEED = 55;
let MIN_SPEED = 5;
let currMaxSpeed = 35;

let MAX_WIND = 0.5;
let MIN_WIND = 0.05;
let windSpeed = 0.1;
const CC_WIND = 42;
var acceleration = 64;
const CC_BLUR = 43;
let minBlur = 0;
var fade = 255;
const CC_FONT_SIZE = 44;
var size_a =  120;
const CC_PERMABLUR = 14;
let permablur = false;


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
  let blur = permablur ? 0 : map(highestSpeed,0,currMaxSpeed,255,minBlur);
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

  wind.x = map(mouseX, 0, width, -windSpeed,windSpeed);
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
    case CC_MAX_SPEED:
      currMaxSpeed = map(msg.velocity,0,127,MIN_SPEED,MAX_SPEED);
      if(debug){ console.log("Max Speed " + currMaxSpeed);}
      break;
    case CC_WIND:
      windSpeed = map(msg.velocity,0,127,MIN_WIND,MAX_WIND);
      if(debug){ console.log("Wind Speed " + acceleration);}
      break;
    case CC_BLUR:
      minBlur = map(msg.velocity,0,127,0,255);
      if(debug){ console.log("FADE " + msg.velocity);}
      break;
    case CC_FONT_SIZE:
      size_a = msg.velocity;
      if(debug){ console.log("size_a " + msg.velocity);}
      break;
    case CC_PERMABLUR:
      if(msg.velocity > 0){
        permablur = !permablur;
        if(debug){ console.log("permablur " + permablur ? "On" : "Off");}
      }
      break;



    default:
      console.log(msg.note + " " + msg.velocity);
  }
}

