
const RENDER_TO_DOM = Symbol("render to dom");
class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content)
    }
    [RENDER_TO_DOM](range) {
        range.deleteContents();
        range.insertNode(this.root);
    }
}


class ElementWrapper {
    constructor(tagName) {
        this.root = document.createElement(tagName)
    }


    appendChild(component) {
        let range = document.createRange();
        range.setStart(this.root, this.root.childNodes.length);
        range.setEnd(this.root, this.root.childNodes.length);
        console.log('component in append child--:', component)
        component[RENDER_TO_DOM](range);
    }
    [RENDER_TO_DOM](range) {
        range.deleteContents();
        range.insertNode(this.root);
    }
    setAttribute(name, value) {
        if (name.match(/^on([\s\S]+)$/)) {
            this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value);
        } else if (name === 'className') {
            this.root.setAttribute('class', value);
        }
        else {
            this.root.setAttribute(name, value)
        }

    }
}



function insertChildren(children, parent) {

    children = [].concat(children)
    console.log('children in insert children--:', children)

    for (let child of children) {
        console.log('childdddddddddddddd---:', child)
        if (
            typeof child == 'object' &&
            child instanceof Array
        ) {
            for (let c of child) {
                insertChildren(c, parent)
            }
        }
        if (typeof child == 'number') {
            child = child.toString()
        }
        if (typeof child === 'string') {
            child = new TextWrapper(child)
        }
        parent.appendChild(child)
    }



}


let Bue = function () {

}

let merge = (oldState, newState) => {
    for (let p in newState) {
        if (oldState[p] === null || typeof oldState[p] !== "object") {
            oldState[p] = newState[p];
        } else {
            merge(oldState[p], newState[p]);
        }
    }
}
Bue.jsxComp = class {
    constructor() {
        this.props = Object.create(null);
        this.children = [];
        this._root = null;
        this._range = null;
    }
    setAttribute(name, value) {
        this.props[name] = value    // props还未实现
    }
    appendChild(child) {    // component 添加 
        this.children.push(child)
    }
    //root是一个和渲染相关的东西
    //重新渲染  = 重新设置root  + 重新append?
    // get root() {
    //     console.log('root was get ed--:', this._root)
    //     // console.log('this---:', this)
    //     if (!this._root) {
    //         console.log('render in this--:', this.render())
    //         //this.render是一个继承了Bue.createJsxComp的被实例化了的类,且有render方法,
    //         //render方法调用,实际上是调用createElement方法,
    //         //然后再访问其root属性,root属性为一个真实d的dom node

    //         //render方法又会调用ElementWrapper方法,该class在constructor阶段会生成root属性,
    //         // 所以此处可以访问到root属性
    //         this._root = this.render().root
    //     }
    //     return this._root
    // }
    setState(newState) {
        if (this.state === null || typeof this.state !== "object") {
            this.state = newState;
            this.rerender();
            return;
        }

        merge(this.state, newState);
        console.log('will re render')
        this.rerender();
    }
    rerender() {
        let oldRange = this._range;
        let range = document.createRange();
        range.setStart(oldRange.startContainer, oldRange.startOffset);
        range.setEnd(oldRange.startContainer, oldRange.startOffset);
        this[RENDER_TO_DOM](range);

        oldRange.setStart(range.endContainer, range.endOffset)
        oldRange.deleteContents();
    }
    [RENDER_TO_DOM](range) {
        this._range = range;
        this.render()[RENDER_TO_DOM](range);
    }
}

window.Bue = Bue;

Bue.jsxComponent =

    Bue.createElement = createElement


function createElement(type, attributes, ...children) {
    console.log('type-:', type, typeof (type), children.length)
    let e
    //原声html名字都会触发string
    if (typeof type === 'string') {
        e = new ElementWrapper(type)
    } else {
        //type is one class
        e = new type()
    }
    if (attributes) {

        for (let key in attributes) {
            let value = attributes[key]
            e.setAttribute(key, value)
        }
    }
    if (children) {
        for (let child of children) {
            insertChildren(child, e)
        }
    }
    return e
}

// function render(component, mountEle) {
//     console.log('component root--:', component, component.root)

//     mountEle.appendChild(component.root);
// }

Bue.render = function (component, parentElement) {
    let range = document.createRange();
    range.setStart(parentElement, 1);
    range.setEnd(parentElement, parentElement.childNodes.length);
    range.deleteContents();
    component[RENDER_TO_DOM](range);
}
