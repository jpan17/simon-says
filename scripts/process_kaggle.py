import os

base_fp = '../../fingers/'

output_file = open('kaggle_images_train.txt', 'w')
for file in os.listdir(base_fp + 'train'): 
  output_file.write(file+'\n')
output_file = open('kaggle_images_test.txt', 'w')
for file in os.listdir(base_fp + 'test'): 
  output_file.write(file+'\n')