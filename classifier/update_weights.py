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
    vel_w, vel_b = hyper_params["velocity"]
    rho = hyper_params.get("rho", 0.9)
    updated_model = model

    # TODO: Update the weights of each layer in your model based on the calculated gradients
    for i in range(num_layers):
        current_layer = model['layers'][i]
        if current_layer['type'] == 'linear' or current_layer['type'] == 'conv' or current_layer['type'] == 'nxm_conv':
            
            ### Regular Momentum
            if vel_w[i].size == 0: 
                vel_w[i] = np.zeros(current_layer['params']['W'].shape)
                vel_b[i] = np.zeros(current_layer['params']['b'].shape)
            vel_w[i] = rho * vel_w[i] - grads[i]['W']
            current_layer['params']['W'] += a * vel_w[i]
            vel_b[i] = rho * vel_b[i] - grads[i]['b']
            current_layer['params']['b'] += a * vel_b[i]


    return updated_model