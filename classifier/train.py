import sys
sys.path += ['layers']
import numpy as np
import matplotlib.pyplot as plt
import time

from inference import inference
from calc_gradient import calc_gradient
from loss_crossentropy import loss_crossentropy
from update_weights import update_weights
######################################################

def train(model, input, label, params, numIters):
    '''
    This training function is written specifically for classification,
    since it uses crossentropy loss and tests accuracy assuming the final output
    layer is a softmax layer. These can be changed for more general use.
    Args:
        model: Dictionary holding the model
        input: [any dimensions] x [batch_size]
        label: [batch_size]
        params: Paramters for configuring training
            params["learning_rate"] 
            params["weight_decay"]
            params["batch_size"]
            params["save_file"]
            params["test_data"]
            params["test_labels"]
            Free to add more parameters to this dictionary for your convenience of training.
        numIters: Number of training iterations
    ''' 
    # Initialize training parameters
    # Learning rate
    lr = params.get("learning_rate", .01)
    
    # Weight decay
    wd = params.get("weight_decay", .0005)
    
    # Batch size
    batch_size = params.get("batch_size", 50)
    # There is a good chance you will want to save your network model during/after
    # training. It is up to you where you save and how often you choose to back up
    # your model. By default the code saves the model in 'model.npz'.
    save_file = params.get("save_file", 'model.npz')
    
    # update_params will be passed to your update_weights function.
    # This allows flexibility in case you want to implement extra features like momentum.
    update_params = {"learning_rate": lr, 
                     "weight_decay": wd }
    
    test_data = params['test_data']
    test_labels = params['test_labels']
    
    num_inputs = input.shape[-1]
    loss = np.zeros((numIters,))

    # used to calculate momentum
    prev_weights = [None] * len(model['layers'])
    momentum = 0.5
    
    step_size_training = 500
    step_size_testing = 1000
    training_loss = []
    testing_loss = []
    
    begin_time = time.time()
    
    
    for i in range(numIters):
        # Steps:
        #   (1) Select a subset of the input to use as a batch
        subset_indices = np.random.choice(num_inputs, batch_size, replace = False)
        subset = input[(slice(None),) * (len(input.shape) - 1) + (subset_indices,)]
        labels = label[subset_indices]
        
        #   (2) Run inference on the batch
        inference_output, activations = inference(model, subset)
        
        #   (3) Calculate loss and determine accuracy
        loss[i], dv_input = loss_crossentropy(inference_output, labels, None, True)
        
        if i % step_size_training == 0 and i % step_size_testing != 0:
            training_loss.append(loss[i])
            print('Training loss:', loss[i])

        if i % step_size_testing == 0:
            output, _ = inference(model, test_data)
            test_loss, _ = loss_crossentropy(output, test_labels, None, True)
            testing_loss.append(test_loss)
            training_loss.append(loss[i])
            print('Test loss:', test_loss)
            print('Training loss:', loss[i])
        
        #   (4) Calculate gradients
        grads = calc_gradient(model, subset, activations, dv_input)
        
        #   (5) Update the weights of the model
        model = update_weights(model, grads, update_params)
        
        #   (6*) Update the model weights with momentum 
        for j in range(len(model['layers'])):
            layer = model['layers'][j]
            if layer['type'] == 'pool' or layer['type'] == 'softmax' or layer['type'] == 'relu' or layer['type'] == 'flatten':
                continue
            weights = np.array(layer['params']['W'])

            if prev_weights[j] is not None:
                layer['params']['W'] += momentum * (weights - prev_weights[j])
            prev_weights[j] = np.array(layer['params']['W'])
    
    elapsed_time = time.time() - begin_time
    
    output, _ = inference(model, test_data)
    
    correctPredictions = 0
    for i in range(batch_size):
        champIndex = np.argmax(output[:, i])
        if champIndex == test_labels[i]:
            correctPredictions += 1
    
    print('Final model accuracy:', correctPredictions / batch_size)  
    
    print("Time elapsed:", time.strftime("%H:%M:%S", time.gmtime(elapsed_time)))
    
    X_training = np.arange(0, numIters, step_size_training)
    X_testing = np.arange(0, numIters, step_size_testing)
    
    plt.plot(X_training, training_loss, label="training")
    plt.plot(X_testing, testing_loss, label="testing")
    
    plt.legend()
    plt.title('Training/Testing Loss vs Number of Iterations')
    plt.xlabel('Iterations')
    plt.ylabel('Loss')
    # plt.show()
    plt.savefig('loss_curves.png')
    
    np.savez(save_file, **model)
    return model, loss