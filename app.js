// HTML elements
const cameraView = document.querySelector('#camera-view'),
    cameraOutput = document.querySelector('#camera-output'),
    cameraSensor = document.querySelector('#camera-sensor'),
    startButton = document.querySelector('#start-button'),
    stopButton = document.querySelector('#stop-button'),
    testCanvas = document.querySelector('#test-canvas'),
    overlay = document.querySelector('#overlay'),
    handOverlay = document.querySelector('#hand-overlay'),
    scoreDisplay = document.querySelector('#score-display'), 
    middleText = document.querySelector('#middle-text'),
    middleDisplay = document.querySelector('#middle-display'),
    infoDisplay = document.querySelector('#info-display')

// Game variables
let timePerSeq = 2,
    inGame,
    sequence, 
    curTime, 
    curSeq, 
    pauseTime, 
    totalPauseTime
resetGameVars()

// Misc options
const options = {
    maxSizeFactor: 0.5,     
    heightScaleFactor: 0.25,
    widthScaleFactor: 0.25,
    newHandPauseTime: 2,
    debuggingCanvas: false
}

// Set constraints for the video stream
var constraints = { video: { facingMode: 'user' }, audio: false }

var model = null;

// Model parameters 
const modelParams = {
    flipHorizontal: true,   // flip e.g for video  
    maxNumBoxes: 3,         // maximum number of boxes to detect
    iouThreshold: 0.3,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
}

// Start and stop game
startButton.onclick = () => {
    resetGameVars()
    inGame = true
    if (options.debuggingCanvas) cameraOutput.classList.add('camera-output-started')
    middleDisplay.classList.remove('hide')
    infoDisplay.classList.add('hide')
}
stopButton.onclick = () => {
    endGame()
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
//   console.log('Landmarks for model:')
//   console.log(landmarks);
  // Pass these landmarks to the model
  return true;
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
    //   console.log(`Correct hand #${curSeq}: ${checks[0]}`);
      return false || checks[0] ;
  })
}

// ONLY FOR DEBUGGING PURPOSES
// Detect hands with model
function runDetectionImage(img) {
    model.estimateHands(img, modelParams.flipHorizontal).then(predictions => {
        // console.log(`Found ${predictions.length} hands`)
        // console.log(predictions)
        let ctx = testCanvas.getContext('2d')
        if (predictions.length > 0) {
            renderPredictions(predictions, testCanvas, ctx, img)
        } 
    })
}

// Take snapshot
function capturePic() {
    if (inGame) {
        cameraSensor.width = cameraView.videoWidth
        cameraSensor.height = cameraView.videoHeight
        cameraSensor.getContext('2d').drawImage(cameraView, 0, 0)
        if (options.debuggingCanvas) cameraOutput.src = cameraSensor.toDataURL('image/webp')

        // Generate new hand
        if (curSeq == sequence.length) {
            scoreDisplay.innerHTML = `Score: ${sequence.length}`
            let { numFingers, quadrant } = getNextSeq()
            displayHandOutline(numFingers, quadrant)
            pauseTime = options.newHandPauseTime
            displayText = pauseTime
            curSeq = 0
        }
        
        // Check for next hand in sequence
        if (pauseTime > 0) {
            displayText = pauseTime
            pauseTime--
            totalPauseTime++
            console.log(`pause remaining: ${pauseTime}`)
        } else if ((curTime - totalPauseTime) % timePerSeq == 1 && curTime - totalPauseTime > 0) {
            clearHandOutline()
            displayText = (curTime - totalPauseTime) % timePerSeq
            if (model) {
                // runDetectionImage(cameraSensor, sequence[curSeq])
                checkImage(cameraSensor, sequence[curSeq]).then(validImage => {
                    if (!validImage) {
                        // displayText = '❌'
                        displayText = '...'
                        middleText.innerHTML = displayText
                        endGame()
                    } else {
                        console.log(`CORRECT!!!! ${curSeq}`)
                        displayText = '✔'
                        middleText.innerHTML = displayText
                    }
                })
            }
            curSeq++
        } else {
            clearHandOutline()
            displayText = '...'
            console.log('detecting...')
        }
        
        middleText.innerHTML = displayText
        curTime++
    }
}

// Read and analyze image every time step
setInterval(capturePic, 1000 * timePerSeq)
