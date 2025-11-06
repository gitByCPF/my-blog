# 🖥️ JVM 基础

本章系统梳理 JVM 的关键组成、内存模型、类加载、即时编译（JIT）、垃圾回收（GC）、常用诊断工具与调优思路，帮助你从“会用”走向“会定位与优化”。

## 1. JVM 概述

JVM（Java Virtual Machine）是 Java 字节码（.class）的运行时载体。它提供：

- 字节码解释与即时编译执行
- 自动内存管理（GC）
- 平台无关的抽象
- 安全沙箱与类加载隔离

现代 HotSpot JVM 由“解释器 + C1/C2 JIT 编译器 + GC + 运行时服务”构成。JDK 11+ 默认使用 G1 GC，JDK 17+ 引入 ZGC、Shenandoah 作为低停顿选择。

## 2. 运行时数据区（内存结构）

> 不同 JDK 版本术语略有不同，以下以 HotSpot 为主线。

### 2.1 堆（Heap）

- 存放对象实例与数组，由所有线程共享。
- 典型划分：新生代（Eden、Survivor）与老年代（Tenured）。
- 绝大多数对象“朝生夕死”，新生代使用复制算法更高效。

### 2.2 元空间（Metaspace）与方法区

- JDK 8 起以本地内存实现 Metaspace（早期为永久代 PermGen）。
- 存放类元数据（类结构、常量池、方法元信息等）。
- 相关参数：`-XX:MetaspaceSize`、`-XX:MaxMetaspaceSize`。

### 2.3 线程私有区

- 虚拟机栈（VM Stack）：方法调用帧、局部变量表、操作数栈。
- 本地方法栈（Native Method Stack）：为本地方法服务。
- 程序计数器（PC）：记录当前线程字节码执行位置。

### 2.4 直接内存（Direct Memory）

- 由 `ByteBuffer.allocateDirect` 等使用，绕过堆，减少一次拷贝。
- 大量网络 IO/零拷贝场景常见，需关注泄漏与上限。

## 3. 类加载子系统

### 3.1 双亲委派模型

类加载遵循：启动类加载器 → 扩展类加载器 → 应用类加载器（自顶向下委派）。

- 优点：安全、避免重复加载与类冲突。
- 破坏双亲委派：自定义 `ClassLoader`，或模块化、框架隔离（OSGi、Tomcat）。

### 3.2 类加载过程

1. 加载（Loading）：读取字节码进内存，生成 `Class` 对象。
2. 验证（Verification）：文件格式/元数据/字节码语义校验。
3. 准备（Preparation）：为静态字段分配内存并设默认值。
4. 解析（Resolution）：符号引用转为直接引用。
5. 初始化（Initialization）：执行 `<clinit>` 静态初始化块。

### 3.3 常见问题

- 类重复加载、`LinkageError`、`ClassNotFoundException`、`NoClassDefFoundError`。
- Fat-JAR 与容器环境下的类路径/模块路径冲突。

## 4. 执行引擎与 JIT（C1/C2/Graal）

### 4.1 解释与编译

- 解释器启动快；JIT 将热点方法编译为本地代码，吞吐量高。
- C1（客户端编译器）偏向轻优化，C2（服务端编译器）更激进。
- Graal JIT（JDK 11+ 可选）具备更强的优化潜力。

### 4.2 逃逸分析与标量替换

- 若对象不逃逸出方法，可进行栈上分配（理论层面）、同步消除、标量替换。
- 相关参数：`-XX:+DoEscapeAnalysis`（默认开启）。

### 4.3 分层编译与编译阈值

- 分层编译（TieredCompilation）综合 C1+C2 优势，默认开启。
- 热点统计来自解释执行的计数器与采样，触发编译阈值后进入优化。

## 5. Java 内存模型（JMM）与并发基础

### 5.1 可见性、有序性、原子性

- 可见性：`volatile`、锁与 `final` 语义保障。
- 有序性：`happens-before` 规则约束重排序。
- 原子性：基本读写与 `Atomic*` 类借助 CAS 实现。

### 5.2 关键规则（简要）

- 程序次序规则、监视器锁规则、`volatile` 变量规则、传递性规则等。
- 发布与逃逸：构造未完成的对象引用被其他线程观察到会破坏可见性。

