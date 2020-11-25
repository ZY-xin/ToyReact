; (function () {

    let HACKER = window.HACKER,
        HK = HACKER;

    class EventEmitter {
        constructor() {
            this.events = {};
        }
        on(event, callback) {


            if (Array.isArray(event)) {
                if (!event.length) {
                    return;
                }
                event.forEach((evt) => {
                    this.on(evt, callback)
                })
                return this;
            }

            const callbacks = this.events[event] || [];
            if (Array.isArray(callbacks)) {
                callbacks.push(callback);
                this.events[event] = callbacks;
            }
            return this;
        }
        off(event, callback = () => { }) {

            if (Array.isArray(event)) {
                event.forEach((evt) => {
                    // console.log('evt---:', evt, this)
                    this.off(evt, () => { })
                })
                // console.log('callback--:', callback)
                callback()
                return this;
            }

            // console.log('callback of single--:', callback)
            if (!callback) {
                this.events[event] = []
                return this;
            }

            const callbacks = (this.events[event] || []).filter(
                (cb) => cb !== callback
            );
            this.events[event] = callbacks;
            return this;
        }
        once(event, callback) {
            const wrap = (...args) => {
                typeof callback === "function" && callback.apply(this, args);
                this.off(event, wrap);
            };
            this.on(event, wrap);
            return this;
        }
        emit(event, ...args) {
            const callbacks = this.events[event] || [];
            if (Array.isArray(callbacks)) {
                callbacks.forEach((cb) => typeof cb === "function" && cb.apply(null, args));
            }
            return this;
        }
    }

    let $bus = new EventEmitter()
    HACKER.$bus = $bus;



    HACKER.lastRouteFlag = null;
    HACKER.currentRouteFlag = generateUniqueKeyByPathName();
    function generateUniqueKeyByPathName(path) {
        path = path || location.pathname
        return path.split('/').join('_').split('-').join('_').toUpperCase()
    }
    HACKER.generateUniqueKeyByPathName = generateUniqueKeyByPathName;


    function emitEventWhenPushState() {
        HACKER.currentRouteFlag = generateUniqueKeyByPathName();

        // console.log('emit event busName--:', busName)

        //先触发push state，再触发parse ok工作
        let busName = 'B_PUSH_STATE' + HACKER.currentRouteFlag
        HACKER.$bus.emit(busName)


        HACKER.$bus.emit("B_AFTER_ROUTE_CHANGE")


    }
    function offEventBeforePushState() {
        // HACKER.lastPathName = (location.href)

        // console.log('off event busName--:', busName)
        HACKER.lastRouteFlag = generateUniqueKeyByPathName()
        let busName = 'B_POP_STATE' + HACKER.lastRouteFlag
        HACKER.$bus.emit(busName)
        HACKER.$bus.emit('B_BEFORE_ROUTE_CHANGE')
        // HACKER.$bus.off(busName)
    }










    ; (function (history) {
        var pushState = history.pushState;
        history.pushState = function (state) {
            offEventBeforePushState()

            // console.log('href before--:', location.href)
            if (typeof history.onpushstate == "function") {
                history.onpushstate({ state: state });
            }
            setTimeout(() => {
                emitEventWhenPushState()
            })
            // console.log('href after--:', location.href)

            // ... whatever else you want to do
            // maybe call onhashchange e.handler
            return pushState.apply(history, arguments);
        };
    })(window.history);



    //本bus on仅仅会在当前路由发生时期进行注册，切换后会自动注销注册的函数。注意：不适用于keepalive的路由组件
    let busOn = (function () {
        let tempBusCollection = [];
        function registerTempBusCollection(key) {
            if (Array.isArray(key)) {
                if (!key.length) {
                    return
                }
                key.forEach((k) => {
                    registerTempBusCollection(k)
                })
                return key;
            }
            if (!tempBusCollection.includes(key)) {
                tempBusCollection.push(key)
            }
            return key;
        }

        HK.$bus.on('B_BEFORE_ROUTE_CHANGE', () => {

            HK.$bus.off(tempBusCollection, () => {
                tempBusCollection = [];

            })
        })

        return (key, fun, addToTemp = true) => {
            HK.$bus.on(addToTemp ? registerTempBusCollection(key) : key, fun)

        }
    })();

    HACKER.busOn = HACKER.$bus.busOn = busOn;


    $bus.routeData = {}
    HACKER.$bus.on('HACKER_CORE_LOADED', () => {
        $bus.routeData = HACKER.createObservableObject({}, 'ROUTE_DATA', ['$refs'])
    })



    // setTimeout(emitEventWhenPushState, 5000)
    // emitEventWhenPushState()

    HACKER.$bus.on('B_ROUTE_WRAPPER_LOADED', emitEventWhenPushState)


    HACKER.setRouteData = (obj) => {
        for (let i in obj) {
            HK.$bus.routeData[i] = obj[i]
        }
    }





})();