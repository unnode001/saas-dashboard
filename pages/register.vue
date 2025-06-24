<script setup lang="ts">
const user = useUser()
const router = useRouter()

if (user.value) {
  router.push('/')
}

const email = ref('')
const password = ref('')

const register = async () => {
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
      },
    })
    router.push('/')
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <h1>Register</h1>
    </template>
    <form @submit.prevent="register">
      <UFormGroup label="Email">
        <UInput v-model="email" type="email" />
      </UFormGroup>
      <UFormGroup label="Password">
        <UInput v-model="password" type="password" />
      </UFormGroup>
      <UButton type="submit">Register</UButton>
    </form>
  </UCard>
</template>
