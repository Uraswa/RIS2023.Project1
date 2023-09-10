//if not allowed, then even if browser supports them, they will be disabled
let allowWebWorkers = true;
//when is false, some debug functions will not work, for example print or tests
let debugVersion = true;

//START LANGUAGE SECTION

let curLang = 'ru';

/**
 * Translates page. Each language-sensetive text is marked with class ILanguage and has unique key attribute:
 * key in dictionary
 * @param language enum(ru,en,sp,ch)
 */
function changeLanguage(language) {
    curLang = language;
    let texts = document.getElementsByClassName('ILanguage');
    for (let text of texts) {
        text.innerHTML = dictionary[language][text.getAttribute('key')];
    }


    let docs = document.getElementsByClassName('docs_lng');
    for (let doc of docs){
        let key = doc.getAttribute('key');
        if (key != curLang){

            if (doc.classList.contains('d-none')) continue
            doc.classList.add('d-none');
            continue
        }

        doc.classList.remove('d-none');

    }
}

//END LANGUAGE SECTION


const numberInput = document.getElementById('number_input');
const precisionInput = document.getElementById('precision_input');
const rootExponentInput = document.getElementById('root_exponent_input');
const resultView = document.getElementById('number_result');
const calculateBtn = document.getElementById("calculate_btn");


/**
 * Error with custom data
 * @param error_key
 * @param custom_part
 */
function customError(error_key, custom_part){
    return '<span class="ILanguage" key="' + error_key + '">' + (dictionary[curLang][error_key] || '') + '</span>' + custom_part;
}

/**
 * Error html template
 * @param error_key
 * @param error_text
 */
function getErrorTemplate(error_key, error_text) {
    return '<span class="ILanguage" key="' + error_key + '">' + error_text + '</span>';
}

/**
 * The error is translated into multiple languages, so this function gets error by error_key in current language and returns html structure
 * @param error_key string
 */
function getError(error_key){
   return getErrorTemplate(error_key, (dictionary[curLang][error_key] || ''));
}

/**
 * render error(string) got by error_key(string) in getError function in pre-defined place
 * @param error_key string
 */
function renderError(error_key) {
    resultView.innerHTML = getError(error_key);
}

/**
 * Evaluate and expression and then calculate root of rootExponent and return result formatted by precisionVal. May be calculated
 * on different threads
 * @param expression string
 * @param precisionVal string
 * @param rootExponent string
 * @param {Function} allDoneCallback Called as callback(result) when calculation is ended
 */
