

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content)
    }
}


class ElementWrapper {
    constructor(tagName) {
        this.root = document.createElement(tagName)
    }

    setAttribute(name, value) {
        this.root.setAttribute(name, value)
    }
    appendChild(child) {
        if (child.root) {
            this.root.appendChild(child.root)
        }
    }
}



function insertChild(child, parent) {
    console.log('childdddddddddddddd---:', child)
    if (
        typeof child == 'object' &&
        child instanceof Array
    ) {
        for (let c of child) {
            insertChild(c, parent)
        }
    }
    if (typeof child === 'string') {
        child = new TextWrapper(child)
    }
    parent.appendChild(child)
}


let Bue = function () {

}
Bue.jsxComp = class {
    constructor() {
        this._root = null
        this.props = Object.create(null)
        this.children = []
    }
    setAttribute(name, value) {
        this.props[name] = value    // props还未实现
    }
    appendChild(child) {    // component 添加 
        this.children.push(child)
    }
    get root() {
        console.log('root was get ed--:', this._root)
        // console.log('this---:', this)
        if (!this._root) {
            console.log('render in this--:', this.render())
            //this.render是一个继承了Bue.createJsxComp的被实例化了的类,且有render方法,
            //render方法调用,实际上是调用createElement方法,
            //然后再访问其root属性,root属性为一个真实d的dom node

            //render方法又会调用ElementWrapper方法,该class在constructor阶段会生成root属性,所以此处可以访问到root属性
            this._root = this.render().root
        }
        return this._root
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
            insertChild(child, e)
        }
    }
    return e
}

// function render(component, mountEle) {
//     console.log('component root--:', component, component.root)

//     mountEle.appendChild(component.root);
// }

Bue.render = (component, mountEle) => {

    console.log('component.root---:', component.root)
    mountEle.appendChild(component.root);
}
