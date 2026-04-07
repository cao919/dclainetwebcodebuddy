<template>
  <div class="simple-login">
    <h1>营销AI智能体系统</h1>
    <div class="login-box">
      <h2>用户登录</h2>
      <input 
        v-model="email" 
        type="email" 
        placeholder="请输入邮箱"
        class="input"
      />
      <input 
        v-model="password" 
        type="password" 
        placeholder="请输入密码"
        class="input"
        @keyup.enter="handleLogin"
      />
      <button 
        class="login-btn" 
        @click="handleLogin"
        :disabled="loading"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    alert('请输入邮箱和密码')
    return
  }
  
  loading.value = true
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })
    
    const data = await response.json()
    
    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      alert('登录成功！')
      router.push('/dashboard')
    } else {
      alert('登录失败：' + (data.message || '未知错误'))
    }
  } catch (error) {
    alert('登录失败：' + error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.simple-login {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

h1 {
  color: white;
  margin-bottom: 30px;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.input {
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #667eea;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover {
  background: #5a6fd6;
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
