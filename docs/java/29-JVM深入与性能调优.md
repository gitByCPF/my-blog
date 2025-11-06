# ⚡ JVM 深入与性能调优

## JVM 性能调优概述

JVM 性能调优是提高 Java 应用性能的重要手段。

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

## 性能分析工具

### JVisualVM

- 监控 JVM 性能
- 分析内存使用
- 查看线程状态

### JProfiler

- CPU 分析
- 内存分析
- 线程分析

## 下一步

掌握了 JVM 性能调优后，可以继续学习：

- [并发编程高级](/java/30-并发编程高级.md) - 深入学习并发编程
- [分布式与微服务](/java/31-分布式与微服务.md) - 学习分布式系统

---

<div style="text-align: center; margin-top: 2rem;">
  <p>💡 <strong>提示</strong>：JVM 性能调优需要根据实际应用情况进行，通过监控和分析找到瓶颈</p>
</div>
