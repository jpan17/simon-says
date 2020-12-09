import math

SENZ_KINECT = True
gesture_labels = {'s1':1, 's2':2, 's3':3, 's4':5, 's5':0, 's6':2, 's7':1, 's8':4, 's9':3, 's10':1, 's11':1, 'k1':0, 'k2':1, 'k3':1, 'k4':2, 'k5':2, 'k6':3, 'k7':2, 'k8':3, 'k9':5, 'k10':3}

def distFromOrigin(pt):
    return math.sqrt(pt[0] ** 2 + pt[1] ** 2)

def checkFingerLocal(landmarks, target):
    fingerIndex = {
        'thumb': { 'base': 1, 'tip': 4, },
        'index': { 'base': 5, 'tip': 8, },
        'middle': { 'base': 9, 'tip': 12, },
        'ring': { 'base': 13, 'tip': 16, },
        'pinky': { 'base': 17, 'tip': 20, },
    }
    nonThumbs = sum([1 if distFromOrigin(landmarks[fingerIndex[x]['tip']]) - distFromOrigin(landmarks[fingerIndex[x]['base']]) > 0.25 else 0 for x in ['index', 'middle', 'ring', 'pinky']])
    if nonThumbs < 4:
        return nonThumbs == target

    indexBaseX = landmarks[fingerIndex['index']['base']][0]
    thumbTipX = landmarks[fingerIndex['thumb']['tip']][0]
    thumbUp = thumbTipX < indexBaseX if indexBaseX < 0 else thumbTipX > indexBaseX
    fingersUp = nonThumbs + (1 if thumbUp else 0)
    return fingersUp == target

# f = open('will-normalized-test.txt', 'r')
# f = open('kaggle-normalized-train.txt', 'r')
# f = open('kaggle-normalized-test.txt', 'r')
f = open('senz-kinect-normalized-test.txt', 'r')
f.readline()
correct = [0, 0, 0, 0, 0, 0]
total = [0, 0, 0, 0, 0, 0]
for line in f:
    line = line.split('_')
    if SENZ_KINECT:
        target = gesture_labels[line[0]]
        landmarks = [float(x) for x in line[2].split(',')]
    else:
        target = int(line[0])
        landmarks = [float(x) for x in line[1].split(',')]
    landmarks = [[landmarks[x * 3], landmarks[x * 3 + 1], landmarks[x * 3 + 2]] for x in range(21)]
    if checkFingerLocal(landmarks, target):
        correct[target] += 1
    total[target] += 1
print('correct', correct)
print('total', total)
[print(i, 'fingers:', correct[i]/total[i]) for i in range(6)]
print('accuracy', sum(correct) / sum(total))
f.close()
