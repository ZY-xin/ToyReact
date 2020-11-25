/**
 * 本响应式系统里的缺陷：
 * 1 目前支持的响应 ：$refs 以及手动塞的数据；$refs里的key变动不支持响应式，
 * 仅支持在key不改变的情况在mutationObservable变更触发更新
 * 
 * 2 其他自定义的数据，支持变更响应
 * 
 * 3 带嵌套的深度proxy，以及对array的proxy，灵感来源于：https://www.cnblogs.com/aiv367/p/12753340.html
 * 
 * 4 proxy return true很有意思：https://blog.csdn.net/LawssssCat/article/details/104561640
 * 
 * 5 如果数组中有对象等复杂的东西，本系统无法被proxy
 * 
 * 6 !!!!!!!!重大bug:无法实现对响应式data中类型为数组元素的
 * 响应,需要更改Reflect.set(target, key, value, receiver); 附近的代码,
 * 比如：html expr里如果带有 -  {this.list.length}  则无法响应更新
 */

import './hackDefine.js'
import './hackUtils.js'

import './routlyPubSubService.js'
import './hackDomService.js'
import './hackParser.js'//
import './lifeCycle.js'

    ; (function () {




        HACKER.setGlobalVariableForViewModel = function (key) {
            key = key || location.pathname.split('/').join('_').split('-').join('_').toUpperCase()
            if (HACKER.BX_MODE) {
                HACKER[key] = this
            }
            HACKER.$bus.on('B_BEFORE_ROUTE_CHANGE', () => {
                delete HACKER[key]
            })
        }



        HACKER.html = (strings, ...restArgs) => {

            // HACKER.doNothing('rest ars--:', restArgs, strings)
            let res = ''
            for (let i = 0; i < 10000; i++) {
                // res += strings[i] + (restArgs[i] || '')
                res += (strings[i] || '') + (restArgs[i] || '')
                if (!strings[i] && !restArgs[i]) {
                    break;
                }
            }

            return res
        };

        [['props', '!="function"'], ['functions', '=="function"']].forEach((row) => {
            HACKER[row[0]] = new Proxy({}, {
                get: function () {


                    return HACKER.transformObjIteratilly(window.HACKER,
                        (o, k) => !'functions props'.split(' ').includes(k) && new Function('return typeof(this.v)' + row[1]).call({ v: o, k: k }))
                }
            });
        })






        HACKER.checkThrottleFlag = (dealy = 100) => {
            setTimeout(() => {
                HACKER.throttleFlag = true
            }, dealy)

            let res = HACKER.throttleFlag;

            HACKER.throttleFlag = false
            return res;
        }


        let observableObjectStore = {

        }


        //proxySetterChecker 和 keepAliveKeys只能工作于第一层
        HACKER.createObservableObject = (initialValue = {}, updateFlag, keepAliveKeys = [], proxySetterChecker = () => true) => {
            observableObjectStore[updateFlag] = initialValue

            HACKER.$bus.on('B_BEFORE_ROUTE_CHANGE', () => {
                for (let i in observableObjectStore[updateFlag]) {
                    if (!keepAliveKeys.includes(i)) {
                        delete observableObjectStore[updateFlag][i]
                    }
                }
                HACKER.doNothing(`clear flag:${updateFlag} store successfully`, 'LOG')
            })



            return new Proxy(observableObjectStore[updateFlag], {
                get(target, key) {
                    HACKER.doNothing('key and target--:', key, target)
                    if (key == '__LIST') {
                        return observableObjectStore[updateFlag]
                    } else {
                        let prefix = key.split('__LIST^')[1]
                        if (prefix) {
                            return HACKER.transformObjIteratilly(observableObjectStore[updateFlag],
                                (o, i) => i.startsWith(prefix), (k) => k.split(prefix + '_')[1])
                        }
                    }
                    HACKER.doNothing('get value of [' + key + '] in flag [' + updateFlag + '],', observableObjectStore[updateFlag][key], "LOG")
                    // HACKER.doNothing('obj---:', observableObjectStore[updateFlag])

                    return observableObjectStore[updateFlag][key];
                },
                set(target, key, value, receiver) {
                    proxySetterChecker(value)
                    HACKER.$bus.emit(updateFlag + '_UPDATE', observableObjectStore[updateFlag], key, value)

                    HACKER.doNothing('set value of [' + key + '] in flag [' + updateFlag + '],', target, value, "LOG")


                    // HACKER.doNothing('compare target and flag streo--:', target, observableObjectStore[updateFlag], observableObjectStore[updateFlag] === target, 'LOG')

                    // return Reflect.set(target, key, value, receiver);


                    // observableObjectStore[updateFlag][key] = value;

                    if (Array.isArray(value)) {
                        // let flag = updateFlag + '_' + key.replace(/([A-Z])/g, "_$1").toUpperCase();
                        // // target[key] = Reflect.set(target, key, value, receiver);
                        // observableObjectStore[updateFlag][key] = HACKER.createObservableObject(target[key], flag)

                        Reflect.set(target, key, value, receiver);


                        // return true;

                    } else {
                        if (typeof (value) == 'object') {
                            if (Object.getPrototypeOf(value).constructor !== Object) {
                                observableObjectStore[updateFlag][key] = value;
                            } else {

                                let flag = updateFlag + '_' + key.replace(/([A-Z])/g, "_$1").toUpperCase();
                                observableObjectStore[updateFlag][key] = HACKER.createObservableObject({}, flag)
                            }

                            // return true;

                        } else {
                            HACKER.doNothing('shit value--:', value)
                            observableObjectStore[updateFlag][key] = value;
                            //why return true? see:https://blog.csdn.net/LawssssCat/article/details/104561640
                            // return true;
                        }
                    }

                    return true;




                }
            })

        }

        HACKER.$bus.emit('HACKER_CORE_LOADED')

    })();