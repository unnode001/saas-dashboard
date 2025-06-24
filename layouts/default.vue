<script setup lang="ts">
const user = useUser()
const router = useRouter()

const logout = async () => {
  await useFetch('/api/auth/logout', { method: 'POST' })
  user.value = null
  router.push('/login')
}
</script>

<template>
  <UContainer>
    <header class="flex items-center justify-between py-4">
      <NuxtLink to="/" class="text-2xl font-bold">SaaS Dashboard</NuxtLink>
      <nav>
        <div v-if="user" class="flex items-center gap-4">
          <span>{{ user.email }}</span>
          <UButton @click="logout">Logout</UButton>
        </div>
        <div v-else class="flex items-center gap-4">
          <NuxtLink to="/login">
            <UButton variant="ghost">Login</UButton>
          </NuxtLink>
          <NuxtLink to="/register">
            <UButton>Register</UButton>
          </NuxtLink>
        </div>
      </nav>
    </header>
    <main class="py-8">
      <slot />
    </main>
  </UContainer>
</template>
