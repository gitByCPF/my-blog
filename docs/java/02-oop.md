# Java 面向对象编程（OOP）详解

> **关键词**：类（Class）、对象（Object）、封装（Encapsulation）、继承（Inheritance）、多态（Polymorphism）、抽象（Abstraction）

---

## 一、什么是面向对象编程（OOP）

**面向对象编程（Object-Oriented Programming, OOP）** 是一种以对象为中心的编程思想。  
在 Java 中，**一切皆对象**。程序通过创建、使用对象来完成任务，而对象由类（Class）定义。

> 🧠 简单理解：
> - 过程式编程：关注“怎么做”（步骤和过程）
> - 面向对象编程：关注“谁来做”（对象和职责）

---

## 二、OOP 的四大核心特性

Java 的 OOP 思想主要体现在四个特性上：

1. **封装（Encapsulation）**
2. **继承（Inheritance）**
3. **多态（Polymorphism）**
4. **抽象（Abstraction）

我们逐一来看。

---

### 1. 封装（Encapsulation）

**概念：**
封装是将对象的属性（变量）和行为（方法）绑定在一起，并对外隐藏内部实现细节，仅暴露必要的接口。

**目的：**
- 隐藏内部实现
- 提高安全性
- 降低代码耦合度

**示例：**
```java
public class Person {
    // 私有属性（封装）
    private String name;
    private int age;

    // 提供公共访问方法（getter/setter）
    public String getName() {
        return name;
    }

    public void setName(String name) {
        // 可在此增加校验逻辑
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        if (age >= 0) {
            this.age = age;
        }
    }
}
```

> 💡 封装让你可以控制属性访问方式，同时避免外部随意修改对象状态。

---

### 2. 继承（Inheritance）

**概念：**
继承是从已有类（父类/基类）中派生出新类（子类/派生类）的机制。  
子类会自动拥有父类的属性和方法，也可以对其进行**扩展**或**重写（override）**。

**语法：**
```java
class 子类 extends 父类
```

**示例：**
```java
public class Animal {
    public void eat() {
        System.out.println("动物在吃东西");
    }
}

public class Dog extends Animal {
    public void bark() {
        System.out.println("狗在汪汪叫");
    }
}

// 测试
public class Test {
    public static void main(String[] args) {
        Dog dog = new Dog();
        dog.eat();  // 继承自 Animal
        dog.bark(); // 自己定义的方法
    }
}
```

> ⚙️ 继承的优点：代码复用、结构清晰  
> ⚠️ 缺点：滥用继承会造成代码复杂性上升，可用“组合”代替继承。

---

### 3. 多态（Polymorphism）

**概念：**
多态表示“同一操作作用于不同对象时，会产生不同的行为”。

**实现条件：**
1. 存在继承关系  
2. 子类重写父类方法  
3. 父类引用指向子类对象

**示例：**
```java
class Animal {
    public void sound() {
        System.out.println("动物发出声音");
    }
}

class Dog extends Animal {
    @Override
    public void sound() {
        System.out.println("汪汪汪");
    }
}

class Cat extends Animal {
    @Override
    public void sound() {
        System.out.println("喵喵喵");
    }
}

public class Test {
    public static void main(String[] args) {
        Animal a1 = new Dog();
        Animal a2 = new Cat();

        a1.sound(); // 输出：汪汪汪
        a2.sound(); // 输出：喵喵喵
    }
}
```

> 💡 多态让程序具有更强的扩展性和灵活性，比如工厂模式、策略模式等都依赖多态思想。

---

### 4. 抽象（Abstraction）

**概念：**
抽象是对现实世界中对象的本质特征建模，忽略非本质细节。  
在 Java 中，抽象通过 **抽象类** 和 **接口（interface）** 实现。

#### 抽象类：
```java
public abstract class Shape {
    // 抽象方法：没有方法体，子类必须实现
    public abstract void draw();
}

public class Circle extends Shape {
    @Override
    public void draw() {
        System.out.println("画一个圆形");
    }
}
```

