class Flowers{
  size = 100;
  petalCount = 10; 
  flowerCoordinatesAndSize= [[(width/2)-270,(height/2)-40,30],[(width/2)-170,(height/2)-200,70],[width/2,height/2,80],[(width/2)+310,(height/2)+110,40],[(width/2)+140,(height/2)+180,30]];
  flowersArray = [];
  spectrum;
  spectrum2;
  colors = [color(102, 102, 204),color(102, 204, 102),color(204, 102, 102),color(151, 102, 204),color(102, 151, 204),color(151, 204, 204),color(204, 151, 204)];
  colorPickerCounter = 0;

  


  constructor(){
    let newFlower;
    for(let info of this.flowerCoordinatesAndSize){
      newFlower = new Flower(info[0],info[1],info[2], this.colorPicker());
      this.flowersArray.push(newFlower);
    }
  }


  draw(){
    for(let flower of this.flowersArray){
      flower.display();
      flower.update();
    }
  }

  generateNewFlower(x,y){
    let newFlower;
    let randomSize = random(30,80);
    newFlower = new Flower(x,y,randomSize,this.colorPicker());
    this.flowersArray.push(newFlower);
  }

  colorPicker(){
    let colorPicked =  this.colors[this.colorPickerCounter];
    this.colorPickerCounter++;
    if (this.colorPickerCounter >= this.colors.length){
      this.colorPickerCounter = 0;
    }
    return colorPicked;
  }
}