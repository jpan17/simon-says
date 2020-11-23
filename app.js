// Set constraints for the video stream
var constraints = { video: { facingMode: 'user' }, audio: false }

var model = null;

// define model parameters 
const modelParams = {
    flipHorizontal: false,   // flip e.g for video  
    maxNumBoxes: 20,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
}

function runDetectionImage(img) {
    model.detect(img).then(predictions => {
        console.log("Predictions: ", predictions);
        context = testCanvas.getContext('2d')
        model.renderPredictions(predictions, testCanvas, context, img);
    });
}

// Define constants
const cameraView = document.querySelector('#camera-view'),
    cameraOutput = document.querySelector('#camera-output'),
    cameraSensor = document.querySelector('#camera-sensor'),
    startButton = document.querySelector('#start-button'),
    stopButton = document.querySelector('#stop-button'),
    testCanvas = document.querySelector('#test-canvas')
    
let startGame = false

// Access the device camera and stream to cameraView
let cameraStart = () => {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => {
            track = stream.getTracks()[0]
            cameraView.srcObject = stream
        })
        .catch(error => {
            console.error('Whoopsies... You dun goofed', error)
            alert('let me innn')
        })
}

// Start and stop game
startButton.onclick = () => {
    startGame = true
    cameraOutput.classList.add('camera-output-started')
}
stopButton.onclick = () => {
    startGame = false
}

// Start the video stream when the window loads
window.addEventListener('load', cameraStart)

// Take snapshot
let capturePic = () => {
    if (startGame) {
        cameraSensor.width = cameraView.videoWidth
        cameraSensor.height = cameraView.videoHeight
        cameraSensor.getContext('2d').drawImage(cameraView, 0, 0)
        cameraOutput.src = cameraSensor.toDataURL('image/webp')
        runDetectionImage(cameraOutput)
        
        //// Make sure the captured data is correct... imgData.data should be pixel values of each snapshot
        // testCanvas.width = cameraView.videoWidth
        // testCanvas.height = cameraView.videoHeight
        // let imgData = cameraSensor.getContext('2d').getImageData(0, 0, cameraSensor.width, cameraSensor.height)
        // testCanvas.getContext('2d').putImageData(imgData,0,0)
        // console.log(imgData.data)
    }
}

// Load the model.?
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    runDetectionImage(cameraOutput)
});

setInterval(capturePic, 1000)
