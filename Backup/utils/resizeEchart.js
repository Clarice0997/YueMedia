// 判断当前是否处于首页 重绘 Echarts (解决方案)
// if (this.$router.currentRoute.fullPath === '/home/homepage') {
//   let isTransitioning = true
//   // 监听过渡效果结束事件
//   this.$nextTick(() => {
//     const elAside = this.$refs.elAside.$el
//     // 添加过渡效果的监听器
//     elAside.addEventListener('transitionend', () => {
//       if (isTransitioning) {
//         store.dispatch('dataCharts/redrawEcharts')
//         isTransitioning = false
//       }
//     })
//   })
// }