# ☕ Java 概述

## 什么是 Java？

Java 是由 Sun Microsystems（现已被 Oracle 收购）于 1995 年发布的一种高级编程语言。它是一种面向对象的、跨平台的编程语言，具有"一次编写，到处运行"（Write Once, Run Anywhere）的特性。

## Java 的特点

### 🔑 核心特性

- **面向对象**：完全面向对象的编程语言，支持封装、继承、多态
- **跨平台性**：通过 JVM（Java 虚拟机）实现跨平台运行
- **简单易学**：语法相对简洁，去除了 C++ 中复杂的指针和多重继承
- **安全性**：内置安全管理机制，防止恶意代码执行
- **健壮性**：强类型检查、异常处理、垃圾回收机制
- **多线程**：内置多线程支持，便于开发并发程序
- **分布式**：支持网络编程，易于构建分布式应用
- **解释执行**：通过 JVM 解释执行，同时支持即时编译（JIT）

### 🎯 应用领域

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1rem 0;">

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem; border-radius: 8px;">
  <h4>🌐 Web 开发</h4>
  <p>Spring、Spring Boot、JSP/Servlet</p>
</div>

<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 1rem; border-radius: 8px;">
  <h4>📱 移动开发</h4>
  <p>Android 应用开发</p>
</div>

<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 1rem; border-radius: 8px;">
  <h4>🏢 企业应用</h4>
  <p>企业级应用、微服务架构</p>
</div>

<div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 1rem; border-radius: 8px;">
  <h4>💾 大数据</h4>
  <p>Hadoop、Spark、HBase</p>
</div>

<div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 1rem; border-radius: 8px;">
  <h4>🎮 游戏开发</h4>
  <p>Minecraft、LibGDX 游戏引擎</p>
</div>

<div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); color: white; padding: 1rem; border-radius: 8px;">
  <h4>🔧 工具开发</h4>
  <p>IDE、构建工具、测试框架</p>
</div>

</div>

## Java 版本历史

### 主要版本

- **Java 1.0** (1996) - 首个公开发行版本
- **Java 1.2** (1998) - 引入 Swing GUI 框架
- **Java 5** (2004) - 泛型、枚举、注解、自动装箱/拆箱
- **Java 8** (2014) - Lambda 表达式、Stream API、新的日期时间 API
- **Java 11** (2018) - LTS 版本，移除部分模块
- **Java 17** (2021) - 最新 LTS 版本，密封类、模式匹配等新特性
- **Java 21** (2023) - 最新 LTS 版本，虚拟线程、结构化并发等

### LTS 版本说明

LTS（Long Term Support）长期支持版本，Oracle 提供至少 3 年的免费支持和更新。目前主要的 LTS 版本：
- Java 8
- Java 11
- Java 17
- Java 21

## JVM、JRE、JDK 的关系

### 📦 核心组件

```
┌─────────────────────────────────────┐
│           JDK (开发工具包)            │
│  ┌───────────────────────────────┐ │
│  │      JRE (运行环境)            │ │
│  │  ┌─────────────────────────┐ │ │
│  │  │   JVM (Java 虚拟机)      │ │ │
│  │  └─────────────────────────┘ │ │
│  │  + 核心类库 (rt.jar)          │ │
│  └───────────────────────────────┘ │
│  + 编译器 (javac)                  │
│  + 调试工具 (jdb)                  │
│  + 其他开发工具                     │
└─────────────────────────────────────┘
```

### 组件说明

- **JVM (Java Virtual Machine)**：Java 虚拟机，负责执行 Java 字节码
- **JRE (Java Runtime Environment)**：Java 运行环境，包含 JVM 和核心类库
- **JDK (Java Development Kit)**：Java 开发工具包，包含 JRE 和开发工具

## 第一个 Java 程序

让我们编写经典的 "Hello, World!" 程序：

```java
// HelloWorld.java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("欢迎来到 Java 世界！");
    }
}
```

