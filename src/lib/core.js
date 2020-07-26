// 通过2种wrapper，让原生dom和自定义的component的2种行为表现的一致
class ElementWrapper {
  // 避免写if else 判断，写wrapper，对type进行封装
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(vChild) {
    // 虚拟的vChild
    vChild.mountTo(this.root);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

export class Component {
  constructor() {
    this.children = []
  }
  setAttribute(name, value) {
    this[name] = value;
  }
  mountTo(parent) {
    let vDom = this.render();
    vDom.mountTo(parent);
  }
  appendChild(vChild) {
    this.children.push(vChild);
  }
}

export const toyReact = {
  createElement: function (type, attributes, ...children) {
    // createElement中使用element的method需要wrapper实现对应的method
    let element;
    if (typeof type === "string") {
      // 原生dom的包装
      element = new ElementWrapper(type);
    } else {
      // 自定义的component
      element = new type;
    }
    for (let name in attributes) {
      // element[name] = attributes[name] wrong
      element.setAttribute(name, attributes[name]);
    }
    let insertChildren = (children) => {
      for (let child of children) {
        if (typeof child === "object" && child instanceof Array) {
          insertChildren(child);
        } else {
          if (
            !(child instanceof Component) &&
            !(child instanceof ElementWrapper) &&
            !(child instanceof TextWrapper)
          ) {
            // 白名单机制
            child = String(child);
          }
          if (typeof child === "string") {
            child = new TextWrapper(child);
          }
          element.appendChild(child);
        }
      }
    };
    insertChildren(children)

    return element;
  },
  render(vDom, element) {
    vDom.mountTo(element);
  },
};
