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
    model.estimateHands(img).then(predictions => {
        console.log(`Found ${predictions.length} hands`)
        console.log(predictions)
        if (predictions.length > 0) {
            for (let i = 0; i < predictions.length; i++) {
                const prediction = predictions[i]
                //// Log hand keypoints.
                // const keypoints = predictions[i].landmarks;
                // for (let i = 0; i < keypoints.length; i++) {
                //     const [x, y, z] = keypoints[i];
                //     console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
                // }
                console.log(`Confidence scores: ${prediction.handInViewConfidence}`)
                console.log(`Bounding Box:`)
                console.table(prediction.boundingBox)

                // Draw diagonal of bounding box
                let { topLeft, bottomRight } = prediction.boundingBox
                let cw = cameraSensor.width, 
                    ch = cameraSensor.height, 
                    tw = testCanvas.width, 
                    th = testCanvas.height
                let ctx = testCanvas.getContext('2d')
                ctx.beginPath()
                // Multiply by tw/cw to rescale box from cameraSensor coords to testCanvas coords
                // Btw I tested the coords directly on cameraSensor and the lines drawn were the same, so the rescaling should work
                ctx.moveTo(Math.floor(topLeft[0] * tw / cw), Math.floor(topLeft[1] * th / ch))
                ctx.lineTo(Math.floor(bottomRight[0] * tw / cw), Math.floor(bottomRight[1] * th / ch))
                ctx.stroke()
            }
        } 
    })

    /**
     * Code for HandTrack.js and bounding boxes below
     */
    // const height = img.height;
    // const width = img.width;

    // model.detect(img).then(predictions => {
    //     var newPredictions = []
    //     predictions.forEach(prediction => {
    //         const boundingBox = prediction.bbox;
    //         // remove the really big ones
    //         if (boundingBox[2] > width * options.maxSizeFactor || boundingBox[3] > height * options.maxSizeFactor) {
    //             return;
    //         }

    //         // scale bounding box
    //         const widthIncrease = boundingBox[2] * options.widthScaleFactor;
    //         const heightIncrease = boundingBox[3] * options.heightScaleFactor;
    //         const newBoundingBox = [
    //             boundingBox[0] - widthIncrease / 2,
    //             boundingBox[1] - heightIncrease / 2,
    //             boundingBox[2] + widthIncrease,
    //             boundingBox[3] + heightIncrease,
    //         ]
    //         prediction.bbox = newBoundingBox;
    //         newPredictions.push(prediction);
    //     })

    //     // skip image if no predictions remain
    //     if (newPredictions.length === 0) {
    //         return;
    //     }
        
    //     // draw bounding box into testCanvas
    //     context = testCanvas.getContext('2d')
    //     model.renderPredictions(newPredictions, testCanvas, context, img);

    //     // // save image from testCanvas to file
    //     // var a = document.createElement('a');
    //     // a.href = testCanvas.toDataURL();
    //     // a.download = 'prediction.png';
    //     // document.body.appendChild(a);
    //     // a.click();
    //     // document.body.removeChild(a);

    // });
}

// Define constants
const cameraView = document.querySelector('#camera-view'),
    cameraOutput = document.querySelector('#camera-output'),
    cameraSensor = document.querySelector('#camera-sensor'),
    startButton = document.querySelector('#start-button'),
    stopButton = document.querySelector('#stop-button'),
    testCanvas = document.querySelector('#test-canvas'),
    seqDisplay = document.querySelector('#seq-display')
    
// Game variables
let startGame = false, 
    sequence = [],
    curTime = 0,
    timePerSeq = 3

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
    console.log(`final score: ${sequence.length}, final time: ${curTime}`)
    console.log('sequence: ')
    console.table(sequence)
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
        if (model) {
            // Not sure why, but doesn't work on cameraOutput
            runDetectionImage(cameraSensor)
        }
        
        if (curTime % timePerSeq == 0) {
            quadNum = Math.floor(Math.random() * 4)
            fingNum = Math.floor(Math.random() * 6)
            sequence.push(`${quadNum}${fingNum}`)
            seqDisplay.innerHTML = `Next: ${sequence[sequence.length - 1]}`
        }
        curTime++
    }
}

// Load the model!
console.log('beginning to load model');
handpose.load().then(lmodel => {
    model = lmodel
    console.log('camera model loaded!');
})

setInterval(capturePic, 1000)
