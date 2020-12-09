import sys
sys.path += ['../data']

from train import train
from init_layers import init_layers
from init_model import init_model
from load_kaggle_data import load_data
import numpy as np
import time

def main():
    train_data, train_label, test_data, test_label = load_data()
    layers = [init_layers('nxm_conv', {'filter_height': 1,
                                       'filter_width': 1,
                                       'filter_extra': 3,
                                       'filter_depth': 1,
                                       'extra_dim': True,
                                       'num_filters': 5}),
              init_layers('relu', {}),
              init_layers('nxm_conv', {'filter_height': 1,
                                       'filter_width': 4,
                                       'filter_extra': 1,
                                       'filter_depth': 5,
                                       'extra_dim': True,
                                       'num_filters': 5}),
              init_layers('relu', {}),
              init_layers('flatten', {}),
              init_layers('linear', {'num_in': 25,
                                     'num_out': 5}),      
              init_layers('relu', {}),
              init_layers('linear', {'num_in': 5,
                                     'num_out': 6}),            
              init_layers('softmax', {})]
        
    model = init_model(layers, [5, 4, 3, 1], 6, True)
    params = {"test_data": test_data,
              "test_labels": test_label}
        
    train_model, train_loss = train(model, train_data, train_label, params, 3000)

if __name__ == '__main__':
    print('Training!')
    print('====================')
    main()
