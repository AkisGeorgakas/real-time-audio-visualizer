// Main canvas for visuals
let mainCanvas; 
// Small canvas for analytics
let analyticsCanvas; 
//Sound Analysis 
let fft;
let fft2;
let amplitude;
let spectrum;
let vol;
let beatThreshold = 0.5;  // Beat sensitivity
let beatHoldTime = 20;    // Frames to wait after a beat is detected
let beatDecayRate = 0.95; // How quickly the beat threshold resets
let beatFrameCount = 0;   // Counter to manage beat hold time
//Media Controls
let songControlsDiv;
let spacerDiv;
let mainSongControlsDiv;
let volumeSongControlsDiv;
let progressSongControlsDiv; 
let playButton;
let previousButton;
let nextButton;
let volumeIcon;
let volumeSlider;
let volumeSliderValue;
let volumeSliderLabel;
let progressSlider;
let progressSliderLabel;
let currentTime = 0;
let duration = 0;
let isDragging = false; // Track if the user is interacting with the slider
let isChangingManually = false; // Tracks if a manual jump is happening
//Dots Mode
let dotsSpeedSlider;
let dotsSpeedSliderValue;
let dotsSpeedSliderLabel;
let dotsOscillationSlider;
let dotsOscillationSliderValue;
let dotsOscillationSliderLabel;
//Flowers Mode
let petalCountSlider;
let petalCountSliderValue;
let petalCountSliderLabel;
let flowerSizeSlider;
let flowerSizeSliderValue;
let flowerSizeSliderLabel;
let flowerGeneratorLabel;
//Modes Controls
let modesButtons = [];
let modesControlDiv;
let modeObject = null;
let currentModeId;
//Playback & Playlist Controls
let playlistDiv;
let playlistDivLabel;
let playlist = [];
let currentSong;
let firstSong  = "under_pressure.mp3";
let songsToLoad = ["the_illuminator.mp3", "sega_sunset.mp3", "house_of_the_rising_sun.mp3", "all _of_me.mp3", "somebody_to_love.mp3", "pneuma.mp3", "i_put_a_spell_on_you.mp3", "atmosphere.mp3"]; // Background songs
let isOtherSongsReady = false; // Status flag for background loading
let songButtons = []; // To store button references

/** 
 * Toggles the currently selected song between playing/paused. 
 * @returns {void}
 */
function toggleSong(){
  if(currentSong.sound.isPlaying()){
    currentSong.sound.onended(() => {}); // Remove onended() callback function to prevent from being called upon .pause()
    playButton.html('\u23F5'); // Change button icon to *play* 
    currentSong.sound.pause();
  }else{
    playButton.html('\u23F8'); // Change button icon to *pause* 
    currentSong.sound.play(); 
    currentSong.sound.onended(nextSong); // Attach onended() callback function. Change to next song if song reaches it's end
  }
}

/** 
 * Creates a new button within the playlist div.  
 * @param {string} name of the audio file
 * @returns {Button Object} newly created Button Object
 */
function createSongButton(filename){
  //Check if this song's button already exists. If yes, return
  for(button of songButtons){
    if(button.attribute('name') === filename){
      return button;
    }
  }
  let newSongButton = createButton(filename);  // Create new button
  newSongButton.class('song-button');
  newSongButton.attribute('name',filename); // Keep file name as attribute. Used for search when button is clicked
  newSongButton.mousePressed( function(){
    changeSong(filename);
  });
  newSongButton.parent(playlistDiv); // Append button to playlistDiv
  songButtons.push(newSongButton); // Push button to songButtons
  return newSongButton;
}

/** 
 * Checks whether a given song is the one already selected.  
 * @param {string} name of the song to check
 * @returns {boolean} true if it's the same as currentSong
 */
function isCurrentSong(song){
  return song === currentSong.name;
}

/** 
 * Finds the index of the song previous to the currentSong.  
 * @param {number} index of the currentSong within the playlist[]
 * @returns {number} previous index or the last song if currentSong is the first
 */
function getPreviousIndex(i){
  let previousIndex = --i;
  if(previousIndex < 0){
    previousIndex = playlist.length - 1; // If reached out of bounds, return to the bottom of the playlist
  }
  return previousIndex;
}

