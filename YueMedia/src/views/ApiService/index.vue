<template>
  <div style="width: 100%; display: flex; flex-direction: column">
    <el-card shadow="hover" class="top-card">
      <span>过期时间：</span>
      <el-date-picker v-model="endDate" type="datetime" :picker-options="pickerOptions" placeholder="选择过期时间"></el-date-picker>
      <el-button type="primary" icon="el-icon-magic-stick" @click="clickGenerateTokenHandler" style="margin: 0 10px">生成 Token </el-button>
      <span style="margin-left: 10px">Token：</span>
      <el-input placeholder="待生成 Token" prefix-icon="el-icon-key" :value="openApiToken" readonly></el-input>
      <el-button type="primary" icon="el-icon-copy-document" @click="clickCopyTokenHandler(openApiToken)" :disabled="!isAllowCopy" style="margin: 0 10px"></el-button>
    </el-card>
    <el-card shadow="hover" class="body-card" body-style="height:100%">
      <iframe :src="docUrl"></iframe>
    </el-card>
  </div>
</template>

<script>
import { getOpenApiTokenAPI } from '@/apis/opanAPI'

export default {
  name: 'MusicManageSystemApiServiceView',
  data() {
    return {
      endDate: '',
      openApiToken: '',
      pickerOptions: {
        disabledDate: time => {
          const now = new Date()
          const oneMonthLater = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
          return time.getTime() < now.getTime() || time.getTime() > oneMonthLater.getTime()
        }
      },
      docUrl: `${process.env.VUE_APP_REQUEST_URL}/apidoc-open`
    }
  },
  computed: {
    isAllowCopy() {
      return this.openApiToken.length !== 0
    }
  },
  methods: {
    async clickGenerateTokenHandler() {
      try {
        const {
          data: { token, message }
        } = await getOpenApiTokenAPI(this.endDate)
        this.$message.success(message)
        this.openApiToken = token
      } catch (error) {
        if (error.response) {
          this.$message.error(error.response.data.message)
        }
      }
    },
    async clickCopyTokenHandler(text) {
      await navigator.clipboard.writeText(text)
      this.$message.success('复制到剪切板成功！')
    }
  }
}
</script>

<style lang="less" scoped>
.top-card {
  .el-input {
    width: 220px;
  }
}

.top-card,
.body-card {
  margin: 10px;
}

.body-card {
  margin-top: 0;
  flex: 1;

  iframe {
    width: 100%;
    height: 100%;
  }
}
</style>