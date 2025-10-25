# 🐍 Python 基础入门

## 什么是 Python？

Python 是一种高级、解释型、通用的编程语言。它由 Guido van Rossum 于 1991 年首次发布，以其简洁的语法和强大的功能而闻名。

### Python 的特点

- **简洁易读**：Python 的语法非常接近自然语言，代码可读性极强
- **跨平台**：可以在 Windows、macOS、Linux 等操作系统上运行
- **丰富的库**：拥有庞大的标准库和第三方库生态系统
- **开源免费**：完全免费，社区活跃
- **多范式**：支持面向对象、函数式、过程式编程

## 为什么选择 Python？

### 🎯 应用领域

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1rem 0;">

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem; border-radius: 8px;">
  <h4>🌐 Web 开发</h4>
  <p>Django、Flask、FastAPI 等框架</p>
</div>

<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1rem; border-radius: 8px;">
  <h4>📊 数据科学</h4>
  <p>Pandas、NumPy、Matplotlib</p>
</div>

<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 1rem; border-radius: 8px;">
  <h4>🤖 人工智能</h4>
  <p>TensorFlow、PyTorch、Scikit-learn</p>
</div>

<div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 1rem; border-radius: 8px;">
  <h4>🔧 自动化脚本</h4>
  <p>系统管理、文件处理</p>
</div>

</div>

## 安装 Python

### Windows 系统

1. 访问 [Python 官网](https://www.python.org/downloads/)
2. 下载最新版本的 Python
3. 运行安装程序，**记得勾选 "Add Python to PATH"**
4. 验证安装：打开命令提示符，输入 `python --version`

### macOS 系统

```bash
# 使用 Homebrew 安装
brew install python

# 或者从官网下载安装包
```

### Linux 系统

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip

# CentOS/RHEL
sudo yum install python3 python3-pip
```

## 第一个 Python 程序

让我们编写经典的 "Hello, World!" 程序：

```python
# hello.py
print("Hello, World!")
print("欢迎来到 Python 世界！")
```

运行程序：

```bash
python hello.py
```

输出：
```
Hello, World!
欢迎来到 Python 世界！
```

## Python 基础语法

### 注释

```python
# 这是单行注释

"""
这是多行注释
可以写多行内容
"""

'''
这也是多行注释
使用单引号
'''
```

### 变量和赋值

```python
# Python 是动态类型语言，不需要声明变量类型
name = "张三"           # 字符串
age = 25               # 整数
height = 175.5         # 浮点数
is_student = True      # 布尔值

# 多重赋值
x, y, z = 1, 2, 3

# 链式赋值
a = b = c = 0
```

### 命名规范

- **变量名**：使用小写字母和下划线，如 `user_name`
- **常量**：使用大写字母和下划线，如 `MAX_SIZE`
- **函数名**：使用小写字母和下划线，如 `get_user_info`
- **类名**：使用驼峰命名法，如 `UserManager`

## Python 解释器

### 交互式模式

```bash
python
```

进入交互式模式后，可以直接输入代码并立即看到结果：

```python
>>> 2 + 3
5
>>> print("Hello")
Hello
>>> exit()  # 退出
```

### 脚本模式

将代码保存为 `.py` 文件，然后运行：

```bash
python script.py
```

## 学习路径

<div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">

### 📚 推荐学习顺序

1. **基础语法** → [数据类型详解](/python/02-数据类型.md)
2. **控制流程** → [控制流程](/python/03-控制流程.md)
3. **函数模块** → [函数与模块](/python/04-函数与模块.md)
4. **面向对象** → [面向对象编程](/python/05-面向对象.md)
5. **异常处理** → [异常处理](/python/06-异常处理.md)
6. **文件操作** → [文件操作](/python/07-文件操作.md)
7. **实践项目** → [实践项目](/python/08-实践项目.md)

</div>

## 常用开发工具

### IDE 推荐

- **PyCharm**：功能强大的专业 IDE
- **VS Code**：轻量级，插件丰富
- **Jupyter Notebook**：适合数据科学和教学
- **Sublime Text**：轻量级文本编辑器

### 在线环境

- **Repl.it**：在线 Python 环境
- **Google Colab**：免费的 Jupyter 环境
- **Python.org**：官方在线解释器

## 下一步

现在你已经了解了 Python 的基础知识，接下来我们将深入学习：

- [数据类型详解](/python/02-数据类型.md) - 了解 Python 中的各种数据类型
- [控制流程](/python/03-控制流程.md) - 学习条件语句和循环

---

<div style="text-align: center; margin-top: 2rem;">
  <p>💡 <strong>学习提示</strong>：多动手实践，尝试修改示例代码，观察结果变化</p>
</div>