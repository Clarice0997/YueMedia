<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<style lang="less">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: '阿里巴巴普惠体 2.0 65 Medium', sans-serif;
}

@font-face {
  font-family: '阿里巴巴普惠体 2.0 65 Medium';
  src: url('@/assets/font/Alibaba_PuHuiTi_2.0_65_Medium_65_Medium.ttf') format('truetype');
  font-weight: 300;
  font-display: swap;
}

@font-face {
  font-family: '阿里妈妈东方大楷 Regular';
  src: url('@/assets/font/Alimama_DongFangDaKai_Regular.woff2') format('woff2'), url('@/assets/font/Alimama_DongFangDaKai_Regular.woff') format('woff');
  font-weight: 300;
  font-display: swap;
}
</style>
