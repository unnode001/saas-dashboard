<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const user = useUser()
const { data } = await useFetch('/api/user', {
  headers: useRequestHeaders(['cookie']),
})
user.value = data.value
</script>
