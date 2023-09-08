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

function getError(error_key){
   return '<span class="ILanguage" key="' + error_key + '">' + (dictionary[curLang][error_key] || '') + '</span>';
}

function renderError(error_key) {
    resultView.innerHTML = getError(error_key);
}

function Calculate(val, precisionVal, rootExponent) {
    val = val
        .replaceAll('ctg', 'cot')
        .replaceAll('tg', 'tan')

        // .replaceAll('ctg', 'cot')
        // .replaceAll('tg', 'Math.tan')
        // .replaceAll('sqrt', 'Math.sqrt')
        // .replaceAll('pi', 'Math.PI');

    if (val === "") {
        return {
            success: false,
            error: ''
        }
    }

    try {
        val = math.evaluate(val);
    } catch (e) {

        if (e instanceof ReferenceError) {
            return {
                success: false,
                error: 'err_unknown_symbol'
            }
        }

        if (e instanceof SyntaxError) {
            return {
                success: false,
                error: 'err_unknown_symbol'
            }
        }

        throw e;
    }

    //let rootExponent = Number.parseFloat(rootExponentInput.value);



    if (rootExponent === 0) {
        return {
            success: false,
            error: 'err_wrong_root_exponent_value'
        }
    }

    //let precisionVal = precisionInput.value;

    if (precisionVal < 0){
        return {
            success: false,
            error: 'err_negative_precision'
        }
    }

    if (precisionVal > 509) {
        return {
            success: false,
            error: 'err_too_large_precision'
        }
    }

    if (precisionVal % 1 !== 0) {
        return {
            success: false,
            error: 'err_floating_precision'
        }
    }



    let sqVal = [];
    let arg = val < 0 ? 'pi' : '0';

    let formattedResult = math.format(val,{notation: 'fixed', precision: Number.parseInt(precisionVal)})

    let muavr = (k) => {

        let imagine = math.evaluate('sqrt(abs('+formattedResult+')) * (sin(('+arg+' + 2 * pi * '+k+') / '+rootExponent+'))');
        let re = math.evaluate('sqrt(abs('+formattedResult+')) * (cos(('+arg+' + 2 * pi * '+k+') / '+rootExponent+'))');

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

        res += math.format(re,{notation: 'fixed', precision: Number.parseInt(precisionVal)});


        if (!math.equal(imagine, 0)){
            res += " " + (math.larger(imagine, 0) ? "+ " : '') + (math.equal(imagine, 1) ? '' : math.format(imagine,{notation: 'fixed', precision: Number.parseInt(precisionVal)})) + "i"
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
    return {
        success: true,
        values: sqVal
    }
}

function workCalculation() {
    let expression = numberInput.value;
    let result = Calculate(expression, precisionInput.value, Number.parseFloat(rootExponentInput.value));

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
}

numberInput.addEventListener('input', workCalculation);
precisionInput.addEventListener('input', workCalculation)
rootExponentInput.addEventListener('input', workCalculation)

function cot(val) {
    return Math.pow(Math.tan(val), -1);
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

    workCalculation()

}

//end input


// initialization


changeLanguage(curLang);

// service

function print(...args) {
    if (debugVersion) console.log(args.join(" "))
}