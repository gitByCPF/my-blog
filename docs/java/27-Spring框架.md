# 🌱 Spring 框架

## Spring 概述

Spring 是一个开源的 Java 企业应用框架，提供了依赖注入、AOP 等功能。

```
应用 ──▶ IoC 容器（Bean 生命周期/依赖注入）
       └─▶ AOP（横切关注点：事务/日志/鉴权）
       └─▶ MVC（Web 层）/ Data（数据访问）/ Boot（自动配置）
```

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

### Bean 生命周期（图示）

```
实例化 → 属性注入 → Aware 回调 → BeanPostProcessor(before) → 初始化 → BeanPostProcessor(after) → 使用 → 销毁
```

```java
@Component
class Life implements InitializingBean, DisposableBean {
    public void afterPropertiesSet(){ /* init */ }
    public void destroy(){ /* cleanup */ }
}
```

### 条件化与配置属性

```java
@ConfigurationProperties(prefix = "app")
record AppProps(String name, int workers) {}

@Bean @ConditionalOnProperty("feature.x.enabled")
Service featureX(){ return new Service(); }
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

### 统一异常与校验

```java
@RestControllerAdvice
class GlobalEx {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<?> badReq(MethodArgumentNotValidException e){ return ResponseEntity.badRequest().build(); }
}

record CreateUser(@NotBlank String name, @Email String email){}
```

### 数据访问：JDBC、JPA 与事务

```java
@Service
class PayService {
  @Transactional
  public void pay(){ /* 调用 repo 并保证原子性 */ }
}
```

### 配置与环境

```properties
# application.yml（片段）
server.port: 8080
spring.datasource.hikari.maximum-pool-size: 16
logging.level.root: info
```

## AOP（切面）

```
JoinPoint（连接点）
Pointcut（切点） → Advice（前/后/环绕） → Aspect（切面）
```

```java
@Aspect @Component
class LogAspect {
  @Around("execution(* com.example.service..*(..))")
  Object around(ProceedingJoinPoint pjp) throws Throwable {
    long t = System.nanoTime();
    try { return pjp.proceed(); }
    finally { System.out.println(pjp.getSignature()+" " + (System.nanoTime()-t)); }
  }
}
```

## 实战：分层架构骨架（Controller → Service → Repository）

```
Controller（参数校验/DTO）
  → Service（业务逻辑/事务）
    → Repository（数据访问）
```

```java
interface UserRepo { Optional<User> find(long id); User save(User u); }
@Service class UserSvc { @Autowired UserRepo repo; @Transactional public User create(User u){ return repo.save(u);} }
@RestController class UserApi { @Autowired UserSvc svc; @PostMapping("/users") User c(@RequestBody CreateUser dto){ return svc.create(new User(dto.name(), dto.email())); } }
```

## 下一步

掌握了 Spring 框架后，可以继续学习：

- [综合项目实战](/java/28-综合项目实战.md) - 实战项目
- [JVM 深入与性能调优](/java/29-JVM深入与性能调优.md) - 深入学习 JVM

---

<div style="text-align: center; margin-top: 2rem;">
  <p>💡 <strong>提示</strong>：Spring 是 Java 企业开发的主流框架，Spring Boot 简化了 Spring 应用的开发</p>
</div>
