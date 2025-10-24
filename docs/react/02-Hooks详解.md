# React Hooks 详解

## 什么是 Hooks

Hooks 是 React 16.8 引入的新特性，让你在函数组件中使用状态和其他 React 特性，而无需编写类组件。

## 为什么需要 Hooks

- **简化组件逻辑**：避免类组件的复杂性
- **代码复用**：更容易在组件间共享状态逻辑
- **更好的性能**：避免不必要的重渲染
- **学习成本低**：只需要学习函数，不需要理解类

## 常用 Hooks

### useState

用于在函数组件中添加状态：

```jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
      
      <input 
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="输入姓名"
      />
      <p>你好, {name}!</p>
    </div>
  );
}
```

### useEffect

用于处理副作用（数据获取、订阅、手动 DOM 操作等）：

```jsx
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 组件挂载时执行
    fetchUser(userId);
  }, [userId]); // 依赖数组：当 userId 变化时重新执行

  const fetchUser = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${id}`);
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('获取用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>加载中...</div>;
  if (!user) return <div>用户不存在</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>邮箱: {user.email}</p>
    </div>
  );
}
```

### useEffect 清理函数

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // 清理函数：组件卸载时清除定时器
    return () => {
      clearInterval(interval);
    };
  }, []); // 空依赖数组：只在挂载和卸载时执行

  return <div>计时器: {seconds} 秒</div>;
}
```

### useContext

用于在组件树中共享数据：

```jsx
import React, { createContext, useContext } from 'react';

// 创建 Context
const ThemeContext = createContext();

// Provider 组件
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 使用 Context 的组件
function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button 
      style={{ 
        backgroundColor: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff'
      }}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      切换主题
    </button>
  );
}
```

### useReducer

用于管理复杂的状态逻辑：

```jsx
import React, { useReducer } from 'react';

// Reducer 函数
function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      throw new Error('未知的操作类型');
  }
}

function Counter() {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>计数: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+1</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-1</button>
      <button onClick={() => dispatch({ type: 'reset' })}>重置</button>
    </div>
  );
}
```

### useMemo 和 useCallback

用于性能优化：

```jsx
import React, { useState, useMemo, useCallback } from 'react';

function ExpensiveComponent({ items }) {
  const [filter, setFilter] = useState('');

  // useMemo: 缓存计算结果
  const filteredItems = useMemo(() => {
    console.log('重新计算过滤结果');
    return items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  // useCallback: 缓存函数
  const handleItemClick = useCallback((itemId) => {
    console.log('点击了项目:', itemId);
  }, []);

  return (
    <div>
      <input 
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="搜索项目"
      />
      <ul>
        {filteredItems.map(item => (
          <li key={item.id} onClick={() => handleItemClick(item.id)}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 自定义 Hooks

创建可复用的状态逻辑：

```jsx
// 自定义 Hook: useLocalStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// 使用自定义 Hook
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [language, setLanguage] = useLocalStorage('language', 'zh');

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">浅色主题</option>
        <option value="dark">深色主题</option>
      </select>
      
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
```

## Hooks 使用规则

1. **只在顶层调用 Hooks**：不要在循环、条件或嵌套函数中调用
2. **只在 React 函数中调用 Hooks**：函数组件或自定义 Hooks

```jsx
// ❌ 错误示例
function BadExample() {
  if (someCondition) {
    const [state, setState] = useState(0); // 错误！
  }
}

// ✅ 正确示例
function GoodExample() {
  const [state, setState] = useState(0);
  
  if (someCondition) {
    // 在这里使用 state
  }
}
```

## 总结

Hooks 让 React 函数组件更加强大和灵活，是现代 React 开发的标准方式。掌握常用 Hooks 的使用方法，可以让你写出更简洁、更易维护的 React 代码。
