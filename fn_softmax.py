import numpy as np

def fn_softmax(input, params, hyper_params, backprop, dv_output=None):
    """
    Args:
        input: The input data to the layer function. [num_nodes] x [batch_size] array
        params: Dummy input. This is included to maintain consistency across all layers, but the input argument is not used.
        hyper_params: Dummy input. This is included to maintain consistency across all layers, but the input argument is not used.
        backprop: Boolean stating whether or not to compute the output terms for backpropagation.
        dv_output: The partial derivative of the loss with respect to each element in the output matrix. Only passed in when backprop is set to true. Same size as output.

    Returns:
        output: Output of layer, [num_nodes] x [batch_size] array
        dv_input: The derivative of the loss with respect to the input. Same size as input.
        grad: Dummy output. This is included to maintain consistency in the return values of layers, but there is no gradient to calculate in the softmax layer since there are no weights to update.
    """

    num_nodes, batch_size = input.shape
    exp_input = np.exp(input)

    # Initialize
    output = np.zeros([num_nodes, batch_size])
    dv_input = np.zeros(0)
    # grad is included to maintain consistency in the return values of layers,
    # but there is no gradient to calculate in the softmax layer since there
    # are no weights to update.
    grad = {'W': np.zeros(0),
            'b': np.zeros(0)}

    # TODO: FORWARD CODE
    #       Update output with values
    col_sums = np.sum(exp_input, axis = 0)
    for i in range(len(output)):
        for j in range(len(output[0])):
            output[i][j] = exp_input[i][j] / col_sums[j]

    if backprop:
        assert dv_output is not None
        dv_input = np.zeros([num_nodes, batch_size])

        # TODO: BACKPROP CODE
        #       Update dv_input with values
        for i in range(len(input)):
            for j in range(len(input[0])):
                
                x = exp_input[i][j]
                dydx = []
                
                for k in range(len(input)):
                    y = exp_input[k][j]
                    
                    if i == k:
                        dydx.append((col_sums[j] * x - x * y) / (col_sums[j] ** 2))
                    else:
                        dydx.append((-x * y) / (col_sums[j] ** 2))
                
                dLdx = 0
                for m in range(len(dv_output)):
                    dLdy = dv_output[m][j]
                    dLdx += dLdy * dydx[m]
                    
                dv_input[i][j] = dLdx


    return output, dv_input, grad
