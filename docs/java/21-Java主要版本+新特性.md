# ✨ Java 8+ 新特性

## Java 版本路线图

Java 8、11、17、21 是重要的 LTS（Long Term Support）版本，每个版本都带来了重大更新：

- **Java 8** (2014) - 函数式编程、Stream API、Lambda 表达式
- **Java 11** (2018) - 模块化、HTTP Client、字符串增强
- **Java 17** (2021) - 密封类、模式匹配、文本块增强
- **Java 21** (2023) - 虚拟线程、结构化并发、记录模式

---

## 🎯 Java 8 新特性

Java 8 是 Java 历史上最重要的版本之一，引入了函数式编程特性。

### Lambda 表达式

#### 基本语法

```java
// 传统匿名内部类
Runnable r1 = new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello");
    }
};

// Lambda 表达式
Runnable r2 = () -> System.out.println("Hello");

// 带参数的 Lambda
Comparator<String> c1 = new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.length() - b.length();
    }
};

// Lambda 简化
Comparator<String> c2 = (a, b) -> a.length() - b.length();

// 方法引用
Comparator<String> c3 = Comparator.comparing(String::length);
```

#### Lambda 表达式语法规则

```java
// 语法：(参数列表) -> 表达式或代码块

// 无参数
() -> System.out.println("Hello");

// 单个参数（可省略括号）
x -> x * 2

// 多个参数
(x, y) -> x + y

// 带类型声明
(int x, int y) -> x + y

// 代码块
(x, y) -> {
    int sum = x + y;
    return sum;
}
```

### 函数式接口

#### 内置函数式接口

```java
// Predicate<T> - 断言
Predicate<String> isLong = s -> s.length() > 5;
boolean result = isLong.test("Hello World");  // true

// Function<T, R> - 函数
Function<String, Integer> length = String::length;
int len = length.apply("Hello");  // 5

// Consumer<T> - 消费者
Consumer<String> printer = System.out::println;
printer.accept("Hello");  // 输出: Hello

// Supplier<T> - 供应者
Supplier<String> supplier = () -> "Hello";
String value = supplier.get();

// BiFunction<T, U, R> - 二元函数
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
int sum = add.apply(5, 3);  // 8

// UnaryOperator<T> - 一元操作符
UnaryOperator<String> upper = String::toUpperCase;
String result = upper.apply("hello");  // "HELLO"
```

#### 自定义函数式接口

```java
@FunctionalInterface
public interface Calculator {
    int calculate(int a, int b);
    
    // 可以有默认方法
    default int multiply(int a, int b) {
        return a * b;
    }
    
    // 可以有静态方法
    static int subtract(int a, int b) {
        return a - b;
    }
}

// 使用
Calculator add = (a, b) -> a + b;
int result = add.calculate(5, 3);  // 8
```

### Stream API

#### Stream 概述

Stream API 提供了一种声明式处理数据集合的方式，支持并行处理。

```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");

// 传统方式
List<String> filtered = new ArrayList<>();
for (String name : names) {
    if (name.length() > 3) {
        filtered.add(name.toUpperCase());
    }
}

// Stream 方式
List<String> filtered = names.stream()
    .filter(name -> name.length() > 3)
    .map(String::toUpperCase)
    .collect(Collectors.toList());
```

#### 中间操作（Intermediate Operations）

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// filter - 过滤
List<Integer> evens = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());  // [2, 4, 6, 8, 10]

// map - 映射
List<Integer> squares = numbers.stream()
    .map(n -> n * n)
    .collect(Collectors.toList());  // [1, 4, 9, 16, 25, ...]

// flatMap - 扁平化映射
List<String> words = Arrays.asList("Hello", "World");
List<String> letters = words.stream()
    .flatMap(word -> Arrays.stream(word.split("")))
    .collect(Collectors.toList());  // [H, e, l, l, o, W, o, r, l, d]

