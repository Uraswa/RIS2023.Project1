// BASE UNIT TEST FUNCTIONS

// Function that concludes if the test was successful or not
function it(desc, func) {
    try {
        func();
        console.log('\x1b[32m%s\x1b[0m', '\u2714 ' + desc);
      } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', '\u2718 ' + desc);
        console.error(error);
      }
}

// Function that checks if all the answers are correct by raising them to the corresponding power
function calcAssertEqual(res, expRes, presVal, rootExp) {
    if (res.success === true){
        // Checking for "0" is done separately
        if(res.values.length == 1 && res.values[0].value == '0'){
            if(presVal.real == '0' && presVal.imaginary == '0')throw new Error(`expected '0', got ${res.values[i].value}`);
        }
        else{
            for (let i = 0; i < rootExp; i++){
                let a = parseFloat(res.values[i].real);
                let b = parseFloat(res.values[i].imagine);
                let r = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
                let angle = Math.acos(a / r);
                let realNum = Math.pow(r, rootExp) * Math.cos(rootExp * angle);
                let imagNum = Math.pow(r, rootExp) * Math.sin(rootExp * angle);
                if (!(Math.abs(expRes.real - realNum) < 0.1) || !(Math.abs(expRes.imaginary - imagNum) < 0.1)){
                    throw new Error(`expected real: ${expRes.real}, imaginary: ${expRes.imaginary}; got real: ${realNum}, imaginary: ${imagNum}`);
                }
            }
        }
    }
    else{
        throw new Error(`expected output: ${expRes}; instead error raised: ${res.error}`);
    }
}

// Function that checks if the correct type of error is raised
function calcAssertError(res, expRes) {
    if (res.success === false){
        if (res.error.error_key && res.error.error_key.trim() != expRes.trim()) {
            throw new Error(`expected error: ${expRes}; instead error raised: ${res.error.error_key}`);
        }
        if (typeof res.error == 'string' && res.error.trim() != expRes.trim()){
            throw new Error(`expected error: ${expRes}; instead error raised: ${res.error}`);
        }
    }
    else{
        throw new Error(`expected error: ${expRes}; instead no error raised`);
    }
}

// Function that runs all tests in an array
function runTests(tests) {
    for (let i = 0; i < tests.length; i++) {
        tests[i]();
    }
}

