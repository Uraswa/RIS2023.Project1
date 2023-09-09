math.config({
    number: 'BigNumber',      // Default type of number:
                              // 'number' (default), 'BigNumber', or 'Fraction'
    precision: 400
})


//START LANGUAGE SECTION

let curLang = 'ru';
let debugVersion = true;

function changeLanguage(language) {
    curLang = language;
    let texts = document.getElementsByClassName('ILanguage');
    for (let text of texts) {
        text.innerHTML = dictionary[language][text.getAttribute('key')];
    }
}

//END LANGUAGE SECTION


const numberInput = document.getElementById('number_input');
const precisionInput = document.getElementById('precision_input');
const rootExponentInput = document.getElementById('root_exponent_input');
const resultView = document.getElementById('number_result');
const calculateBtn = document.getElementById("calculate_btn");

function getError(error_key){
   return '<span class="ILanguage" key="' + error_key + '">' + (dictionary[curLang][error_key] || '') + '</span>';
}

function renderError(error_key) {
    resultView.innerHTML = getError(error_key);
}

function Calculate(val, precisionVal, rootExponent, allDoneCallback) {
    val = val
        .replaceAll('ctg', 'cot')
        .replaceAll('tg', 'tan')
        .replaceAll('=', '')

        // .replaceAll('ctg', 'cot')
        // .replaceAll('tg', 'Math.tan')
        // .replaceAll('sqrt', 'Math.sqrt')
        // .replaceAll('pi', 'Math.PI');


    if (val === "") {
        allDoneCallback({
            success: false,
            error: ''
        })

        return;
    }


    try {
        val = math.evaluate(val);

    } catch (e) {


        if (e instanceof ReferenceError) {
            allDoneCallback({
                success: false,
                error: 'err_unknown_symbol'
            })
            return;
        }

        if (e instanceof SyntaxError) {
            allDoneCallback({
                success: false,
                error: 'err_unknown_symbol'
            })
            return;
        }


        if (e.message.includes("Undefined symbol")){
            allDoneCallback({
                error: 'err_variable'
            })
            return;
        }

        allDoneCallback({
            error: 'err_nan'
        })

        return;

    }



    if (math.format(val) == 'NaN'){
        allDoneCallback({
            error: 'err_nan'
        })
        return;
    }

    if (math.format(val) == "Infinity"){
        allDoneCallback({
            error: 'text_too_large_res_or_zero'
        })
        return;
    }

    if (math.format(val) == "-Infinity"){
        allDoneCallback({
            error: 'text_too_small_res_or_zero'
        })
        return;
    }

    if (math.equal(val, "0")){
        allDoneCallback({
            success: true,
            values: [{
                value: "0"
            }]
        })
        return;
    }

    if (rootExponent === 0) {
        allDoneCallback({
            success: false,
            error: 'err_wrong_root_exponent_value'
        })
        return
    }

    if (precisionVal < 0){
       allDoneCallback({
            success: false,
            error: 'err_negative_precision'
        })
        return
    }

    if (precisionVal > 400) {
        allDoneCallback({
            success: false,
            error: 'err_too_large_precision'
        })
        return
    }

    if (precisionVal % 1 !== 0) {
        allDoneCallback({
            success: false,
            error: 'err_floating_precision'
        })
        return
    }

    let sqVal = [];
    let arg = val < 0 ? 'pi' : '0';

    let formattedResult = math.format(val,{notation: 'fixed', precision: Number.parseInt(precisionVal)})


    if (typeof(Worker) !== "undefined"){

        MultiThreadCalculation(formattedResult, rootExponent, precisionVal, arg, allDoneCallback);
        return;
    }


    let muavr = (k) => {

        let imagine = math.evaluate('pow(abs('+formattedResult+'), 1 / '+rootExponent+') * (sin(('+arg+' + 2 * pi * '+k+') / '+rootExponent+'))');
        let re = math.evaluate('pow(abs('+formattedResult+'), 1 / '+rootExponent+') * (cos(('+arg+' + 2 * pi * '+k+') / '+rootExponent+'))');

        //console.log('pow(abs('+formattedResult+'), 1 / '+rootExponent+') * (sin(('+arg+' + 2 * pi * '+k+') / '+rootExponent+'))')

        if (re === Number.NEGATIVE_INFINITY){
            return {
                error: 'text_too_small_res_or_zero'
            }
        } else if (re === Number.POSITIVE_INFINITY){
            return {
                error: 'text_too_large_res_or_zero'
            }
        } else if (imagine === Number.NEGATIVE_INFINITY){
            return {
                error: 'text_too_small_res_or_zero'
            }
        } else if (imagine === Number.POSITIVE_INFINITY){
            return {
                error: 'text_too_large_res_or_zero'
            }
        } else if (Number.isNaN(imagine)){
            return {
                error: 'err_nan'
            }
        }

        let res = '';

        let realFormatted = math.format(re,{notation: 'fixed', precision: Number.parseInt(precisionVal)});
        let hasRealPart = !math.equal(realFormatted, "0")

        if (hasRealPart){
            res += realFormatted;
        }

        let imagineFormatted =  math.format(imagine,{notation: 'fixed', precision: Number.parseInt(precisionVal)});

        if (!self.math.equal(imagineFormatted, "0")){

            if (self.math.equal(imagineFormatted, '-1')){
                imagineFormatted = '-'
            } else if (self.math.equal(imagineFormatted, '1')){
                imagineFormatted = '';
            }

            res += " " + ( self.math.larger(imagine, 0) && hasRealPart ? "+ " : '') + imagineFormatted + "i"
        }

        return {
            value: res,
            real: re.toString(),
            imagine: imagine.toString()
        }
    }

    let fineResultSet = new Set();

    for (let i = 0; i < rootExponent; i++){
        let val = muavr(i);

        if (!val.error && !fineResultSet.has(val.value)){
            sqVal.push(val)
            fineResultSet.add(val.value)
        } else if (val.error){
            sqVal.push(val)
        }
    }

    //print("Value", val, "Sq value", sqVal);
    allDoneCallback({
        success: true,
        values: sqVal
    })
}

