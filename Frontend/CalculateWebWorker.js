function worker_function() {
    importScripts('https://unpkg.com/mathjs@11.11.0/lib/browser/math.js')

    self.math.config({
        number: 'BigNumber',      // Default type of number:
                                  // 'number' (default), 'BigNumber', or 'Fraction'
        precision: 400
    })

// create a parser
    const parser = self.math.parser()

    //muavr formula responder, similiar to one on the main thread
    self.addEventListener('message', function (event) {
        const request = JSON.parse(event.data)

        let rootExponent = request.rootExponent;
        let precisionVal = request.precision;
        let k = request.k;
        let formattedResult = request.formattedValue;
        let arg = request.arg;

        let imagine = parser.evaluate('pow(abs('+formattedResult+'), 1 / '+rootExponent+') * (sin(('+arg+' + 2 * pi * '+k+') / '+rootExponent+'))');
        let re = parser.evaluate('pow(abs('+formattedResult+'), 1 / '+rootExponent+') * (cos(('+arg+' + 2 * pi * '+k+') / '+rootExponent+'))');

        let res = '';
        let realFormatted = self.math.format(re,{notation: 'fixed', precision: Number.parseInt(precisionVal)});
        realFormatted = realFormatted.replace(/(\.[0-9]*[1-9])0+$|\.0*$/,'$1');

        let hasRealPart = ! self.math.equal(realFormatted, "0")

        if (hasRealPart){
            res += realFormatted;
        }

        let imagineFormatted =   self.math.format(imagine,{notation: 'fixed', precision: Number.parseInt(precisionVal)});
        imagineFormatted = imagineFormatted.replace(/(\.[0-9]*[1-9])0+$|\.0*$/,'$1');

        if (! self.math.equal(imagineFormatted, "0")){

            if (self.math.equal(imagineFormatted, '-1')){
                imagineFormatted = '-'
            } else if (self.math.equal(imagineFormatted, '1')){
                imagineFormatted = '';
            }

            res += " " + ( self.math.larger(imagine, 0) && hasRealPart ? "+ " : '') + imagineFormatted + "i"
        }
        // build a response
        const response = {
            id: request.id,
            value: res
        }

        // send the response back
        self.postMessage(JSON.stringify(response))
    }, false)

}
// This is in case of normal worker start
// "window" is not defined in web worker
// so if you load this file directly using `new Worker`
// the worker code will still execute properly
if(window!=self)
    worker_function();
