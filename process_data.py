import os

kinect_people = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12", "P13", "P14"]
senz3d_subjects = ["S1", "S2", "S3", "S4"]
kinect_gestures = ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"]
senz3d_gestures = ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10", "G11"]

kinect_filepath = "./kinect_leap_dataset/acquisitions/"
senz3d_filepath = "./senz3d_dataset/acquisitions/"

for person in kinect_people:
    for gesture in kinect_gestures:
        filepath = kinect_filepath + person + "/" + gesture + "/"
        for file in os.listdir(filepath):
            if not file.endswith('rgb.png'):
                os.remove(filepath + file)

for subject in senz3d_subjects:
    for gesture in senz3d_gestures:
        filepath = senz3d_filepath + subject + "/" + gesture + "/"
        for file in os.listdir(filepath):
            if not file.endswith('.png'):
                os.remove(filepath + file)