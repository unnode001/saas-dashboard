<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js'
import 'chartjs-adapter-date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

defineProps<{
  chartData: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor?: string
      backgroundColor?: string
      tension?: number
    }[]
  }
}>()

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'time' as const,
      time: {
        unit: 'day' as const,
        tooltipFormat: 'MMM dd',
      },
      grid: {
        display: false,
      },
      ticks: {
        color: '#9ca3af', // text-gray-400
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(229, 231, 235, 0.5)', // gray-200/50
      },
      ticks: {
        color: '#9ca3af', // text-gray-400
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#1f2937', // bg-gray-800
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
    },
  },
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
}
</script>

<template>
  <Line :data="chartData" :options="options" />
</template>
