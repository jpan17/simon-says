import sys
import json
import numpy as np
from inference import inference

def main():
    new_sample = json.loads(sys.argv[1])
    new_sample = np.array(new_sample).T
    new_sample = np.reshape(new_sample, (3, 21, 1, 1))
    
    model = np.load('model.npz', allow_pickle=True)
    model = dict(model)
    output, _ = inference(model, new_sample)
    
    print(np.argmax(output))
    sys.stdout.flush()
    model.close()
    
if __name__ == '__main__':
    main()