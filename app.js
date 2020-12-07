// const { traceDeprecation } = require("process");

// Set constraints for the video stream
var constraints = { video: { facingMode: 'user' }, audio: false }

var model = null;
    
// Game variables
let startGame = false, 
    sequence = [],
    curTime = 0,
    timePerSeq = 1

// Model parameters 
const modelParams = {
    flipHorizontal: true,   // flip e.g for video  
    maxNumBoxes: 3,         // maximum number of boxes to detect
    iouThreshold: 0.3,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
}

// Misc options
const options = {
    maxSizeFactor: 0.5,     
    heightScaleFactor: 0.25,
    widthScaleFactor: 0.25,
}

// HTML elements
const cameraView = document.querySelector('#camera-view'),
    cameraOutput = document.querySelector('#camera-output'),
    cameraSensor = document.querySelector('#camera-sensor'),
    startButton = document.querySelector('#start-button'),
    stopButton = document.querySelector('#stop-button'),
    testCanvas = document.querySelector('#test-canvas'),
    overlay = document.querySelector('#overlay'),
    handOverlay = document.querySelector('#hand-overlay'),
    seqDisplay = document.querySelector('#seq-display')

// Start and stop game
startButton.onclick = () => {
    startGame = true
    cameraOutput.classList.add('camera-output-started')
}
stopButton.onclick = () => {
    startGame = false
    console.log(`final score: ${sequence.length}, final time: ${curTime}`)
    console.log('sequence: ')
    console.table(sequence)
}

drawQuadrantLines(overlay)

// Start the video stream when the window loads
window.addEventListener('load', cameraStart)

// Load the model!
console.log('beginning to load model');
handpose.load().then(lmodel => {
    model = lmodel
    console.log('camera model loaded!');
})

// 0 - Top left
// 1 - Top right
// 2 - Bottom left
// 3 - Bottom right
function checkQuadrant(img, boundingBox, quadrant) {
  // Find center of bounding box
  const { topLeft: tl, bottomRight: br } = boundingBox;
  const bboxCenter = [(tl[0] + br[0]) / 2, (tl[1] + br[1]) / 2];
  
  // Find center of image
  const { width, height } = img;
  const imgCenter = [width / 2, height / 2];

  // Check correctness
  switch(quadrant) {
      case 0:
          return bboxCenter[0] <= imgCenter[0] && bboxCenter[1] <= imgCenter[1];
      case 1:
          return bboxCenter[0] >= imgCenter[0] && bboxCenter[1] <= imgCenter[1];
      case 2:
          return bboxCenter[0] <= imgCenter[0] && bboxCenter[1] >= imgCenter[1];
      case 3:
          return bboxCenter[0] >= imgCenter[0] && bboxCenter[1] >= imgCenter[1];
      default:
          return false;
  }
}

// This will probably return a promise
function checkFinger(img, prediction, numFingers) {
  const landmarks = normalizePredictions(prediction);
  console.log('Landmarks for model:')
  console.log(landmarks);
  let correct = false
  // Pass these landmarks to the classifier
  return fetch('http://127.0.0.1:8000', {
    method: 'POST', 
    body: JSON.stringify(landmarks)
  }).then(
      response => response.text()
  ).then(
      body => {
          console.log(body)
          correct = (parseInt(body) === numFingers)
          console.log('You were ' + correct)
          return correct
      }
  )
}

function checkQuadrantAndFinger(img, prediction, target) {
  const quadrantCorrect = checkQuadrant(img, prediction.boundingBox, target.quadrant);
  return quadrantCorrect && checkFinger(img, prediction, target.numFingers);    
}

// Verify whether hand is correct
function checkImage(img, target) {
  return model.estimateHands(img, modelParams.flipHorizontal).then(predictions => 
      predictions.map(p => checkQuadrantAndFinger(img, p, target))
  ).then(checks => {
      console.log(`Correct: ${checks[0]}`);
      return checks[0];
  })
}

// Detect hands with model
function runDetectionImage(img) {
    model.estimateHands(img, modelParams.flipHorizontal).then(predictions => {
        console.log(`Found ${predictions.length} hands`)
        console.log(predictions)
        let ctx = testCanvas.getContext('2d')
        if (predictions.length > 0) {
            renderPredictions(predictions, testCanvas, ctx, img)
        } 
    })
}

// Take snapshot
function capturePic() {
    if (startGame) {
        cameraSensor.width = cameraView.videoWidth
        cameraSensor.height = cameraView.videoHeight
        cameraSensor.getContext('2d').drawImage(cameraView, 0, 0)
        cameraOutput.src = cameraSensor.toDataURL('image/webp')
        
        if (curTime % timePerSeq == 0) {
            let { numFingers, quadrant } = getNextSeq()
            displayHandOutline(numFingers, quadrant)            
        }

        if (model) {
            runDetectionImage(cameraSensor, sequence[sequence.length - 1])
            checkImage(cameraSensor, sequence[sequence.length - 1]) 
        }
        curTime++
    }
}

// Read and analyze image every time step
setInterval(capturePic, 1000 * timePerSeq)
