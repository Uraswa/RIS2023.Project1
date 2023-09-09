// BASE UNIT TEST FUNCTIONS

function it(desc, func) {
    try {
        func();
        console.log('\x1b[32m%s\x1b[0m', '\u2714 ' + desc);
      } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', '\u2718 ' + desc);
        console.error(error);
      }
}


function calcAssertEqual(res, expRes) {
    if (res.success === true){
        console.log(res.length);
        for (let i = 0; i < res.length; i++){
            let realNum = parseFloat(value.real);
            let imagNum = parseFloat(value.imagine);
            console.log(Math.pow(realNum, 2) - Math.pow(imagNum, 2), expRes.real);
            console.log( 2 * realNum * imagNum, expRes.imaginary);
            
            if ((Math.pow(realNum, 2) - Math.pow(imagNum, 2) !== expRes.real) || ( 2 * realNum * imagNum !== expRes.imaginary)){
                throw new Error(`expected real: ${expRes.real}, imaginary: ${expRes.imaginary}; got real: ${realNum}, imaginary: ${imagNum}`);
            }
        }
    }
    else{
        throw new Error(`expected output: ${expRes}; instead error raised: ${res.error}`);
    }
}

function calcAssertError(res, expRes) {
    console.log(res, expRes);
    if (res.success === false){
        if (res.error.trim() != expRes.trim()){
            throw new Error(`expected error: ${expRes}; instead error raised: ${res.error}`);
        }
    }
    else{
        throw new Error(`expected error: ${expRes}; instead no error raised`);
    }
}

function runTests(tests) {
    for (let i = 0; i < tests.length; i++) {
        tests[i]();
    }
}

// TESTS
var Tests = [
    // "Calculate" function tests
    function test1() {
        it('Base Test 1', function() {
            let real = '4';
            let imaginary = '0';
            let presVal = 2;
            let rootExp = 2;
            let res = Calculate(`${real} + (${imaginary}i)`, presVal, rootExp);
            console.log(res)
            res.forEach((element) => {
                console.log(element);
            });
            let expRes = {
                real: real,
                imaginary: imaginary
            }
            calcAssertEqual(res, expRes);
          });
    },
    function test2() {
        it('Base Test 2', function() {
            let real = '9';
            let imaginary = '0';
            let presVal = 2;
            let rootExp = 2;
            let res = Calculate(`${real} + (${imaginary}i)`, presVal, rootExp);
            let expRes = {
                real: real,
                imaginary: imaginary
            }
            calcAssertEqual(res, expRes);
          });
    },
    function test3() {
        it('Irrational Test 1', function() {
            let real = '2';
            let imaginary = '0';
            let presVal = 2;
            let rootExp = 2;
            let res = Calculate(`${real} + (${imaginary}i)`, presVal, rootExp);
            let expRes = {
                real: real,
                imaginary: imaginary
            }
            calcAssertEqual(res, expRes);
          });
    },
    function test4() {
        it('Irrational Test 2', function() {
            let real = '5';
            let imaginary = '0';
            let presVal = 2;
            let rootExp = 2;
            let res = Calculate(`${real} + (${imaginary}i)`, presVal, rootExp);
            let expRes = {
                real: real,
                imaginary: imaginary
            }
            calcAssertEqual(res, expRes);
          });
    },
    function test5() {
        it('Random Number Test 1', function() {
            let real = Math.floor((Math.random() + 1)).toString();;
            let imaginary = '0';
            let presVal = 2;
            let rootExp = 2;
            let res = Calculate(`${real} + (${imaginary}i)`, presVal, rootExp);
            let expRes = {
                real: real,
                imaginary: imaginary
            }
            calcAssertEqual(res, expRes);
          });
    },
    function test6() {
        it('Random Number Test 2', function() {
            let real = (Math.floor(((Math.random() + 1))) * 1000).toString();
            let imaginary = '0';
            let presVal = 2;
            let rootExp = 2;
            let res = Calculate(`${real} + (${imaginary}i)`, presVal, rootExp);
            let expRes = {
                real: real,
                imaginary: imaginary
            }
            calcAssertEqual(res, expRes);
          });
    },
    function test7() {
        it('Random Number Test 3', function() {
            let real = (Math.floor((Math.random() + 1)) * 100000000).toString();
            let imaginary = '0';
            let presVal = 2;
            let rootExp = 2;
            let res = Calculate(`${real} + (${imaginary}i)`, presVal, rootExp);
            let expRes = {
                real: real,
                imaginary: imaginary
            }
            calcAssertEqual(res, expRes);
          });
    },
    function test8() {
        it('Test Zero', function() {
            let real = '0'; 
            let imaginary = '0';
            let presVal = 2;
            let rootExp = 2;
            let res = Calculate(`${real} + (${imaginary}i)`, presVal, rootExp);
            let expRes = {
                real: real,
                imaginary: imaginary
            }
            calcAssertEqual(res, expRes);
          });
    },
    function test9() {
        it('Test Unknown Symbol Error 1', function() {
            var input = '2 + a';
            var res = Calculate(input);
            calcAssertError(res, 'err_unknown_symbol');
          });
    },
    function test10() {
        it('Test Unknown Symbol Error 2', function() {
            var input = '2 +';
            var res = Calculate(input);
            calcAssertError(res, 'err_unknown_symbol');
          });
    },
    function test11() {
        it('Test Unknown Symbol Error 3', function() {
            var input = 'abcde';
            var res = Calculate(input);
            calcAssertError(res, 'err_unknown_symbol');
          });
    },
    function test12() {
        it('Test Float Input', function() {
            var input = '2.4';
            var res = Calculate(input);
            calcAssertEqual(res, input);
          });
    },
    
    
    
]

if (debugVersion){
    runTests(Tests);
}