function workCalculation() {
    let expression = numberInput.value;
    resultView.innerHTML = '<span>'+dictionary[curLang]['text_loading']+'</span>';

    calculateBtn.setAttribute("disabled", "");

    Calculate(expression, precisionInput.value, Number.parseFloat(rootExponentInput.value), function (result) {
        console.log('result received ', result);
        calculateBtn.removeAttribute("disabled");
        let html = '';
        if (result.success) {

            for (let val of result.values){

                if (val.error){
                    html += getError(val.error)
                } else {
                    html += '<span style="line-break: anywhere; max-width: 100%">'+val.value+'</span><hr>';
                }

                html += '<br>'
            }
        }

        if (result.error){
            html += getError(result.error);
        }

        resultView.innerHTML = html;
    });


}


//input

function workInput(character) {

    let cachedCursorIndex = numberInput.selectionStart;
    let beforeString = numberInput.value.slice(0, cachedCursorIndex);

    if (character === '<-') {
        if (cachedCursorIndex !== 0) {
            numberInput.value = beforeString.slice(0, cachedCursorIndex - 1) + numberInput.value.substring(cachedCursorIndex, numberInput.value.length);
        }
        numberInput.focus();
        numberInput.selectionStart = cachedCursorIndex - 1;

    } else if (character === '+-') {
        let currentCharacter = numberInput.value.slice(cachedCursorIndex, cachedCursorIndex + 1);

        if (currentCharacter !== "-") {
            numberInput.value = beforeString + '-' + numberInput.value.substring(cachedCursorIndex, numberInput.value.length);
        } else {
            numberInput.value = beforeString + numberInput.value.substring(cachedCursorIndex + 1, numberInput.value.length);
        }

        numberInput.focus();
        numberInput.selectionStart = cachedCursorIndex;

    } else if (character === 'C') {
        numberInput.value = "";
        numberInput.focus();
        numberInput.selectionStart = 0;
    } else if (character === '=') {
        workCalculation()
        numberInput.focus();
        numberInput.selectionStart = cachedCursorIndex;
    } else if (character === 'cos' || character === 'sin' || character === 'ctg' || character === 'sqrt' || character === 'tg') {
        numberInput.value = beforeString + character + '()' + numberInput.value.substring(cachedCursorIndex, numberInput.value.length);
        numberInput.focus();
        numberInput.selectionStart = cachedCursorIndex + character.length + 1;
    } else {
        numberInput.value = beforeString + character + numberInput.value.substring(cachedCursorIndex, numberInput.value.length);
        numberInput.focus();
        numberInput.selectionStart = cachedCursorIndex + character.length;
    }

    numberInput.selectionEnd = numberInput.selectionStart;



}

//end input


// initialization


changeLanguage(curLang);


// service

function print(...args) {
    if (debugVersion) console.log(args.join(" "))
}
