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
        let modulo = request.modulo;
        let arg = request.arg;

        //for more information https://resh.edu.ru/subject/lesson/4930/conspect/79038/
        let n1 = math.evaluate('pow('+modulo+', 1 / '+rootExponent+') * (sin(('+arg+' + 2 * pi * '+k+') / '+rootExponent+'))');
        let n2 = math.evaluate('pow('+modulo+', 1 / '+rootExponent+') * (cos(('+arg+' + 2 * pi * '+k+') / '+rootExponent+'))');

        let res = '';

        //this big part of code is formatting result properly.
        //cases that are predicted:
        //0 + 1231i -> 1231i
        //1 + 0i -> 1
        //1 + 1i -> 1 + i
        //1 - 1i -> 1 -i
        //etc.

        console.log(n1, n2)
        let realFormatted = math.format(n2,{notation: 'fixed', precision: Number.parseInt(precisionVal)});
        realFormatted = realFormatted.replace(/(\.[0-9]*[1-9])0+$|\.0*$/,'$1');

        let hasRealPart = ! math.equal(realFormatted, "0")

        if (hasRealPart){
            res += realFormatted;
        }

        let imagineFormatted =   math.format(n1,{notation: 'fixed', precision: Number.parseInt(precisionVal)});
        imagineFormatted = imagineFormatted.replace(/(\.[0-9]*[1-9])0+$|\.0*$/,'$1');

        if (! math.equal(imagineFormatted, "0")){

            if (math.equal(imagineFormatted, '-1')){
                imagineFormatted = '-'
            } else if (math.equal(imagineFormatted, '1')){
                imagineFormatted = '';
            }

            res += " " + ( math.larger(n1, 0) && hasRealPart ? "+ " : '') + imagineFormatted + "i"
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
