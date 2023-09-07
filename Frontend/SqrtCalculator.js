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

function renderError(error_key) {
    resultView.innerHTML = '<span class="ILanguage" key="' + error_key + '">' + (dictionary[curLang][error_key] || '') + '</span>'
}

function Calculate(val) {
    val = val
        .replaceAll('sin', 'Math.sin')
        .replaceAll('cos', 'Math.cos')
        .replaceAll('ctg', 'cot')
        .replaceAll('tg', 'Math.tan')
        .replaceAll('sqrt', 'Math.sqrt')
        .replaceAll('pi', 'Math.PI');

    if (val === "") {
        resultView.innerHTML = "";
        return {
            success: false,
            error: ''
        }
    }

    try {
        val = Number.parseFloat(eval(val));
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

    let rootExponent = Number.parseFloat(rootExponentInput.value);

    if (val < 0 && rootExponent % 2 === 0) {
        return {
            success: false,
            error: 'err_negative_value'
        }
    }

    if (rootExponent === 0) {
        return {
            success: false,
            error: 'err_wrong_root_exponent_value'
        }
    }

    if (rootExponent % 1 !== 0 && val < 0) {
        return {
            success: false,
            error: 'err_negative_value_float_root_exponent'
        }
    }

    let precisionVal = precisionInput.value;

    if (precisionVal < 0){
        return {
            success: false,
            error: 'err_negative_precision'
        }
    }

    if (precisionVal > 100) {
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

    // костыль чтобы без муавра. Например, кубический корень из -8

    let sqVal = 0;
    if (val > 0) {
        sqVal = Math.pow(val, 1 / rootExponent);
    } else {
        sqVal = -Math.pow(Math.abs(val), 1 / rootExponent);
    }

    // вообще до сюда не должно дойти, но если вдруг что-то еще не учли здесь выведется

    if (Number.isNaN(sqVal)) {
        return {
            success: false,
            error: 'err_nan'
        }
    }

    //print("Value", val, "Sq value", sqVal);
    return {
        success: true,
        value: sqVal.toFixed(precisionVal)
    }
}

function workCalculation() {
    let expression = numberInput.value;
    let result = Calculate(expression);

    if (result.success) {
        resultView.innerHTML = result.value;
        return;
    }

    renderError(result.error);
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