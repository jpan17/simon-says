/**
 * To run, open script.html
 * Run this to serve image files: npx http-server -c1 --cors .
 * IGNORE BELOW
 * Run this to run backend: node server.js
 */

const cameraSensor = document.querySelector('#camera-sensor'),
      saveCanvas = document.querySelector('#save-canvas'),
      stopButton = document.querySelector('#stop')
cameraSensor.width = 1280
cameraSensor.height = 960
ctx = cameraSensor.getContext('2d')
saveCtx = saveCanvas.getContext('2d')

const settings = {
  multiple: true, 
  download: false,
  keypointsToFile: true,
  customModelParams: false,
}
const datasetSettings = {
  kinect: {
    p: 14, g: 10, n: 10
    // p: 2, g: 2, n: 2
  },
  senz3d: {
    p: 4, g: 11, n: 30
    // p: 2, g: 2, n: 2
  }
}
let onKinect = true, prefix = 'k'
const modelParams = settings.customModelParams ? {
  detectionConfidence: 0.1,
  iouThreshold: 0,
  scoreThreshold: 0
} : {}
let keypointsOutput = ''

getFileName = (p, g, n, onKinect) => onKinect ? `http://127.0.0.1:8080/kinect_leap_dataset/acquisitions/P${p}/G${g}/${n}_rgb.png`
                                              : `http://127.0.0.1:8080/senz3d_dataset/acquisitions/S${p}/G${g}/${n}-color.png`

stopButton.onclick = () => {
  settings.multiple = false
  settings.download = false
}

handpose.load(modelParams).then(model => {
  p = 1, g = 1, n = 1

  // Using img to draw image on canvas
  img = new Image
  img.crossOrigin = 'anonymous'
  img.src = getFileName(p, g, n, onKinect)
  img.onload = () => {
    ctx.drawImage(img, 0, 0)
    
    model.estimateHands(cameraSensor).then(predictions => {
      console.log(`detected ${predictions.length} hands for ${p}-${g}-${n}`)
      
      // Crop image to saveCanvas
      if (predictions.length > 0) {
        bb = predictions[0].boundingBox
        tl = bb.topLeft, br = bb.bottomRight
        newWidth = br[0] - tl[0], newHeight = br[1] - tl[1]
        saveCanvas.width = newWidth
        saveCanvas.height = newHeight
        saveCtx.drawImage(img, tl[0], tl[1], newWidth, newHeight, 0, 0, newWidth, newHeight)

        // Download cropped image
        if (settings.download) {
          a = document.createElement('a')
          a.download = `${prefix}-${p}-${g}-${n}.png`
          a.href = saveCanvas.toDataURL()
          a.textContent = 'Download PNG'
          a.click()
        }

        // // Send cropped image to server and store as file
        // blobData = saveCanvas.toBlob(blob => {
        //   url = (URL || webkitURL).createObjectURL(blob)
        //   console.log(url)
        //   fetch('http://127.0.0.1:8000', {
        //     method: 'POST', 
        //     body: blobData
        //   })
        // })
      
        // Store keypoints to be outputted in file
        if (settings.keypointsToFile) {
          keypointsOutput += `${prefix}${g}_${p}${n}_${predictions[0].landmarks}\n`
        }
      }
      
      // Get next image
      datasetLimit = onKinect ? datasetSettings.kinect : datasetSettings.senz3d
      p = n == datasetLimit.n && g == datasetLimit.g ? p + 1 : p
      g = n == datasetLimit.n ? g == datasetLimit.g ? 1 : g + 1 : g
      n = n == datasetLimit.n ? 1 : n + 1
      if (settings.multiple && p <= datasetLimit.p) {
        // Get next image
        img.src = getFileName(p, g, n, onKinect) 
      } else if (settings.multiple && onKinect) {
        // Start senz3d dataset
        onKinect = false
        prefix = 's'
        p = 1, g = 1, n = 1
        cameraSensor.width = 640
        cameraSensor.height = 480
        img.src = getFileName(p, g, n, onKinect)
      } else {
        // Finished... print keypoints to output file on server
        if (settings.keypointsToFile) {
          fetch('http://127.0.0.1:8000', {
            method: 'POST', 
            body: keypointsOutput
          })
        }
      }
    })
  }
})

        