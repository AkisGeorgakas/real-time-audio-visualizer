class Dots{

    dotsA = [];
    cols; 
    rows; 
    size = 30;
    margin = 100;
    speed = 0.1 ; 
    

    constructor(width,height){
        

        this.cols = (width - this.margin*2) / this.size;
        this.rows = (height - this.margin*2) / this.size;

        for (let i=0; i<this.cols; i++) {
            this.dotsA[i] = [];
            for (let j=0; j<this.rows; j++) {
                let x = this.margin + this.size/2 + i*this.size;
                let y = this.margin + this.size/2 + j*this.size;
                //distance from the center of the canvas
                let distance = dist(x, y, width/2, height/2);
                //angle for movement
                let angle = map(distance, 0, width/2, 0, TWO_PI * 3);
                //dots closer to the center move slower
                let scl = map(distance, 0, width/2, 0.3, 0.2);
                this.dotsA[i][j] = new Dot(x, y, angle, this.speed, scl);
            }
        }
    }
    
    draw(){
        for (let i=0; i<this.cols; i++) {
            for (let j=0; j<this.rows; j++) {
                this.dotsA[i][j].update();
                this.dotsA[i][j].display();
            }
        }
    }

}