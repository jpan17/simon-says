import sys
import pandas as pd
import numpy as np

def load_training_test_data():
    pass

def normalize(keypoints):
    
    # origin keypoint
    palmBase = np.array(keypoints[-1])
    for k in range(len(keypoints) - 1):
        scaled_keypoint = np.subtract(keypoints[k], palmBase)
    
    nom = (keypoints - keypoints.min(axis=0)) * 2
    denom = keypoints.max(axis=0) - keypoints.min(axis=0)
    denom[denom==0] = 1
    
    return -1 + nom/denom

def load_data():
    
    # read from keypoints.txt
    data_file = open('keypoints.txt', 'r')
    lines = data_file.readlines()
    lines = lines[1:]
    
    n = len(lines)

    samples = []
    labels = []
    
    for l in range(n):
        coordinates = lines[l].split(',')
        
        # remove newline
        coordinates[-1] = coordinates[-1].rstrip()
        
        # ground truth
        first_string = coordinates[0].split('_')
        labels.append(first_string[0])
        coordinates[0] = first_string[2]
        
        # split coordinates into respective keypoints
        k = 3 # 3 values per keypoint
        keypoints = [coordinates[i * k:(i + 1) * k] for i in range((len(coordinates) + k - 1) // k)]

        # normalize using palm base as origin
        keypoints = np.asfarray(keypoints)
        keypoints = normalize(keypoints)
        samples.append(keypoints)
    
    samples = np.asfarray(samples).T 
    labels = np.array(labels)
    print("Data shape:", samples.T.shape)   
    print("Labels shape:", labels.shape)   
    
if __name__ == '__main__':
    load_data()