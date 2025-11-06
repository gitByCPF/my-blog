# 💾 数据库与 JDBC

## JDBC 概述

JDBC（Java Database Connectivity）是 Java 访问数据库的标准 API。

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

## PreparedStatement

```java
String sql = "INSERT INTO users (name, age) VALUES (?, ?)";
PreparedStatement pstmt = conn.prepareStatement(sql);

pstmt.setString(1, "张三");
pstmt.setInt(2, 25);
pstmt.executeUpdate();

pstmt.close();
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

## 下一步

掌握了 JDBC 后，可以继续学习：

- [Spring 框架](/java/27-Spring框架.md) - 学习 Spring 框架
- [综合项目实战](/java/28-综合项目实战.md) - 实战项目

---

<div style="text-align: center; margin-top: 2rem;">
  <p>💡 <strong>提示</strong>：JDBC 是 Java 访问数据库的基础，现代开发通常使用 ORM 框架如 MyBatis、Hibernate</p>
</div>
