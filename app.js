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
let timePerSeq = 3,
    newHandPauseTime = 3,
    inGame,
    sequence, 
    curTime, 
    curSeq, 
    pauseTime, 
    totalPauseTime,
    validDetection,
    correctGestures
resetGameVars()

// Misc options
const options = {
    maxSizeFactor: 0.5,     
    heightScaleFactor: 0.25,
    widthScaleFactor: 0.25,
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

// Verify whether hand is correct
function checkImage(img, target) {
  return model.estimateHands(img, modelParams.flipHorizontal).then(predictions => 
      checkQuadrantAndFinger(img, predictions[0], target)
  ).then(checks => {
      console.log(`Correct: ${checks}`);
      return checks;
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
            let { numFingers, quadrant } = getNextSeq()
            displayHandOutline(numFingers, quadrant)
            pauseTime = newHandPauseTime
            displayText = pauseTime
            curSeq = 0
            validDetection = false
            scoreDisplay.innerHTML = `Current: ${curSeq}/${sequence.length}`
        }
        
        // Check for next hand in sequence
        if (pauseTime > 0) {
            displayText = pauseTime
            pauseTime--
            totalPauseTime++
            console.log(`pause remaining: ${pauseTime}`)
        } else {
            clearHandOutline()
            if (model) {
                // runDetectionImage(cameraSensor, sequence[curSeq])
                checkImage(cameraSensor, sequence[curSeq]).then(validImage => {
                    validDetection = validImage || validDetection
                })
            }
            if ((curTime - totalPauseTime) % timePerSeq == 1 && curTime - totalPauseTime > 0) {
                if (!validDetection) {
                    displayText = '...'
                    middleText.innerHTML = displayText
                    endGame()
                } else {
                    console.log(`CORRECT!!!! ${curSeq}`)
                    correctGestures++
                    displayText = '✔'
                    middleText.innerHTML = displayText
                    validDetection = false
                    scoreDisplay.innerHTML = `Current: ${curSeq+1}/${sequence.length}`
                }
                displayHandOutline(sequence[curSeq].numFingers, sequence[curSeq].quadrant)
                curSeq++
            } else {
                displayText = '...'
                console.log('detecting...')
            }
        }
        
        middleText.innerHTML = displayText
        curTime++
    }
}

// Read and analyze image every time step
setInterval(capturePic, 1000)
