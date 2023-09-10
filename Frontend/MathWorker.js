const threads = (navigator.hardwareConcurrency || 4)

/**
 * Math thread initialization
 */
function MathWorker () {
    //create object url is needed, because chrome do not start web worker when localhost
    this.worker = new Worker(URL.createObjectURL(new Blob(["("+worker_function.toString()+")()"], {type: 'text/javascript'})));
    this.callbacks = {}
    this.seq = 0

    // create a listener to receive responses from the web worker
    const me = this
    this.worker.addEventListener('message', function(event) {
        const response = JSON.parse(event.data)

        // find the callback corresponding to this response
        const callback = me.callbacks[response.id]
        delete me.callbacks[response.id]


        // call the requests callback with the result
        callback(response.err, response)
    }, false)
}

/**
 * Evaluate an expression
 * @param modulo
 * @param arg
 * @param rootExponent
 * @param k
 * @param precision
 * @param {Function} callback   Called as callback(err, result)
 */
MathWorker.prototype.RootEvaluationMessage = function evaluate (modulo, arg, rootExponent, k, precision, callback) {
    // build a request,
    // add an id so we can link returned responses to the right callback
    const id = this.seq++
    const request = {
        id: id,
        rootExponent: rootExponent,
        k: k,
        precision: precision,
        modulo: modulo,
        arg: arg
    }

    // queue the callback, it will be called when the worker returns the result
    this.callbacks[id] = callback

    // send the request to the worker
    this.worker.postMessage(JSON.stringify(request))
}

/**
 * Distribute math root evaluation process between threads function
 * @param modulo
 * @param arg
 * @param rootExponent
 * @param precision
 * @param allDoneCallback
 */
function MultiThreadCalculation(modulo, rootExponent, precision, arg, allDoneCallback){
    const totalK = rootExponent;
    let doneParallelK = 0;
    let doneK = 0;

    let index = 0;
    let results = {
        values: [],
        success: true
    };

    while (doneParallelK != totalK){

        let thread = _MathWorkers[index];

        let k = doneParallelK;

        thread.RootEvaluationMessage(modulo, arg, rootExponent, k, precision, function (err, res) {
            doneK++;

            results.values.push(res);

            if (doneK == totalK){
                allDoneCallback(results)
            }
        })

        if (index == _MathWorkers.length - 1) { index = 0}

        index++;
        doneParallelK++;

    }


}

//web workers initialization
const _MathWorkers = [];

for (let i = 0; i < threads; i++){
    _MathWorkers.push(new MathWorker())
}