### 程序说明

1. **`public class HelloWorld`**：定义公共类，类名必须与文件名相同
2. **`public static void main(String[] args)`**：程序入口方法
   - `public`：公共访问权限
   - `static`：静态方法，无需创建对象即可调用
   - `void`：无返回值
   - `main`：方法名
   - `String[] args`：命令行参数数组
3. **`System.out.println()`**：输出语句，将内容打印到控制台

### 编译和运行

```bash
# 编译 Java 源文件
javac HelloWorld.java

# 运行编译后的字节码文件
java HelloWorld
```

输出：
```
Hello, World!
欢迎来到 Java 世界！
```

## Java 程序执行流程

```
.java 源文件
    ↓
javac 编译
    ↓
.class 字节码文件
    ↓
JVM 加载
    ↓
JVM 解释执行（或 JIT 编译）
    ↓
程序运行
```

## Java 平台版本

### Java SE (Standard Edition)
标准版，用于开发和部署桌面、服务器环境下的 Java 应用程序。

### Java EE (Enterprise Edition)
企业版，现已更名为 Jakarta EE，用于开发和部署企业级应用。

### Java ME (Micro Edition)
微型版，用于开发移动设备和嵌入式系统的应用。

## Java 开发工具

### IDE 推荐

- **IntelliJ IDEA**：功能强大的商业 IDE，社区版免费
- **Eclipse**：开源 IDE，插件丰富
- **NetBeans**：Oracle 官方 IDE
- **VS Code**：轻量级编辑器，配合 Java 扩展

### 构建工具

- **Maven**：项目管理和构建工具
- **Gradle**：现代化的构建工具
- **Ant**：传统的构建工具

## 学习路径

<div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">

### 📚 推荐学习顺序

1. **基础准备** → [开发环境搭建](/java/02-开发环境搭建.md)
2. **基础语法** → [基础语法](/java/03-基础语法.md)
3. **数据类型** → [数据类型与变量](/java/04-数据类型与变量.md)
4. **控制结构** → [控制流程](/java/06-控制流程.md)
5. **面向对象** → [类与对象](/java/07-类与对象.md)
6. **核心特性** → [数组与集合](/java/12-数组与集合.md)
7. **异常处理** → [异常处理](/java/13-异常处理.md)
8. **框架学习** → [Spring 框架](/java/25-Spring框架.md)

</div>

## Java 生态系统

### 常用框架和库

- **Spring Framework**：企业级应用开发框架
- **Spring Boot**：快速开发框架
- **Hibernate**：ORM 框架
- **MyBatis**：持久层框架
- **JUnit**：单元测试框架
- **Log4j/SLF4J**：日志框架
- **Jackson/Gson**：JSON 处理库

### 开发规范

- **Java 编码规范**：遵循阿里巴巴 Java 开发手册
- **代码风格**：使用统一的代码格式化工具
- **命名规范**：驼峰命名法、包名小写等

## 为什么选择 Java？

### ✅ 优势

- **市场需求大**：企业级应用开发的主流语言
- **生态完善**：丰富的第三方库和框架
- **社区活跃**：庞大的开发者社区
- **就业机会多**：Java 开发岗位需求量大
- **稳定性好**：经过多年发展，非常成熟稳定

### ⚠️ 注意事项

- **学习曲线**：面向对象概念需要时间理解
- **内存占用**：相比 C/C++ 内存占用较大
- **启动速度**：JVM 启动需要时间

## 下一步

现在你已经了解了 Java 的基础知识，接下来我们将深入学习：

- [开发环境搭建](/java/02-开发环境搭建.md) - 安装和配置 Java 开发环境
- [基础语法](/java/03-基础语法.md) - 学习 Java 的基本语法规则

---

<div style="text-align: center; margin-top: 2rem;">
  <p>💡 <strong>学习提示</strong>：Java 是一门实践性很强的语言，多动手编写代码，多思考面向对象的设计思想</p>
</div>
