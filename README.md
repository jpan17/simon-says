# Simon Says
Simon Says is a webapp that supports an interactive, memory-based game which uses the player’s webcam to record their 
actions. The game generates and displays incrementally longer sequences of gestures that the user must remember and 
repeat. The goal of the player is to replicate as many sequences and gestures as they can in the correct order. 
Gestures consist of holding up a certain number of fingers in a specified quadrant of the screen, and we use multiple 
models to detect, classify, and judge the player’s actions. 

The inspiration for this webapp came from the popular multiplayer game Among Us developed by Innersloth, which contains 
many mini-games for player ‘crewmates’ to complete. One of these mini-games consists of a keypad that flashes longer 
and longer sequences of keys for the player to replicate. The name of the mini-game is “Start Reactor”, but players 
refer to it as “Simon Says”, so we decided to take the colloquial name. We decided that creating a more interactive 
version of this mini-game (requiring players to not only recall the order of positions, but also the number of fingers 
in those positions) that logs real-time motions for the player would be a fascinating and unique application of 
computer vision.

## Usage ##
There are two modes of running the game. One requires running a local server and uses our classifier while the other 
can be run entirely in the browser and uses a manual method of counting fingers. 

To run the browser version, navigate to this [link](https://jpan17.github.io/simon-says/) and enable your webcam to play this game. 

To run the local version, run "node app_server.js" in the root folder and set useServer to true at the top of app.js. 
Then open index.html to play. 

## Game Mechanics ##
* Takes video feed from browser camera, so be sure to allow access
* Upon starting, game with shown outlines of hands in a specific quadrant holding up a certain number of fingers
* Player must replicate the position and fingers to move to the next round
* Each round adds an additional gesture that the player must remember and repeat
* The top counter shows which gesture the player is currently on out of the total gestures in the current sequence
* Once a wrong gesture is detected, the game ends and the player is shown the number of correct gestures made and their longest sequence
* Pressing the "Stop!" button will also end the game

## Behind the Scenes ##
To detect the hands, we used [Handpose](https://github.com/tensorflow/tfjs-models/tree/master/handpose) from MediaPipe. 
We took the 21 keypoints from Handpose's output and fed them into our own model to determine the number of fingers that 
are held up. Read more about this in our paper. 

## Folder Structure ##
The classifier folder contains our model and the data used to train the model. The landing folder is for the beautiful 
landing page. The models folder is for the handpose model. The overlays folder is for the hand outlines. And the scripts folder contain 
data cleaning and processing scripts. 

## Data and Resources ##
* Handpose model (https://www.npmjs.com/package/@tensorflow-models/handpose)
* Kinect + Senz3D hand gesture dataset (https://lttm.dei.unipd.it/downloads/gesture/)
* Kaggle fingers dataset (https://www.kaggle.com/koryakinp/fingers)
* Fingers test dataset (custom) (https://drive.google.com/drive/folders/1zQRdwLCZBg0w7tgMW19OUPa7Shgq2DbZ)
* Bootstrap template (https://github.com/StartBootstrap/startbootstrap-creative)
