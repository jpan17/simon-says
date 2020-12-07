# simon-says

## Data and Resources ##
* Hand gesture dataset (https://lttm.dei.unipd.it/downloads/gesture/)
* Kaggle gesture dataset (https://www.kaggle.com/koryakinp/fingers)
* Handpose model (https://www.npmjs.com/package/@tensorflow-models/handpose)
* Bootstrap template (https://github.com/StartBootstrap/startbootstrap-creative)
* Fingers test dataset (team-created) (https://drive.google.com/drive/folders/1zQRdwLCZBg0w7tgMW19OUPa7Shgq2DbZ)

## Usage ##
Navigate to this link and enable your webcam to play this game: https://jpan17.github.io/simon-says/

## Game Mechanics ##
* Game 'tutor' generates sequence of actions
  - different hand gestures (holding up fingers)
  - positions in psace relative to player's face
  - ex: '3', 'upper-left' <-- baseline textual representation
  - visual representation for webapp
* take video feed / live camera feed and detect the hands / classify the gesture
* calculate some kind of score based on the accuracy of the representation
