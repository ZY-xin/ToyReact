; (function () {

    HACKER.fd2obj = function (formData) {
        var objData = {};

        for (var entry of formData.entries()) {
            objData[entry[0]] = entry[1];
        }
        return objData
    };



    HACKER.poll = poll;
    function isNull(o) {


        return (o == null) || (o == undefined) || (('' + o).trim() == '') || ('length' in o && o.length == 0)
    }
    function poll(fn, timeout, interval) {
        var endTime = Number(new Date()) + (timeout || 1000000);
        interval = interval || 50;

        var checkCondition = function (resolve, reject) {
            // If the condition is met, we're done! 
            var result = fn();
            if (!isNull(result)) {
                resolve(result);
            }
            // If the condition isn't met but the timeout hasn't elapsed, go again
            else if (Number(new Date()) < endTime) {
                setTimeout(checkCondition, interval, resolve, reject);
            }
            // Didn't match and too much time, reject!
            else {
                reject(new Error('timed out for ' + fn + ': ' + arguments));
            }
        };

        return new Promise(checkCondition);
    }










    function transformObjIteratilly(obj, fn, transformKey = (k) => k) {
        let res = {}
        for (let i in obj) {
            if ('props' != i && Reflect.has(obj, i) && fn(obj[i], i)) {
                res[transformKey(i)] = obj[i]
            }
        }
        return res;
    }

    function toHump(name, big = false) {
        name = name.replace(/\-(\w)/g, function (all, letter) {
            HACKER.doNothing(all) //"_T"
            HACKER.doNothing(letter) //"T"
            return letter.toUpperCase();
        });

        if (big) {
            return name.charAt(0).toUpperCase() + name.slice(1)
        }
        return name;
    }

    HACKER.toHump = toHump;

    HACKER.dealyExec = (fn = () => { }, dealy = 0, returnPromise = true) => {
        if (returnPromise) {
            return new Promise((resolve) => {
                setTimeout(async () => {
                    let res = await fn();
                    resolve(res)
                }, dealy)
            })
        }
        return () => {
            setTimeout(fn, dealy)
        }

    }

    HACKER.transformObjIteratilly = transformObjIteratilly;




})();