function Calculate(expression, precisionVal, rootExponent, allDoneCallback) {


    //Some math functions in the west called differently.
    // = is replaced because it causes many bugs
    expression = expression
        .replace(/ctg/g, 'cot')
        .replace(/tg/g, 'tan')
        .replace(/=/g, '')
        .replace(/[\r\n]/g, '');

    //safety check, to ensure that no special symbols will be in expression
    const unknownCharacterRegex = /[^a-zA-Z0-9 \.%\+\-\/\*\(\)\^]/gm;
    const unknownRes = unknownCharacterRegex.exec(expression);
    if (unknownRes != null) {
        unknownRes.forEach((match, groupIndex) => {

            allDoneCallback({
                success: false,
                error: {
                    error_key: 'err_unknown_character',
                    custom: match
                }
            })
        });
        return;
    }



    //extra case where expression == "", returns success false, but error empty too, so error is being rendered but it is not.
    if (expression === "") {
        allDoneCallback({
            success: false,
            error: ''
        })

        return;
    }

    //if internet explorer browser
    // if (typeof math === "undefined"){
    //     expression = expression
    //         .replace(/tan/g, 'Math.tan')
    //         .replace(/sqrt/g, 'Math.sqrt')
    //         .replace(/sin/g, 'Math.sin')
    //         .replace(/cos/g, 'Math.cos')
    //         .replace(/\be\b/g, 'Math.E')
    //         .replace(/\^/g, 'Math.E')
    // }


    //Calculated expression result will be put here
    let expressionValue = 0;
    try {
        expressionValue = math.evaluate(expression);

    } catch (e) {

        //Caused when some mathematical operator wasn't given neccessery arguments, or parser didn't found pair ()
        if (e instanceof ReferenceError) {

            allDoneCallback({
                success: false,
                error: 'err_unknown_symbol'
            });
            return;
        }

        //when user tries to use js constructs in evaluation not properly
        if (e instanceof SyntaxError) {
            console.log(e.message);
            allDoneCallback({
                success: false,
                error: 'err_unknown_symbol'
            });
            return;
        }

        //when user tries to use algebra letters in expression
        if (e.message.includes("Undefined symbol")){
            allDoneCallback({
                success: false,
                error: 'err_variable'
            });
            return;
        }

        // all other uncaught exceptions
        allDoneCallback({
            success: false,
            error: 'err_nan'
        });

        return;

    }

    console.log(expressionValue);

    // in case of unpredicted error.
    if (!expressionValue || math.format(expressionValue) == 'NaN'){
        allDoneCallback({
            success: false,
            error: 'err_nan'
        });
        return;
    }

    //when some positive number was divided by 0, or the value is too big (When 1 / 0, js returns infinity)
    if (math.format(expressionValue) == "Infinity"){
        allDoneCallback({
            success: false,
            error: 'text_too_large_res_or_zero'
        });
        return;
    }

    //when some negative number was divided by 0, or the value is too small (When -1 / 0, js returns -infinity)
    if (math.format(expressionValue) == "-Infinity"){
        allDoneCallback({
            success: false,
            error: 'text_too_small_res_or_zero'
        });
        return;
    }

    //null is special case, because there is no -0 in math

    try {
        let equalZero = math.equal(expressionValue, "0")
        if (equalZero){
            allDoneCallback({
                success: true,
                values: [{
                    value: "0"
                }]
            });
            return;
        }
    } catch (e) {

        if (e instanceof TypeError){
            allDoneCallback({
                success: false,
                error: 'err_nan'
            });
            return;
        }

    }

    if (rootExponent % 1 != 0){
        allDoneCallback({
            success: false,
            error: "err_floating_exponent_value"
        })
        return;
    }

    if (rootExponent <= 0){
        allDoneCallback({
            success: false,
            error: "err_wrong_root_exponent_value"
        })
        return;
    }



    if (rootExponent == "" || rootExponent == "0" || rootExponent === 0) {
        allDoneCallback({
            success: false,
            error: 'err_wrong_root_exponent_value'
        });
        return;
    }

    if (precisionVal < 0 || precisionVal == ""){
       allDoneCallback({
            success: false,
            error: 'err_negative_precision'
        });
        return;
    }

    //max precision in math package is 508, in some cases it is 400. All calculations always proceed in 400 point float numbers
    // and then formatted into what user needs
    if (precisionVal > 400) {
        allDoneCallback({
            success: false,
            error: 'err_too_large_precision'
        });
        return;
    }

    //precisionVal belongs to N
    if (precisionVal % 1 !== 0) {
        allDoneCallback({
            success: false,
            error: 'err_floating_precision'
        });
        return;
    }

    // prepare data to send to other thread
    let formattedResult = math.format(expressionValue,{notation: 'fixed', precision: 400});

    //extracting and formatting real part of expressionValue
    let re = undefined;
    if (expressionValue.re){
        re = math.format(expressionValue.re, {notation: 'fixed', precision: 400})
    }

    //extracting and formatting imagine part of expressionValue
    let im = undefined;
    if (expressionValue.re){
        im = math.format(expressionValue.im, {notation: 'fixed', precision: 400})
    }

    //modulo of complex number
    let modulo = 0
    if (re || im){
        console.log('sqrt(('+(re || 0)+')^2 + ('+(im || 0)+')^2)')
        modulo = math.evaluate('sqrt(('+(re || 0)+')^2 + ('+(im || 0)+')^2)')
    } else {
        modulo = math.evaluate('abs('+formattedResult+')');
    }

    //formatting for right calculation
    modulo = math.format(modulo, {notation: 'fixed', precision: 400});

    //argument of complex number when it is presented in trigonometry form in math
    let arg = '0';
    if (re || im){
        arg = math.format(math.evaluate('atan2('+(im || 0)+', '+(re || 0)+')'), {notation: 'fixed', precision: 400})
    } else {
        arg = expressionValue < 0 ? 'pi' : '0';
    }

    //array to store results.
    //result struct format: {string value, string error}
    let sqVal = [];

    //some browsers do not support WebWorkers, we must count this case too
    if (allowWebWorkers && typeof(Worker) !== "undefined"){

        // functions that distributes work between webWorkers
        MultiThreadCalculation(modulo, rootExponent, precisionVal, arg, allDoneCallback);
        return;
    }

    console.log(modulo.toString(), arg.toString());


    //main thread Muavr function realization, k : int
    let muavr = (k) => {

        //for more information https://resh.edu.ru/subject/lesson/4930/conspect/79038/
        let n1 = math.evaluate('pow('+modulo+', 1 / '+rootExponent+') * (sin(('+arg+' + 2 * pi * '+k+') / '+rootExponent+'))');
        let n2 = math.evaluate('pow('+modulo+', 1 / '+rootExponent+') * (cos(('+arg+' + 2 * pi * '+k+') / '+rootExponent+'))');

        //when root exponent is too close to zero
        if (n2 === Number.NEGATIVE_INFINITY){
            return {
                error: 'text_too_small_res_or_zero'
            };
        } else if (n2 === Number.POSITIVE_INFINITY){
            return {
                error: 'text_too_large_res_or_zero'
            };
        } else if (n1 === Number.NEGATIVE_INFINITY){
            return {
                error: 'text_too_small_res_or_zero'
            };
        } else if (n1 === Number.POSITIVE_INFINITY){
            return {
                error: 'text_too_large_res_or_zero'
            };
        } else if (Number.isNaN(n1)){ //in case of unpredicted error
            return {
                error: 'err_nan'
            };
        }

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

        return {
            value: res,
            real: n2.toString(),
            imagine: n1.toString()
        }
    };

    //the root of n exponent has n returning values. k belongs to 0,1,2, ...n, the n is rootExponent
    for (let k = 0; k < rootExponent; k++){
        let val = muavr(k);
        sqVal.push(val);
    }
    
    //function successfully executed in main thread and returns array of values, but in values there may be errors
    allDoneCallback({
        success: true,
        values: sqVal
    });
}

