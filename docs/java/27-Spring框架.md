# 🌱 Spring 框架

## Spring 概述

Spring 是一个开源的 Java 企业应用框架，提供了依赖注入、AOP 等功能。

## Spring Core

### 依赖注入

```java
@Component
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public User getUser(Long id) {
        return userRepository.findById(id);
    }
}
```

### 配置类

```java
@Configuration
@ComponentScan("com.example")
public class AppConfig {
    @Bean
    public DataSource dataSource() {
        return new HikariDataSource();
    }
}
```

## Spring Boot

### 自动配置

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### REST Controller

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;
    
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getUser(id);
    }
    
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }
}
```

## 下一步

掌握了 Spring 框架后，可以继续学习：

- [综合项目实战](/java/28-综合项目实战.md) - 实战项目
- [JVM 深入与性能调优](/java/29-JVM深入与性能调优.md) - 深入学习 JVM

---

<div style="text-align: center; margin-top: 2rem;">
  <p>💡 <strong>提示</strong>：Spring 是 Java 企业开发的主流框架，Spring Boot 简化了 Spring 应用的开发</p>
</div>
