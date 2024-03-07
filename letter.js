
class Letter {
  
    constructor(){
        this.init(true);
        textAlign(CENTER, CENTER);

        midiInput = new MIDIInput();
        // Override onMIDIMessage callback with custom function
        midiInput.onMIDIMessage = this.onMIDIMessage.bind(this);
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
      this.setColor();
      this.grabbed = false;
      this.setMaxSpeed();
    }
  

    
 onMIDIMessage(data) {
    let msg = new MIDI_Message(data.data);
    
    switch(msg.note){
      case CC_MAX_SPEED:
        this.setMaxSpeed();
        break;
      case CC_WIND:
        this.setMaxSpeed();
        break;
      case CC_BLUR:
        fade = msg.velocity == 127 ? 255 : msg.velocity / 2;
        break;
      case CC_FONT_SIZE:
        size_a = msg.velocity;
        break;
  
  
      default:
        //console.log(msg.note + " " + msg.velocity);
    }
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
  
          this.onCollide(element);
        }
      }
  
    }
  
    onCollide(element){
      this.char += element.char;
      this.textSize = (this.textSize + element.textSize) / 2;
      this.color.lerp(element.color,random(.25,.75));
      this.setMaxSpeed();
  
      grabbedLetters.splice(grabbedLetters.indexOf(element), 1);
      element.init();
    }
  
    setMaxSpeed(){
      this.maxSpeed = map(this.textSize,MAX_TEXT_SIZE/2,MAX_TEXT_SIZE,currMaxSpeed,currMaxSpeed/2);
      this.windFactor =  map(this.textSize,MAX_TEXT_SIZE/2,MAX_TEXT_SIZE,1.2,.5);
    }
    
    setColor(){
      this.fill = random(200,255);
      this.color = createVector(random(255),random(50,150),random(120,200));
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
  
      let speed = this.velocity.mag();
  
      if(speed > highestSpeed){
        highestSpeed = speed;
      }
  
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
      fill(this.color.x,this.color.y,this.color.z,this.fill);
      textSize(this.textSize);
      text(this.char, this.location.x,this.location.y);
    }
  }