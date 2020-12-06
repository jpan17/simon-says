# Usage: run 'pythong sort_cropped_photos' in the folder with the cropped images

import os
import shutil
import hashlib

source_path = '/home/hollisma/Downloads/'
destin_path = '/home/hollisma/Downloads/cropped-images'

# check if destination path is existing create if not
if not os.path.exists(destin_path):
    os.makedirs(destin_path)

# file hash function
def hash_file(filename):

   # make a hash object
   h = hashlib.sha1()

   # open file for reading in binary mode
   with open(filename,'rb') as file:

       # loop till the end of the file
       chunk = 0
       while chunk != b'':
           # read only 1024 bytes at a time
           chunk = file.read(1024)
           h.update(chunk)

   # return the hex representation of digest
   return h.hexdigest()

for file in os.listdir(source_path): 
  if file.endswith('.png'): 
    filename = source_path + os.sep + file
    props = file.split('.')[0].split('-')  # should be [k/s, p, g, n]
    out_folder = props[0] + props[2]  # want k/s + gesture number
    out_filepath = destin_path + os.sep + out_folder
    out_filename = out_filepath + os.sep + file + '.png'

    # check if dest path exists; create if not
    if not os.path.exists(out_filepath): 
      os.makedirs(out_filepath)

    # copy image to dest
    shutil.copy2(filename, out_filename)

    # verify if file is the same and display output
    if hash_file(filename) == hash_file(out_filename):
        print('success! ' + out_filename)
        os.remove(filename)
    else:
        print('failed to copy:' + filename)
