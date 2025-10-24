# JavaScript DOM 操作

## 什么是 DOM

DOM（Document Object Model）是 HTML 文档的对象模型，JavaScript 可以通过 DOM API 来操作网页元素。

## 获取元素

### 通过 ID 获取
```javascript
const element = document.getElementById('myId');
```

### 通过类名获取
```javascript
const elements = document.getElementsByClassName('myClass');
```

### 通过标签名获取
```javascript
const elements = document.getElementsByTagName('div');
```

### 现代选择器方法
```javascript
// 获取单个元素
const element = document.querySelector('#myId');
const element = document.querySelector('.myClass');

// 获取多个元素
const elements = document.querySelectorAll('.myClass');
```

## 修改元素内容

### 修改文本内容
```javascript
element.textContent = "新的文本内容";
element.innerText = "新的文本内容";
element.innerHTML = "<strong>新的HTML内容</strong>";
```

### 修改属性
```javascript
element.setAttribute('class', 'newClass');
element.className = 'newClass';
element.id = 'newId';
```

## 创建和添加元素

### 创建新元素
```javascript
const newDiv = document.createElement('div');
newDiv.textContent = "新创建的div";
```

### 添加到页面
```javascript
// 添加到父元素的末尾
parentElement.appendChild(newDiv);

// 插入到指定位置
parentElement.insertBefore(newDiv, referenceElement);
```

## 事件处理

### 添加事件监听器
```javascript
element.addEventListener('click', function(event) {
    console.log('元素被点击了！');
});
```

### 移除事件监听器
```javascript
element.removeEventListener('click', handlerFunction);
```

## 样式操作

### 修改样式
```javascript
element.style.color = 'red';
element.style.fontSize = '16px';
element.style.backgroundColor = '#f0f0f0';
```

### 添加/移除 CSS 类
```javascript
element.classList.add('active');
element.classList.remove('inactive');
element.classList.toggle('visible');
```

## 实际示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>DOM 操作示例</title>
</head>
<body>
    <div id="container">
        <h1 id="title">原始标题</h1>
        <button id="changeBtn">改变标题</button>
    </div>

    <script>
        const title = document.getElementById('title');
        const button = document.getElementById('changeBtn');

        button.addEventListener('click', function() {
            title.textContent = '标题已被改变！';
            title.style.color = 'blue';
        });
    </script>
</body>
</html>
```

## 总结

DOM 操作是 JavaScript 与网页交互的核心，掌握这些基本方法可以让你创建动态的网页应用。
