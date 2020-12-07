import numpy as np
import scipy.signal

def fn_conv(input, params, hyper_params, backprop, dv_output=None):
    """
    Args:
        input: The input data to the layer function. [in_height] x [in_width] x [num_channels] x [batch_size] array
        params: Weight and bias information for the layer.
            params['W']: layer weights, [filter_height] x [filter_width] x [filter_depth] x [num_filters] array
            params['b']: layer bias, [num_filters] x 1 array
        hyper_params: Optional, could include information such as stride and padding.
        backprop: Boolean stating whether or not to compute the output terms for backpropagation.
        dv_output: The partial derivative of the loss with respect to each element in the output matrix. Only passed in when backprop is set to true. Same size as output.

    Returns:
        output: Output of layer, [out_height] x [out_width] x [num_filters] x [batch_size] array
        dv_input: The derivative of the loss with respect to the input. Same size as input.
        grad: The gradient term that you will use to update the weights defined in params and train your network. Dictionary with same structure as params.
            grad['W']: gradient wrt weights, same size as params['W']
            grad['b']: gradient wrt bias, same size as params['b']
    """

    in_height, in_width, num_channels, batch_size = input.shape
    _, _, filter_depth, num_filters = params['W'].shape
    out_height = in_height - params['W'].shape[0] + 1
    out_width = in_width - params['W'].shape[1] + 1

    assert params['W'].shape[2] == input.shape[2], 'Filter depth does not match number of input channels'

    # Initialize
    output = np.zeros((out_height, out_width, num_filters, batch_size))
    dv_input = np.zeros(0)
    grad = {'W': np.zeros(0),
            'b': np.zeros(0)}
    
    # TODO: FORWARD CODE
    #       Update output with values
    W = params['W']
    b = params['b']
    for i in range(batch_size): 
        for j in range(num_filters): 
            for k in range(num_channels): 
                input_im = input[:,:,k,i]
                W_im = W[:,:,k,j]
                conv_im = scipy.signal.convolve(input_im, W_im, mode='valid')
                output[:,:,j,i] += np.reshape(conv_im, (conv_im.shape[:2]))
            output[:,:,j,i] += b[j]

    if backprop:
        assert dv_output is not None
        dv_input = np.zeros(input.shape)
        grad['W'] = np.zeros(params['W'].shape)
        grad['b'] = np.zeros(params['b'].shape)
        
        # TODO: BACKPROP CODE
        #       Update dv_input and grad with values
        for i in range(batch_size): 
            for j in range(num_channels): 
                for k in range(num_filters): 

                    # Convolve rev image with dv_output to compute gradient of W
                    rev_im = input[::-1,::-1,j,i]
                    dv_output_im = dv_output[:,:,k,i]
                    dv_W_conv = scipy.signal.convolve(rev_im, dv_output_im, mode='valid')
                    # print(grad['W'].shape, dv_W_conv.shape, rev_im.shape, dv_output_im.shape)
                    grad['W'][:,:,j,k] += dv_W_conv

                    # Convolve rev W with dv_output to compute gradient of input
                    rev_W = W[::-1,::-1,j,k]
                    dv_input_conv = scipy.signal.convolve(rev_W, dv_output_im, mode='full')
                    # print(dv_input_conv.shape, rev_W.shape, dv_output_im.shape, out_height, out_width)
                    dv_input[:,:,j,i] += dv_input_conv

                    # Compute gradient of bias
                    grad['b'][k] += np.sum(dv_output_im)
        
        # Normalize gradients
        grad['W'] /= batch_size
        grad['b'] /= batch_size * num_channels

    return output, dv_input, grad
