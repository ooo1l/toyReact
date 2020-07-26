// 通过2种wrapper，让原生dom和自定义的component的2种行为表现的一致
class ElementWrapper {
  // 避免写if else 判断，写wrapper，对type进行封装
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      // click事件处理
      let eventName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLowerCase())
      this.root.addEventListener(eventName, value);
    }
    if (name === 'className') {
      name = 'class'
    }
    this.root.setAttribute(name, value);
  }
  appendChild(vChild) {
    // 虚拟的vChild
    let range = document.createRange();
    if (this.root.children.length) {
      range.setStartAfter(this.root.lastChild);
      range.setEndAfter(this.root.lastChild);
    } else {
      range.setStart(this.root, 0);
      range.setEnd(this.root, 0);
    }
    vChild.mountTo(range);
  }
  mountTo(range) {
    // 原生dom的mountTo
    range.deleteContents()
    range.insertNode(this.root);
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
  mountTo(range) {
    // 文本的mountTo
    range.deleteContents();
    range.insertNode(this.root);
  }
}

export class Component {
  constructor() {
    this.children = []
    this.props = Object.create(null)
  }
  setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      // 组件的自定义事件
      console.log(RegExp.$1)
    }
    this.props[name] = value
    this[name] = value;
  }
  mountTo(range) {
    console.log('willMount')
    this.range = range
    this.update()
    console.log("didMount");
  }
  update() {
    console.log('willUpdate')
    let placeholder = document.createComment('placeholder')
    let range = document.createRange()
    range.setStart(this.range.endContainer, this.range.endOffset)
    range.setEnd(this.range.endContainer, this.range.endOffset)
    range.insertNode(placeholder)

    this.range.deleteContents() 
    
    let vDom = this.render();
    vDom.mountTo(this.range);

    console.log("didUpdate");
    // placeholder.parentNode.removeChild(placeholder)
  }
  appendChild(vChild) {
    this.children.push(vChild);
  }
  setState (state) {
    // 类似与assign或者merge的操作
    let merge = (oldState, newState) => {
      for(let p in newState) {
        if(typeof newState[p] === 'object') {
          if(typeof oldState[p] !== 'object') {
            oldState[p] = {}
          }
          merge(oldState[p], newState[p])
        } else {
          oldState[p] = newState[p]
        }
      }
    }
    if(!this.state && state) {
      this.state = {}
    }
    merge(this.state, state)
    
    this.update()
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
      // 自定义的Component
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
    let range = document.createRange()
    if (element.children.length) {
      range.setStartAfter(element.lastChild)
      range.setEndAfter(element.lastChild);
    } else {
      range.setStart(element, 0)
      range.setEnd(element, 0)
    }
    vDom.mountTo(range);
  },
};