#### 接口：
```java
public interface Flyable {
    void fly(); // 默认是 public abstract
}

public class Bird implements Flyable {
    @Override
    public void fly() {
        System.out.println("鸟在飞");
    }
}
```

> ✅ 抽象类：用于描述“是什么”  
> ✅ 接口：用于描述“能做什么”

---

## 三、类与对象的关系

| 概念 | 含义 | 类比 |
|------|------|------|
| 类（Class） | 模板、设计图 | 蓝图 |
| 对象（Object） | 类的实例 | 房子（根据蓝图建造） |

**示例：**
```java
public class Car {
    String color;
    int speed;

    void drive() {
        System.out.println("汽车在行驶");
    }
}

public class TestCar {
    public static void main(String[] args) {
        Car car = new Car();  // 创建对象
        car.color = "红色";
        car.speed = 120;

        car.drive();
    }
}
```

---

## 四、this 与 super 关键字

| 关键字 | 含义 | 使用场景 |
|--------|------|----------|
| `this` | 引用当前对象 | 区分成员变量与局部变量、调用当前类构造器 |
| `super` | 引用父类对象 | 调用父类构造器或父类方法 |

**示例：**
```java
class Animal {
    Animal() {
        System.out.println("Animal 构造器");
    }
}

class Dog extends Animal {
    Dog() {
        super(); // 调用父类构造器
        System.out.println("Dog 构造器");
    }
}
```

---

## 五、构造方法（Constructor）

构造方法是创建对象时自动调用的，用于初始化对象。

**特点：**
- 方法名与类名相同
- 没有返回类型
- 可重载（多个不同参数的构造器）

**示例：**
```java
public class Person {
    String name;
    int age;

    // 无参构造
    public Person() {
        this("未知", 0);
    }

    // 有参构造
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
```

---

## 六、static 与 final

| 关键字 | 用途 | 特点 |
|--------|------|------|
| `static` | 表示“类级别”成员 | 所有对象共享 |
| `final` | 表示“不可改变” | 修饰变量、方法、类 |

**示例：**
```java
public class Demo {
    static int count = 0;
    final double PI = 3.14159;

    public static void main(String[] args) {
        System.out.println(Demo.count); // 通过类名访问
    }
}
```

---

## 七、面向对象设计思想总结

| 思想 | 说明 | 示例 |
|------|------|------|
| 封装 | 隐藏内部实现 | 私有属性 + Getter/Setter |
| 继承 | 复用已有代码 | extends |
| 多态 | 统一接口，不同行为 | 父类引用指向子类对象 |
| 抽象 | 抽取共性特征 | 抽象类 / 接口 |

> 🧩 **口诀：**
> > 封装隐藏细节，继承复用结构，多态提升灵活，抽象抽取共性。

---

## 八、OOP 实战示例：宠物管理系统

```java
abstract class Pet {
    String name;
    int age;
    public abstract void play();
}

class Dog extends Pet {
    @Override
    public void play() {
        System.out.println(name + " 正在玩飞盘！");
    }
}

class Cat extends Pet {
    @Override
    public void play() {
        System.out.println(name + " 正在追毛线球！");
    }
}

public class PetManager {
    public static void main(String[] args) {
        Pet dog = new Dog();
        dog.name = "旺财";
        dog.play();

        Pet cat = new Cat();
        cat.name = "咪咪";
        cat.play();
    }
}
```

---

## 九、总结

- Java 是一种 **完全面向对象** 的语言（除了基本类型）。
- OOP 的核心在于“**抽象与建模**”。
- 掌握 OOP 思想后，你能：
  - 写出更易维护、扩展的代码；
  - 理解设计模式；
  - 构建高质量的面向对象系统。

> 🚀 **下一步建议：**
> 学习 OOP 的延伸——**设计模式（Design Patterns）**，比如单例模式、工厂模式、策略模式等。

---