// distinct - 去重
List<Integer> unique = Arrays.asList(1, 2, 2, 3, 3, 3).stream()
    .distinct()
    .collect(Collectors.toList());  // [1, 2, 3]

// sorted - 排序
List<Integer> sorted = numbers.stream()
    .sorted(Comparator.reverseOrder())
    .collect(Collectors.toList());  // [10, 9, 8, ...]

// limit - 限制数量
List<Integer> firstThree = numbers.stream()
    .limit(3)
    .collect(Collectors.toList());  // [1, 2, 3]

// skip - 跳过元素
List<Integer> skipped = numbers.stream()
    .skip(5)
    .collect(Collectors.toList());  // [6, 7, 8, 9, 10]

// peek - 窥视（用于调试）
numbers.stream()
    .peek(n -> System.out.println("处理: " + n))
    .map(n -> n * 2)
    .collect(Collectors.toList());
```

#### 终端操作（Terminal Operations）

```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David");

// forEach - 遍历
names.stream().forEach(System.out::println);

// collect - 收集
List<String> list = names.stream().collect(Collectors.toList());
Set<String> set = names.stream().collect(Collectors.toSet());
Map<String, Integer> map = names.stream()
    .collect(Collectors.toMap(Function.identity(), String::length));

// reduce - 归约
int sum = numbers.stream()
    .reduce(0, Integer::sum);  // 55

Optional<Integer> max = numbers.stream()
    .reduce(Integer::max);

// count - 计数
long count = names.stream().count();  // 4

// anyMatch / allMatch / noneMatch - 匹配
boolean hasLong = names.stream().anyMatch(s -> s.length() > 5);  // true
boolean allLong = names.stream().allMatch(s -> s.length() > 5);   // false
boolean noneLong = names.stream().noneMatch(s -> s.length() > 10); // true

// findFirst / findAny - 查找
Optional<String> first = names.stream().findFirst();
Optional<String> any = names.stream().findAny();
```

#### 并行流

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// 并行流处理
long sum = numbers.parallelStream()
    .mapToInt(Integer::intValue)
    .sum();

// 注意：并行流不保证顺序
List<Integer> result = numbers.parallelStream()
    .map(n -> n * 2)
    .collect(Collectors.toList());
```

### 新日期时间 API

#### 旧 API 的问题

```java
// 旧 API 的问题
Date date = new Date();  // 可变，线程不安全
Calendar calendar = Calendar.getInstance();  // 复杂，易出错
```

#### LocalDate、LocalTime、LocalDateTime

```java
// LocalDate - 日期
LocalDate date = LocalDate.now();
LocalDate date2 = LocalDate.of(2024, 1, 1);
LocalDate date3 = LocalDate.parse("2024-01-01");

// 日期操作
LocalDate tomorrow = date.plusDays(1);
LocalDate nextWeek = date.plusWeeks(1);
LocalDate nextMonth = date.plusMonths(1);
LocalDate nextYear = date.plusYears(1);

LocalDate yesterday = date.minusDays(1);

// 获取日期信息
int year = date.getYear();
int month = date.getMonthValue();
int day = date.getDayOfMonth();
DayOfWeek dayOfWeek = date.getDayOfWeek();

// LocalTime - 时间
LocalTime time = LocalTime.now();
LocalTime time2 = LocalTime.of(12, 30, 45);
LocalTime time3 = LocalTime.parse("12:30:45");

// 时间操作
LocalTime nextHour = time.plusHours(1);
LocalTime nextMinute = time.plusMinutes(5);

// LocalDateTime - 日期时间
LocalDateTime dateTime = LocalDateTime.now();
LocalDateTime dateTime2 = LocalDateTime.of(2024, 1, 1, 12, 30);
LocalDateTime dateTime3 = LocalDateTime.parse("2024-01-01T12:30:45");

// 组合日期和时间
LocalDate date = LocalDate.of(2024, 1, 1);
LocalTime time = LocalTime.of(12, 30);
LocalDateTime dateTime = LocalDateTime.of(date, time);
```

