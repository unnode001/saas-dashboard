<script setup lang="ts">
import { sub, format } from 'date-fns'
import AnalyticsChart from '~/components/AnalyticsChart.vue'

const route = useRoute()
const websiteId = route.params.id as string

// Fetch website details
const { data: website, error: websiteError } = await useFetch(`/api/websites/${websiteId}`)

if (websiteError.value) {
  console.error('Failed to fetch website data:', websiteError.value)
  // Consider redirecting or showing a global error message
}

// Date range state
const range = ref({
  start: sub(new Date(), { days: 30 }),
  end: new Date(),
})

// Fetch analytics data based on date range
const { data: analytics, pending, error: analyticsError, refresh } = useAsyncData(
  `analytics-${websiteId}`,
  () => $fetch(`/api/analytics/${websiteId}`, {
    params: {
      start: format(range.value.start, 'yyyy-MM-dd'),
      end: format(range.value.end, 'yyyy-MM-dd'),
    },
  }),
  {
    watch: [range], // Re-fetch when range changes
  },
)

const formattedRange = computed(() => {
  if (!range.value.start || !range.value.end) return 'Select a date range'
  return `${format(range.value.start, 'MMM d, yyyy')} - ${format(range.value.end, 'MMM d, yyyy')}`
})

const trendChartData = computed(() => {
  if (!analytics.value?.trend) {
    return { labels: [], datasets: [] }
  }
  return {
    labels: analytics.value.trend.map(t => t.date),
    datasets: [
      {
        label: '浏览量',
        data: analytics.value.trend.map(t => t.views),
        borderColor: '#10b981', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  }
})

const trackerScript = computed(() => {
  return `<script async src="/tracker.js" data-website-id="${websiteId}"><\/script>`
})

const toast = useToast()
function copyScript() {
  navigator.clipboard.writeText(trackerScript.value)
  toast.add({ title: '追踪代码已复制到剪贴板', icon: 'i-heroicons-check-circle' })
}

const pageTitle = computed(() => website.value?.name ? `仪表盘 - ${website.value.name}` : '仪表盘')
useHead({
  title: pageTitle,
})
</script>

<template>
  <div v-if="website">
    <header class="flex justify-between items-start mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ website.name }}</h1>
        <p class="text-lg text-gray-500 dark:text-gray-400">{{ website.domain }}</p>
      </div>
      <UPopover :popper="{ placement: 'bottom-end' }">
        <UButton icon="i-heroicons-calendar-days-20-solid" size="lg" class="w-72 justify-center">{{ formattedRange }}</UButton>
        <template #panel="{ close }">
          <VDatePicker v-model.range="range" @close="close" />
        </template>
      </UPopover>
    </header>

    <div v-if="pending" class="flex justify-center items-center h-64">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl text-gray-400" />
    </div>
    <div v-else-if="analyticsError" class="p-4 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
      <p class="text-red-600 dark:text-red-400">加载分析数据失败: {{ analyticsError.message }}</p>
    </div>
    <div v-else-if="analytics">
      <UGrid :columns="12" class="gap-6">
        <!-- Key Metrics -->
        <UCard class="col-span-12 sm:col-span-6 lg:col-span-3">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">总浏览量</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ analytics.totalPageviews }}</p>
        </UCard>
        <UCard class="col-span-12 sm:col-span-6 lg:col-span-3">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">独立访客</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ analytics.uniqueVisitors }}</p>
        </UCard>
        <UCard class="col-span-12 sm:col-span-6 lg:col-span-3">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">平均访问时长</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white">N/A</p>
        </UCard>
        <UCard class="col-span-12 sm:col-span-6 lg:col-span-3">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">跳出率</p>
          <p class="text-3xl font-bold text-gray-900 dark:text-white">N/A</p>
        </UCard>

        <!-- Pageviews Trend -->
        <UCard class="col-span-12">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">浏览趋势</h3>
          <div class="h-80">
            <AnalyticsChart :chart-data="trendChartData" />
          </div>
        </UCard>

        <!-- Top Pages & Referrers -->
        <div class="col-span-12 lg:col-span-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">热门页面</h3>
            <UTable :rows="analytics.topPages" :columns="[{key: 'path', label: '页面路径'}, {key: 'views', label: '浏览量'}]" />
        </div>
         <div class="col-span-12 lg:col-span-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">流量来源</h3>
            <UTable :rows="analytics.topReferrers" :columns="[{key: 'referrer', label: '来源'}, {key: 'views', label: '浏览量'}]"/>
        </div>

      </UGrid>
    </div>
    <div v-else class="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <UIcon name="i-heroicons-signal-slash" class="text-5xl text-gray-400 dark:text-gray-500 mx-auto"/>
      <h2 class="mt-4 text-xl font-semibold text-gray-900 dark:text-white">暂无数据</h2>
      <p class="mt-2 text-gray-500 dark:text-gray-400">我们尚未收到任何数据，请确保您的追踪代码已正确安装。</p>
    </div>

    <!-- Tracking Script Section -->
    <div class="mt-12 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">追踪代码</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">将此代码复制并粘贴到您网站的 `<head>` 标签中，以开始收集数据。</p>
        <div class="relative bg-gray-200 dark:bg-gray-800 rounded-md p-4 font-mono text-sm text-gray-700 dark:text-gray-300">
            <pre><code>{{ trackerScript }}</code></pre>
            <UButton
              icon="i-heroicons-clipboard-document"
              class="absolute top-3 right-3"
              @click="copyScript"
              size="sm"
              color="white"
              variant="solid"
              aria-label="复制追踪代码"
            />
        </div>
    </div>

  </div>
  <div v-else-if="websiteError" class="flex flex-col items-center justify-center h-full text-center">
      <UIcon name="i-heroicons-exclamation-triangle" class="text-5xl text-red-500 mx-auto"/>
      <h2 class="mt-4 text-xl font-semibold text-gray-900 dark:text-white">加载网站失败</h2>
      <p class="mt-2 text-gray-500 dark:text-gray-400">无法加载网站数据，请检查网站ID是否正确或稍后再试。</p>
  </div>
  <div v-else class="flex justify-center items-center h-64">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl text-gray-400" />
  </div>
</template>
