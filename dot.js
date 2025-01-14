class Dot {
  

    constructor(x, y, angle, speed, scl) {
      this.pos = createVector(x, y);
      this.center = createVector(width/2, height/2);
      this.dir = p5.Vector.sub(this.center, this.pos);
      this.maxMag = scl * this.dir.mag();
      this.angle = angle;
      this.speed = dotsSpeedSliderValue;
      this.blue = 0;
      this.green = 0;
      //Initial oscillation value is controlled by slider
      this.oscillation = dotsOscillationSliderValue;
    }
    
    update() {
      //Calculates oscillation based on the sine of the angle, affected by the oscillation slider value
      this.oscillation = this.maxMag*sin(this.angle) * dotsOscillationSliderValue;
      //Sets the oscillation direction vector with the calculated magnitude
      this.oscillationDir = p5.Vector.setMag(this.dir, this.oscillation);
      //Calculates the new position by adding the oscillation direction to the current position
      this.newPos = p5.Vector.add(this.pos, this.oscillationDir);

      
      if(volumeSlider.value() === 0){
        this.speed = 0.01;
      } else {
        //Scales the speed based on the volume slider value and the sound volume
        this.speed = min( volume * (1/(volumeSlider.value()+0.0001)) * dotsSpeedSliderValue ,1);
      }
      
      
      this.angle += this.speed;
      this.blue = this.newPos.x;
      this.green = this.newPos.y;
    }
    
    display() {
      noStroke();
      fill(125,map(this.green,0,1024,0,255),map(this.blue,0,1024,0,255));
      //fill(random(0,255),random(0,255),random(0,255));
      ellipse(this.newPos.x, this.newPos.y, 7, 7);
    }

    
  }