#### Period 和 Duration

```java
// Period - 日期之间的间隔
LocalDate date1 = LocalDate.of(2024, 1, 1);
LocalDate date2 = LocalDate.of(2024, 12, 31);
Period period = Period.between(date1, date2);
System.out.println(period.getMonths());  // 11
System.out.println(period.getDays());    // 30

// Duration - 时间之间的间隔
LocalTime time1 = LocalTime.of(10, 0);
LocalTime time2 = LocalTime.of(12, 30);
Duration duration = Duration.between(time1, time2);
System.out.println(duration.toHours());   // 2
System.out.println(duration.toMinutes()); // 150
```

#### DateTimeFormatter

```java
// 格式化
LocalDateTime dateTime = LocalDateTime.now();
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
String formatted = dateTime.format(formatter);  // "2024-01-01 12:30:45"

// 预定义格式
String iso = dateTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

// 解析
LocalDateTime parsed = LocalDateTime.parse("2024-01-01 12:30:45", formatter);
```

### Optional

#### Optional 概述

Optional 用于处理可能为 null 的值，避免 NullPointerException。

```java
// 创建 Optional
Optional<String> optional = Optional.of("Hello");  // 非 null 值
Optional<String> empty = Optional.empty();        // 空值
Optional<String> nullable = Optional.ofNullable(getValue());  // 可能为 null

// 判断是否存在
if (optional.isPresent()) {
    System.out.println(optional.get());
}

// ifPresent - 如果存在则执行
optional.ifPresent(System.out::println);

// orElse - 如果为空返回默认值
String value = optional.orElse("默认值");

// orElseGet - 延迟计算默认值
String value = optional.orElseGet(() -> "延迟计算的默认值");

// orElseThrow - 如果为空抛出异常
String value = optional.orElseThrow(() -> new RuntimeException("值为空"));

// map - 映射
Optional<String> upper = optional.map(String::toUpperCase);

// flatMap - 扁平化映射
Optional<String> result = optional.flatMap(s -> Optional.of(s.toUpperCase()));

// filter - 过滤
Optional<String> filtered = optional.filter(s -> s.length() > 5);
```

### 方法引用

#### 方法引用类型

```java
// 1. 静态方法引用
Function<String, Integer> parseInt = Integer::parseInt;
int value = parseInt.apply("123");

// 2. 实例方法引用
String str = "Hello";
Function<Integer, Character> charAt = str::charAt;
char ch = charAt.apply(0);

// 3. 类实例方法引用
Function<String, String> toUpper = String::toUpperCase;
String upper = toUpper.apply("hello");

// 4. 构造方法引用
Supplier<List<String>> listSupplier = ArrayList::new;
List<String> list = listSupplier.get();

Function<Integer, List<String>> listWithSize = ArrayList::new;
List<String> list2 = listWithSize.apply(10);
```

### 接口默认方法和静态方法

```java
// 接口可以有默认方法实现
public interface Vehicle {
    void start();
    
    // 默认方法
    default void stop() {
        System.out.println("车辆停止");
    }
    
    // 静态方法
    static void honk() {
        System.out.println("鸣笛");
    }
}

// 实现接口
public class Car implements Vehicle {
    @Override
    public void start() {
        System.out.println("汽车启动");
    }
    
    // 可以选择性重写默认方法
    @Override
    public void stop() {
        System.out.println("汽车停止");
    }
}

// 使用
Car car = new Car();
car.start();
car.stop();
Vehicle.honk();  // 调用静态方法
```

### CompletableFuture

```java
// 异步执行
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    try {
        Thread.sleep(1000);
        return "结果";
    } catch (InterruptedException e) {
        throw new RuntimeException(e);
    }
});

// 处理结果
future.thenAccept(result -> System.out.println("结果: " + result));

// 组合多个 Future
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> "Hello");
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> "World");

CompletableFuture<String> combined = future1.thenCombine(future2, (a, b) -> a + " " + b);
combined.thenAccept(System.out::println);  // "Hello World"
```

