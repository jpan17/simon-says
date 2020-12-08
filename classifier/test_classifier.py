import sys
sys.path.append('./layers')
import numpy as np
from inference import inference

def main():
    
    # read data from will's hands dataset 
    test_file = open('./keypoints/keypoints_will.txt', 'r')
    test_lines = test_file.readlines()
    test_lines = test_lines[1:]
    
    # read data from kinect/senz datset
    data_file = open('./keypoints/keypoints_KS.txt', 'r')
    lines = data_file.readlines()
    lines = lines[1:]
    
    test_data = []
    test_labels = []

    # kinect/senz gesture dictionary
    gesture_labels = {'s1':1, 's2':2, 's3':3, 's4':5, 's5':0, 's6':2, 's7':1, 's8':4, 's9':3, 's10':1, 's11':1, 'k1':0, 'k2':1, 'k3':1, 'k4':2, 'k5':2, 'k6':3, 'k7':2, 'k8':3, 'k9':5, 'k10':3}
    samples = []
    labels = []
    
    n = len(lines)
    num_test = len(test_lines)
    num_coords = 3 # 3 values per keypoint
    
    # get will's  test data / labels in correct format        
    for k in range(num_test):
        coordinates = test_lines[k].split(',')
    
        # remove newline
        coordinates[-1] = coordinates[-1].rstrip()
        
        # ground truth
        first_string = coordinates[0].split('_')
        # uncomment for kinect/senz
        # labels.append(gesture_labels[first_string[0]])
        coordinates[0] = first_string[1]
        test_labels.append(first_string[0])
        
        # split coordinates into respective keypoints
        keypoints = [coordinates[i * num_coords:(i + 1) * num_coords] 
                     for i in range((len(coordinates) + num_coords - 1) // num_coords)]

        keypoints = np.asfarray(keypoints)
        keypoints = np.reshape(keypoints.T, (1, 3, 21))
        test_data.append(keypoints)
        
    for l in range(n):
        coordinates = lines[l].split(',')
        
        # remove newline
        coordinates[-1] = coordinates[-1].rstrip()
        
        # ground truth
        first_string = coordinates[0].split('_')
        # decide what you want to do with the classifier labels, for now label them all '1'
        labels.append(gesture_labels[first_string[0]])
        coordinates[0] = first_string[2]
        
        # split coordinates into respective keypoints
        k = 3 # 3 values per keypoint
        keypoints = [coordinates[i * num_coords:(i + 1) * num_coords] for i in range((len(coordinates) + num_coords - 1) // num_coords)]

        keypoints = np.asfarray(keypoints)
        # keypoints = normalize(keypoints)
        keypoints = np.reshape(keypoints, (1, 3, 21))
        samples.append(keypoints)
    
    test_data = np.asfarray(test_data)
    test_data = test_data.T
    test_labels = np.asfarray(test_labels)
    
    samples = np.asfarray(samples)
    samples = samples.T
    labels = np.asfarray(labels)
    
    model = np.load('9465c_model.npz', allow_pickle=True)
    model = dict(model)
    willOutput, _ = inference(model, test_data)
    output, _ = inference(model, samples)
    
    
    correctWillPredictions = 0
    # stores tuples of total # of actual fingers in the test set to the correctly predicted ones
    willFingerPredictions = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]
    for i in range(len(test_labels)):
        champIndex = np.argmax(willOutput[:, i])
        willFingerPredictions[champIndex][0] += 1
        if champIndex == test_labels[i]:
            willFingerPredictions[champIndex][1] += 1
            correctWillPredictions += 1

    for finger in range(len(willFingerPredictions)):
        print("Finger {0} accuracy for Will: {1}".format(finger, 
                                                willFingerPredictions[finger][1] / 
                                                willFingerPredictions[finger][0]))
    
    print('Model accuracy on Will hands:', correctWillPredictions / len(test_labels))  
    
    correctKSPredictions = 0
    # stores tuples of total # of actual fingers in the test set to the correctly predicted ones
    fingerKSPredictions = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]
    for i in range(len(labels)):
        champIndex = np.argmax(output[:, i])
        fingerKSPredictions[champIndex][0] += 1
        if champIndex == labels[i]:
            fingerKSPredictions[champIndex][1] += 1
            correctKSPredictions += 1

    for finger in range(len(fingerKSPredictions)):
        print("Finger {0} accuracy for KS: {1}".format(finger, 
                                                fingerKSPredictions[finger][1] / 
                                                fingerKSPredictions[finger][0]))
    
    print('Model accuracy on KS hands:', correctKSPredictions / len(labels))  
    
if __name__ == '__main__':
    main()