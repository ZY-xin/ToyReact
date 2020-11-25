; (function () {

    let HACKER = window.HACKER,
        HK = HACKER;




    let getElementByContext = (selectorOrEle, context) => {
        if (selectorOrEle instanceof HTMLElement) {
            return selectorOrEle
        } else {
            return (context || window.document.body).querySelector(selectorOrEle)
        }
    }




    HACKER.mappingEvents = (configArr, context, dealy = 0) => {
        if (!Array.isArray(configArr) || !configArr.length) {
            return
        }

        context = context || HACKER.$.context
        configArr.forEach((row) => {

            if (row[0] && row[1]) {
                getElementByContext(row[0], context).addEventListener(row[1], function (e) {
                    // HACKER.doNothing('e.tar---:', e.target)

                    let fun = () => {
                        if (row[2] && row[3]) {
                            getElementByContext(row[2], context)[row[3]]();
                        }


                        //取最后一个function作为回调函数执行
                        (row.reverse().find((o) => 'function' == typeof (o)) || (() => { }))();
                    }

                    dealy == 0 ? (fun()) : (setTimeout(fun, dealy))



                })
            }










        })
    }
    HACKER.CLICKED_TAR_COLLECTIONS = []


    // HACKER.lastPathName = null

    HACKER.LAST_EMITTED_TARGET_CLICK_FLAG = ''
    window.addEventListener('click', (e) => {

        if (!e.isTrusted) {
            return false;
        }

        let tar = e.target;
        // if (HACKER.BX_MODE) {
        //     window.LAST_CLICKED_TAR = tar;
        // }
        HACKER.CLICKED_TAR_COLLECTIONS.push(tar)
        if (HACKER.CLICKED_TAR_COLLECTIONS.length > 5) {
            HACKER.CLICKED_TAR_COLLECTIONS.splice(0, HACKER.CLICKED_TAR_COLLECTIONS.length - 5)
        }
        HACKER.$bus.emit('B_TARGET_CLICK_ANYTHING', tar, e)
        if (tar.className != '') {
            HACKER.LAST_EMITTED_TARGET_CLICK_FLAG = tar.className.split('-').join('_').split(' ').join('_').toUpperCase()
            let busName = 'B_TARGET_CLICK_' + HACKER.LAST_EMITTED_TARGET_CLICK_FLAG

            // B_TARGET_CLICK_DATE_PICKER_TRIGGER_START
            HACKER.$bus.emit(busName, tar, e)
            tar.className.split(' ').forEach((clsName) => {
                let busName = ('B_TARGET_CLICK_CLASS_EACH_' + clsName.split('-').join('_').toUpperCase())
                HACKER.doNothing('bus name by single class--:', busName, 'LOG')
                HACKER.$bus.emit(busName, tar, e)
            })

            HACKER.doNothing('bus name by whole class--:', busName, 'LOG')

        }
    })

    HACKER.forEachNodeList = (selector, fn = () => { }) => {
        let list = document.querySelectorAll(selector);
        [].forEach.call(list, (obj, index) => {
            fn.call(obj, obj, index)
        })
        return list;
    }
    function calculatePx(o) {
        if (('' + o).endsWith('%')) {
            return o;
        } else {
            return o + 'px'
        }
    }
    function h(p, w = 40, h = 40, l = 0, t = 0, classes, listeners, customStyles = {}) {
        listeners = listeners || {}
        // let p = obj.parentNode
        let div = document.createElement('div')
        if (['inherit', 'static', ''].includes(p.style.position)) {
            p.style.position = 'relative'
        }
        p.appendChild(div)


        let styles = {
            width: calculatePx(w),
            height: calculatePx(h),
            position: 'absolute',
            left: calculatePx(l),
            top: calculatePx(t),

            ...customStyles
        }
        for (let i in listeners) {
            div.addEventListener(i, listeners[i])
        }

        classes.split(' ').forEach((k) => {
            div.classList.add(k)
        })
        for (let i in styles) {

            div.style[i] = styles[i]
        }
        return {
            instance: div,
            styles(styleDefines) {
                for (let i in styleDefines) {

                    div.style[i] = styleDefines[i]
                }
                return div;
            }
        }
    }
    HACKER.h = h;

    HACKER.$ = {
        getObjBySelectorOrNode(selectorOrNode) {
            selectorOrNode = selectorOrNode || this.context
            // console.log('selectorOrNode--selectorOrNode--:', selectorOrNode)
            if (!(selectorOrNode instanceof HTMLElement)) {
                selectorOrNode = document.querySelector(selectorOrNode)
            }
            return selectorOrNode;
        },
        $(obj, useQuerySelectorAll = true) {
            if (obj instanceof HTMLElement) { return obj }

            let targetNode = this.getObjBySelectorOrNode()
            if (!targetNode) {
                return null;
            }
            return targetNode[useQuerySelectorAll ? 'querySelectorAll' : 'querySelector'].apply(targetNode, arguments)
        },
        $$(obj) {
            return this.$(obj, false)
        },
        context: document.body,
        update(node) {

            // this.$ = node.querySelectorAll.bind(node);
            this.context = node;
            return node;
        },
        reset() {





            this.context = HACKER.mutationObserverRouteWrapper || document.body;
            // this.$ = this.context.querySelectorAll.bind(this.context)
            // this.$ = document.querySelectorAll.bind(document)
        }
    }

    HACKER.$bus.on('B_BEFORE_ROUTE_CHANGE', () => {
        HACKER.$.reset()
    })







    async function updateMutationObserverRouteWrapper() {
        HACKER.mutationObserverRouteWrapper = await HACKER.poll(() => HACKER.$.$$(HACKER.mutationObserverRouteWrapper));
        // console.log('HACKER.mutationObserverRouteWrapper---:', HACKER.mutationObserverRouteWrapper)
        // HACKER.mutationObserverRouteWrapper = await HACKER.poll(() => HACKER.$.$$('.m-wrapper'));
        HACKER.$.update(HACKER.mutationObserverRouteWrapper)
        HACKER.$bus.emit('B_ROUTE_WRAPPER_LOADED')
        // initialPopUpService()

    }







    // HACKER.initialPopUpService = initialPopUpService
    function initialPopUpService() {
        HACKER.PENDING_POPUP = null;
        HACKER.MASK_DOM = HACKER.h(document.body, 1, 1, 0, 0,
            // HACKER.MASK_DOM = HACKER.h(document.body, '100%', '100%', 0, 0,
            // calendarShowTriggerStart = HACKER.h(list[0].parentNode.parentNode.parentNode, 40, 40, 0, -10,
            `HK-fullscreen-mask`).styles({
                background: 'rgba(0,0,0,0.5)',
                // opacity: 0.5,
                zIndex: 99999,
                display: 'none'
            });
        HACKER.popup = function (obj, w, h, translateX = 0, translateY = 0, customStyles) {
            let MODE = 'POPUP'
            customStyles = customStyles || {}
            let boundingClientRect;

            if (obj) {
                boundingClientRect = obj.getBoundingClientRect()
            } else {
                MODE = 'DIALOG'
                w = w || 800
                h = h || 500
                boundingClientRect = {
                    left: (document.documentElement.clientWidth - w) / 2,
                    top: (document.documentElement.clientHeight - h) / 2
                }
                HACKER.MASK_DOM.style.width = "100%"
                HACKER.MASK_DOM.style.height = "100%"
                HACKER.MASK_DOM.addEventListener('click', closeEventForDialogMode)
            }




            HACKER.MASK_DOM.style.display = 'block';
            let div = HACKER.h(HACKER.MASK_DOM, w, h, boundingClientRect.left + translateX, boundingClientRect.top + translateY,
                // calendarShowTriggerStart = HACKER.h(list[0].parentNode.parentNode.parentNode, 40, 40, 0, -10,
                `HK-fullscreen-pop`).styles({
                    boxShadow: `0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)`,
                    ...customStyles,
                    background: '#fff'
                });
            // HACKER.doNothing('div--:', div, 'LOG')
            let res = {
                instance: div,

                setContent(title, content) {
                    if (MODE != 'DIALOG') {
                        return res;
                    }
                    div.innerHTML = HACKER.html`
                    <div style="font-size: 24px;
                                            text-align: center;
                                            margin-bottom: 20px;
                                            line-height: 30px;">${title}</div>
                    <div style="box-sizing: border-box;
                        max-height: calc(100% - 70px);
                        overflow: auto;
                        padding: 0 20px;">${content}</div>
                    `


                    return res;
                },
                destroy() {
                    div.parentNode.removeChild(div);
                    HACKER.MASK_DOM.style.width = "1px"
                    HACKER.MASK_DOM.style.height = "1px"
                    HACKER.MASK_DOM.style.display = 'none';
                    HACKER.PENDING_POPUP = null;
                    if (MODE == 'DIALOG') {
                        HACKER.MASK_DOM.removeEventListener('click', closeEventForDialogMode)
                    }

                }
            };
            function closeEventForDialogMode(e) {
                if (!e.target.closest('.HK-fullscreen-pop')) {

                    res.destroy();
                }
            }
            HACKER.PENDING_POPUP = res
            return res;
        }
    }

    // 创建一个observer示例与回调函数相关联
    var observer = new MutationObserver(function (mutationsList, obsr) {
        for (var mutation of mutationsList) {
            if (mutation.type == 'childList') {

                setTimeout(async () => {

                    if (!HACKER.checkThrottleFlag()) {


                        return false

                    }



                    await updateMutationObserverRouteWrapper()






                    // 停止观测
                    observer.disconnect();

                }, 200)


                HACKER.doNothing('A child node has been added or removed.', mutation);

            }
            // else if (mutation.type == 'attributes') {
            //     HACKER.doNothing('The ' + mutation.attributeName + ' attribute was modified.');
            // }
        }
    });

    // initialPopUpService()

    let isBasicServiceInited = false

    HACKER.$bus.on("B_AFTER_ROUTE_CHANGE", () => {
        if (!isBasicServiceInited) {
            initialPopUpService()

            isBasicServiceInited = true;
        }
    })



    window.addEventListener('load', () => {
        //必须用mutationObserver确保一开始就定义的mutationobservableWrapper加载成功之后,再触发parser工作
        // setTimeout(() => {
        //使用配置文件对目标节点进行观测
        observer.observe(document.body, { attributes: false, childList: true, subtree: false });
        // })
    })
















})();