/** 
 * Finds the index of the song next to the currentSong.  
 * @param {number} index of the currentSong within the playlist[]
 * @returns {number} next index or the first song if currentSong is the last
 */
function getNextIndex(i){
  let nextIndex = ++i;
  if(nextIndex >= playlist.length){
    nextIndex = 0; // If reached out of bounds, return to the top of the playlist
  }
  return nextIndex;
}

/** 
 * Changes the selected song to the newSong given.
 * @param {string} name of the new song we want to select
 * @returns {void} 
 */
function changeSong(newSong){
  if (isChangingManually) return; // Prevent unwanted calls during manual changes
  if(! isCurrentSong(newSong)){ // Only change songs if a different than the current one was given
    currentSong.sound.onended(() => {}); // Remove onended() callback function to prevent from being called upon .stop()
    let newSongObject = playlist.find(item => item.name === newSong); // Find the new song within the playlist and store as song Object
    if(currentSong.sound.isPlaying()){
      currentSong.sound.stop();
      newSongObject.sound.play();
    }

    songButtons.find(button => button.attribute('name') === currentSong.name).removeClass('active');
    songButtons.find(button => button.attribute('name') === newSongObject.name).addClass('active');

    currentSong = newSongObject;
    // Reset the flag and reassign the callback
    isChangingManually = false;
    currentSong.sound.onended(nextSong); // Attach onended() callback function. Change to next song if song reaches it's end
  }
}

/** 
 * Finds the previous song and calls changeSong() to change to it.
 * @returns {void} 
 */
function previousSong(){
  let currentSongIndex = playlist.findIndex(item => item.name === currentSong.name); // Search the previous song by name 
  changeSong(playlist[getPreviousIndex(currentSongIndex)].name); // Change song
}

/** 
 * Finds the next song and calls changeSong() to change to it.
 * @returns {void} 
 */
function nextSong(){
  let currentSongIndex = playlist.findIndex(item => item.name === currentSong.name); // Search the previous song by name
  changeSong(playlist[getNextIndex(currentSongIndex)].name); // Change song
}

/** 
 * Changes the mode of visualization.
 * @param {number} id of the new mode to change to
 * @returns {void} 
 */
function changeMode(newModeId){
  if(!(newModeId === currentModeId)){ // Only change modes if a different than the current one was given
    switch(newModeId.toString()){
      case '0':
        initializeDots();
        break;
      case '1':
        initializeFlowers();
        break;
    }
  }
}

/** 
 * Initializes the Dots Object and changes the modes controls accordingly
 * @returns {void} 
 */
function initializeDots(){
  //Delete old mode
  modeObject = null; // Delete old Object
  if(currentModeId === 1){
    // Delete old Flowers controls
    petalCountSlider.remove();
    petalCountSliderLabel.remove();
    flowerSizeSliderLabel.remove();
    flowerSizeSlider.remove();
    flowerGeneratorLabel.remove();
  }

  //Initialize new mode
  // Create new Dots controls
  dotsSpeedSliderLabel = createP('Dots Speed:');
  dotsSpeedSliderLabel.parent(canvasControlsDiv);

  dotsSpeedSlider = createSlider(0.5, 1.5, 1, 0);
  dotsSpeedSlider.size(80);
  dotsSpeedSlider.parent(canvasControlsDiv);
  dotsSpeedSliderValue = dotsSpeedSlider.value();

  dotsOscillationSliderLabel = createP('Dots Oscillation Range:');
  dotsOscillationSliderLabel.parent(canvasControlsDiv);

  dotsOscillationSlider = createSlider(0.001, 2, 0.3, 0);
  dotsOscillationSlider.size(80);
  dotsOscillationSlider.parent(canvasControlsDiv);
  dotsOscillationSliderValue = dotsOscillationSlider.value();
  
  modeObject = new Dots(width,height); // Create new Dots Object
  modesButtons[1].removeClass('active');
  modesButtons[0].addClass('active');
  currentModeId = 0;
}

/** 
 * Initializes the Flowers Object and changes the modes controls accordingly
 * @returns {void} 
 */
