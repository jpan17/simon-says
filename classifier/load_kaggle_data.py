import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

def load_data():
    
    # read from .txt files
    train_file = open('keypoints_kaggle_train.txt', 'r')
    train_lines = train_file.readlines()
    train_lines = train_lines[1:]
    
    test_file = open('keypoints_kaggle_test.txt', 'r')
    test_lines = test_file.readlines()
    test_lines = test_lines[1:]
    
    num_train = len(train_lines)
    num_test = len(test_lines)
    num_coords = 3 # 3 values per keypoint
    
    train_data = []
    test_data = []
    train_labels = []
    test_labels = []
    
    # get training data / labels in correct format
    for l in range(num_train):
        coordinates = train_lines[l].split(',')
        
        # remove newline
        coordinates[-1] = coordinates[-1].rstrip()
        
        # ground truth
        first_string = coordinates[0].split('_')
        coordinates[0] = first_string[1]
        train_labels.append(first_string[0])
        
        # split coordinates into respective keypoints
        keypoints = [coordinates[i * num_coords:(i + 1) * num_coords] for i in range((len(coordinates) + num_coords - 1) // num_coords)]

        keypoints = np.asfarray(keypoints)
        keypoints = np.reshape(keypoints.T, (1, 3, 21))
        train_data.append(keypoints)
        
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
        keypoints = [coordinates[i * num_coords:(i + 1) * num_coords] for i in range((len(coordinates) + num_coords - 1) // num_coords)]

        keypoints = np.asfarray(keypoints)
        keypoints = np.reshape(keypoints.T, (1, 3, 21))
        test_data.append(keypoints)
    
    train_data = np.asfarray(train_data)
    train_labels = np.asfarray(train_labels)
    test_data = np.asfarray(test_data)
    test_labels = np.asfarray(test_labels)
    print("Train data shape:", train_data.shape)
    print("Train labels shape:", train_labels.shape)   
    print("Test data shape:", test_data.shape)
    print("Test labels shape:", test_labels.shape)   
    
    return train_data.T, train_labels, test_data.T, test_labels
    
if __name__ == '__main__':
    load_data()