// TESTS
let Tests = [
    // "Calculate" function tests
    // Calculation tests
    // Basic tests
    function test1() {

        let real = '4';
        let imaginary = '0';
        let presVal = 4;
        let rootExp = 2;
        let expRes = {
            real: real,
            imaginary: imaginary
        }    
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Base Test 1', function() {
                console.log(result)
                calcAssertEqual(result, expRes, presVal, rootExp);
            });
        });

    },
    function test2() {
        let real = '9';
        let imaginary = '0';
        let presVal = 4;
        let rootExp = 2;
        let expRes = {
            real: real,
            imaginary: imaginary
        }    
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Base Test 2', function() {
                calcAssertEqual(result, expRes, presVal, rootExp);
            });
        });
    },
    // Tests for irrational results
    function test3() {
        let real = '2';
        let imaginary = '0';
        let presVal = 4;
        let rootExp = 2;
        let expRes = {
            real: real,
            imaginary: imaginary
        }    
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Irrational Test 1', function() {
                calcAssertEqual(result, expRes, presVal, rootExp);
            });
        });
    },
    function test4() {
        let real = '5';
        let imaginary = '0';
        let presVal = 4;
        let rootExp = 2;
        let expRes = {
            real: real,
            imaginary: imaginary
        }    
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Irrational Test 2', function() {
                calcAssertEqual(result, expRes, presVal, rootExp);
            });
        });
    },
    // Tests for random numbers
    function test5() {
        let real = Math.floor((Math.random() + 1) * 10).toString();;
        let imaginary = '0';
        let presVal = 4;
        let rootExp = 2;
        let expRes = {
            real: real,
            imaginary: imaginary
        }    
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Random Number Test 1', function() {
                calcAssertEqual(result, expRes, presVal, rootExp);
            });
        });
    },
    function test6() {
        let real = (Math.floor(((Math.random() + 1))) * 1000).toString();
        let imaginary = '0';
        let presVal = 4;
        let rootExp = 2;
        let expRes = {
            real: real,
            imaginary: imaginary
        }    
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Random Number Test 2', function() {
                calcAssertEqual(result, expRes, presVal, rootExp);
            });
        });
    },
    function test7() {
        let real = (Math.floor((Math.random() + 1)) * 100000000).toString();
        let imaginary = '0';
        let presVal = 4;
        let rootExp = 2;
        let expRes = {
            real: real,
            imaginary: imaginary
        }    
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Random Number Test 3', function() {
                calcAssertEqual(result, expRes, presVal, rootExp);
            });
        });
    },
    // Test for zero
    function test8() {
        let real = '0';
        let imaginary = '0';
        let presVal = 4;
        let rootExp = 2;
        let expRes = {
            real: real,
            imaginary: imaginary
        }    
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Test Zero', function() {
                calcAssertEqual(result, expRes, presVal, rootExp);
            });
        });
    },
    // Tests for different root exponents
    function test9() {
        let real = '9';
        let imaginary = '0';
        let presVal = 4;
        let rootExp = 3;
        let expRes = {
            real: real,
            imaginary: imaginary
        }    
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Test Odd RootExp 1', function() {
                calcAssertEqual(result, expRes, presVal, rootExp);
            });
        });
    },
    function test10() {
        let real = '6';
        let imaginary = '0';
        let presVal = 4;
        let rootExp = 7;
        let expRes = {
            real: real,
            imaginary: imaginary
        }    
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Test Odd RootExp 2', function() {
                calcAssertEqual(result, expRes, presVal, rootExp);
            });
        });
    },
    // tests for imaginary numbers
    function test11() {
        let real = '0';
        let imaginary = '4';
        let presVal = 4;
        let rootExp = 2;
        let expRes = {
            real: '4',
            imaginary: '0'
        }    
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Test Imaginary 1', function() {
                calcAssertEqual(result, expRes, presVal, rootExp);
            });
        });
    },
    function test12() {
        let real = '0';
        let imaginary = '2.54';
        let presVal = 4;
        let rootExp = 7;
        let expRes = {
            real: '2.54',
            imaginary: '0'
        }    
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Test Imaginary 2', function() {
                calcAssertEqual(result, expRes, presVal, rootExp);
            });
        });
    },
    // Error Tests
    // Tests for algebra symbols error
    function test13() {
        let real = '2 + a';
        let imaginary = '0';
        let presVal = 4;
        let rootExp = 2; 
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Test Algebra Symbol Error 1', function() {
                calcAssertError(result, 'err_variable');
            });
        });
    },
    function test13() {
        let real = '0';
        let imaginary = 'x';
        let presVal = 4;
        let rootExp = 2; 
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Test Algebra Symbol Error 2', function() {
                calcAssertError(result, 'err_variable');
            });
        });
    },
    // Tests for special symbols error
    function test14() {
        let real = '2 + 5_';
        let imaginary = '0';
        let presVal = 4;
        let rootExp = 2;  
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Test Special Symbol Error 1', function() {
                calcAssertError(result, 'err_unknown_character');
            });
        });
    },
    function test15() {
        let real = '\\n2 + 5';
        let imaginary = '0';
        let presVal = 4;
        let rootExp = 2;  
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Test Special Symbol Error 2', function() {
                calcAssertError(result, 'err_unknown_character');
            });
        });
    },
    // Tests for incorrect root exponent error
    function test16() {
        let real = '2';
        let imaginary = '0';
        let presVal = 4;
        let rootExp = -2;  
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Test Negative RootExp Error', function() {
                calcAssertError(result, 'err_wrong_root_exponent_value');
            });
        });
    },
    function test17() {
        let real = '2';
        let imaginary = '0';
        let presVal = 4;
        let rootExp = 2.5;  
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Test Incorrect RootExp Error', function() {
                calcAssertError(result, 'err_floating_exponent_value');
            });
        });
    },
    function test18() {
        let real = '2';
        let imaginary = '0';
        let presVal = 4;
        let rootExp = 0;  
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Test Zero RootExp Error', function() {
                calcAssertError(result, 'err_wrong_root_exponent_value');
            });
        });
    },
    // Tests for incorrect precision value error
    function test19() {
        let real = '2';
        let imaginary = '0';
        let presVal = -2;
        let rootExp = 2;  
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Test Negative presVal Error', function() {
                calcAssertError(result, 'err_negative_precision');
            });
        });
    },
    function test20() {
        let real = '2';
        let imaginary = '0';
        let presVal = 4.5;
        let rootExp = 2;  
        Calculate(`${real} + (${imaginary}i)`, presVal, rootExp, function(result){
            it('Test Incorrect presVal Error', function() {
                calcAssertError(result, 'err_floating_precision');
            });
        });
    },

]

// RUNNING TESTS
if (debugVersion){
    runTests(Tests);
}