function cot(value){
    return Math.pow(Math.tan(value), - 1);
}

/**
 * Function wrapper for Calculate. Which modifies UI.
 */
function workCalculation() {
    let expression = numberInput.value;

    //loading placeholder
    resultView.innerHTML = '<span>'+dictionary[curLang]['text_loading']+'</span>';

    //calculations of roots with rootExponent more than 200 may take a while.
    //so we ban user to click calculate button when previous calculation is not ended.
    //if we do not, then because calculation results arrive asynchonasly, in resultView there will be a mess.
    calculateBtn.setAttribute("disabled", "");

    Calculate(expression, precisionInput.value, rootExponentInput.value, function (result) {

        //unban calculate button
        calculateBtn.removeAttribute("disabled");
        let html = '';

        //forming the resultView
        if (result.success) {

            for (let val of result.values){

                if (val.error){
                    html += getError(val.error);
                } else {
                    html += '<span style="line-break: anywhere; max-width: 100%">'+val.value+'</span><hr>';
                }

                html += '<br>';
            }
        }

        //each sqVal may contain error, but the function  on can too.
        //for example rootExponent = 0
        //error may be object, when contains custom data
        if (result.error && result.error.error_key){
            html += customError(result.error.error_key, result.error.custom)
        } else if (result.error){
            html += getError(result.error);
        }

        resultView.innerHTML = html;
    });


}


//input

/**
 * called when user clicked on calculator button. Each button has own onclick attribute, where character is automaticly passed (watch index.html)
 * @param character string
 */
function workInput(character) {

    let cachedCursorIndex = numberInput.selectionStart; // current cursor index in input
    let beforeString = numberInput.value.slice(0, cachedCursorIndex); // get string value before cursor

    //delete symbol before current cursor index
    if (character === '<-') {
        if (cachedCursorIndex !== 0) {
            numberInput.value = beforeString.slice(0, cachedCursorIndex - 1) + numberInput.value.substring(cachedCursorIndex, numberInput.value.length);
        }
        numberInput.focus();
        numberInput.selectionStart = cachedCursorIndex - 1;

    }
    // clear expression
    else if (character === 'C') {
        numberInput.value = "";
        numberInput.focus();
        numberInput.selectionStart = 0;
    }
    //calculate root trigger
    else if (character === '=') {
        workCalculation();
        numberInput.focus();
        numberInput.selectionStart = cachedCursorIndex;
    }
    //when function is added, the () added automaticly and cursor is moved to index between ( )
    else if (character === 'cos' || character === 'sin' || character === 'ctg' || character === 'sqrt' || character === 'tg') {
        numberInput.value = beforeString + character + '()' + numberInput.value.substring(cachedCursorIndex, numberInput.value.length);
        numberInput.focus();
        numberInput.selectionStart = cachedCursorIndex + character.length + 1;
    } else {
        numberInput.value = beforeString + character + numberInput.value.substring(cachedCursorIndex, numberInput.value.length);
        numberInput.focus();
        numberInput.selectionStart = cachedCursorIndex + character.length;
    }

    //when cursor is moved, some area of input is selected. We remove selection
    numberInput.selectionEnd = numberInput.selectionStart;



}

//end input



// service
/**
 * service functions, available only in debug mode. Just logs content in console, but ensures that program in edit mode.
 * @param args
 */
function print(...args) {
    if (debugVersion) console.log(args.join(" "))
}