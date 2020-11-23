import { Component, render } from './toy-react.js'

class MyComponent extends Bue.jsxComp {
    render() {
        return <div title="test title" class="bx-test abc" style="border:solid 1px red;">{this.children}</div>
    }
}



window.addEventListener('load', () => {
    Bue.renderJsx(<MyComponent>
        i am pure text
        <div title="a">a</div>
        {/* <div title="b">b</div> */}
    </MyComponent>, document.body)
})