---

## 🎯 Java 11 新特性

Java 11 是第二个 LTS 版本，带来了模块化支持和一些实用特性。

### HTTP Client（标准库）

```java
// Java 11 之前需要第三方库（如 Apache HttpClient）
// Java 11 内置 HTTP Client

HttpClient client = HttpClient.newHttpClient();

// GET 请求
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/data"))
    .GET()
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());

// POST 请求
String jsonBody = "{\"key\":\"value\"}";
HttpRequest postRequest = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/data"))
    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
    .header("Content-Type", "application/json")
    .build();

HttpResponse<String> postResponse = client.send(postRequest, HttpResponse.BodyHandlers.ofString());

// 异步请求
CompletableFuture<HttpResponse<String>> future = client.sendAsync(
    request,
    HttpResponse.BodyHandlers.ofString()
);
future.thenAccept(response -> System.out.println(response.body()));
```

### 字符串增强

#### isBlank()、lines()、strip()

```java
// isBlank() - 检查字符串是否为空或只包含空白字符
String str1 = "   ";
boolean blank1 = str1.isBlank();  // true
boolean blank2 = "".isBlank();    // true

// lines() - 按行分割字符串
String text = "第一行\n第二行\n第三行";
List<String> lines = text.lines().collect(Collectors.toList());
// ["第一行", "第二行", "第三行"]

// strip() - 去除首尾空白字符（比 trim() 更强大，支持 Unicode）
String str2 = "  Hello  ";
String stripped = str2.strip();  // "Hello"

// stripLeading() - 去除前导空白
String leading = str2.stripLeading();  // "Hello  "

// stripTrailing() - 去除尾随空白
String trailing = str2.stripTrailing();  // "  Hello"

// repeat() - 重复字符串
String repeated = "Hello".repeat(3);  // "HelloHelloHello"
```

### 文件操作增强

```java
// Files 类新增方法

// readString() - 读取文件内容为字符串
String content = Files.readString(Path.of("file.txt"));

// writeString() - 写入字符串到文件
Files.writeString(Path.of("file.txt"), "Hello World");

// 指定编码
String content = Files.readString(Path.of("file.txt"), StandardCharsets.UTF_8);
Files.writeString(Path.of("file.txt"), "Hello World", StandardCharsets.UTF_8);
```

### var 关键字（局部变量类型推断）

```java
// Java 10 引入，Java 11 继续支持
// 编译器可以推断变量类型

// 传统方式
String message = "Hello";
List<String> list = new ArrayList<>();
Map<String, Integer> map = new HashMap<>();

// 使用 var
var message = "Hello";  // 推断为 String
var list = new ArrayList<String>();  // 推断为 ArrayList<String>
var map = new HashMap<String, Integer>();  // 推断为 HashMap<String, Integer>

// var 的限制
// var 只能用于局部变量
// var 必须初始化
// var 不能用于方法参数和返回类型
// var 不能用于字段

// 示例：简化代码
var stream = Files.lines(Path.of("file.txt"));
var filtered = stream.filter(line -> line.length() > 10).collect(Collectors.toList());
```

### 模块系统增强

```java
// module-info.java 增强
module com.example.app {
    // 导出包
    exports com.example.app.core;
    
    // 需要其他模块
    requires java.base;
    requires java.sql;
    
    // 打开包（用于反射）
    opens com.example.app.internal;
    
    // 提供服务
    provides com.example.service.Service
        with com.example.service.ServiceImpl;
    
    // 使用服务
    uses com.example.service.Service;
}
```

### 其他改进

