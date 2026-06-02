<template>
  <div class="app-container">
    <div class="card">
      <h1>{{ title }}</h1>
      <p>{{ message }}</p>
      <button @click="count++" class="btn">
        点击计数: {{ count }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const title = ref('Vue 3 项目')
const message = ref('欢迎使用 Vue 3 + Vite！')
const count = ref(0)
</script>

<style scoped>
.app-container {
  text-align: center;
  padding: 20px;
}

.card {
  background: white;
  padding: 40px 60px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

h1 {
  color: #333;
  margin-bottom: 16px;
  font-size: 2rem;
}

p {
  color: #666;
  margin-bottom: 24px;
  font-size: 1.1rem;
}

.btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}
</style>