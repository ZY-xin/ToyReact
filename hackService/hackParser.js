; (async function () {

    let HK = window.HACKER,
        $ = HACKER.$.$;






    // new Function('return `'+     ('$'+'{this.$refs.a}')     +'`')      .call({$refs:{a:11111111}})

    //移除一个被双引号包裹的字符串里除了单引号引用里面之外的所有空格
    // function removeSpacesOutsideSingleQuot(s) {
    //     let inside = 0;
    //     return s.replace(/ +|'/g, m => m === "'" ? (inside ^= 1, "'") : inside ? m : "");
    // }


    //表达式如果需要在依赖的属性变更时重新计算，则必须满足类似格式：
    /** 
     * 1 每一个{}里必须只能引用一个响应式数据
     * 2 每一个{}对响应式数据的访问必须通过this.xxx.xx的形式，且被访问的属性之后必须得有至少一个.去访问其自身的属性
    */

    // "{this.$refs.startTime.value}   
    //  ~    {this.$refs.endTime.value}  list length:{this.list.length}  props:{Object.keys(HACKER.props.v).join('----')}"


    //匹配一个字符串中两个字符串中间的所有内容
    function matchStringsBetween(text) {
        // const text = "This is a test string {more or less}, {more} and {less}";
        const regex = /\{(.*?)\}/gi;
        // const regex = new RegExp('[(.*?)]', 'gi')
        const resultMatchGroup = text.match(regex); // [ '[more or less]', '[more]', '[less]' ]
        const desiredRes = resultMatchGroup.map(match => match.replace(regex, "$1"))
        return desiredRes
    }
    HACKER.matchStringsBetween = matchStringsBetween


    //根据表达式解析，收集依赖
    async function collectDepsByExpression(expr) {
        let previousExpr = expr;
        expr = expr.replace(/\{/g, '\${')
        // expr=removeSpacesOutsideSingleQuot(expr);
        let computedFun = new Function('return `' + expr + '`'),
            changeDesc = null,
            changeHandler = computedFun.bind(HACKER.$bus.routeData);

        if (!expr.includes('{this.')) {
            return {
                changeHandler: changeHandler,
                deps: null
                // result: result
            }
        }

        let deps = []

        let everyExprs = matchStringsBetween(previousExpr)



        await HACKER.dealyExec(() => {
            everyExprs.forEach((expr) => {
                Object.keys(HACKER.$bus.routeData.__LIST).forEach((observableKey) => {
                    let prefixKey = 'this.' + observableKey + '.'
                    if (expr.includes(prefixKey)) {
                        let visitedKey = expr.split(prefixKey)[1].split('.')[0]
                        deps.push({
                            observableKey,
                            visitedKey
                        })
                        // HACKER.doNothing('expr--:', visitedKey, expr, 'LOG')
                    }
                })
            })
        }, 50)
        // setTimeout(() => {

        // }, 50)



        // for (let observableKey in HACKER.$bus.routeData.__LIST) {
        //     // if ('$refs' == key) {
        //     //     //观测属性变动
        //     //     changeDesc = {
        //     //         type: 'MUTATION_OBSERVER_ATTRIBUTES',
        //     //     }
        //     // } else {
        //     //     changeDesc = null
        //     // }
        // }

        return {
            // result: result,
            deps: deps,
            changeHandler: changeHandler,
            // changeHandler() {
            //     return computedFun.call(HACKER.$bus.routeData)
            // }
        }
    }

    function applyValue(deps, node, key) {
        let specialSituations = {
            html: 'innerHTML',
            text: 'innerText'
        }
        if (key in specialSituations) {
            node[specialSituations[key]] = deps.changeHandler()
        } else {

            node.setAttribute(key, deps.changeHandler())
        }

    }

    async function exprObservableHandler(deps, node, key) {



        HACKER.doNothing('deps and node--:', deps, node, "LOG")
        if (null == deps.deps) {
            await HACKER.dealyExec(applyValue.bind(null, ...arguments), 30);
        } else {
            await HACKER.dealyExec(applyValue.bind(null, ...arguments), 300);
            deps.deps.forEach((dep) => {
                HACKER.doNothing('log single dep--:', dep, 'LOG')

                if (dep.observableKey == '$refs') {
                    new MutationObserver(HACKER.dealyExec(applyValue.bind(null, ...arguments), 0, false))
                        .observe(HK.$bus.routeData.$refs[dep.visitedKey], { attributes: true, childList: false, subtree: false })
                } else {

                }

            })
        }

    }


    //主解析引擎
    async function parseNodeByDataHacker(node) {

        let hackerDefine = {}, otherDataset = {}
        try {
            // let 
            // console.log('node.dataset.hacker--:', node.dataset.hacker)
            hackerDefine = node.dataset.hacker ? (new Function('return ' + (node.dataset.hacker))()) : {}
        } catch (e) {

        }
        for (let i in node.dataset) {
            if (i != 'hacker' && i.startsWith('hacker')) {
                let key = i.split('hacker')[1].toLowerCase(),
                    val = node.dataset[i]
                otherDataset[key] = val;

                await exprObservableHandler((await collectDepsByExpression(val)), node, key)

            }
        }


        // if (Object.keys(otherDataset).length) {

        //     HACKER.doNothing('other data set--:', otherDataset, "LOG")
        // }

        // console.log('hackerDefine--:', hackerDefine, typeof (hackerDefine))
        let id = hackerDefine.id || node.getAttribute('id')

        if (hackerDefine.hide) {
            node.style.display = 'none'
        } else if (hackerDefine.transparent) {
            node.style.opacity = '0'
        }
        if (!id) {
            return false;
        }

        HK.$bus.routeData.$refs[(hackerDefine.group ? (hackerDefine.group + '_') : '') + HACKER.toHump(id)]
            = node

        // if (hackerDefine.group) {
        //     if (!HK.$bus.routeData.$refs[hackerDefine.group]) {
        //         HK.$bus.routeData.$refs[hackerDefine.group] = {}
        //     }

        //     HK.$bus.routeData.$refs[hackerDefine.group][HACKER.toHump(id)] = node
        // } else {
        //     HK.$bus.routeData.$refs[HACKER.toHump(id)] = node
        // }






    }


    // HACKER.$bus.on('B_BEFORE_ROUTE_CHANGE', () => {

    //     HK.$bus.routeData.$refs = HACKER.createObservableObject({},'HK.$bus.routeData_REF', true, (v) => {
    //         if (!(v instanceof HTMLElement)) {
    //             // throw '只能为ref设置HTMLElement类型的值'
    //         }
    //     })
    // })

    HACKER.$bus.on('HACKER_CORE_LOADED', () => {

        HK.$bus.routeData.$refs = HACKER.createObservableObject({}, 'HK.$bus.routeData_REF', [], (v) => {
            if (!(v instanceof HTMLElement)) {
                throw '只能为ref设置HTMLElement类型的值'
            }
        })
    })


    //route data被改变触发点事件
    HACKER.$bus.busOn('HK.$bus.routeData_REF_UPDATE', ($refs, key, value) => {
        HACKER.doNothing('log-ref-setter:', $refs, key, value, 'LOG')
    })

    HACKER.$bus.on("B_AFTER_ROUTE_CHANGE", async () => {

        // return false;

        HACKER.currentParser = async () => {
            // HK.$bus.routeData.$refs = {}
            // HACKER.$.$('[data-hacker]').forEach(await parseNodeByDataHacker)

            await Promise.all([].map.call(HACKER.$.$('[data-hacker]') || [], parseNodeByDataHacker))

            HK.$bus.emit('B_HACKER_READY' + HACKER.generateUniqueKeyByPathName())
        }


        HACKER.currentParser()


    })
})();