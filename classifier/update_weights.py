import numpy as np

def update_weights(model, grads, hyper_params):
    '''
    Update the weights of each layer in your model based on the calculated gradients
    Args:
        model: Dictionary holding the model
        grads: A list of gradients of each layer in model["layers"]
        hyper_params: 
            hyper_params['learning_rate']
            hyper_params['weight_decay']: Should be applied to W only.
    Returns: 
        updated_model:  Dictionary holding the updated model
    '''
    num_layers = len(grads)
    a = hyper_params["learning_rate"]
    lmd = hyper_params["weight_decay"]
    updated_model = model

    # TODO: Update the weights of each layer in your model based on the calculated gradients
    for i in range(num_layers):
        current_layer = model['layers'][i]
        if current_layer['type'] == 'linear' or current_layer['type'] == 'conv':
            current_weights = current_layer['params']['W']
            current_bias = current_layer['params']['b']
            grad_w = grads[i]['W']
            grad_b = grads[i]['b']
            
            updated_model['layers'][i]['params']['W'] = current_weights - grad_w * a
            
            updated_model['layers'][i]['params']['W'] -= current_weights * lmd
            
            updated_model['layers'][i]['params']['b'] = current_bias - grad_b * a


    return updated_model