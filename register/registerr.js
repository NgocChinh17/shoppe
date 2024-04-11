// một cái đối tượng
function f8 (option){

    var selectorRules  = {};

    // validate
    function validate (inputElement, rule) {
        var errorElement = inputElement.parentElement.querySelector(option.errorSelector);
        var error;  
        
        // lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        // lặp qua từng rules và kiểm tra
        // có lỗi thì dừng kiểm tra
        for (var i = 0; i < rules.length; ++i) {
            error = rules[i] (inputElement.value);
            if (error) 
            break;
        }

        if (error) {
            errorElement.innerText = error;
            inputElement.parentElement.classList.add('invalid');
        }else{
            errorElement.innerText = '';
            inputElement.parentElement.classList.remove('invalid');
        }
        
        return !error;
    }

    // lấy element của form cần validate
    var formElement = document.querySelector(option.form);
    if(formElement){
        // submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValaid = true;

            // lặp qua từng rules và validate
            option.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValaid = validate(inputElement, rule);

                if (!isValaid) {
                    isFormValaid = false;
                }
            });

            if (isFormValaid) {
                // console.log (' không có lỗi')
                if ( typeof option.onsubmit === 'function') {
                    var enableInputs  = formElement.querySelectorAll('[name]');
                    var formValue = Array.from(enableInputs).reduce(function(values, input){
                        values[input.name] = input.value
                        return values;
                    }, {});
                    option.onsubmit (formValue);
                }
            }
        }
        // lặp qua mỗi rules và xử lý các sự kiện
        option.rules.forEach(function (rule) {
            // lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            }else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);

            if (inputElement) {
                // xử lý trường hợp blur ra khỏi input
                inputElement.onblur = function (){
                    validate(inputElement, rule);
                }
                // xử lý khi người dùng nhập input
                inputElement.oninput = function(){
                    var errorElement = inputElement.parentElement.querySelector('.form-message');
                    errorElement.innerText = '';
                    inputElement.parentElement.classList.remove('invalid');
                }
            }
        })
    }
}

// định nghĩa rules bắt buộc
f8.isRequired = function(selector, err1){
    return  {
        selector: selector,
        test:  function(value){
            return value.trim() ? undefined : err1 || 'Vui lòng trường này !';
        }
    }
}

f8.isEmail = function(selector, err1){
    return  {
        selector: selector,
        test:  function(value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : err1 || 'Trường này phải là email !';
        }
    }
}

f8.minLength = function(selector, min, err1) {
    return  {
        selector: selector,
        test:  function(value){
            return value.length >= min ? undefined : err1 || `Vui lòng nhập tối thiểu ${min} kí tự`;
        }
    }
}

f8.repeatpass = function (selector, firstpass, err1) {
    return {
        selector : selector,
        test : function (value) {
            return value === firstpass() ? undefined  : err1 || 'Vui lòng nhập đúng kí tự phía trên';
        }
    }
}