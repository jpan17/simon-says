

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

// Startup - draw quadrant lines
function drawQuadrantLines(overlay) {
  let ctx = overlay.getContext('2d')
  let { width, height } = overlay
  ctx.beginPath()
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 10]);
  ctx.moveTo(width / 2 - 0.5, 0)  // subtract 0.5 so that line is 1px wide
  ctx.lineTo(width / 2 - 0.5, height)
  ctx.moveTo(0, height / 2 - 0.5)
  ctx.lineTo(width, height / 2 - 0.5)
  ctx.stroke()
}

// Generate next finger num and position
function getNextSeq() {
  const quadrant = Math.floor(Math.random() * 4)
  const numFingers = Math.floor(Math.random() * 6)
  sequence.push({
      quadrant,
      numFingers,
  })
  return { numFingers, quadrant }
}

// Remove hand outline
function clearHandOutline() {
  let ctx = handOverlay.getContext('2d')
  ctx.clearRect(0, 0, handOverlay.width, handOverlay.height)
}

// Display hand outline with fingers and in quadrant
function displayHandOutline(numFingers, quadrant) {
  let ctx = handOverlay.getContext('2d')
  img = new Image()
  img.src = 'overlays/' + numFingers + '.png'
  img.onload = () => {
      ctx.clearRect(0, 0, handOverlay.width, handOverlay.height)
      startPoint = [handOverlay.width / 2 * (quadrant % 2), handOverlay.height / 2 * Math.floor(quadrant / 2)]
      ctx.drawImage(img, startPoint[0], startPoint[1], handOverlay.width / 2, handOverlay.height / 2)
  }
}

// Access the device camera and stream to cameraView
function cameraStart() {
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

// Draw predictions in upper right box
function renderPredictions(predictions, canvas, context, mediasource) {

  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = mediasource.width;
  canvas.height = mediasource.height;
  // console.log("render", mediasource.width, mediasource.height)

  context.save();
  if (modelParams.flipHorizontal) {
    context.scale(-1, 1);
    context.translate(-mediasource.width, 0);
  }
  context.drawImage(mediasource, 0, 0, mediasource.width, mediasource.height);
  context.restore();
  context.font = '10px Arial';

  // console.log('number of detections: ', predictions.length);
  for (let i = 0; i < predictions.length; i++) {
      
      let { topLeft, bottomRight } = predictions[i].boundingBox
      
      // get the bottom left point of the bounding box and its height/width
      let boundingBoxWidth = bottomRight[0] - topLeft[0]
      let boundingBoxHeight = topLeft[1] - bottomRight[1]
      let bottomLeft = [topLeft[0], topLeft[1] - boundingBoxHeight]

      // calculate the change in width/height 
      const widthDecrease = boundingBoxWidth * options.widthScaleFactor;
      const heightDecrease = boundingBoxHeight * options.heightScaleFactor;

      const newPredictionBox = [
          bottomLeft[0] + widthDecrease / 2,
          bottomLeft[1] + heightDecrease / 3,
          boundingBoxWidth - widthDecrease,
          boundingBoxHeight - heightDecrease,
      ]

      context.beginPath();
      context.fillStyle = "rgba(255, 255, 255, 0.6)";
      context.fillRect(newPredictionBox[0], newPredictionBox[1] - 17, newPredictionBox[2], 17);
      context.rect(...newPredictionBox);

      // draw a dot at the center of bounding box
      context.lineWidth = 3;
      context.strokeStyle = '#FFFFFF';
      context.fillStyle = "#FFFFFF"; // "rgba(244,247,251,1)";
      context.fillRect(newPredictionBox[0] + (newPredictionBox[2] / 2), newPredictionBox[1] + (newPredictionBox[3] / 2), 5, 5);

      context.stroke();
      context.fillText(
          predictions[i].handInViewConfidence.toFixed(3) + ' ' + " | hand",
          newPredictionBox[0] + 5,
          newPredictionBox[1] > 10 ? newPredictionBox[1] - 5 : 10);

      // draw a dot at each of the landmarks
      // context.strokeStyle = '#FF0000;
      // context.fillStyle = "#FF0000";
      // for (let j = 0; j < predictions[i].landmarks.length; j++) {
      //     context.fillRect(predictions[i].landmarks[j][0], predictions[i].landmarks[j][1], 5, 5);
      // }

      // draw dots at finger positions
      colors = ['#FF0000', '#FFFF00', '#00FF00', '#0000FF', '#FF00FF', '#FFFFFF']
      // thumb
      for (let t = 0; t < predictions[i].annotations.thumb.length; t++) {
          context.strokeStyle = colors[0];
          context.fillStyle = colors[0];
          context.fillRect(predictions[i].annotations.thumb[t][0], predictions[i].annotations.thumb[t][1], 5, 5);
      }

      // indexFinger
      for (let f = 0; f < predictions[i].annotations.indexFinger.length; f++) {
          context.strokeStyle = colors[1];
          context.fillStyle = colors[1];
          context.fillRect(predictions[i].annotations.indexFinger[f][0], predictions[i].annotations.indexFinger[f][1], 5, 5);
      }

      // middleFinger
      for (let m = 0; m < predictions[i].annotations.middleFinger.length; m++) {
          context.strokeStyle = colors[2];
          context.fillStyle = colors[2];
          context.fillRect(predictions[i].annotations.middleFinger[m][0], predictions[i].annotations.middleFinger[m][1], 5, 5);
      }

      // ringFinger
      for (let r = 0; r < predictions[i].annotations.ringFinger.length; r++) {
          context.strokeStyle = colors[3];
          context.fillStyle = colors[3];
          context.fillRect(predictions[i].annotations.ringFinger[r][0], predictions[i].annotations.ringFinger[r][1], 5, 5);
      }

      // pinky
      for (let p = 0; p < predictions[i].annotations.pinky.length; p++) {
          context.strokeStyle = colors[4];
          context.fillStyle = colors[4];
          context.fillRect(predictions[i].annotations.pinky[p][0], predictions[i].annotations.pinky[p][1], 5, 5);
      }

      // palmbase
      for (let b = 0; b < predictions[i].annotations.palmBase.length; b++) {
          context.strokeStyle = colors[5];
          context.fillStyle = colors[5];
          context.fillRect(predictions[i].annotations.palmBase[b][0], predictions[i].annotations.palmBase[b][1], 5, 5);
      }
  }

  // Write FPS to top left
  context.font = "bold 14px Candara";
}

function resetGameVars() {
  sequence = []
  curTime = 0
  curSeq = 0
  inGame = false
  pauseTime = 0
  totalPauseTime = 0
  scoreDisplay.innerHTML = 'Score: 0'
  validDetection = false
}

// End the game and display final stats
function endGame() {
  inGame = false
  const score = sequence.length - 1
  console.log(`final score: ${score}, final time: ${curTime}`)
  console.log('sequence: ')
  console.table(sequence)
  infoDisplay.classList.remove('hide')
  middleDisplay.classList.add('hide')
  infoDisplay.children[0].innerHTML = `final score: ${Math.max(score, 0)}`
  infoDisplay.children[1].innerHTML = `time lasted: ${curTime}`
}