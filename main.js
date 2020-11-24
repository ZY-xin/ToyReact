

import './toy-react.js'

class MyComponent extends Bue.jsxComp {
  constructor() {
    super()
    this.state = {
      foo: 1234567
    }
  }
  changeValueOfFoo() {
    this.setState({
      foo: "foo:" + Math.random()
    })
  }
  render() {
    return <div title="test title" class="bx-test abc"
      style="border:solid 1px red;">
      <button onClick={this.changeValueOfFoo.bind(this)}>change state</button>
      <div style="background:rgba(0,0,0,0.5)">{this.state.foo}</div>
      {this.children}</div>




    /**
     * the jsx above is same as:
     * 
     * return Bue.createElement(

          //tag name
          "div",
          //props
          {
            title: "test title",
            "class": "bx-test abc",
            style: "border:solid 1px red;"
          },
          //self children
          Bue.createElement(
            "div",
            {
              style: "background:rgba(255,255,255,0.5)"

            },
            //it is a child,but it's textNode child,value from state
            this.state.foo),

          //children in render method first arg
          this.children

        );
     */


  }
}



window.addEventListener('load', () => {
  Bue.render(<MyComponent>
    i am pure text
        <div title="a">a</div>
    {/* <div title="b">b</div> */}
  </MyComponent>, document.body)
})
