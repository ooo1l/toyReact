// react = 组件化 + jsx + vDom
// react文档 https://zh-hans.reactjs.org/


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
