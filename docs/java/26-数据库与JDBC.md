# 💾 数据库与 JDBC

## JDBC 概述

JDBC（Java Database Connectivity）是 Java 访问数据库的标准 API。

```
应用代码 → JDBC API → 驱动（Driver）→ 协议（MySQL/PostgreSQL）→ 数据库
```

## 连接数据库

### 基本步骤

```java
// 1. 加载驱动
Class.forName("com.mysql.cj.jdbc.Driver");

// 2. 建立连接
String url = "jdbc:mysql://localhost:3306/test";
String user = "root";
String password = "password";
Connection conn = DriverManager.getConnection(url, user, password);

// 3. 创建 Statement
Statement stmt = conn.createStatement();

// 4. 执行 SQL
ResultSet rs = stmt.executeQuery("SELECT * FROM users");

// 5. 处理结果
while (rs.next()) {
    String name = rs.getString("name");
    int age = rs.getInt("age");
    System.out.println(name + ": " + age);
}

// 6. 关闭资源
rs.close();
stmt.close();
conn.close();
```

### 连接池架构与选择

```
         Borrow        Use        Return
应用线程 ─────────▶ 连接池 ─────────▶ 空闲池
                 ▲           │
                 └── 创建/销毁（最小/最大、存活检测）
```

- 推荐：HikariCP（低延迟、低抖动）。关键参数：`maximumPoolSize`、`connectionTimeout`、`minimumIdle`、`idleTimeout`、`maxLifetime`。

```java
HikariConfig cfg = new HikariConfig();
cfg.setJdbcUrl("jdbc:mysql://localhost:3306/app?useSSL=false&serverTimezone=UTC");
cfg.setUsername("app");
cfg.setPassword("***");
cfg.setMaximumPoolSize(16);
cfg.setMaxLifetime(30*60_000); // 小于数据库侧的 wait_timeout
DataSource ds = new HikariDataSource(cfg);
```

## PreparedStatement

```java
String sql = "INSERT INTO users (name, age) VALUES (?, ?)";
PreparedStatement pstmt = conn.prepareStatement(sql);

pstmt.setString(1, "张三");
pstmt.setInt(2, 25);
pstmt.executeUpdate();

pstmt.close();
```

提示：永远使用 `PreparedStatement` 防止 SQL 注入，并复用执行计划；配合批处理提升吞吐。

### 批处理（Batch）

```java
String sql = "INSERT INTO orders (id, amount) VALUES (?, ?)";
try (PreparedStatement ps = conn.prepareStatement(sql)) {
    for (int i = 0; i < 1000; i++) {
        ps.setLong(1, i);
        ps.setBigDecimal(2, new BigDecimal("9.99"));
        ps.addBatch();
        if ((i+1) % 200 == 0) ps.executeBatch();
    }
    ps.executeBatch();
}
```

## 事务处理

```java
try {
    conn.setAutoCommit(false);  // 关闭自动提交
    
    // 执行多个 SQL 操作
    stmt.executeUpdate("UPDATE account SET balance = balance - 100 WHERE id = 1");
    stmt.executeUpdate("UPDATE account SET balance = balance + 100 WHERE id = 2");
    
    conn.commit();  // 提交事务
} catch (SQLException e) {
    conn.rollback();  // 回滚事务
}
```

### 事务隔离级别（图示）

```
读未提交 < 读已提交 < 可重复读 < 可串行化
  脏读      不可重复读      幻读      串行一致
```

```java
conn.setTransactionIsolation(Connection.TRANSACTION_REPEATABLE_READ);
```

### 传播行为（在 Spring 中）

```
REQUIRED（默认）/ REQUIRES_NEW / NESTED / SUPPORTS / MANDATORY / NEVER / NOT_SUPPORTED
```

```java
@Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
public void pay() { /* ... */ }
```

## 映射与模板：JdbcTemplate 与 ORM 对照

```java
JdbcTemplate jdbc = new JdbcTemplate(ds);
List<User> list = jdbc.query("select id,name from t_user where name like ?",
        ps -> ps.setString(1, "A%"),
        (rs, i) -> new User(rs.getLong(1), rs.getString(2))
);
```

对照：
- JdbcTemplate：轻量、显式 SQL、手写映射；
- MyBatis：SQL 为中心，XML/注解映射；
- JPA/Hibernate：对象为中心，自动映射与缓存。

## 索引与查询优化（要点）

- 选择性高的列建 B+ 树索引；前缀匹配有效（`like 'abc%'`）。
- 覆盖索引减少回表；避免函数作用于列、隐式类型转换。
- 慎用 `SELECT *`；限制结果集与分页策略（`id` 游标优于 `offset`）。

## 常见问题与排查

- 连接泄漏：归还失败/忘记关闭；开启池化 leakDetectionThreshold；在 finally 块关闭资源。
- 长事务：持锁时间长导致阻塞/死锁；尽量短事务、拆分批次、合理索引。
- 字符集/时区：确保 `useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC` 一致。

## 实战：转账服务（简化版）

```java
void transfer(long from, long to, BigDecimal amt) throws SQLException {
    try (Connection c = ds.getConnection()) {
        c.setAutoCommit(false);
        try (PreparedStatement d = c.prepareStatement("update account set bal=bal-? where id=?");
             PreparedStatement c2 = c.prepareStatement("update account set bal=bal+? where id=?")) {
            d.setBigDecimal(1, amt); d.setLong(2, from); d.executeUpdate();
            c2.setBigDecimal(1, amt); c2.setLong(2, to); c2.executeUpdate();
            c.commit();
        } catch (Exception e) { c.rollback(); throw e; }
    }
}
```

## 下一步

掌握了 JDBC 后，可以继续学习：

- [Spring 框架](/java/27-Spring框架.md) - 学习 Spring 框架
- [综合项目实战](/java/28-综合项目实战.md) - 实战项目

---

<div style="text-align: center; margin-top: 2rem;">
  <p>💡 <strong>提示</strong>：JDBC 是 Java 访问数据库的基础，现代开发通常使用 ORM 框架如 MyBatis、Hibernate</p>
</div>
