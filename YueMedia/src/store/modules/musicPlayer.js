// 设置播放列表
const setMusicList = ({ commit }, data) => {
  commit('SET_MUSIC_LIST', data)
}

// 清除播放列表
const clearMusicList = ({ commit }) => {
  commit('CLEAR_MUSIC_LIST')
}

export const musicPlayer = {
  namespaced: true,
  state: {
    musicList: [
      {
        title: 'Little Snowflake',
        artist: '花近 feat. ryuryu',
        src: `${process.env.VUE_APP_REQUEST_URL}/df64172568e6614d23046b50618636ce1681897545891.mp3`,
        pic: `${process.env.VUE_APP_REQUEST_URL}/df64172568e6614d23046b50618636ce1681897545891.jpg`
      }
    ]
  },
  mutations: {
    SET_MUSIC_LIST(state, data) {
      state.musicList = data
    },
    CLEAR_MUSIC_LIST(state) {
      state.musicList = []
    }
  },
  actions: {
    setMusicList,
    clearMusicList
  },
  getters: {
    // 动态获取播放别表
    getMusicList(state) {
      return state.musicList
    }
  }
}