function initializeFlowers(){
  // Delete old mode
  modeObject = null; // Delete old Object
  if(currentModeId === 0){
    // Delete old Dots controls
    dotsSpeedSliderLabel.remove();
    dotsSpeedSlider.remove();
    dotsOscillationSliderLabel.remove();
    dotsOscillationSlider.remove();
  }

  // Initialize new mode
  // Create new Flowers controls
  petalCountSliderLabel = createP('Petal Count:');
  petalCountSliderLabel.parent(canvasControlsDiv);

  petalCountSlider = createSlider(8, 64, 12);
  petalCountSlider.size(80);
  petalCountSlider.parent(canvasControlsDiv);
  petalCountSliderValue = petalCountSlider.value();

  flowerSizeSliderLabel = createP('Flower Size:');
  flowerSizeSliderLabel.parent(canvasControlsDiv);

  flowerSizeSlider = createSlider(0.7, 1.2, 1, 0);
  flowerSizeSlider.size(80);
  flowerSizeSlider.parent(canvasControlsDiv);
  flowerSizeSliderValue = flowerSizeSlider.value();

  flowerGeneratorLabel = createP('Click on the canvas <br>to generate your own <br>flowers!');
  flowerGeneratorLabel.parent(canvasControlsDiv);

  modeObject = new Flowers(); // Create new Flowers Object
  modesButtons[0].removeClass('active');
  modesButtons[1].addClass('active');
  currentModeId = 1;
}

/** 
 * Loads the first song before setup begins
 * @returns {void} 
 */
function preload() {
  // Load song and push to playlist[]
  loadSound(
    `/music/${firstSong}`,
    (sound) => {
      playlist.push({ name: firstSong, sound: sound });
    }
  );
}

/** 
 * Sets up canvas, general divs, media controls, modes buttons and initializes the default modeObject
 * @returns {void} 
 */
function setup() {
  loadOtherSongs(); // Load remaining song in the background
  mainCanvas = createCanvas(windowWidth - 500 , windowHeight - 200);
  analyticsCanvas = createGraphics(200, 600);

  // Create the necessary divs for element organization.
  playlistDiv = createDiv();
  playlistDiv.class('playlist-div');

  playlistDivLabel = createP('Playlist:');
  playlistDivLabel.parent(playlistDiv);
  
  createSongButton(playlist[0].name).addClass('active'); // Create the first song's button in the playlist
  currentSong = playlist[0];
  
  modesControlDiv = createDiv();
  modesControlDiv.class('modesControl-div');

  progressSongControlsDiv = createDiv();
  progressSongControlsDiv.class('progressSongControls-div');

  songControlsDiv = createDiv();
  songControlsDiv.class('songControls-div');

  spacerDiv = createDiv();
  spacerDiv.class('spacer-div');
  spacerDiv.parent(songControlsDiv);

  mainSongControlsDiv = createDiv();
  mainSongControlsDiv.class('mainSongControls-div');
  mainSongControlsDiv.parent(songControlsDiv);

  volumeSongControlsDiv = createDiv();
  volumeSongControlsDiv.class('volumeSongControls-div');
  volumeSongControlsDiv.parent(songControlsDiv);

  canvasControlsDiv = createDiv();
  canvasControlsDiv.class('canvasControls-div');

  // Create the media controls
  previousButton = createButton('\u23EE');
  previousButton.class('previous-button');
  previousButton.mousePressed(previousSong);
  previousButton.parent(mainSongControlsDiv);

  playButton = createButton('\u23F5');
  playButton.class('play-button');
  playButton.mousePressed(toggleSong);
  playButton.parent(mainSongControlsDiv);

  nextButton = createButton('\u23ED');
  nextButton.class('next-button');
  nextButton.mousePressed(nextSong);
  nextButton.parent(mainSongControlsDiv);

  volumeSliderLabel = createDiv('<i class="fas fa-volume-high"></i>');
  volumeSliderLabel.class('volume-icon');
  volumeSliderLabel.parent(volumeSongControlsDiv);

  volumeSlider = createSlider(0, 1, 0.5, 0);
  volumeSlider.size(120);
  volumeSlider.parent(volumeSongControlsDiv);
  volumeSliderValue = volumeSlider.value();
  currentSong.sound.setVolume(volumeSliderValue);
  
  // Create the modes controls
  let modesLabel = createP('Visualization Modes:');
  modesLabel.parent(modesControlDiv); 

  let numberModesButtons = 2;
  let modesButtonsLabels = ['Dots', 'Flowers'];
  let newButton;

  for(let i = 0; i < numberModesButtons; i++){
    newButton = createButton(modesButtonsLabels[i]);
    newButton.class('modes-button');
    newButton.attribute('id',i.toString());
    newButton.mousePressed( function(){
      changeMode(i);
    });
    newButton.parent(modesControlDiv); // Append button to modesControlDiv
    modesButtons[i] = newButton; // Append button to modesButtons[]
  }

  // Create the progress slider
  progressSliderLabel = createP(`${currentTime} / ${duration}`);
  progressSliderLabel.parent(progressSongControlsDiv);
  progressSlider = createSlider(0, 100, 0); // Min: 0, Max: 100, Initial: 0
  progressSlider.parent(progressSongControlsDiv);
  progressSlider.style("width", "100%"); // Set slider width
  
  

  // Event listener for user interaction
  progressSlider.input(() => {
    isChangingManually = true; // User is interacting with the slider
    isDragging = true;
  });

  progressSlider.mouseReleased(() => {
    if (currentSong.sound.isLoaded()) {
        const newTime = (progressSlider.value() / 100) * currentSong.sound.duration();
        currentSong.sound.jump(newTime); // Jump to the new time
    }
    isDragging = false;

    // Reset the flag with a slight delay to prevent immediate `onended` triggers
    setTimeout(() => {
        isChangingManually = false;
    }, 50);
});

  // Create p5.fft Objects for audio analysis 
  amplitude = new p5.Amplitude();
  fft = new p5.FFT(0.85,64);
  fft2 = new p5.FFT(0.85,1024);
  
  initializeFlowers(); // Initialize the default mode
}

