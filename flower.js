class Flower{

  x;
  y;
  spectrum;
  petalCount;
  centerColor;
  petalColor;
  size = 0;
  sizeInitial;
  sizeMultiplier;
  

  constructor(x,y,size,petalColor){
      this.x = x;
      this.y = y;
      this.petalCount = petalCountSliderValue;
      this.spectrum =this.splitFreq(fft2.analyze(),this.petalCount);
      this.size = 0;
      this.sizeInitial = size;
      this.sizeMultiplier = flowerSizeSliderValue;
      this.centerColor = color(255, 204, 100); // Yellow center
      this.petalColor = petalColor; // Petal color
      }


  update(){
      this.petalCount = petalCountSliderValue;
      this.spectrum = this.splitFreq(fft2.analyze(),this.petalCount);
      this.size = this.sizeInitial * flowerSizeSliderValue;
  }

  //Default values: draw(width / 2, height / 2, 100, 10, spectrum);
  //How draw() will be implemented : draw(x, y, size, petalCount, spectrum)
  display() {
      

      noStroke();

      // Draw petals
      fill(this.petalColor);
      for (let i = 0; i < this.petalCount; i++) {
          let angle = TWO_PI / this.petalCount * i;
          let amplitude = this.spectrum[i % this.spectrum.length] / 255; // Scale amplitude for petal size

          // Petal radii
          let outerRadius = this.size * (1 + amplitude * 1.5); // Outer radius (varies with FFT)
          let controlRadius = this.size ;                // Control point radius

          // Petal points
          let startX = this.x + cos(angle) * this.size*0.2;             // Base of the petal
          let startY = this.y + sin(angle) * this.size*0.2;

          let endX = this.x + cos(angle + TWO_PI / this.petalCount) * this.size; // Other base of the petal
          let endY = this.y + sin(angle + TWO_PI / this.petalCount) * this.size;

          let controlX = this.x + cos(angle + (PI / this.petalCount)) * outerRadius; // Tip of the petal
          let controlY = this.y + sin(angle + (PI / this.petalCount)) * outerRadius;

          // Draw petal as a Bezier curve
          beginShape();
          vertex(startX, startY);                        // Start point
          quadraticVertex(controlX, controlY, endX, endY); // Curve to the control point and end
          endShape(CLOSE);
      }

      // Draw flower center
      fill(this.centerColor);
      ellipse(this.x, this.y, this.size * 0.5, this.size * 0.5);
  }

  splitFreq(spectrum, slicesPer) {
    var scaledSpectrum = [];
    var len = spectrum.length;
  
    var n = slicesPer;
    var binVals = Math.pow(2, 1/n);
  
    var lowestBin = slicesPer;
  
    var binI = len - 1;
    var i = binI;
  
    while (i > lowestBin) {
      var nextBin = round( binI/binVals );
  
      if (nextBin === 1) return;
  
      var total = 0;
      var numBins = 0;
      var totalWeights = 0;
      
      for (i = binI; i > nextBin; i--) {
        let weight = Math.log(i + 1); // Weighting factor for logarithmic emphasis
        total += spectrum[i] * weight;
        totalWeights += weight;
        numBins++;
    }
    var energy = total / totalWeights; // Weighted average

      scaledSpectrum.push(energy);
  
      //Next
      binI = nextBin;
    }
    scaledSpectrum.reverse();
  
    return scaledSpectrum;
  }
  
  


}