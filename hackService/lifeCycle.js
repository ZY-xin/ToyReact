HACKER.viewmodel = class {

    usePollResult(initialValue) {


        return {
            value: initialValue,
            __HACKER_STATE_UPDATE_TYPE: 'USE_POLL_RESULT'
        }
    }
    setState(obj) {
        for (let i in obj) {
            HACKER.$bus.routeData[i] = obj[i]
        }
    }
    constructor($options) {


        let defaultOptions = {
            bindRoute: null,
            domContext: () => document.body,
            render() {

            },
            state() {
                return {}
            },
            methods: {},
            reloadTrigger: null,
            waitUntil: () => true,
            onReady: () => { },
            mappingEvents: () => [],
            h: []
        }

        $options = this.$options = {
            ...defaultOptions,
            ...$options
        }
        for (let i in this.$options.methods) {
            this[i] = this.$options.methods[i].bind(this)
        }


        if (typeof (this.$options.bindRoute) == 'string') {

        } else {
            throw 'bindRoute只能是string类型'
        }





        console.log('this in constructor--:', this)



        let uniqueBusName = HACKER.generateUniqueKeyByPathName($options.bindRoute)
        let busOn = HACKER.busOn;
        let pollResultForState = []

        for (let i in HACKER.props.v) {
            this[i] = HACKER.props.v[i]
        }
        for (let i in HACKER.functions.v) {
            this[i] = HACKER.functions.v[i]
        }

        this.$ = HACKER.$.$;
        this.$$ = HACKER.$.$$;

        busOn('B_PUSH_STATE' + uniqueBusName, () => {

            let state = $options.state.call(this)

            this.state = HACKER.$bus.routeData

            for (let i in state) {
                if ('__HACKER_STATE_UPDATE_TYPE' in state[i]) {



                    let updateType = state[i]['__HACKER_STATE_UPDATE_TYPE']
                    if (updateType == 'USE_POLL_RESULT') {
                        pollResultForState.push(i)
                    }

                    state[i] = state[i].value;

                }
            }

            HACKER.setRouteData(state)
        })

        busOn($options.reloadTrigger.map((o) => 'B_TARGET_CLICK_' + o.split('-').join('_').toUpperCase()),
            async () => {

                await HACKER.dealyExec();
                await HACKER.poll(() => HACKER.$.$('.mat-datepicker-toggle-default-icon'));
                // alert('yes')
                HACKER.currentParser()

            })

        busOn('B_HACKER_READY' + uniqueBusName, async () => {
            this.busOn = HACKER.busOn;

            if (typeof (this.$options.onReady) == 'function') {
                // console.log('shit this---:', this)
                let pollResult = await HACKER.poll($options.waitUntil.bind(this));

                pollResultForState.forEach((key) => {
                    HACKER.setRouteData({
                        [key]: pollResult
                    })
                })

                HACKER.$.update($options.domContext(pollResult))

                $options.render.call(this, HACKER.h)


                HACKER.mappingEvents($options.mappingEvents.call(this),
                    $.context,
                    0
                )

                if (HACKER.BX_MODE) {
                    window.HACKER['HACKER' + HACKER.generateUniqueKeyByPathName($options.bindRoute)] = this
                }


                this.$options.onReady.call(this, pollResult)
            }
        }, false)





    }

}