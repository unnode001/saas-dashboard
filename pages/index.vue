<script setup lang="ts">
const user = useUser()

if (!user.value) {
  await navigateTo('/login')
}
</script>

<template>
  <div>
    <h1>Dashboard</h1>
    <p>Welcome, {{ user?.email }}</p>
  </div>
</template>