```java
// Optional 增强
Optional<String> optional = Optional.of("Hello");

// isEmpty() - Java 11
boolean empty = optional.isEmpty();  // 与 !isPresent() 等价

// Collection.toArray() 增强
List<String> list = Arrays.asList("a", "b", "c");
String[] array = list.toArray(String[]::new);  // 更简洁的方式
```

---

## 🎯 Java 17 新特性

Java 17 是第三个 LTS 版本，引入了一些重要的语言特性。

### 密封类（Sealed Classes）

#### 密封类概述

密封类限制哪些类可以继承它，提供了更精确的继承控制。

```java
// 定义密封类
public sealed class Shape
    permits Circle, Rectangle, Triangle {
    // 类定义
}

// 允许的子类
public final class Circle extends Shape {
    private final double radius;
    
    public Circle(double radius) {
        this.radius = radius;
    }
    
    public double area() {
        return Math.PI * radius * radius;
    }
}

public final class Rectangle extends Shape {
    private final double width;
    private final double height;
    
    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }
    
    public double area() {
        return width * height;
    }
}

public final class Triangle extends Shape {
    private final double base;
    private final double height;
    
    public Triangle(double base, double height) {
        this.base = base;
        this.height = height;
    }
    
    public double area() {
        return 0.5 * base * height;
    }
}

// 使用密封类
public double calculateArea(Shape shape) {
    // 编译器知道所有可能的子类
    return switch (shape) {
        case Circle c -> c.area();
        case Rectangle r -> r.area();
        case Triangle t -> t.area();
    };
}
```

#### 密封接口

```java
// 密封接口
public sealed interface Expression
    permits Constant, Variable, Addition {
    double evaluate();
}

public record Constant(double value) implements Expression {
    @Override
    public double evaluate() {
        return value;
    }
}

public record Variable(String name) implements Expression {
    @Override
    public double evaluate() {
        // 从上下文获取变量值
        return 0;
    }
}

public record Addition(Expression left, Expression right) implements Expression {
    @Override
    public double evaluate() {
        return left.evaluate() + right.evaluate();
    }
}
```

### 模式匹配（Pattern Matching）

#### instanceof 模式匹配

```java
// Java 16 之前
Object obj = "Hello";
if (obj instanceof String) {
    String str = (String) obj;  // 需要强制转换
    System.out.println(str.length());
}

// Java 16+ 模式匹配
Object obj = "Hello";
if (obj instanceof String str) {  // 自动转换和绑定
    System.out.println(str.length());
}

// switch 表达式增强
Object obj = 42;
String result = switch (obj) {
    case Integer i -> "整数: " + i;
    case String s -> "字符串: " + s;
    case null -> "null";
    default -> "未知类型";
};
```

#### switch 表达式增强

```java
// 传统 switch
int day = 3;
String dayName;
switch (day) {
    case 1: dayName = "星期一"; break;
    case 2: dayName = "星期二"; break;
    default: dayName = "其他";
}

// switch 表达式（Java 14+）
String dayName = switch (day) {
    case 1 -> "星期一";
    case 2 -> "星期二";
    case 3 -> "星期三";
    case 4 -> "星期四";
    case 5 -> "星期五";
    default -> "周末";
};

// 使用 yield（多行代码块）
String dayName = switch (day) {
    case 1, 2, 3, 4, 5 -> {
        yield "工作日";
    }
    case 6, 7 -> {
        yield "周末";
    }
    default -> {
        yield "无效";
    }
};

// 模式匹配 switch（Java 17+）
Object obj = 42;
String result = switch (obj) {
    case Integer i when i > 0 -> "正整数: " + i;
    case Integer i when i < 0 -> "负整数: " + i;
    case String s -> "字符串: " + s;
    case null -> "null";
    default -> "未知";
};
```

### 文本块（Text Blocks）

#### 文本块概述

文本块（Java 15 引入，Java 17 正式版）用于处理多行字符串。

