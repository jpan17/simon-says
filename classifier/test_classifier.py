import sys
sys.path.append('./layers')
import numpy as np
from inference import inference

def main():
    
    test_file = open('./keypoints/keypoints_will.txt', 'r')
    test_lines = test_file.readlines()
    test_lines = test_lines[1:]
    
    test_data = []
    test_labels = []
    
    num_test = len(test_lines)
    num_coords = 3 # 3 values per keypoint
    
    # get test data / labels in correct format        
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
    
    test_data = np.asfarray(test_data)
    test_data = test_data.T
    test_labels = np.asfarray(test_labels)
    
    model = np.load('model.npz', allow_pickle=True)
    model = dict(model)
    output, _ = inference(model, test_data)
    
    correctPredictions = 0
    # stores tuples of total # of actual fingers in the test set to the correctly predicted ones
    fingerPredictions = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]
    for i in range(len(test_labels)):
        champIndex = np.argmax(output[:, i])
        fingerPredictions[champIndex][0] += 1
        if champIndex == test_labels[i]:
            fingerPredictions[champIndex][1] += 1
            correctPredictions += 1

    # for finger in range(len(fingerPredictions)):
    #     print("Finger {0} accuracy: {1}".format(finger, 
    #                                             fingerPredictions[finger][1] / 
    #                                             fingerPredictions[finger][0]))
    
    print('Model accuracy on Will hands:', correctPredictions / len(test_labels))  
    
if __name__ == '__main__':
    main()