### 5.3 常见并发隐患

- 指令重排导致的懒汉单例失效（需 `volatile`）。
- 双重检查锁定（DCL）正确写法：

```java
public class Singleton {
    private static volatile Singleton INSTANCE;
    public static Singleton getInstance() {
        if (INSTANCE == null) {
            synchronized (Singleton.class) {
                if (INSTANCE == null) {
                    INSTANCE = new Singleton();
                }
            }
        }
        return INSTANCE;
    }
}
```

## 6. 垃圾回收（GC）算法与收集器

### 6.1 基础算法

- 标记-清除（Mark-Sweep）：产生碎片。
- 标记-复制（Mark-Copy）：新生代常用，吞吐好。
- 标记-整理（Mark-Compact）：老年代常用，减少碎片。

### 6.2 分代回收思想

- 新生代对象朝生夕死；老年代对象存活久。
- Minor GC（新生代）、Major/Full GC（包含老年代/全堆）。

### 6.3 典型收集器

- Serial/Parallel：吞吐优先。
- CMS（JDK 9 标记为废弃）：并发标记清除，降低停顿但有碎片。
- G1（JDK 9+ 默认）：Region 化，按预测停顿目标回收，混合收集。
- ZGC（JDK 15+ 生产可用）：超低停顿（~毫秒级），区域化、着色指针。
- Shenandoah（OpenJDK）：低停顿，Brooks pointer。

### 6.4 G1 关键概念

- Region：将堆切分为若干小块，便于按需回收。
- Remembered Set：记录跨区引用，支持独立回收。
- Mixed GC：同时回收部分老年代 + 新生代，满足停顿目标。

### 6.5 常见 GC 参数（示例）

```bash
# 堆与代大小
-Xms2g -Xmx2g
-XX:NewRatio=2               # 老年代:新生代 = 2:1（示例）
-XX:SurvivorRatio=8          # Eden:Survivor = 8:1:1

# 选择收集器
-XX:+UseG1GC                 # 使用 G1
# -XX:+UseZGC                # 使用 ZGC（JDK 15+）

# 停顿目标
-XX:MaxGCPauseMillis=200

# 元空间
-XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=1024m

# GC 日志（JDK 9+ 统一日志）
-Xlog:gc*:file=gc.log:tags,uptime,time,level
```

## 7. 常见内存与 GC 问题排查

### 7.1 OOM 类型

- `java.lang.OutOfMemoryError: Java heap space`
- `java.lang.OutOfMemoryError: GC overhead limit exceeded`
- `java.lang.OutOfMemoryError: Metaspace`
- `java.lang.OutOfMemoryError: Direct buffer memory`
- `java.lang.StackOverflowError`

### 7.2 分析思路

1. 收集证据：GC 日志、堆转储（heap dump）、线程栈、系统指标。
2. 工具辅助：`jcmd`、`jmap`、`jstack`、`jstat`、`jfr`（Flight Recorder）、VisualVM、MAT。
3. 确认增长对象/泄漏路径：弱引用/缓存未清、线程本地变量、ClassLoader 泄漏、直接内存释放不及时等。

### 7.3 常用命令

```bash
# 进程列表
jcmd

# 导出堆快照（可能触发 STW）
jcmd <pid> GC.heap_dump heap.hprof

# 概览 JVM 运行时与 GC 统计
jcmd <pid> GC.class_stats
jcmd <pid> GC.heap_info
jstat -gc <pid> 1000 10

# 线程快照
jstack <pid> > threads.txt
```

## 8. 对象分配与内存布局

### 8.1 TLAB（Thread Local Allocation Buffer）

- 每个线程在 Eden 预分配一段小缓存，减少分配时的竞争。
- 失败回退到共享分配或老年代。

### 8.2 对象头与压缩指针

- 对象头包含 Mark Word + Klass Pointer。
- `-XX:+UseCompressedOops`（默认开启）将 64 位指针压缩为 32 位，提高缓存命中。

### 8.3 锁优化

- 偏向锁、轻量级锁、重量级锁逐步升级。
- 偏向锁在 JDK 15 起默认移除，可通过参数控制旧版本行为。

## 9. 字符串与常量池

