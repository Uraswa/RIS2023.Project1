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
                error: 'err_variable'
            });
            return;
        }

        // all other uncaught exceptions
        allDoneCallback({
            error: 'err_nan'
        });

        return;

    }

    // in case of unpredicted error.
    if (!expressionValue || math.format(expressionValue) == 'NaN'){
        allDoneCallback({
            error: 'err_nan'
        });
        return;
    }

    //when some positive number was divided by 0, or the value is too big (When 1 / 0, js returns infinity)
    if (math.format(expressionValue) == "Infinity"){
        allDoneCallback({
            error: 'text_too_large_res_or_zero'
        });
        return;
    }

    //when some negative number was divided by 0, or the value is too small (When -1 / 0, js returns -infinity)
    if (math.format(expressionValue) == "-Infinity"){
        allDoneCallback({
            error: 'text_too_small_res_or_zero'
        });
        return;
    }

    //null is special case, because there is no -0 in math
    console.log(expressionValue);
    if (math.equal(expressionValue, "0")){
        allDoneCallback({
            success: true,
            values: [{
                value: "0"
            }]
        });
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

    //array to store results.
    //result struct format: {string value, string error}
    let sqVal = [];
    //argument of complex number when it is presented in trigonometry form in math
    let arg = expressionValue < 0 ? 'pi' : '0';

    // prepare data to send to other thread
    let formattedResult = math.format(expressionValue,{notation: 'fixed', precision: 400});


    //some browsers do not support WebWorkers, we must count this case too
    if (allowWebWorkers && typeof(Worker) !== "undefined"){

        // functions that distributes work between webWorkers
        MultiThreadCalculation(formattedResult, rootExponent, precisionVal, arg, allDoneCallback);
        return;
    }


    //main thread Muavr function realization, k : int
    let muavr = (k) => {

        //for more information https://resh.edu.ru/subject/lesson/4930/conspect/79038/
        let imagine = math.evaluate('pow(abs('+formattedResult+'), 1 / '+rootExponent+') * (sin(('+arg+' + 2 * pi * '+k+') / '+rootExponent+'))');
        let re = math.evaluate('pow(abs('+formattedResult+'), 1 / '+rootExponent+') * (cos(('+arg+' + 2 * pi * '+k+') / '+rootExponent+'))');

        //when root exponent is too close to zero
        if (re === Number.NEGATIVE_INFINITY){
            return {
                error: 'text_too_small_res_or_zero'
            };
        } else if (re === Number.POSITIVE_INFINITY){
            return {
                error: 'text_too_large_res_or_zero'
            };
        } else if (imagine === Number.NEGATIVE_INFINITY){
            return {
                error: 'text_too_small_res_or_zero'
            };
        } else if (imagine === Number.POSITIVE_INFINITY){
            return {
                error: 'text_too_large_res_or_zero'
            };
        } else if (Number.isNaN(imagine)){ //in case of unpredicted error
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
        let realFormatted = math.format(re,{notation: 'fixed', precision: Number.parseInt(precisionVal)});
        realFormatted = realFormatted.replace(/(\.[0-9]*[1-9])0+$|\.0*$/,'$1');

        let hasRealPart = ! math.equal(realFormatted, "0")

        if (hasRealPart){
            res += realFormatted;
        }

        let imagineFormatted =   math.format(imagine,{notation: 'fixed', precision: Number.parseInt(precisionVal)});
        imagineFormatted = imagineFormatted.replace(/(\.[0-9]*[1-9])0+$|\.0*$/,'$1');

        if (! math.equal(imagineFormatted, "0")){

            if (math.equal(imagineFormatted, '-1')){
                imagineFormatted = '-'
            } else if (math.equal(imagineFormatted, '1')){
                imagineFormatted = '';
            }

            res += " " + ( math.larger(imagine, 0) && hasRealPart ? "+ " : '') + imagineFormatted + "i"
        }

        return {
            value: res,
            real: re.toString(),
            imagine: imagine.toString()
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