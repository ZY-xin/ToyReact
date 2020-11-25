

; (function () {
    let HACKER = function () {
        let args = [...arguments]
        let action = args[args.length - 1] || 'LOG'
        switch (action) {
            case 'LOG':
            case 'WARN':
                {
                    if (HACKER.BX_MODE) {
                        console[action.toLowerCase()].apply(console, args.slice(0, args.length - 1))
                    }
                    break;
                }
        }
    }

    window.HACKER = HACKER;

    HACKER.doNothing = () => { }
    HACKER.BX_MODE = !!localStorage.getItem('BX_DEBUG');
    HACKER.throttleFlag = true;
    HACKER.mutationObserverRouteWrapper = document.body;



})();