/** 
 * If Flowers mode enabled and a click is registered, creates a new Flower 
 * @returns {void} 
 */
function mouseClicked(){
  // Check whether Flowers mode is enabled and the mouse is within the Canvas
  if(currentModeId === 1 && mouseWithinCanvas(mouseX,mouseY)){ 
    modeObject.generateNewFlower(mouseX,mouseY);
  }
}

/** 
 * Checks if the coordinates are whithin the canvas
 * @returns {boolean} returns true if coordinates inside canvas 
 */
function mouseWithinCanvas(x,y){
  return ( x >= 0 && x <= width && y >= 0 && y <= height);
}

/** 
 * Gets called at every frame and responsible for drawing on canvas
 * @returns {void}
 */
function draw() {
  background(0);
  // Update variable values according to slider position
  if(currentModeId === 0){
    dotsSpeedSliderValue = dotsSpeedSlider.value();
    dotsOscillationSliderValue = dotsOscillationSlider.value();
  } else{
    petalCountSliderValue = petalCountSlider.value();
    flowerSizeSliderValue = flowerSizeSlider.value();
  }
  currentSong.sound.setVolume(volumeSlider.value());
  volume = amplitude.getLevel(); // Update volume. This is accessed by Dots to affect their speed.
  
  modeObject.draw();

  // Update slider if not dragging
  if (currentSong.sound.isPlaying() && !isDragging) {
    const progress = (currentSong.sound.currentTime() / currentSong.sound.duration()) * 100;
    progressSlider.value(progress); // Update slider value
  }

  // Display current time and duration
  currentTime = formatTime(currentSong.sound.currentTime());
  duration = formatTime(currentSong.sound.duration());
  progressSliderLabel.html(`${currentTime} / ${duration}`);

  analyticsCanvas.background(0);
  //1.Waveform analysis
  var waveform = fft.waveform();

  analyticsCanvas.noFill();
  analyticsCanvas.stroke(255,100,55);
  analyticsCanvas.strokeWeight(2);

  analyticsCanvas.beginShape();
  for(var i =0; i<waveform.length; i++){
    var x = map(i,0,waveform.length,0,analyticsCanvas.width);
    var y = map(waveform[i], -1, 1, 0, analyticsCanvas.height/3);
    analyticsCanvas.vertex(x,y);
  }
  analyticsCanvas.endShape();
  analyticsCanvas.fill(255);
  analyticsCanvas.textSize(12);
  analyticsCanvas.textAlign(CENTER, CENTER);
  analyticsCanvas.text(`Waveform analysis`, analyticsCanvas.width / 2, analyticsCanvas.height/6 + 40);

  //2.Spectrum analysis:
  var fftLin = fft.linAverages(15);
  analyticsCanvas.noStroke();
  analyticsCanvas.fill(100,255,55);
  for(var i =0; i<fftLin.length; i++){
    var x = map(i,0,fftLin.length,0, analyticsCanvas.width);
    var h = map(fftLin[i], 0, 255, 0, analyticsCanvas.height/3);
    analyticsCanvas.rect(x, analyticsCanvas.height / 3 + (analyticsCanvas.height / 3) - h, analyticsCanvas.width / fftLin.length, h);
  }
  analyticsCanvas.fill(255);
  analyticsCanvas.textSize(12);
  analyticsCanvas.textAlign(CENTER, CENTER);
  analyticsCanvas.text(`Spectrum analysis`, analyticsCanvas.width / 2, analyticsCanvas.height/2  - 40);

  //3.Bass Frequencies
  let spectrum = fft.analyze();
  // Get energy in the bass range (0-200 Hz)
  let bassEnergy = fft.getEnergy('bass');

  // Beat detection based on bass energy
  if (bassEnergy > beatThreshold && beatFrameCount <= 0) {
    beatFrameCount = beatHoldTime;
    //prevent false beats
    beatThreshold = bassEnergy * 1.1; 
  }

  // Decay the threshold over time
  beatThreshold *= beatDecayRate;

  // Decrease beat hold time counter
  if (beatFrameCount > 0) {
    beatFrameCount--;
  }

 //Pulsating rings
  analyticsCanvas.noFill();
  analyticsCanvas.strokeWeight(3);
  let maxRadius = map(bassEnergy, 0, 255, 50, 100); 
  for (let i = 0; i < 5; i++) {
  let alpha = map(i, 0, 5, 255, 50); // Fading effect for outer rings
    analyticsCanvas.stroke(lerpColor(color(255, 0, 0), color(0, 0, 255), i / 5), alpha);
    analyticsCanvas.ellipse(analyticsCanvas.width / 2, analyticsCanvas.height / 6*5, maxRadius + i * 5, maxRadius + i * 5);
  }

  //Center
  analyticsCanvas.noStroke();
  analyticsCanvas.fill(255, 200, 100, 200);
  let centerSize = map(bassEnergy, 0, 255, 0, analyticsCanvas.height/6);
  analyticsCanvas.ellipse(analyticsCanvas.width / 2, analyticsCanvas.height / 6 *5, centerSize, centerSize);

  //Display the bass energy value
  analyticsCanvas.fill(255);
  analyticsCanvas.textSize(12);
  analyticsCanvas.textAlign(CENTER, CENTER);
  analyticsCanvas.text(`Bass Energy: ${Math.round(bassEnergy)}`, analyticsCanvas.width / 2, analyticsCanvas.height - 20);

// Overlay the analytics canvas onto the main canvas
  image(analyticsCanvas, width - analyticsCanvas.width - 10, height - analyticsCanvas.height - 10);

}

// Helper function to format time as mm:ss
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}


function loadOtherSongs() {
  let loadedCount = 0;

  // Iterate through the list of additional songs
  songsToLoad.forEach((fileName) => {
    loadSound(
      `/music/${fileName}`,
      (sound) => {
        // On success: Update button and add to buttons list
        playlist.push({ name: fileName, sound: sound })
        createSongButton(fileName)
        //songButtons[index + 1].sound = sound;
        //songButtons[index + 1].isLoading = false;
        console.log(`${fileName} loaded`);
        loadedCount++;

        // Check if all songs are loaded
        if (loadedCount === songsToLoad.length) {
          isOtherSongsReady = true; // Update the loading status
          console.log("All additional songs are ready.");
        }
      }
    );
  });
}