- String 为不可变对象，JDK 9 起底层由 `byte[]` + 编码标志实现（Compact Strings）。
- 运行时常量池存放符号引用与字面量；`String.intern()` 可将字符串放入全局池以复用。

## 10. 类数据共享（CDS）与 AOT

- CDS 通过预加载常用类到共享只读映像，加速启动、降低内存。
- AppCDS 支持应用类共享（JDK 10+ 更完善）。
- AOT（Ahead-of-Time）在某些发行版或 GraalVM Native Image 场景可用。

## 11. 生产调优套路（示例）

1. 澄清目标：吞吐优先 vs 延迟优先。
2. 选择收集器：G1（通用），ZGC/Shenandoah（低停顿），Parallel（吞吐）。
3. 设定初始堆与上限一致（避免扩缩容抖动）。
4. 观察 GC 日志与服务指标，确认是否由 GC 导致延迟。
5. 热路径优化：减少短命大对象、避免无界缓存、审查序列化与反序列化。
6. 工具定位：JFR 录制 + MAT 分析。

## 12. 实战示例：GC 日志解读（G1）

```text
[3.456s][info][gc,start    ] GC(12) Pause Young (Normal) (G1 Evacuation Pause)
[3.456s][info][gc,task     ] GC(12) Using 8 workers of 8 for evacuation
[3.462s][info][gc,mmu      ] GC(12) MMU target violated: 20.0ms (20.0ms/200.0ms)
[3.468s][info][gc,heap     ] GC(12) Eden regions: 12->0(10)
[3.468s][info][gc,heap     ] GC(12) Survivor regions: 2->3(4)
[3.468s][info][gc,heap     ] GC(12) Old regions: 30->30
[3.468s][info][gc          ] GC(12) Pause Young (Normal) (G1 Evacuation Pause) 24M->13M(2048M) 12.3ms
```

- Evacuation：复制存活对象到 Survivor/Old。
- MMU target violated：未满足最小可用性目标，可适当放宽 `MaxGCPauseMillis` 或调整新生代大小。

## 13. 常见“慢”的根因清单

- 频繁 Full GC：内存不足/晋升失败/元空间增长。
- 大对象频繁分配与回收：优化对象生命周期，复用缓冲。
- 过多小对象：考虑池化或批处理；关注装箱与临时集合。
- 类加载过多：反射/代理生成类泄漏，检查 `ClassLoader` 引用链。
- I/O 或外部依赖阻塞导致线程堆积。

## 14. 版本差异与选择

- JDK 8：PermGen→Metaspace，默认 Parallel（部分发行版）。
- JDK 11：LTS，默认 G1，统一日志 `-Xlog`。
- JDK 17：LTS，引入更稳定的 ZGC/Shenandoah，性能与诊断能力增强。

## 15. 小结与建议

- 优先明确目标（延迟/吞吐/成本），再选 GC 与参数。
- 用数据驱动：GC 日志 + JFR + 业务指标联动分析。
- 减少不必要的对象分配与跨代存活，控制常驻集合。
- 线上问题首选“抓证据”而非“拍脑袋调参”。

## 附录 A：常用参数备忘（参考）

```bash
# 堆与元空间
-Xms4g -Xmx4g
-XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=2g

# G1 相关
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:InitiatingHeapOccupancyPercent=45
-XX:G1NewSizePercent=20
-XX:G1MaxNewSizePercent=60

# ZGC 相关（JDK 17+）
-XX:+UseZGC
-XX:ZUncommitDelay=300

# 统一日志（JDK 9+）
-Xlog:gc*,safepoint,class+load,class+unload:file=app-gc.log:time,level,tags

# 诊断开关
-XX:+UnlockDiagnosticVMOptions
-XX:+LogVMOutput -XX:LogFile=vm.log
```

## 附录 B：工具与资料

- JFR（Java Flight Recorder）、JMC（Mission Control）
- MAT（Memory Analyzer）、VisualVM、async-profiler、Arthas
- “深入理解 Java 虚拟机”（周志明）

---

掌握 JVM 原理可让你在性能优化、故障排查、容量规划上更为主动。建议结合“并发与线程”、“JVM 深入与性能调优”章节联读与实操。
