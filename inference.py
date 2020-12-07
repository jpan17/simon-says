import numpy as np

def inference(model, input):
    """
    Do forward propagation through the network to get the activation
    at each layer, and the final output
    Args:
        model: Dictionary holding the model
        input: [any dimensions] x [batch_size]
    Returns:
        output: The final output of the model
        activations: A list of activations for each layer in model["layers"]
    """

    num_layers = len(model['layers'])
    activations = [None,] * num_layers

    # TODO: FORWARD PROPAGATION CODE
    for i in range(num_layers):
        current_layer = model['layers'][i]
        current_function = current_layer['fwd_fn']

        output, _, _ = current_function(input, current_layer['params'], current_layer['hyper_params'], False)
        
        input = output
        activations[i] = output
        
    output = activations[-1]
    return output, activations
