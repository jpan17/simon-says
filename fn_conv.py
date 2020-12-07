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
    print(input.shape)
    in_height, in_width, num_channels, batch_size = input.shape
    filter_height, filter_width, filter_depth, num_filters = params['W'].shape
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
    for f in range(num_filters):
        for batch in range(batch_size):
            temp = scipy.signal.convolve(input[:, :, :, batch], np.flip(W[:, :, :, f]), mode = "valid")
            temp = np.reshape(temp, (out_height, out_width))
            output[:, :, f, batch] = temp + b[f]

    if backprop:
        assert dv_output is not None
        dv_input = np.zeros(input.shape)
        grad['W'] = np.zeros(params['W'].shape)
        grad['b'] = np.zeros(params['b'].shape)
        
        # TODO: BACKPROP CODE
        #       Update dv_input and grad with values
        # to calculate dL/dw, convolve dL/dy with the input image after flipping 
        # go one batch at a time
        grad_w = np.zeros((W.shape[0], W.shape[1], W.shape[2], W.shape[3], batch_size))
        for batch in range(batch_size):
            # go through all the filters for this batch and convolve with the flipped input, and then save into array
            for filter in range(num_filters):
                for channel in range(num_channels):
                    curr_filter = dv_output[:, :, filter, batch]
                    curr_flipped_batch_input = np.flip(input[:, :, channel, batch])
                    # do the convolution
                    temp = scipy.signal.convolve(curr_flipped_batch_input, curr_filter, mode = "valid")
                    # this is one image with one filter derivative with dimensions [filter_height] x [filter_width] x [filter_depth], so save this to output
                    grad_w[:, :, channel, filter, batch] = temp
        # need to sum and divide all by batch_size
        grad_w_final = np.zeros((W.shape[0], W.shape[1], W.shape[2], W.shape[3]))
        for batch in range(batch_size):
            grad_w_final = grad_w_final + grad_w[:, :, :, :, batch]
        grad_w_final = grad_w_final / batch_size
        grad['W'] = grad_w_final
        for i in range(num_filters):
            for j in range(filter_depth):
                grad['W'][:, :, j, i] = np.rot90(grad['W'][:, :, j, i], 2)

        # to calculate dL/db, calculate dy/db and multiply that with dL/dy
        # get dL/db per batch and then sum and divide by batch_size
        dy_db = np.zeros((output.shape[0], output.shape[1], output.shape[2], num_filters, batch_size))
        for batch in range(batch_size):
            # dy_{a, b, filter}/db_{filter} is equal to 1 if they are associated with the same filter, otherwise zero
            for filter in range(num_filters):
                dy_db[:, :, filter, filter, batch] = 1

        # use chain rule with weighted sum dL/db = dL/dy * dy/db
        dL_db = np.zeros((num_filters, batch_size))
        for batch in range(batch_size):
            for b in range(num_filters):
                sum = 0
                for i in range(output.shape[0]):
                    for j in range(output.shape[1]):
                        for k in range(output.shape[2]):
                            sum = sum + dv_output[i, j, k, batch] * dy_db[i, j, k, b, batch]
                dL_db[b, batch] = sum

        # need to sum and divide all by batch_size
        grad_b = np.zeros(num_filters)
        for batch in range(batch_size):
            grad_b = grad_b + dL_db[:, batch]
        grad_b = grad_b / batch_size
        grad['b'] = grad_b.reshape(grad_b.shape + (1,))

        # to calculate dL/dx, calculate dy/dx and multiply that with dL/dy
        # get dy/dx per batch
        
        dy_dx = np.zeros((out_height, out_width, num_filters, in_height, in_width, num_channels, batch_size))
        for batch in range(batch_size):
            for filter in range(num_filters):
                for height in range(out_height):
                    for width in range(out_width):
                        dy_dx[height, width, filter, height:height + filter_height, width:width + filter_width , :, batch] = W[:, :, :, filter]
        
        # use chain rule with weighted sum dL/dx = dL/dy * dy/dx
        dL_dx = np.zeros((in_height, in_width, num_channels, batch_size))
        for batch in range(batch_size):
            for x_height in range(in_height):
                for x_width in range(in_width):
                    for channel in range(num_channels):
                        # for a particular dx, sum over product of all dy's
                        sum = 0
                        for i in range(out_height):
                            for j in range(out_width):
                                for k in range(num_filters):
                                    sum = sum + dv_output[i, j, k, batch] * dy_dx[i, j, k, x_height, x_width, channel, batch]
                        dL_dx[x_height, x_width, channel, batch] = sum

        dv_input = dL_dx
        

    return output, dv_input, grad
