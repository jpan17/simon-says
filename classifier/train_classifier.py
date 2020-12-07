import sys
sys.path += ['../data']

from train import train
from init_layers import init_layers
from init_model import init_model
from load_data import load_train_test_data
import numpy as np
import time

def main():
    train_data, train_label, test_data, test_label = load_train_test_data()
        
    layers = [init_layers('nxm_conv', {'filter_height': 3,
                                       'filter_width': 1,
                                       'filter_depth': 1,
                                       'num_filters': 5}),
              init_layers('relu', {}),
              init_layers('flatten', {}),
              init_layers('linear', {'num_in': 105,
                                     'num_out': 6}),            
              init_layers('softmax', {})]
        
    model = init_model(layers, [3, 21, 1], 6, True)
    params = {"test_data": test_data,
              "test_labels": test_label}
        
    train_model, train_loss = train(model, train_data, train_label, params, 5000)

if __name__ == '__main__':
    print('Training!')
    print('====================')
    main()