```java
// 传统方式
String html = "<html>\n" +
              "  <body>\n" +
              "    <p>Hello World</p>\n" +
              "  </body>\n" +
              "</html>";

// 文本块方式
String html = """
    <html>
      <body>
        <p>Hello World</p>
      </body>
    </html>
    """;

// SQL 查询
String query = """
    SELECT id, name, email
    FROM users
    WHERE status = 'active'
    ORDER BY name
    """;

// JSON
String json = """
    {
      "name": "张三",
      "age": 25,
      "city": "北京"
    }
    """;
```

#### 文本块格式化

```java
// 文本块会自动处理缩进
String text = """
    第一行
    第二行
    第三行
    """;  // 最后一行不包含换行

// 使用 \s 保留尾随空格
String text = """
    第一行    \s
    第二行\s
    """;

// 转义字符
String text = """
    包含 "引号" 的文本
    包含 \\ 反斜杠的文本
    """;
```

### Records（记录类）

#### Records 概述

Records（Java 14 引入，Java 16 正式版）提供了一种简洁的方式定义不可变数据类。

```java
// 传统方式定义数据类
public class Person {
    private final String name;
    private final int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public String getName() {
        return name;
    }
    
    public int getAge() {
        return age;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Person person = (Person) o;
        return age == person.age && Objects.equals(name, person.name);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }
    
    @Override
    public String toString() {
        return "Person{name='" + name + "', age=" + age + "}";
    }
}

// 使用 Record 简化
public record Person(String name, int age) {
    // 自动生成：
    // - 构造函数
    // - getter 方法（注意：没有 get 前缀，直接 name(), age()）
    // - equals() 和 hashCode()
    // - toString()
}

// 使用
Person person = new Person("张三", 25);
System.out.println(person.name());  // "张三"
System.out.println(person.age());   // 25
System.out.println(person);         // Person[name=张三, age=25]
```

#### Records 自定义

```java
// 自定义构造函数
public record Person(String name, int age) {
    // 紧凑构造函数（用于验证）
    public Person {
        if (age < 0) {
            throw new IllegalArgumentException("年龄不能为负数");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("姓名不能为空");
        }
    }
    
    // 自定义方法
    public String displayName() {
        return name + " (" + age + " 岁)";
    }
    
    // 静态方法
    public static Person create(String name, int age) {
        return new Person(name, age);
    }
}

// Records 可以实现接口
public record Person(String name, int age) implements Comparable<Person> {
    @Override
    public int compareTo(Person other) {
        return name.compareTo(other.name);
    }
}
```

### 其他 Java 17 特性

```java
// 外部函数和内存 API（预览）
// 允许 Java 程序调用本地代码和管理堆外内存

// 向量 API（预览）
// 用于数值计算的 SIMD（单指令多数据）操作

// 强封装 JDK 内部 API
// 默认不允许访问 JDK 内部 API
```

---

## 🎯 Java 21 新特性

Java 21 是第四个 LTS 版本，引入了虚拟线程等重大特性。

### 虚拟线程（Virtual Threads）

#### 虚拟线程概述

虚拟线程是轻量级线程，由 JVM 管理，可以创建数百万个而不消耗大量系统资源。

```java
// 传统线程（平台线程）
Thread platformThread = new Thread(() -> {
    System.out.println("平台线程");
});
platformThread.start();

// 虚拟线程
Thread virtualThread = Thread.ofVirtual().start(() -> {
    System.out.println("虚拟线程");
});

// 使用 ExecutorService
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10000; i++) {
        executor.submit(() -> {
            try {
                Thread.sleep(1000);
                System.out.println("任务 " + Thread.currentThread().getName());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
    }
}
```

#### 虚拟线程的优势

```java
// 可以创建大量虚拟线程
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 1_000_000; i++) {
        int taskId = i;
        executor.submit(() -> {
            // 执行 I/O 操作
            // 虚拟线程在等待 I/O 时会释放平台线程
            String response = httpClient.get("https://api.example.com/data/" + taskId);
            processResponse(response);
        });
    }
}
// 可以轻松处理百万级并发请求
```

