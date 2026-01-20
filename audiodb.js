// audiodb.js
// 群組（分頁）設定
const AUDIO_GROUPS = [
  {
    id: "miyin-tellmewhy",
    label: "迷因 - 回答我"
  },
  {
    id: "Sound-Effects",
    label: "綜藝音效"
  }
];

// 單一音效資料
const AUDIO_DB = [
  // ===== 群組 1：迷因 - 回答我 =====
  {
    id: "miyin_answerme",
    group: "miyin-tellmewhy",
    name: "回答我!!",
    file: "audio/miyin-tellmewhy/answerme.WAV",
    mode: "fade"
  },
  {
    id: "miyin_lookingmyeyes",
    group: "miyin-tellmewhy",
    name: "Looking My Eyes",
    file: "audio/miyin-tellmewhy/lookingmyeyes.WAV",
    mode: "fade"
  },
  {
    id: "miyin_tellmewhy",
    group: "miyin-tellmewhy",
    name: "Tell Me Why",
    file: "audio/miyin-tellmewhy/TellMeWhy.WAV",
    mode: "fade"
  },
  {
    id: "miyin_say",
    group: "miyin-tellmewhy",
    name: "說話!!",
    file: "audio/miyin-tellmewhy/say.WAV",
    mode: "fade"
  },
  {
    id: "miyin_a",
    group: "miyin-tellmewhy",
    name: "啊~",
    file: "audio/miyin-tellmewhy/a.WAV",
    mode: "fade"
  },
  {
    id: "miyin_askyou",
    group: "miyin-tellmewhy",
    name: "啊我再問你啊!",
    file: "audio/miyin-tellmewhy/askyou.WAV",
    mode: "fade"
  },
  {
    id: "miyin_can",
    group: "miyin-tellmewhy",
    name: "能~能~能~",
    file: "audio/miyin-tellmewhy/can.WAV",
    mode: "fade"
  },

  // ===== 群組 2：Sound-Effects（綜藝音效） =====
 {
    id: "se_jinma",
    group: "Sound-Effects",
    name: "金馬頒獎音樂",
    file: "audio/Sound-Effects/金馬頒獎音樂.WAV",
    mode: "fade"
  },
    {
    id: "se_foxintro",
    group: "Sound-Effects",
    name: "福斯電影開頭",
    file: "audio/Sound-Effects/福斯電影開頭.WAV",
    mode: "fade"
  },
    {
    id: "se_huanhusheng",
    group: "Sound-Effects",
    name: "歡呼聲",
    file: "audio/Sound-Effects/歡呼聲.WAV",
    mode: "fade"
  },
    {
    id: "se_zhangsheng",
    group: "Sound-Effects",
    name: "掌聲",
    file: "audio/Sound-Effects/掌聲.WAV",
    mode: "fade"
  },
  {
    id: "se_kexi",
    group: "Sound-Effects",
    name: "可惜",
    file: "audio/Sound-Effects/可惜.WAV",
    mode: "fade"
  },
  {
    id: "se_dong",
    group: "Sound-Effects",
    name: "咚",
    file: "audio/Sound-Effects/咚.WAV",
    mode: "fade"
  },
  {
    id: "se_dongdong",
    group: "Sound-Effects",
    name: "咚咚",
    file: "audio/Sound-Effects/咚咚.WAV",
    mode: "fade"
  },
  {
    id: "se_bo",
    group: "Sound-Effects",
    name: "啵",
    file: "audio/Sound-Effects/啵.WAV",
    mode: "fade"
  },
  {
    id: "se_wandanle",
    group: "Sound-Effects",
    name: "完蛋了",
    file: "audio/Sound-Effects/完蛋了.WAV",
    mode: "fade"
  },

  {
    id: "se_zouren",
    group: "Sound-Effects",
    name: "揍人",
    file: "audio/Sound-Effects/揍人.WAV",
    mode: "fade"
  },

  {
    id: "se_xiaoyin",
    group: "Sound-Effects",
    name: "消音",
    file: "audio/Sound-Effects/消音.WAV",
    mode: "fade"
  },

  {
    id: "se_daduile",
    group: "Sound-Effects",
    name: "答對了",
    file: "audio/Sound-Effects/答對了.WAV",
    mode: "fade"
  },
  {
    id: "se_dacuole",
    group: "Sound-Effects",
    name: "答錯了",
    file: "audio/Sound-Effects/答錯了.WAV",
    mode: "fade"
  },
  {
    id: "se_jinzhang",
    group: "Sound-Effects",
    name: "緊張",
    file: "audio/Sound-Effects/緊張.WAV",
    mode: "fade"
  },
  {
    id: "se_tiaoyue",
    group: "Sound-Effects",
    name: "跳躍",
    file: "audio/Sound-Effects/跳躍.WAV",
    mode: "fade"
  },

  {
    id: "se_luo",
    group: "Sound-Effects",
    name: "鑼",
    file: "audio/Sound-Effects/鑼.WAV",
    mode: "fade"
  },
  {
    id: "se_nanguo",
    group: "Sound-Effects",
    name: "難過",
    file: "audio/Sound-Effects/難過.WAV",
    mode: "fade"
  }
];
