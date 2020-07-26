// react = 组件化 + jsx + vDom


import { toyReact, Component } from "./lib/core.js";
const createElement = toyReact.createElement

class MyComponent extends Component {
  render() {
    return (
      <div>
        <span>hello ccc1l !!!</span>
        <span>{true}</span>
        <span>{this.children}</span>
      </div>
    );
  }
}

let a = (
  <MyComponent name="a" id="ida">
    <div>123</div>
  </MyComponent>
);

toyReact.render(
    a,
    document.body
)
