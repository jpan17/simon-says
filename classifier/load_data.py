import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

def load_train_test_data():
    samples, labels = load_data()
    
    # Split dataset into training set and test set (80%/20%)
    train_data, test_data, train_label, test_label = train_test_split(samples, labels, test_size=0.2, random_state=1)
    return train_data.T, train_label, test_data.T, test_label

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
    data_file = open('./keypoints/keypoints_KS.txt', 'r')
    lines = data_file.readlines()
    lines = lines[1:]
    
    n = len(lines)

    # gesture dictionary
    gesture_labels = {'s1':1, 's2':2, 's3':3, 's4':5, 's5':0, 's6':2, 's7':1, 's8':4, 's9':3, 's10':1, 's11':1, 'k1':0, 'k2':1, 'k3':1, 'k4':2, 'k5':2, 'k6':3, 'k7':2, 'k8':3, 'k9':5, 'k10':3}
    samples = []
    labels = []
    
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
        keypoints = [coordinates[i * k:(i + 1) * k] for i in range((len(coordinates) + k - 1) // k)]

        keypoints = np.asfarray(keypoints)
        # keypoints = normalize(keypoints)
        keypoints = np.reshape(keypoints, (1, 3, 21))
        samples.append(keypoints)
    
    samples = np.asfarray(samples)
    labels = np.asfarray(labels)
    print("Data shape:", samples.shape)
    print("Labels shape:", labels.shape)   
    
    return samples, labels
    
if __name__ == '__main__':
    load_train_test_data()