### 结构化并发（Structured Concurrency）

#### 结构化并发概述

结构化并发提供了一种更清晰的方式来管理并发任务的生命周期。

```java
// 使用 StructuredTaskScope（预览）
try (var scope = new StructuredTaskScope<String>()) {
    Future<String> task1 = scope.fork(() -> fetchData("url1"));
    Future<String> task2 = scope.fork(() -> fetchData("url2"));
    
    scope.join();  // 等待所有任务完成
    
    String result1 = task1.get();
    String result2 = task2.get();
    
    // 处理结果
    processResults(result1, result2);
}  // 如果任何任务失败或取消，自动取消其他任务
```

### 记录模式（Record Patterns）

#### 记录模式匹配

```java
// 定义 Record
public record Point(int x, int y) {}

public record Line(Point start, Point end) {}

// 使用记录模式
Object obj = new Point(10, 20);

// Java 17 之前
if (obj instanceof Point p) {
    int x = p.x();
    int y = p.y();
    System.out.println("点: (" + x + ", " + y + ")");
}

// Java 21 记录模式
if (obj instanceof Point(int x, int y)) {
    System.out.println("点: (" + x + ", " + y + ")");
}

// 嵌套记录模式
Object obj = new Line(new Point(0, 0), new Point(10, 10));
if (obj instanceof Line(Point(int x1, int y1), Point(int x2, int y2))) {
    System.out.println("线段: (" + x1 + ", " + y1 + ") -> (" + x2 + ", " + y2 + ")");
}

// switch 中的记录模式
String result = switch (obj) {
    case Point(int x, int y) when x > 0 && y > 0 -> "第一象限: (" + x + ", " + y + ")";
    case Point(int x, int y) when x < 0 && y > 0 -> "第二象限: (" + x + ", " + y + ")";
    case Point(int x, int y) when x < 0 && y < 0 -> "第三象限: (" + x + ", " + y + ")";
    case Point(int x, int y) when x > 0 && y < 0 -> "第四象限: (" + x + ", " + y + ")";
    case Point(int x, int y) -> "坐标轴: (" + x + ", " + y + ")";
    default -> "未知";
};
```

### switch 表达式增强

#### 完整的模式匹配

```java
// 支持所有类型的模式匹配
Object obj = new Point(10, 20);

String result = switch (obj) {
    // 记录模式
    case Point(int x, int y) when x > 0 && y > 0 -> "第一象限";
    
    // 类型模式
    case String s -> "字符串: " + s;
    case Integer i -> "整数: " + i;
    
    // 空值模式
    case null -> "null";
    
    // 默认
    default -> "未知";
};

// 枚举模式
enum Color { RED, GREEN, BLUE }

String result = switch (color) {
    case RED -> "红色";
    case GREEN -> "绿色";
    case BLUE -> "蓝色";
};
```

### 序列化集合（Sequenced Collections）

```java
// Java 21 引入了 SequencedCollection、SequencedSet、SequencedMap

// SequencedCollection - 有序集合
SequencedCollection<String> list = new ArrayList<>();
list.add("first");
list.add("last");

String first = list.getFirst();  // "first"
String last = list.getLast();    // "last"

list.addFirst("newFirst");
list.addLast("newLast");

// SequencedSet
SequencedSet<String> set = new LinkedHashSet<>();
set.add("a");
set.add("b");
set.add("c");

String first = set.getFirst();  // "a"
String last = set.getLast();    // "c"

// SequencedMap
SequencedMap<String, Integer> map = new LinkedHashMap<>();
map.put("first", 1);
map.put("last", 2);

Map.Entry<String, Integer> firstEntry = map.firstEntry();
Map.Entry<String, Integer> lastEntry = map.lastEntry();
```

### 字符串模板（String Templates，预览）

