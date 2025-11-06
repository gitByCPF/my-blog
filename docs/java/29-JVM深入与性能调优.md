# ⚡ JVM 深入与性能调优

## JVM 性能调优概述

JVM 性能调优是提高 Java 应用性能的重要手段。

```
目标导向：吞吐优先 / 低延迟 / 成本优先 → 选 GC → 设堆与阈值 → 观测验证
```

## 内存调优

### 堆内存设置

```bash
# 设置初始堆大小和最大堆大小
-Xms2g -Xmx4g

# 设置新生代大小
-Xmn1g

# 设置老年代和新生代比例
-XX:NewRatio=2
```

### 垃圾回收调优

```bash
# 使用 G1 回收器
-XX:+UseG1GC

# 设置 G1 最大暂停时间
-XX:MaxGCPauseMillis=200

# 设置 G1 区域大小
-XX:G1HeapRegionSize=16m
```

#### G1 关键参数与观测

```bash
-XX:+UseG1GC -XX:MaxGCPauseMillis=200 -Xlog:gc*:file=gc.log:time,level,tags
```

```
GC 日志读法（示例）：
Pause Young (Normal) (G1 Evacuation)  2.1ms  Eden 8->0  Survivor 2->3  Old 30
→ 预测停顿是否满足目标、晋升速率/碎片、Mixed 频率
```

## 性能分析工具

### JVisualVM

- 监控 JVM 性能
- 分析内存使用
- 查看线程状态

### JProfiler

- CPU 分析
- 内存分析
- 线程分析

### JFR（Flight Recorder）与 JMC

- 低开销事件采集：方法采样、锁争用、分配热点；
- 生产可常驻：profile 真实流量；与业务指标联动分析。

```bash
jcmd <pid> JFR.start name=prod settings=profile filename=app.jfr duration=5m
```

### async-profiler（火焰图）

```bash
./profiler.sh -d 60 -e cpu -f cpu.svg <pid>
./profiler.sh -d 60 -e alloc -f alloc.svg <pid>
```

## 典型问题与实战定位

### 1. 高延迟：是否 GC 造成？

```
步骤：检查 GC 日志 → 停顿时间/频次 → Mixed 触发条件 → Region 占用/RS 大小
若非 GC：看线程栈（jstack）、锁等待、外部依赖。
```

### 2. OOM：哪类内存？

- `Java heap space`、`GC overhead limit`、`Metaspace`、`Direct buffer memory`、`StackOverflow`。
- 动作：heap dump + MAT 查找增长最猛对象 & 引用链；ClassLoader 泄漏/缓存/线程本地变量。

### 3. 锁竞争：谁在争？

- JFR 的 monitor-blocked 事件、`jstack` 看 `BLOCKED` 线程；避免粗粒度锁，考虑读写锁/分段锁/无锁。

## 调优清单（Checklist）

- 堆初始=最大，避免扩缩容抖动；
- 合理代比与新生代大小，减少晋升失败；
- 大对象与短命对象分配优化；
- 避免无界缓存，设置上限与过期；
- 使用对象池要谨慎，评估收益与复杂度；
- I/O 线程与业务线程隔离，线程池命名与监控。

## 参数模板（示例，按需调整）

```bash
JAVA_OPTS="-Xms2g -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 \
  -XX:InitiatingHeapOccupancyPercent=45 -Xlog:gc*:file=gc.log:tags,uptime,time,level"
```

## 案例：一次线上 Full GC 风暴

```
现象：RT 飙升，GC 日志显示频繁 Full GC；
原因：大 JSON 反序列化产生大量短命临时对象 + 日志异步队列堆积；
处理：调大新生代、限制日志速率、优化 JSON 库与对象复用；
结果：停顿从 800ms 降至 120ms，QPS 恢复。
```

## 下一步

掌握了 JVM 性能调优后，可以继续学习：

- [并发编程高级](/java/30-并发编程高级.md) - 深入学习并发编程
- [分布式与微服务](/java/31-分布式与微服务.md) - 学习分布式系统

---

<div style="text-align: center; margin-top: 2rem;">
  <p>💡 <strong>提示</strong>：JVM 性能调优需要根据实际应用情况进行，通过监控和分析找到瓶颈</p>
</div>
