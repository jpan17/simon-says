/**
 * Run this to serve image files: npx http-server -c1 --cors .
 * Run this to run backend: node server.js
 */

const cameraSensor = document.querySelector('#camera-sensor'),
      saveCanvas = document.querySelector('#save-canvas'),
      stopButton = document.querySelector('#stop')
cameraSensor.width = 1280
cameraSensor.height = 960
ctx = cameraSensor.getContext('2d')
saveCtx = saveCanvas.getContext('2d')

const gLow = 1, gHigh = 10, nLow = 1, nHigh = 10
const modelParams = {
  detectionConfidence: 0.1,
  iouThreshold: 0,
  scoreThreshold: 0
}
const settings = {
  multiple: true, 
  download: true,
}

getFileName = (g, n) => `http://127.0.0.1:8080/kinect_leap_dataset/acquisitions/P1/G${g}/${n}_rgb.png`

stopButton.onclick = () => {
  settings.multiple = false
  settings.download = false
}

handpose.load(modelParams).then(model => {
  g = gLow, n = nLow

  // Using img to draw image on canvas
  img = new Image
  img.crossOrigin = 'anonymous'
  img.src = getFileName(g, n)
  img.onload = () => {
    ctx.drawImage(img, 0, 0)
    
    model.estimateHands(cameraSensor).then(predictions => {
      console.log(`detected ${predictions.length} hands for ${g}-${n}`)
      
      // Crop image to saveCanvas
      if (predictions.length > 0) {
        bb = predictions[0].boundingBox
        tl = bb.topLeft, br = bb.bottomRight
        newWidth = br[0] - tl[0], newHeight = br[1] - tl[1]
        saveCanvas.width = newWidth
        saveCanvas.height = newHeight
        saveCtx.drawImage(img, tl[0], tl[1], newWidth, newHeight, 0, 0, newWidth, newHeight)

        if (settings.download) {
          a = document.createElement('a')
          a.download = 'test.png'
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
      }
      
      // Get next image
      g = n == nHigh ? g + 1 : g
      n = n == nHigh ? nLow : n + 1
      if (settings.multiple && (g < gHigh || n < nHigh)) {
        img.src = getFileName(g, n) 
      }
    })
  }

  
})
