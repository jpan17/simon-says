const cameraSensor = document.querySelector('#camera-sensor'),
      saveCanvas = document.querySelector('#save-canvas')
cameraSensor.width = 1280
cameraSensor.height = 960
ctx = cameraSensor.getContext('2d')
saveCtx = saveCanvas.getContext('2d')

gLow = 1, gHigh = 10, nLow = 1, nHigh = 10
modelParams = {
  detectionConfidence: 0.1,
  iouThreshold: 0,
  scoreThreshold: 0
}

getFileName = (g, n) => `http://127.0.0.1:8080/kinect_leap_dataset/acquisitions/P1/G${g}/${n}_rgb.png`

handpose.load(modelParams).then(model => {
  g = gLow, n = nLow
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
      }
      
      // Get next image
      g = n == nHigh ? g + 1 : g
      n = n == nHigh ? nLow : n + 1
      if (g < gHigh || n < nHigh) img.src = getFileName(g, n) 
    })
  }

  
})