```java
// 字符串模板（预览特性）
String name = "张三";
int age = 25;

// 传统方式
String message = "姓名: " + name + ", 年龄: " + age;

// 字符串模板
String message = STR."姓名: \{name}, 年龄: \{age}";

// 多行模板
String html = STR."""
    <html>
      <body>
        <p>姓名: \{name}</p>
        <p>年龄: \{age}</p>
      </body>
    </html>
    """;

// 表达式支持
int a = 10;
int b = 20;
String result = STR."\{a} + \{b} = \{a + b}";  // "10 + 20 = 30"
```

### 其他 Java 21 特性

```java
// 未命名模式和变量（预览）
// 可以使用 _ 作为占位符

// 未命名变量
try {
    processData();
} catch (Exception _) {
    // 忽略异常，不需要变量名
    handleError();
}

// 未命名模式
if (obj instanceof Point(_, int y)) {
    // 只关心 y 坐标
    System.out.println("y: " + y);
}

// Scoped Values（预览）
// 提供线程本地变量的替代方案，更适合虚拟线程
```

---

## 版本对比总结

### Java 8 vs Java 11 vs Java 17 vs Java 21

| 特性 | Java 8 | Java 11 | Java 17 | Java 21 |
|------|--------|---------|---------|---------|
| **函数式编程** | ✅ Lambda、Stream | - | - | - |
| **日期时间 API** | ✅ 新 API | - | - | - |
| **HTTP Client** | ❌ | ✅ 标准库 | - | - |
| **var 关键字** | ❌ | ✅ | - | - |
| **文本块** | ❌ | ❌ | ✅ | - |
| **Records** | ❌ | ❌ | ✅ | - |
| **密封类** | ❌ | ❌ | ✅ | - |
| **模式匹配** | ❌ | ❌ | ✅ | ✅ 增强 |
| **虚拟线程** | ❌ | ❌ | ❌ | ✅ |

### 迁移建议

- **Java 8 → Java 11**：主要是模块化和 HTTP Client
- **Java 11 → Java 17**：Records、密封类、文本块
- **Java 17 → Java 21**：虚拟线程、结构化并发

---

## 最佳实践

### 1. Lambda 表达式使用

```java
// ✅ 好的做法：简洁清晰
list.stream()
    .filter(s -> s.length() > 5)
    .map(String::toUpperCase)
    .collect(Collectors.toList());

// ❌ 不好的做法：过度复杂
list.stream()
    .filter(s -> {
        if (s == null) return false;
        return s.length() > 5;
    })
    .map(s -> {
        return s.toUpperCase();
    })
    .collect(Collectors.toList());
```

### 2. Optional 使用

```java
// ✅ 好的做法：使用 Optional 避免 null
Optional<String> optional = getValue();
String result = optional.orElse("默认值");

// ❌ 不好的做法：直接返回 null
String value = getValue();
if (value == null) {
    value = "默认值";
}
```

### 3. 虚拟线程使用

```java
// ✅ 好的做法：I/O 密集型任务使用虚拟线程
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> {
        // I/O 操作
        String response = httpClient.get(url);
        processResponse(response);
    });
}

// ❌ 不好的做法：CPU 密集型任务使用虚拟线程
// CPU 密集型任务应该使用平台线程池
```

## 下一步

掌握了 Java 8+ 新特性后，可以继续学习：

- [反射机制](/java/22-反射机制.md) - 学习反射的使用
- [模块化与包管理](/java/23-模块化与包管理.md) - 学习模块化
- [JVM 深入与性能调优](/java/29-JVM深入与性能调优.md) - 深入学习 JVM

---

<div style="text-align: center; margin-top: 2rem;">
  <p>💡 <strong>提示</strong>：Java 8+ 新特性大大提高了开发效率，合理使用可以编写更简洁、更现代的代码。建议根据项目需求选择合适的 Java 版本</p>
</div>