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
    var num = parseFloat(Math.pow(res.value, 2));
    expRes = parseFloat(expRes);
    console.log(res, num, expRes);
    if (res.success === true){
        if (num !== expRes) {
            throw new Error(`expected output: ${expRes}; current output: ${num}`);
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
    for (var i = 0; i < tests.length; i++) {
        tests[i]();
    }
}

// TESTS
var Tests = [
    // "Calculate" function tests
    function test1() {
        it('Base Test 1', function() {
            var input = '4';
            var res = Calculate(input);
            calcAssertEqual(res, input);
          });
    },
    function test2() {
        it('Base Test 2', function() {
            var input = '9';
            var res = Calculate(input);
            calcAssertEqual(res, input);
          });
    },
    function test3() {
        it('Irrational Test 1', function() {
            var input = '2';
            var res = Calculate(input);
            calcAssertEqual(res, input);
          });
    },
    function test4() {
        it('Irrational Test 2', function() {
            var input = '5';
            var res = Calculate(input);
            calcAssertEqual(res, input);
          });
    },
    function test5() {
        it('Random Number Test 1', function() {
            var input = Math.floor((Math.random() + 1)).toString();
            var res = Calculate(input);
            calcAssertEqual(res, input);
          });
    },
    function test6() {
        it('Random Number Test 2', function() {
            var input =  (Math.floor(((Math.random() + 1))) * 1000).toString();
            var res = Calculate(input);
            calcAssertEqual(res, input);
          });
    },
    function test7() {
        it('Random Number Test 3', function() {
            var input = (Math.floor((Math.random() + 1)) * 100000000).toString();
            var res = Calculate(input);
            calcAssertEqual(res, input);
          });
    },
    function test8() {
        it('Test Zero', function() {
            var input = '0';
            var res = Calculate(input);
            calcAssertEqual(res, input);
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

