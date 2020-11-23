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

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content)
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
        console.log('this---:', this)
        if (!this._root) {
            console.log('render in this--:', this.render())
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

Bue.renderJsx = (component, mountEle) => mountEle.appendChild(component.root);;
