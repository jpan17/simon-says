// Set constraints for the video stream
var constraints = { video: { facingMode: 'user' }, audio: false }

var model = null;

// define model parameters 
const modelParams = {
    flipHorizontal: false,   // flip e.g for video  
    maxNumBoxes: 20,        // maximum number of boxes to detect
    iouThreshold: 0.3,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
}

const options = {
    maxSizeFactor: 0.5,     
    heightScaleFactor: 0.25,
    widthScaleFactor: 0.25,
}

function runDetectionImage(img) {
    const height = img.height;
    const width = img.width;

    model.detect(img).then(predictions => {
        var newPredictions = []
        predictions.forEach(prediction => {
            const boundingBox = prediction.bbox;
            // remove the really big ones
            if (boundingBox[2] > width * maxSizeFactor || boundingBox[3] > height * maxSizeFactor) {
                return;
            }

            // scale bounding box
            const widthIncrease = boundingBox[2] * widthScaleFactor;
            const heightIncrease = boundingBox[3] * heightScaleFactor;
            const newBoundingBox = [
                boundingBox[0] - widthIncrease / 2,
                boundingBox[1] - heightIncrease / 2,
                boundingBox[2] + widthIncrease,
                boundingBox[3] + heightIncrease,
            ]
            prediction.bbox = newBoundingBox;
            newPredictions.push(prediction);
        })

        // skip image if no predictions remain
        if (newPredictions.length === 0) {
            return;
        }
        
        // draw bounding box into testCanvas
        context = testCanvas.getContext('2d')
        model.renderPredictions(newPredictions, testCanvas, context, img);

        // save image from testCanvas to file
        var a = document.createElement('a');
        a.href = testCanvas.toDataURL();
        a.download = 'prediction.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

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
console.log('beginning to load model');
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    console.log('camera model loaded!');
});

setInterval(capturePic, 1000)
