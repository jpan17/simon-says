/**
 * To run, open script.html
 * Run this to serve image files: npx http-server -c1 --cors .
 * Run this to run server: node server.js
 */

const cameraSensor = document.querySelector('#camera-sensor'),
      saveCanvas = document.querySelector('#save-canvas'),
      stopButton = document.querySelector('#stop')
cameraSensor.width = 2590
cameraSensor.height = 3460
ctx = cameraSensor.getContext('2d')
saveCtx = saveCanvas.getContext('2d')

const settings = {
  multiple: true, 
  download: false,
  keypointsToFile: true,
  customModelParams: false,
  crop: false,
  download: false,
}
const modelParams = settings.customModelParams ? {
  detectionConfidence: 0.1,
  iouThreshold: 0,
  scoreThreshold: 0
} : {}
let keypointsOutput = ''

stopButton.onclick = () => {
  settings.multiple = false
  settings.download = false
}

// Get distance from this point to the origin
function getDist(p1, p2) {
  return Math.sqrt(
      Math.pow(p2[0] - p1[0], 2) +
      Math.pow(p2[1] - p1[1], 2)
  );
}

// Get the angle to rotate counter clockwise for the point to be vertical upwards
function calculateAngleToVertical(origin, point) {
  const x = point[0] - origin[0];
  const y = point[1] - origin[1];
  if (y === 0) {
      return (x > 0 ? 1 : -1) * Math.PI / 2; 
  }
  return Math.atan(x / y) + (y < 0 ? 0 : Math.PI);
}

function normalizePredictions(prediction) {
  // Create function to center landmarks to the palm base
  const { palmBase, middleFinger } = prediction.annotations;
  function centerLandmark(landmark) {
      return [
          landmark[0] - palmBase[0][0],
          landmark[1] - palmBase[0][1],
          landmark[2],
      ]
  }

  // Create function to rotate landmarks to be vertical
  const angle = calculateAngleToVertical(palmBase[0], middleFinger[0]);
  const sinTheta = Math.sin(angle);
  const cosTheta = Math.cos(angle);
  function applyRotation(landmark) {
      return [
          landmark[0] * cosTheta - landmark[1] * sinTheta,
          landmark[0] * sinTheta + landmark[1] * cosTheta,
          landmark[2],
      ]
  }
  
  // Scales landmark to uniform size
  const unitLength = getDist(palmBase[0], middleFinger[0]);
  function scaleDown(landmark) {
      return [
          landmark[0] / unitLength,
          landmark[1] / unitLength,
          landmark[2],
      ]
  }

  // Uncenter landmark (used for rendering the points)
  function uncenterLandmark(landmark) {
      return [
          landmark[0] + palmBase[0][0],
          landmark[1] + palmBase[0][1],
          landmark[2],
      ]
  }

  // Apply centering and rotating functions to landmarks
  const { landmarks } = prediction;
  return landmarks.map(centerLandmark).map(applyRotation).map(scaleDown);
}

handpose.load(modelParams).then(model => {
  finger = 0
  fingerCount = [32, 21, 20, 19, 24, 21]
  count = 0
  stop = false

  // Using img to draw image on canvas
  img = new Image
  img.crossOrigin = 'anonymous'
  img.src = `http://127.0.0.1:8080/will/${finger}-${count}.jpg`
  img.onerror = () => console.log('oopsies.. you dun goofed')
  img.onload = () => {
    ctx.drawImage(img, 0, 0)
    
    model.estimateHands(cameraSensor).then(predictions => {
      console.log(`detected ${predictions.length} hands for finger ${finger} #${count}`)

      // Crop image to saveCanvas
      if (predictions.length > 0) {
        if (settings.crop) {
          bb = predictions[0].boundingBox
          tl = bb.topLeft, br = bb.bottomRight
          newWidth = br[0] - tl[0], newHeight = br[1] - tl[1]
          saveCanvas.width = newWidth
          saveCanvas.height = newHeight
          saveCtx.drawImage(img, tl[0], tl[1], newWidth, newHeight, 0, 0, newWidth, newHeight)
        }
      }

      // Download cropped image
      if (settings.download) {
        a = document.createElement('a')
        a.download = `${finger}-${count}.png`
        a.href = saveCanvas.toDataURL()
        a.textContent = 'Download PNG'
        a.click()
      }
      
      // Store keypoints to be outputted in file
      if (settings.keypointsToFile && predictions.length > 0) {  
        let landmarks = normalizePredictions(predictions[0])   
        // let landmarks = predictions[0].landmarks
        keypointsOutput += `${finger}_${landmarks}\n`
      }
      
      // Get next image
      missing = {
        0: [32, 31, 30, 29, 28, 27, 26],
        1: [12, 9, 8, 7, 6, 5, 4, 2, 1, 0],
        2: [20, 19, 18, 17, 13, 12, 11]
      }
      do {
        count++
        if (count == fingerCount[finger]) {
          if (finger < 5) {
            finger++
            count = 0
          } else {
            stop = true
            fetch('http://127.0.0.1:8000', {
              method: 'POST', 
              body: keypointsOutput
            })
          }
        }
      } while (Object.keys(missing).includes(finger.toString()) && missing[finger].includes(count)) 
      if (!stop) img.src = `http://127.0.0.1:8080/will/${finger}-${count}.jpg`
    })
  }
})

        