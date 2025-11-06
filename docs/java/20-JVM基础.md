# 🖥️ JVM 基础

## JVM 概述

JVM（Java Virtual Machine）是 Java 虚拟机，负责执行 Java 字节码。

## JVM 内存区域

### 堆（Heap）

- 存储对象实例
- 被所有线程共享
- 由垃圾回收器管理

### 方法区（Method Area）

- 存储类信息、常量、静态变量
- 被所有线程共享

### 虚拟机栈（VM Stack）

- 存储局部变量、方法参数
- 每个线程独有

### 本地方法栈（Native Method Stack）

- 存储本地方法调用
- 每个线程独有

### 程序计数器（PC Register）

- 记录当前执行指令地址
- 每个线程独有

## 垃圾回收

### 垃圾回收机制

- **标记-清除**：标记垃圾对象，然后清除
- **标记-复制**：将存活对象复制到新区域
- **标记-整理**：标记后整理内存

### 垃圾回收器

- **Serial GC**：单线程回收器
- **Parallel GC**：并行回收器
- **CMS GC**：并发标记清除
- **G1 GC**：分代回收器

## JVM 参数

### 常用 JVM 参数

```bash
# 堆内存设置
-Xms512m  # 初始堆大小
-Xmx1024m # 最大堆大小

# 方法区设置
-XX:PermSize=256m  # 永久代大小（Java 8 之前）
-XX:MaxPermSize=512m

# 垃圾回收器
-XX:+UseG1GC  # 使用 G1 回收器
```

## 下一步

掌握了 JVM 基础后，可以继续学习：

- [Java 8+ 新特性](/java/21-Java8+新特性.md) - 学习 Java 新特性
- [JVM 深入与性能调优](/java/29-JVM深入与性能调优.md) - 深入学习 JVM

---

<div style="text-align: center; margin-top: 2rem;">
  <p>💡 <strong>提示</strong>：理解 JVM 原理有助于编写高性能的 Java 程序</p>
</div>
