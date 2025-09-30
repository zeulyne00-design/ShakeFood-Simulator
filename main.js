(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // ========== 游戏配置区域 ==========
  // 调试配置
  const DEBUG_CONFIG = {
    showCollisionMasks: false, // 显示碰撞遮罩（已关闭）
    studentMaskColor: 'rgba(255, 0, 0, 0)', // 学生碰撞遮罩颜色（透明）
    plateMaskColor: 'rgba(0, 255, 0, 0)', // 盘子碰撞遮罩颜色（透明）
    spoonMaskColor: 'rgba(0, 0, 255, 0)', // 勺子碰撞遮罩颜色（透明）
    spoonClickMaskColor: 'rgba(255, 0, 255, 0)', // 勺子点击遮罩颜色（透明）
    potMaskColor: 'rgba(255, 255, 0, 0)', // 菜盆碰撞遮罩颜色（透明）
  };

  // 碰撞遮罩配置
  const COLLISION_CONFIG = {
    // 学生碰撞遮罩
    student: {
      width: 160,   // 学生碰撞宽度
      height: 190,  // 学生碰撞高度
      offsetX: -65,  // 相对学生图片的X偏移
      offsetY: -400,  // 相对学生图片的Y偏移
    },
    // 盘子碰撞遮罩
    plate: {
      width: 130*1.55,   // 盘子碰撞宽度
      height: 80*1.55,  // 盘子碰撞高度
      offsetX: 20,  // 相对盘子图片的X偏移
      offsetY: -20,  // 相对盘子图片的Y偏移
    },
    // 勺子碰撞遮罩
    spoon: {
      radius: 30,  // 勺子碰撞半径
      offsetX: -15,  // 相对勺子图片的X偏移
      offsetY: 0,  // 相对勺子图片的Y偏移
    },
    // 勺子点击遮罩（长方形，仅用于点击检测）
    spoonClick: {
      width: 50*2,   // 勺子点击遮罩宽度
      height: 80*2,  // 勺子点击遮罩高度
      offsetX: 10,  // 相对勺子图片的X偏移
      offsetY: 30,  // 相对勺子图片的Y偏移
    },
    // 菜盆碰撞遮罩
    pot: {
      width: 170*1.25,  // 菜盆碰撞宽度
      height: 80*1.55,  // 菜盆碰撞高度
      offsetX: -20,  // 相对菜盆图片的X偏移
      offsetY: 20,  // 相对菜盆图片的Y偏移
    },
    // 菜盆抖菜区域
    potShakeZone: {
      width: 170*1.25,  // 抖菜区域宽度
      height: 80*1.25, // 抖菜区域高度
      offsetX: -20, // 相对菜盆的X偏移
      offsetY: 20, // 相对菜盆的Y偏移
    }
  };

  // 游戏界面配置
  const UI_CONFIG = {
    gameTitle: '食堂阿姨之我要赚外快',
    startButtonText: '开始游戏',
    startPromptText: '点击开始按钮开始游戏',
    restartButtonText: '重开'
  };

  // 开始按钮配置
  const START_BUTTON_CONFIG = {
    width: 300*0.8,
    height: 100*0.8,
    backgroundImage: 'img/ui_start_inactive.png',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    hoverScale: 1.05,
    activeScale: 0.95,
    // 位置坐标配置（相对于开始界面背景的像素坐标）
    position: {
      x: 150,  // X轴位置（像素）
      y: 800   // Y轴位置（像素）
    }
  };

  // 新手引导配置
  const TUTORIAL_CONFIG = {
    step1: {
      title: '第一步：舀菜',
      message: '在菜盆内按住勺子可以舀菜',
      position: 'spoon'
    },
    step2: {
      title: '第二步：抖菜',
      message: '按住并左右晃动，可以抖菜',
      position: 'spoon'
    },
    // 从第三步开始采用图片+文本弹窗
    step3: {
      title: '注意事项',
      image: 'img/tutorial_spoon.png',
      messages: [
        '勺子内剩余菜量会显示在勺子旁边，注意把控菜量，空勺无法提交。'
      ],
      position: 'center',
      buttonText: '继续'
    },
    step4: {
      title: '学生点菜',
      image: 'img/tutorial_student_order.png',
      messages: [
        '每个学生都会点不同勺数的菜，需要按照他们的要求来打菜，',
        '勺数和百分比太少都会引起学生不满，导致失败。'
      ],
      position: 'center',
      buttonText: '继续'
    },
    step5: {
      title: '耐心与注意力',
      image: 'img/tutorial_student_condition.png',
      messages: [
        '学生的耐心也是有限的，需要在耐心耗完之前完成打菜。',
        '被学生盯着的时候打菜会被发现，可以趁学生转头时抖菜。'
      ],
      position: 'center',
      buttonText: '继续'
    },
    step6: {
      title: '盘子与提交',
      image: 'img/tutorial_place.png',
      messages: [
        '将菜舀到盘子后，可以看到当前盘子内的勺数和学生要求完成比',
        '拖动盘子到学生身边提交，需要按照学生的点菜要求来打菜，多打会有惩罚，少打则直接失败'
      ],
      position: 'center',
      buttonText: '继续'
    },
    step7: {
      title: '学生干部',
      image: 'img/tutorial_supervisor.png',
      messages: [
        '有时候会有学生干部检查，别在他们看你的时候被发现。',
        '又或者是其他检查人员……总之千万别被发现。'
      ],
      position: 'center',
      buttonText: '继续'
    },
    step8: {
      title: '教程结束',
      messages: [
        '你已经掌握了基础玩法，现在开始正式游戏吧！'
      ],
      position: 'center',
      buttonText: '开始游戏'
    }
  };

  // 学生美术资源配置
  const STUDENT_IMAGES_CONFIG = {
    walking: 'img/student1_walking.png',           // 学生移动时图片
    standby: 'img/student1_standby.png',           // 学生点菜时图片
    watchingYou: 'img/student1_watching you.png',  // 学生盯着玩家时图片
    watchingPhone: 'img/student1_wantching phone.png', // 学生转头看手机时图片
    happy: 'img/student1_happy.png',               // 交付成功时图片
    angry: 'img/student1_angry.png'                // 交付失败时图片
  };

  // 勺子美术资源配置
  const SPOON_IMAGES_CONFIG = {
    standbyEmpty: 'img/spoon_standby_empty.png',     // 勺子空的时候
    pourEmpty: 'img/spoon_pour_empty.png',           // 勺子舀菜时（空勺状态）
    standbyMore: 'img/spoon_standby_more.png',       // 勺子舀菜时（有菜状态）
    pourFull: 'img/spoon_pour_full.png',             // 抖菜时向左甩动（有菜）
    standbyLess: 'img/spoon_standby_less.png'        // 抖菜时向右甩动（有菜）
  };

  // 游戏布局配置
  const LAYOUT_CONFIG = {
    // 勺子配置
    SPOON: {
      initialX: 0.4,        // 初始X位置（屏幕宽度比例）
      initialY: 0.65,        // 初始Y位置（屏幕高度比例）
      radius: 22            // 勺子半径
    },
    
    // 菜盆配置
    POT: {
      x: 0.3,               // X位置（屏幕宽度比例）
      y: 0.75,              // Y位置（屏幕高度比例）
      width: 128*1.5,           // 宽度
      height: 128*0.8,           // 高度
      shakeZoneOffset: 15   // 抖菜判定区域偏移
    },
    
    // 盘子配置
    PLATE: {
      x: 0.68,               // X位置（屏幕宽度比例）
      y: 0.75,               // Y位置（屏幕高度比例）
      width: 94*2.5,           // 宽度
      height: 43*2.5,           // 高度
      offsetX: -70          // 相对于中心的X偏移
    },
    // 学生配置
    STUDENT: {
      initialX: -200,       // 初始X位置（屏幕外）
      y: 0.3,               // Y位置（屏幕高度比例）
      width: 128*3,            // 宽度
      height: 128*3,          // 高度
      targetX: 0.5,         // 目标X位置（屏幕宽度比例）
      speed: 160            // 移动速度
    },
    
    // 干部配置
    INSPECTOR: {
      initialX: -200,        // 初始X位置
      y: 0.3,               // Y位置（屏幕高度比例）
      width: 128*3,            // 宽度
      height: 128*3,          // 高度
      stopPosition: 0.8     // 停留位置（屏幕宽度比例）
    },
    
    // 交付区域配置
    DELIVERY_ZONE: {
      offsetX: -70,         // 相对于学生X的偏移
      y: 0.6,               // Y位置（屏幕高度比例）
      yOffset: -22,         // Y偏移
      width: 140,           // 宽度
      height: 44            // 高度
    },
    
    // 背景区域配置
    BACKGROUND: {
      counterAreaY: 0.6,    // 柜台区域Y位置（屏幕高度比例）
      counterAreaHeight: 0.4 // 柜台区域高度（屏幕高度比例）
    }
  };
  
  // 结算对话配置
  const CONFIG = {
    // 音频配置
    AUDIO: {
      paths: {
        music: 'audio/bg music.mp3',
        fail: 'audio/fail.mp3',
        success: 'audio/success.mp3',
        talking: 'audio/talking.mp3'
      },
      // 初始音量设置（可在配置区调整）
      initialVolume: {
        music: 1,     // 背景音乐初始音量（0.0-1.0）
        sfx: 0.8        // 音效初始音量（0.0-1.0）
      },
      // 设置面板滑条初始值
      settingsSlider: {
        music: 1.0,     // 音乐滑条初始值（0.0-1.0）
        sfx: 0.8        // 音效滑条初始值（0.0-1.0）
      },
      enabled: {
        music: true,
        sfx: true
      }
    },
    // 回合/计时配置（可在此修改每局时间等）
    ROUND: {
      durationSec: 180,          // 每局总时长（秒）默认3分钟
      warnThresholdSec: 30       // 警戒阈值（秒），用于样式/闪烁等扩展
    },
    // 失败结算对话
    FAIL_MESSAGES: {
      studentSeen: '学生看到你抖菜了',
      inspectorCaught: '干部巡逻时被发现抖菜',
      patienceTimeout: '失败：这勺等太久，学生离开了',
      insufficientFood: '失败：需要 {need} 勺且平均≥50%，当前勺数 {current}，平均 {avg}%',
      scoopingWhileWatched: '失败：学生盯着你时打菜',
      shakingWhileWatched: '失败：学生盯着你时抖菜',
      deliveryTooLow: '失败：装盘仅 {percent}%（需≥40%）'
    },
    
    // 成功对话
    SUCCESS_MESSAGES: {
      normal: '谢谢阿姨',
      overServed: '阿姨打的真多，下次还来'
    },
    
    // 惊险提示
    NEAR_MISS_MESSAGES: {
      hadNearMiss: '可恶，就差一点点......',
      perfect: '完美表现，没有被发现！'
    },
    
    // 分数计算配置
    SCORING: {
      dropRateWeight: 0.4,      // 抖菜成功率权重
      successRateWeight: 0.4,   // 成功服务率权重
    },
    
    // 评级配置
    RATINGS: {
      SSS: { threshold: 0.9, color: '#ffd700' }, // 黄色
      SS: { threshold: 0.8, color: '#ffd700' },  // 黄色
      S: { threshold: 0.7, color: '#ffd700' },   // 黄色
      A: { threshold: 0.6, color: '#4caf50' },
      B: { threshold: 0.5, color: '#2196f3' },
      C: { threshold: 0.3, color: '#ff9800' },
      F: { threshold: 0, color: '#f44336' }
    },
    
    // 学生配置
    STUDENT: {
      patienceBaseRange: [0.9, 1.1],     // 耐心基础倍率范围
      patienceBaseTime: 8,                // 基础等待时间（秒）
      patiencePerScoop: 3,                // 每勺菜给予的耐心时间（秒）
      attentionToggleRange: [2, 5],       // 注意力切换间隔（秒）
      attentionSpeedRange: [0.18, 0.34],  // 盯着时速度范围
      distractionSpeedRange: [0.22, 0.4], // 转头时速度范围
      attentionMultiplier: 1.9,           // 盯着时耐心衰减倍率
      distractionMultiplier: 0.75,        // 转头时耐心衰减倍率
      needScoopsRange: [1, 6]             // 需求勺数范围
    },
    
    // 干部配置
    INSPECTOR: {
      appearChance: 0.5,                  // 出现概率（提高到30%）
      appearIntervalRange: [5, 10],       // 出现间隔范围（秒）（缩短间隔）
      stayDuration: 4,                    // 停留时间（秒）
      speed: 120,                         // 移动速度
      stopPosition: -0.5                   // 停留位置（画面宽度比例）
    },
    
    // 经济配置
    ECONOMY: {
      basePricePerScoop: 10,              // 每勺基础价格
      penaltyPerExcessScoop: 10           // 多余勺数罚款
    },
    
    // 抖菜配置
    SHAKING: {
      speedThreshold: 300,                // 抖动速度阈值
      minDrop: 0.05,                      // 最小掉菜量（5%）
      maxDrop: 0.30,                      // 最大掉菜量（30%）
      directionThreshold: 60              // 方向检测阈值
    }
  };

  // ========== 游戏元素统一配置区域  ==========
  // 所有游戏元素的位置、大小、长宽等信息统一管理
  const GAME_ELEMENTS_CONFIG = {
    // 画布和屏幕配置
    CANVAS: {
      width: 540,                    // 画布宽度
      height: 960,                   // 画布高度
      aspectRatio: 9/16              // 宽高比
    },

    // 勺子元素配置
    SPOON: {
      // 位置配置
      initialX: 0.5,                 // 初始X位置（屏幕宽度比例）
      initialY: 0.6,                 // 初始Y位置（屏幕高度比例）
      
      // 大小配置
      radius: 22,                    // 勺子半径
      imageWidth: 44,                // 勺子图片宽度（radius * 2）
      imageHeight: 44,               // 勺子图片高度（radius * 2）
      scale: 10.0,                    // 勺子缩放比例
      
      // 物理配置
      maxSpeed: 400,                 // 最大移动速度
      acceleration: 800,             // 加速度
      friction: 0.85,                // 摩擦力
      
      // 视觉配置
      color: '#b0bec5',              // 勺子颜色
      fillColor: '#ffeb3b',          // 填充颜色
      fillAlpha: 0.3                 // 填充透明度
    },

    // 菜盆元素配置
    POT: {
      // 位置配置
      x: 0.6,                        // X位置（屏幕宽度比例）
      y: 0.65,                       // Y位置（屏幕高度比例）
      
      // 大小配置
      width: 128*3,                    // 宽度
      height: 256*3,                    // 高度
      
      // 功能配置
      shakeZoneOffset: 12,           // 抖菜判定区域偏移
      
      // 视觉配置
      mainColor: '#7b3f00',          // 主颜色
      innerColor: '#a65e2e',         // 内部颜色
      innerOffset: 6,                // 内部偏移
      innerHeightOffset: 20,         // 内部高度偏移
      innerWidthOffset: 12,          // 内部宽度偏移
      innerHeightReduction: 26       // 内部高度减少
    },

    // 盘子元素配置
    PLATE: {
      // 位置配置
      x: 0.1,                        // X位置（屏幕宽度比例）
      y: 0.5,                        // Y位置（屏幕高度比例）
      
      // 大小配置
      width: 248*2,                    // 宽度
      height: 248*2,                   // 高度
      
      // 偏移配置
      offsetX: -70, 
      offsetY: -100,                 // 相对于中心的X偏移（width/2）
      
      // 视觉配置
      color: '#cfd8dc',              // 盘子颜色（备用，当图片加载失败时使用）
      
      // 拖拽配置
      dragOffsetX: 0,                // 拖拽X偏移
      dragOffsetY: 0,                // 拖拽Y偏移
      dragSpeed: 300,                // 拖拽速度
      
      // 拖拽边界配置
      dragMinX: 0,                   // 拖拽最小X位置
      dragMaxX: 0,                   // 拖拽最大X位置（相对于屏幕宽度，0表示W - plate.w）
      dragMinY: 0,                   // 拖拽最小Y位置
      dragMaxY: 0,                   // 拖拽最大Y位置（相对于屏幕高度，0表示H - plate.h）
      
      // 交付后配置
      disappearX: -1000,             // 交付后X位置（屏幕外）
      disappearY: -1000,             // 交付后Y位置（屏幕外）
      
      // 盘子图片配置
      images: {
        empty: 'img/plate_empty.png',    // 空盘子图片
        less: 'img/plate_less.png',      // 少菜盘子图片（≤2勺）
        more: 'img/plate_more.png'       // 多菜盘子图片（>2勺）
      }
    },

    // 学生元素配置
    STUDENT: {
      // 位置配置
      initialX: -200,                // 初始X位置（屏幕外）
      y: 0.8,                        // Y位置（屏幕高度比例）
      targetX: 0.3,                  // 目标X位置（屏幕宽度比例）
      
      // 大小配置
      width: 110*4,                     // 宽度
      height: 110*4,                   // 高度
      
      // 移动配置
      speed: 160,                    // 移动速度
      leaveSpeed: 200,               // 离开速度
      
      // 耐心条配置
      patienceBarWidth: 60,          // 耐心条宽度
      patienceBarHeight: 8,          // 耐心条高度
      patienceBarOffsetY: -15,       // 耐心条Y偏移
      patienceBarColor: '#4caf50',   // 耐心条颜色
      patienceBarBgColor: '#e0e0e0', // 耐心条背景色
      
      // 提示气泡配置
      bubbleWidth: 100,              // 气泡宽度
      bubbleHeight: 30,              // 气泡高度
      bubbleOffsetY: -40,            // 气泡Y偏移
      bubbleColor: '#fff',           // 气泡颜色
      bubbleBorderColor: '#333',     // 气泡边框颜色
      bubbleTextColor: '#333',       // 气泡文字颜色
      bubbleFontSize: 12,            // 气泡字体大小
      
      // 成功语配置
      thanksTextOffsetY: 22,         // 感谢语Y偏移
      thanksTextColor: '#333',       // 感谢语颜色
      thanksTextFontSize: 14         // 感谢语字体大小
    },

    // 干部元素配置
    INSPECTOR: {
      // 位置配置
      initialX: 0,                 // 初始X位置
      y: 0.8,                        // Y位置（屏幕高度比例）
      stopPosition: 0.4,             // 停留位置（屏幕宽度比例）
      
      // 大小配置
      width: 110*4,                     // 宽度
      height: 110*4,                   // 高度
      
      // 移动配置
      speed: 120,                    // 移动速度
      
      // 视觉配置
      color: '#8e24aa'               // 干部颜色
    },

    // 交付区域配置
    DELIVERY_ZONE: {
      // 位置配置
      offsetX: -84,                  // 相对于学生X的偏移（与盘子宽度匹配）
      y: 0.6,                        // Y位置（屏幕高度比例）
      yOffset: -22,                  // Y偏移
      
      // 大小配置
      width: 168,                    // 宽度（与盘子宽度匹配）
      height: 248,                   // 高度（与盘子高度匹配）
      
      // 视觉配置
      color: 'rgba(76, 175, 80, 0.3)', // 交付区域颜色
      borderColor: '#4caf50',        // 边框颜色
      borderWidth: 2                 // 边框宽度
    },

    // 背景区域配置
    BACKGROUND: {
      // 柜台区域配置
      counterAreaY: 0.6,             // 柜台区域Y位置（屏幕高度比例）
      counterAreaHeight: 0.4,        // 柜台区域高度（屏幕高度比例）
      counterAreaColor: 'rgba(22, 32, 43, 0.3)', // 柜台区域颜色
      
      // 背景图片配置
      bg1Path: 'img/bg_1.jpg',       // 背景图片1路径
      bg2Path: 'img/bg_2.png'        // 背景图片2路径
    },

    // UI元素配置
    UI: {
      // HUD配置
      hudPadding: 20,                // HUD内边距
      hudFontSize: 16,               // HUD字体大小
      hudColor: '#fff',              // HUD文字颜色
      
      // 提示文字配置
      promptFontSize: 18,            // 提示文字字体大小
      promptColor: '#ffeb3b',        // 提示文字颜色
      promptOffsetY: -30,            // 提示文字Y偏移
      
      // 教程配置
      tutorialPromptOffsetX: 0,      // 教程提示X偏移
      tutorialPromptOffsetY: -50     // 教程提示Y偏移
    }
  };
  // ========== 游戏元素统一配置区域结束 ==========
  // ========== 配置区域结束 ==========

  // Game state
  const game = {
    running: true,
    overReason: '',
    time: 0,
    income: 0,
    state: 'start', // start | tutorial | playing | failing | over
    failUntil: 0,
    failureType: '', // 'student' | 'inspector' - 失败类型
    // 回合计时（累计用 game.time，剩余用 roundRemaining）
    roundRemaining: 0,
    stats: {
      totalShakes: 0,
      totalDropped: 0,
      successCount: 0,
      closestNearMiss: 999, // 最近一次差点被发现的时间
      lastShakeTime: 0,
    }
  };

  // ========== 音频资源与状态 ==========
  const audio = {
    music: null,
    sfx: {
      fail: null,
      success: null,
      talking: null
    },
    ui: {
      musicEnabled: CONFIG.AUDIO.enabled.music,
      sfxEnabled: CONFIG.AUDIO.enabled.sfx,
      musicVolume: CONFIG.AUDIO.initialVolume.music,
      sfxVolume: CONFIG.AUDIO.initialVolume.sfx
    }
  };

  // 新手引导状态
  const tutorial = {
    isActive: false,
    currentStep: 1,
    completedSteps: {
      step1: false, // 成功舀菜
      step2: false, // 成功抖菜
      step3: false, // 第三步完成
      step4: false, // 第四步完成
      step5: false, // 第五步完成
      step6: false, // 第六步完成
      step7: false, // 第七步完成
      step8: false  // 第八步完成
    },
    showModal: false,
    modalData: null
  };

  // Utility
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const randRange = (a, b) => a + Math.random() * (b - a);

  // Spoon
  const spoon = {
    x: W * GAME_ELEMENTS_CONFIG.SPOON.initialX,
    y: H * GAME_ELEMENTS_CONFIG.SPOON.initialY,
    radius: GAME_ELEMENTS_CONFIG.SPOON.radius,
    isScooped: false,
    fillAmount: 0,
    lastX: null,
    lastY: null,
    lastShakeT: 0,
    lastHorizDir: 0, // -1 左，1 右
    // 勺子状态跟踪
    isInPot: false,        // 是否在菜盆区域
    isShaking: false,      // 是否正在抖菜
    shakeDirection: 0,     // 抖菜方向：-1左，1右，0无
    currentImage: 'standbyEmpty', // 当前显示的图片
    lastDropPercent: 0,    // 最近一次抖掉的百分比（0-100）
    lastDropUntil: 0,      // 显示该百分比的截止时间
    // 舀菜状态跟踪
    scoopingState: 'idle', // idle | pouring | filled
    scoopingUntil: 0,      // 舀菜动作结束时间
    // 倒菜状态跟踪
    pouringState: 'idle',  // idle | pouring | empty
    pouringUntil: 0,       // 倒菜动作结束时间
    // 抖菜状态跟踪
    shakeStartTime: 0,     // 抖菜开始时间
    shakeLeftDone: false,  // 是否完成左甩
    shakeRightDone: false, // 是否完成右甩
    shakeMinX: 0,          // 抖菜过程中的最小X位置
    shakeMaxX: 0,          // 抖菜过程中的最大X位置
    shakeRange: 0          // 抖菜移动范围
  };

  // Food pot and plate and student
  const pot = { 
    x: W * LAYOUT_CONFIG.POT.x - LAYOUT_CONFIG.POT.width / 2, 
    y: H * LAYOUT_CONFIG.POT.y, 
    w: LAYOUT_CONFIG.POT.width, 
    h: LAYOUT_CONFIG.POT.height 
  };
  const plate = { 
    x: W * LAYOUT_CONFIG.PLATE.x + (LAYOUT_CONFIG.PLATE.offsetX || 0), 
    y: H * LAYOUT_CONFIG.PLATE.y + (LAYOUT_CONFIG.PLATE.offsetY || 0), 
    w: LAYOUT_CONFIG.PLATE.width, 
    h: LAYOUT_CONFIG.PLATE.height 
  };
  // 可拖动餐盘属性
  const plateDrag = { x: plate.x, y: plate.y, dragging: false, offsetX: 0, offsetY: 0, taken: false, initialized: true };
  // 抖菜判定更严格：在锅内圈范围才算（避免离开后误判）
  const potShakeZone = { 
    x: pot.x + LAYOUT_CONFIG.POT.shakeZoneOffset, 
    y: pot.y + LAYOUT_CONFIG.POT.shakeZoneOffset, 
    w: pot.w - LAYOUT_CONFIG.POT.shakeZoneOffset * 2, 
    h: pot.h - LAYOUT_CONFIG.POT.shakeZoneOffset * 2 
  };

  const student = {
    x: GAME_ELEMENTS_CONFIG.STUDENT.initialX,
    y: H * GAME_ELEMENTS_CONFIG.STUDENT.y,
    w: GAME_ELEMENTS_CONFIG.STUDENT.width,
    h: GAME_ELEMENTS_CONFIG.STUDENT.height,
    patience: randRange(0.3, 0.7), // 初始警惕条随机
    patienceIncreasePerSec: 0.22, // 被盯着时增长(变红) - 将在切换时重随机
    patienceDecreasePerSec: 0.28, // 转头时减少(变绿) - 将在切换时重随机
    attentionState: 'looking', // or 'distracted'
    nextToggleT: 0,
    state: 'entering', // entering -> ordering -> waiting -> thanking -> leaving
    targetX: W * GAME_ELEMENTS_CONFIG.STUDENT.targetX,
    speed: GAME_ELEMENTS_CONFIG.STUDENT.speed,
    needScoops: 0,
    orderingUntil: 0,
    deliveredScoops: 0,
    deliveredTotalFill: 0,
    thanksUntil: 0,
    deliveryPatience: 0, // 交付耐心值（秒）
    deliveryPatienceMax: 0, // 最大交付耐心值
    overServed: false,
  };

  // Inspector (干部)
  const inspector = {
    x: GAME_ELEMENTS_CONFIG.INSPECTOR.initialX,
    y: H * GAME_ELEMENTS_CONFIG.INSPECTOR.y - GAME_ELEMENTS_CONFIG.INSPECTOR.height,
    w: GAME_ELEMENTS_CONFIG.INSPECTOR.width,
    h: GAME_ELEMENTS_CONFIG.INSPECTOR.height,
    speed: CONFIG.INSPECTOR.speed,
    dir: 1,
    isActive: false,
    nextAppearT: 2,
    duration: 3,
    vanishT: 0,
    phase: 'idle', // idle | entering | waiting | leaving
    stopX: W * GAME_ELEMENTS_CONFIG.INSPECTOR.stopPosition,
    waitUntil: 0,
    // 学生干部状态跟踪
    currentImage: 'standby', // standby | walking | angry
    angryUntil: 0, // 愤怒状态结束时间
  };

  // Mouse handling
  const pointer = { x: spoon.x, y: spoon.y, isDown: false, grabSpoon: false };
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (e.clientX - rect.left) * (canvas.width / rect.width);
    pointer.y = (e.clientY - rect.top) * (canvas.height / rect.height);
  });
  canvas.addEventListener('mousedown', (e) => { 
    pointer.isDown = true; 
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // 检查是否点击了"再来一局"按钮
    if (game.state === 'over') {
      const buttonW = 120, buttonH = 40;
      const buttonX = W/2 - buttonW/2;
      const buttonY = H/2 + 180; // 与渲染位置保持一致
      if (mx >= buttonX && mx <= buttonX + buttonW && my >= buttonY && my <= buttonY + buttonH) {
        reset();
        startGame(); // 直接开始游戏，跳过教程
        return;
      }
    }
    
    // 优先：命中勺子点击遮罩则抓勺子，不触发其他交互
    const spoonClickConfig = COLLISION_CONFIG.spoonClick;
    const spoonClickX = spoon.x + spoonClickConfig.offsetX;
    const spoonClickY = spoon.y + spoonClickConfig.offsetY;
    pointer.grabSpoon = (mx >= spoonClickX && mx <= spoonClickX + spoonClickConfig.width && 
                       my >= spoonClickY && my <= spoonClickY + spoonClickConfig.height);
    // 否则判断是否拖盘
    if (!pointer.grabSpoon && !plateDrag.taken && mx >= plateDrag.x && mx <= plateDrag.x + plate.w && my >= plateDrag.y && my <= plateDrag.y + plate.h) {
      plateDrag.dragging = true;
      plateDrag.offsetX = mx - plateDrag.x;
      plateDrag.offsetY = my - plateDrag.y;
    }
  });
  canvas.addEventListener('mouseup', () => { 
    pointer.isDown = false; 
    pointer.grabSpoon = false;
    plateDrag.dragging = false;
  });
  canvas.addEventListener('mouseleave', () => { pointer.isDown = false; });

  // 获取DOM元素
  const startScreen = document.getElementById('startScreen');
  const gameScreen = document.getElementById('gameScreen');
  const startUI = document.getElementById('startUI');
  const earningsAmount = document.getElementById('earningsAmount');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const musicToggle = document.getElementById('musicToggle');
  const sfxToggle = document.getElementById('sfxToggle');
  const musicVolume = document.getElementById('musicVolume');
  const sfxVolume = document.getElementById('sfxVolume');
  
  // 新手引导弹窗元素
  const tutorialModal = document.getElementById('tutorialModal');
  const tutorialTitle = document.getElementById('tutorialTitle');
  const tutorialMessage = document.getElementById('tutorialMessage');
  const tutorialMessages = document.getElementById('tutorialMessages');
  const tutorialImage = document.getElementById('tutorialImage');
  const tutorialButton = document.getElementById('tutorialButton');
  const skipTutorialBtn = document.getElementById('skipTutorialBtn');

  // 使用配置文件更新界面文字

  // 应用开始按钮配置
  function applyStartButtonConfig() {
    const config = START_BUTTON_CONFIG;
    startUI.style.width = config.width + 'px';
    startUI.style.height = config.height + 'px';
    startUI.style.backgroundImage = `url('${config.backgroundImage}')`;
    startUI.style.backgroundSize = config.backgroundSize;
    startUI.style.backgroundRepeat = config.backgroundRepeat;
    startUI.style.backgroundPosition = config.backgroundPosition;
    startUI.style.cursor = config.cursor;
    startUI.style.transition = config.transition;
    
    // 应用位置坐标
    if (config.position) {
      startUI.style.position = 'absolute';
      startUI.style.left = config.position.x + 'px';
      startUI.style.top = config.position.y + 'px';
      startUI.style.transform = 'none'; // 清除默认的居中变换
    }
  }

  // 事件监听器
  startUI.addEventListener('click', handleStartUIClick);
  
  // 开始按钮悬停和点击效果
  startUI.addEventListener('mouseenter', () => {
    const config = START_BUTTON_CONFIG;
    startUI.style.transform = `scale(${config.hoverScale})`;
  });
  
  startUI.addEventListener('mouseleave', () => {
    startUI.style.transform = 'scale(1)';
  });
  
  startUI.addEventListener('mousedown', () => {
    const config = START_BUTTON_CONFIG;
    startUI.style.transform = `scale(${config.activeScale})`;
  });
  
  startUI.addEventListener('mouseup', () => {
    const config = START_BUTTON_CONFIG;
    startUI.style.transform = `scale(${config.hoverScale})`;
  });
  // 设置按钮与面板
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      const show = settingsPanel.style.display !== 'block';
      settingsPanel.style.display = show ? 'block' : 'none';
    });
  }
  if (musicToggle) {
    musicToggle.checked = audio.ui.musicEnabled;
    musicToggle.addEventListener('change', () => {
      audio.ui.musicEnabled = musicToggle.checked;
      if (audio.ui.musicEnabled) playMusic(); else stopMusic();
    });
  }
  if (sfxToggle) {
    sfxToggle.checked = audio.ui.sfxEnabled;
    sfxToggle.addEventListener('change', () => {
      audio.ui.sfxEnabled = sfxToggle.checked;
    });
  }
  if (musicVolume) {
    musicVolume.value = String(CONFIG.AUDIO.settingsSlider.music);
    musicVolume.addEventListener('input', () => setMusicVolume(parseFloat(musicVolume.value)));
  }
  if (sfxVolume) {
    sfxVolume.value = String(CONFIG.AUDIO.settingsSlider.sfx);
    sfxVolume.addEventListener('input', () => setSfxVolume(parseFloat(sfxVolume.value)));
  }
  
  // 新手引导弹窗按钮事件（通用推进当前步骤）
  tutorialButton.addEventListener('click', () => {
    if (!tutorial.isActive || !tutorial.showModal) return;
    completeTutorialStep(tutorial.currentStep);
  });
  
  // 跳过教程按钮事件
  skipTutorialBtn.addEventListener('click', () => {
    endTutorial();
  });

  function reset() {
    game.running = true;
    game.overReason = '';
    game.time = 0;
    game.income = 0;
    game.state = 'start';
    game.roundRemaining = CONFIG.ROUND.durationSec;
    gameScreen.classList.remove('game-over'); // 移除CSS类，恢复外快UI显示
    game.stats = { totalShakes: 0, totalDropped: 0, successCount: 0, closestNearMiss: 999, lastShakeTime: 0 };
    spoon.x = W * GAME_ELEMENTS_CONFIG.SPOON.initialX; spoon.y = H * GAME_ELEMENTS_CONFIG.SPOON.initialY; spoon.isScooped = false; spoon.fillAmount = 0; spoon.lastX = null; spoon.lastY = null; spoon.lastShakeT = 0; spoon.scoopingState = 'idle'; spoon.scoopingUntil = 0; spoon.pouringState = 'idle'; spoon.pouringUntil = 0;
    student.patience = randRange(0.3, 0.7); student.attentionState = 'looking'; student.nextToggleT = randRange(CONFIG.STUDENT.attentionToggleRange[0], CONFIG.STUDENT.attentionToggleRange[1]);
    // 随机化增长/减少速率（警惕度）
    student.patienceIncreasePerSec = randRange(CONFIG.STUDENT.attentionSpeedRange[0], CONFIG.STUDENT.attentionSpeedRange[1]);
    student.patienceDecreasePerSec = randRange(CONFIG.STUDENT.distractionSpeedRange[0], CONFIG.STUDENT.distractionSpeedRange[1]);
    inspector.x = GAME_ELEMENTS_CONFIG.INSPECTOR.initialX; inspector.y = H * GAME_ELEMENTS_CONFIG.INSPECTOR.y - GAME_ELEMENTS_CONFIG.INSPECTOR.height; inspector.dir = 1; inspector.isActive = false; inspector.nextAppearT = 2; inspector.vanishT = 0; inspector.currentImage = 'standby'; inspector.angryUntil = 0;
    plateDrag.x = plate.x; plateDrag.y = plate.y; plateDrag.dragging = false; plateDrag.taken = false; plateFill.total = 0; plateFill.scoops = 0;
    student.x = GAME_ELEMENTS_CONFIG.STUDENT.initialX; student.state = 'entering'; student.needScoops = Math.floor(randRange(CONFIG.STUDENT.needScoopsRange[0], CONFIG.STUDENT.needScoopsRange[1])); student.deliveredScoops = 0; student.deliveredTotalFill = 0; student.targetX = W * GAME_ELEMENTS_CONFIG.STUDENT.targetX; student.deliveryPatience = 0; student.deliveryPatienceMax = 0;
    
    // 重置新手引导状态
    tutorial.isActive = false;
    tutorial.currentStep = 1;
    tutorial.completedSteps = { step1: false, step2: false, step3: false, step4: false, step5: false, step6: false, step7: false, step8: false };
    tutorial.showModal = false;
    tutorial.modalData = null;
    hideTutorialModal();
    
    // 重置时显示开始界面
    showStartScreen();
  }

  function showStartScreen() {
    startScreen.style.display = 'flex';
    gameScreen.style.display = 'none';
    game.state = 'start';
  }

  function handleStartUIClick() {
    // 点击开始按钮时先尝试播放背景音乐（用户交互后允许自动播放）
    playMusic();
    // 直接开始游戏
    startTutorial();
  }

  function showGameScreen() {
    startScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
  }

  function startGame() {
    showGameScreen();
    game.state = 'playing';
    // 回合时间复位
    game.time = 0;
    game.roundRemaining = CONFIG.ROUND.durationSec;
    
    // 正式进入游戏时清零菜量
    spoon.isScooped = false;
    spoon.fillAmount = 0;
    spoon.scoopingState = 'idle';
    spoon.scoopingUntil = 0;
    spoon.pouringState = 'idle';
    spoon.pouringUntil = 0;
    plateFill.total = 0;
    plateFill.scoops = 0;
    // 背景音乐已在handleStartUIClick中播放
  }

  // 新手引导相关函数
  function startTutorial() {
    tutorial.isActive = true;
    tutorial.currentStep = 1;
    tutorial.completedSteps = { step1: false, step2: false, step3: false, step4: false, step5: false, step6: false, step7: false, step8: false };
    tutorial.showModal = false;
    tutorial.modalData = null;
    showGameScreen();
    game.state = 'tutorial'; // 进入教程模式
    // 教程模式下也初始化倒计时显示
    game.time = 0;
    game.roundRemaining = CONFIG.ROUND.durationSec;
    // 背景音乐已在handleStartUIClick中播放
  }

  function completeTutorialStep(step) {
    tutorial.completedSteps[`step${step}`] = true;
    
    if (step === 1) {
      // 第一步完成，进入第二步
      tutorial.currentStep = 2;
    } else if (step === 2) {
      // 第二步完成，显示第三步弹窗
      tutorial.currentStep = 3;
      showTutorialModal(3);
    } else if (step === 3) {
      // 第三步完成，显示第四步弹窗
      tutorial.currentStep = 4;
      showTutorialModal(4);
    } else if (step === 4) {
      // 第四步完成，显示第五步
      tutorial.currentStep = 5;
      showTutorialModal(5);
    } else if (step === 5) {
      tutorial.currentStep = 6;
      showTutorialModal(6);
    } else if (step === 6) {
      tutorial.currentStep = 7;
      showTutorialModal(7);
    } else if (step === 7) {
      tutorial.currentStep = 8;
      showTutorialModal(8);
    } else if (step === 8) {
      // 结束引导
      endTutorial();
    }
  }

  function showTutorialModal(step) {
    tutorial.showModal = true;
    tutorial.modalData = TUTORIAL_CONFIG[`step${step}`];
    
    // 更新弹窗内容
    tutorialTitle.textContent = tutorial.modalData.title;
    // 单段老式 message 清理
    tutorialMessage.textContent = '';
    tutorialMessage.style.display = 'none';
    // 多段 messages 渲染
    if (tutorialMessages) {
      tutorialMessages.innerHTML = '';
      const msgs = tutorial.modalData.messages;
      if (Array.isArray(msgs) && msgs.length > 0) {
        msgs.forEach(txt => {
          const p = document.createElement('p');
          p.textContent = txt;
          tutorialMessages.appendChild(p);
        });
      } else if (tutorial.modalData.message) {
        // 兼容旧字段
        const p = document.createElement('p');
        p.textContent = tutorial.modalData.message;
        tutorialMessages.appendChild(p);
      }
    }
    // 图片
    if (tutorialImage) {
      if (tutorial.modalData.image) {
        tutorialImage.src = tutorial.modalData.image;
        tutorialImage.style.display = 'block';
      } else {
        tutorialImage.style.display = 'none';
        tutorialImage.removeAttribute('src');
      }
    }
    tutorialButton.textContent = tutorial.modalData.buttonText || '继续';
    
    // 显示弹窗
    tutorialModal.style.display = 'flex';
  }

  function hideTutorialModal() {
    tutorial.showModal = false;
    tutorial.modalData = null;
    tutorialModal.style.display = 'none';
  }

  function endTutorial() {
    tutorial.isActive = false;
    tutorial.currentStep = 1;
    hideTutorialModal();
    // 教程结束后进入正式游戏
    game.state = 'playing';
    // 回合时间复位
    game.time = 0;
    game.roundRemaining = CONFIG.ROUND.durationSec;
    // 正式游戏开始时重置外快分数，教学关卡的外快分数不保留
    game.income = 0;
    
    // 教程结束后清零菜量
    spoon.isScooped = false;
    spoon.fillAmount = 0;
    spoon.scoopingState = 'idle';
    spoon.scoopingUntil = 0;
    spoon.pouringState = 'idle';
    spoon.pouringUntil = 0;
    plateFill.total = 0;
    plateFill.scoops = 0;
    // 背景音乐已在handleStartUIClick中播放
  }

  function checkTutorialProgress() {
    if (!tutorial.isActive) return;

    // 检查第一步：成功舀菜
    if (tutorial.currentStep === 1 && spoon.isScooped && !tutorial.completedSteps.step1) {
      completeTutorialStep(1);
    }

    // 检查第二步：成功抖菜
    if (tutorial.currentStep === 2 && game.stats.totalShakes > 0 && !tutorial.completedSteps.step2) {
      completeTutorialStep(2);
    }
  }

  // 盘子内累计的菜量（本轮）
  const plateFill = { total: 0, scoops: 0 };

  // 外快收入浮动提示
  const floatTips = [];

  // 背景图片
  const backgroundImages = {
    bg1: null,
    bg2: null
  };

  // 学生图片
  const studentImages = {
    walking: null,
    standby: null,
    watchingYou: null,
    watchingPhone: null,
    happy: null,
    angry: null
  };

  // 盘子图片
  const plateImages = {
    empty: null,
    less: null,
    more: null
  };

  // 勺子图片
  const spoonImages = {
    standbyEmpty: null,
    pourEmpty: null,
    standbyMore: null,
    pourFull: null,
    standbyLess: null
  };

  // 学生干部图片
  const inspectorImages = {
    standby: null,
    walking: null,
    angry: null
  };

  // 学生角色配置
  const STUDENT_ROLES_CONFIG = {
    student1: {
      name: '学生1',
      images: {
        walking: 'img/student1_walking.png',
        standby: 'img/student1_standby.png',
        watchingYou: 'img/student1_watching you.png',
        watchingPhone: 'img/student1_wantching phone.png',
        happy: 'img/student1_happy.png',
        angry: 'img/student1_angry.png'
      }
    },
    student2: {
      name: '学生2',
      images: {
        walking: 'img/student2_walking.png',
        standby: 'img/student2_standby.png',
        watchingYou: 'img/student2_watching you.png',
        watchingPhone: 'img/student2_wantching phone.png',
        happy: 'img/student2_happy.png',
        angry: 'img/student2_angry.png'
      }
    }
    // 可以继续添加更多学生角色
  };

  // 当前使用的学生角色
  let currentStudentRole = 'student1';

  // 切换学生角色的函数
  function switchStudentRole(roleName) {
    if (STUDENT_ROLES_CONFIG[roleName]) {
      currentStudentRole = roleName;
      loadStudentImages(roleName);
      console.log(`切换到学生角色: ${STUDENT_ROLES_CONFIG[roleName].name}`);
    } else {
      console.warn(`学生角色 ${roleName} 不存在`);
    }
  }

  // 加载指定学生角色的图片
  function loadStudentImages(roleName = 'student1') {
    const roleConfig = STUDENT_ROLES_CONFIG[roleName];
    if (!roleConfig) return;
    
    // 加载对应角色的图片
    Object.entries(roleConfig.images).forEach(([key, path]) => {
      const img = new Image();
      img.onload = () => {
        studentImages[key] = img;
        console.log(`成功加载学生图片: ${path}`);
      };
      img.onerror = () => {
        console.warn(`Failed to load ${path}`);
      };
      img.src = path;
    });
  }

  // 添加新学生角色的函数
  function addStudentRole(roleName, roleConfig) {
    if (STUDENT_ROLES_CONFIG[roleName]) {
      console.warn(`学生角色 ${roleName} 已存在，将被覆盖`);
    }
    STUDENT_ROLES_CONFIG[roleName] = roleConfig;
    console.log(`成功添加学生角色: ${roleName}`);
  }

  // 获取所有可用的学生角色列表
  function getAvailableStudentRoles() {
    return Object.keys(STUDENT_ROLES_CONFIG);
  }

  // 加载背景图片和学生图片
  function loadBackgroundImages() {
    return new Promise((resolve) => {
      let loadedCount = 0;
      const totalImages = 19; // 2个背景图片 + 6个学生图片 + 3个盘子图片 + 5个勺子图片 + 3个学生干部图片

      // 加载背景图片1
      const bg1 = new Image();
      bg1.onload = () => {
        backgroundImages.bg1 = bg1;
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      bg1.onerror = () => {
        console.warn('Failed to load bg_1.jpg');
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      bg1.src = GAME_ELEMENTS_CONFIG.BACKGROUND.bg1Path;

      // 加载背景图片2
      const bg2 = new Image();
      bg2.onload = () => {
        backgroundImages.bg2 = bg2;
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      bg2.onerror = () => {
        console.warn('Failed to load bg_2.png');
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      bg2.src = GAME_ELEMENTS_CONFIG.BACKGROUND.bg2Path;

      // 使用新的学生角色系统加载图片
      const roleConfig = STUDENT_ROLES_CONFIG[currentStudentRole];
      if (roleConfig) {
        let studentImagesLoaded = 0;
        const totalStudentImages = Object.keys(roleConfig.images).length;
        
        Object.entries(roleConfig.images).forEach(([key, path]) => {
          const img = new Image();
          img.onload = () => {
            studentImages[key] = img;
            studentImagesLoaded++;
            loadedCount++;
            if (loadedCount === totalImages) resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load ${path}`);
            studentImagesLoaded++;
            loadedCount++;
            if (loadedCount === totalImages) resolve();
          };
          img.src = path;
        });
      } else {
        // 如果角色配置不存在，使用默认配置
        console.warn('学生角色配置不存在，使用默认配置');
        loadedCount += 6; // 跳过学生图片加载
        if (loadedCount === totalImages) resolve();
      }

      // 加载盘子空图片
      const plateEmpty = new Image();
      plateEmpty.onload = () => {
        plateImages.empty = plateEmpty;
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      plateEmpty.onerror = () => {
        console.warn('Failed to load plate_empty.png');
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      plateEmpty.src = GAME_ELEMENTS_CONFIG.PLATE.images.empty;

      // 加载盘子少菜图片
      const plateLess = new Image();
      plateLess.onload = () => {
        plateImages.less = plateLess;
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      plateLess.onerror = () => {
        console.warn('Failed to load plate_less.png');
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      plateLess.src = GAME_ELEMENTS_CONFIG.PLATE.images.less;

      // 加载盘子多菜图片
      const plateMore = new Image();
      plateMore.onload = () => {
        plateImages.more = plateMore;
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      plateMore.onerror = () => {
        console.warn('Failed to load plate_more.png');
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      plateMore.src = GAME_ELEMENTS_CONFIG.PLATE.images.more;

      // 加载勺子空状态图片
      const spoonStandbyEmpty = new Image();
      spoonStandbyEmpty.onload = () => {
        spoonImages.standbyEmpty = spoonStandbyEmpty;
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      spoonStandbyEmpty.onerror = () => {
        console.warn('Failed to load spoon_standby_empty.png');
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      spoonStandbyEmpty.src = SPOON_IMAGES_CONFIG.standbyEmpty;

      // 加载勺子舀菜空状态图片
      const spoonPourEmpty = new Image();
      spoonPourEmpty.onload = () => {
        spoonImages.pourEmpty = spoonPourEmpty;
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      spoonPourEmpty.onerror = () => {
        console.warn('Failed to load spoon_pour_empty.png');
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      spoonPourEmpty.src = SPOON_IMAGES_CONFIG.pourEmpty;

      // 加载勺子舀菜有菜状态图片
      const spoonStandbyMore = new Image();
      spoonStandbyMore.onload = () => {
        spoonImages.standbyMore = spoonStandbyMore;
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      spoonStandbyMore.onerror = () => {
        console.warn('Failed to load spoon_standby_more.png');
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      spoonStandbyMore.src = SPOON_IMAGES_CONFIG.standbyMore;

      // 加载勺子抖菜向左甩动图片
      const spoonPourFull = new Image();
      spoonPourFull.onload = () => {
        spoonImages.pourFull = spoonPourFull;
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      spoonPourFull.onerror = () => {
        console.warn('Failed to load spoon_pour_full.png');
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      spoonPourFull.src = SPOON_IMAGES_CONFIG.pourFull;

      // 加载勺子抖菜向右甩动图片
      const spoonStandbyLess = new Image();
      spoonStandbyLess.onload = () => {
        spoonImages.standbyLess = spoonStandbyLess;
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      spoonStandbyLess.onerror = () => {
        console.warn('Failed to load spoon_standby_less.png');
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      spoonStandbyLess.src = SPOON_IMAGES_CONFIG.standbyLess;

      // 加载学生干部待机图片
      const supervisorStandby = new Image();
      supervisorStandby.onload = () => {
        inspectorImages.standby = supervisorStandby;
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      supervisorStandby.onerror = () => {
        console.warn('Failed to load supervisor_standby.png');
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      supervisorStandby.src = 'img/supervisor_standby.png';

      // 加载学生干部行走图片
      const supervisorWalking = new Image();
      supervisorWalking.onload = () => {
        inspectorImages.walking = supervisorWalking;
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      supervisorWalking.onerror = () => {
        console.warn('Failed to load supervisor_walking.png');
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      supervisorWalking.src = 'img/supervisor_walking.png';

      // 加载学生干部愤怒图片
      const supervisorAngry = new Image();
      supervisorAngry.onload = () => {
        inspectorImages.angry = supervisorAngry;
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      supervisorAngry.onerror = () => {
        console.warn('Failed to load supervisor_angry.png');
        loadedCount++;
        if (loadedCount === totalImages) resolve();
      };
      supervisorAngry.src = 'img/supervisor_angry.png';
    });
  }

  function circleRectOverlap(cx, cy, r, rx, ry, rw, rh) {
    const closestX = clamp(cx, rx, rx + rw);
    const closestY = clamp(cy, ry, ry + rh);
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) <= r * r;
  }

  function rectIntersect(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  // 基于碰撞遮罩的碰撞检测函数
  function checkCollisionMaskOverlap(mask1, mask2) {
    // 检查两个矩形碰撞遮罩是否重叠
    if (mask1.type === 'rect' && mask2.type === 'rect') {
      return rectIntersect(
        mask1.x, mask1.y, mask1.width, mask1.height,
        mask2.x, mask2.y, mask2.width, mask2.height
      );
    }
    
    // 检查圆形与矩形碰撞遮罩是否重叠
    if (mask1.type === 'circle' && mask2.type === 'rect') {
      return circleRectOverlap(mask1.x, mask1.y, mask1.radius, mask2.x, mask2.y, mask2.width, mask2.height);
    }
    
    if (mask1.type === 'rect' && mask2.type === 'circle') {
      return circleRectOverlap(mask2.x, mask2.y, mask2.radius, mask1.x, mask1.y, mask1.width, mask1.height);
    }
    
    return false;
  }

  // 获取碰撞遮罩信息
  function getCollisionMask(element, config) {
    if (element === 'student') {
      return {
        type: 'rect',
        x: student.x + config.offsetX,
        y: student.y + config.offsetY,
        width: config.width,
        height: config.height
      };
    } else if (element === 'plate') {
      return {
        type: 'rect',
        x: plate.x + config.offsetX,
        y: plate.y + config.offsetY,
        width: config.width,
        height: config.height
      };
    } else if (element === 'spoon') {
      return {
        type: 'circle',
        x: spoon.x + config.offsetX,
        y: spoon.y + config.offsetY,
        radius: config.radius
      };
    } else if (element === 'pot') {
      return {
        type: 'rect',
        x: pot.x + config.offsetX,
        y: pot.y + config.offsetY,
        width: config.width,
        height: config.height
      };
    }
    return null;
  }

  // 更新学生干部状态和图片
  function updateInspectorState() {
    if (!inspector.isActive) return;
    
    // 根据状态确定当前图片
    if (inspector.angryUntil > 0) {
      // 愤怒状态
      inspector.currentImage = 'angry';
    } else if (inspector.phase === 'entering' || inspector.phase === 'leaving') {
      // 移动状态
      inspector.currentImage = 'walking';
    } else if (inspector.phase === 'waiting') {
      // 停止状态
      inspector.currentImage = 'standby';
    }
  }

  // 更新勺子状态和图片
  function updateSpoonState() {
    // 检查是否在菜盆区域
    spoon.isInPot = circleRectOverlap(spoon.x, spoon.y, spoon.radius, pot.x, pot.y, pot.w, pot.h);
    
    // 检查是否正在抖菜
    spoon.isShaking = spoon.isScooped && pointer.isDown && 
                     circleRectOverlap(spoon.x, spoon.y, spoon.radius, potShakeZone.x, potShakeZone.y, potShakeZone.w, potShakeZone.h);
    
    // 更新抖菜方向
    if (spoon.isShaking && spoon.lastHorizDir !== 0) {
      spoon.shakeDirection = spoon.lastHorizDir;
    } else if (!spoon.isShaking) {
      spoon.shakeDirection = 0;
    }
    
    // 舀菜状态机
    if (spoon.isInPot && pointer.isDown && !spoon.isScooped && spoon.scoopingState === 'idle') {
      // 开始舀菜：先播放pourEmpty
      spoon.scoopingState = 'pouring';
      spoon.scoopingUntil = game.time + 0.3; // 0.3秒后判断是否打上菜
    } else if (spoon.scoopingState === 'pouring' && game.time >= spoon.scoopingUntil) {
      // 0.3秒后判断是否打上菜，播放standbyMore
      spoon.scoopingState = 'filled';
      spoon.isScooped = true;
      spoon.fillAmount = 1.0;
    } else if (!spoon.isInPot || !pointer.isDown) {
      // 离开菜盆或松开时重置舀菜状态
      spoon.scoopingState = 'idle';
    }
    
    // 倒菜状态机
    if (spoon.pouringState === 'pouring' && game.time >= spoon.pouringUntil) {
      // 0.3秒后倒菜完成，显示空勺
      spoon.pouringState = 'empty';
      spoon.isScooped = false;
      spoon.fillAmount = 0;
    } else if (spoon.pouringState === 'empty') {
      // 倒菜完成后，重置为空闲状态，允许下次舀菜
      spoon.pouringState = 'idle';
    }
    
    // 根据状态确定当前图片
    if (spoon.pouringState === 'pouring') {
      // 倒菜中：播放pourFull
      spoon.currentImage = 'pourFull';
    } else if (spoon.pouringState === 'empty') {
      // 倒菜完成：播放standbyEmpty
      spoon.currentImage = 'standbyEmpty';
    } else if (spoon.isShaking) {
      // 抖菜状态
      if (spoon.fillAmount <= 0) {
        // 菜全部甩出
        spoon.currentImage = 'standbyEmpty';
      } else {
        // 还有菜：根据菜量和甩动方向显示
        if (spoon.shakeDirection === -1) {
          // 向左甩动：根据菜量显示
          spoon.currentImage = spoon.fillAmount >= 0.5 ? 'standbyMore' : 'standbyLess';
        } else {
          // 向右甩动：显示standbyLess
          spoon.currentImage = 'standbyLess';
        }
      }
    } else if (spoon.scoopingState === 'pouring') {
      // 舀菜中：播放pourEmpty
      spoon.currentImage = 'pourEmpty';
    } else if (spoon.scoopingState === 'filled' || (spoon.isInPot && pointer.isDown && spoon.isScooped)) {
      // 舀菜完成或有菜舀菜：播放standbyMore
      spoon.currentImage = 'standbyMore';
    } else {
      // 不在锅里：根据是否有菜显示相应形态，保持菜量视觉
      spoon.currentImage = (spoon.isScooped && spoon.fillAmount > 0) ? 'standbyMore' : 'standbyEmpty';
    }
  }

  function update(dt) {
    if (!game.running || (game.state !== 'playing' && game.state !== 'tutorial' && game.state !== 'failing')) return;
    game.time += dt;

    // 回合倒计时逻辑（仅在 playing 时递减）
    if (game.state === 'playing' && Number.isFinite(game.roundRemaining)) {
      const prev = game.roundRemaining;
      game.roundRemaining = Math.max(0, game.roundRemaining - dt);
      // 时间到：若未处于失败过渡，则直接进入结算
      if (prev > 0 && game.roundRemaining === 0 && game.state === 'playing') {
        game.overReason = '';
        game.state = 'over';
        game.running = false;
        gameScreen.classList.add('game-over'); // 添加CSS类隐藏外快UI
        return;
      }
    }
    // 教程模式下倒计时不递减，但保持显示

    // 测试控制台输出 - 游戏状态检查（每10秒输出一次）
    if (Math.floor(game.time) % 10 === 0 && game.time - Math.floor(game.time) < 0.1) {
      console.log('游戏状态检查:', {
        gameState: game.state,
        gameRunning: game.running,
        tutorialActive: tutorial.isActive,
        tutorialStep: tutorial.currentStep,
        gameTime: game.time
      });
    }

    // 检查新手引导进度
    checkTutorialProgress();

    // Follow pointer - 只有摁住时才移动
    if (pointer.isDown && pointer.grabSpoon) {
      const lerp = 0.4;
      spoon.x += (pointer.x - spoon.x) * lerp;
      spoon.y += (pointer.y - spoon.y) * lerp;
    } else {
      // 未按下时：勺子自动回到初始位置并清空内容
      const homeX = W * GAME_ELEMENTS_CONFIG.SPOON.initialX;
      const homeY = H * GAME_ELEMENTS_CONFIG.SPOON.initialY;
      const backLerp = 0.2;
      spoon.x += (homeX - spoon.x) * backLerp;
      spoon.y += (homeY - spoon.y) * backLerp;
      // 回到原位时清空勺内内容
      if (spoon.isScooped || spoon.fillAmount > 0) {
        spoon.isScooped = false;
        spoon.fillAmount = 0;
        spoon.scoopingState = 'idle';
        spoon.scoopingUntil = 0;
        spoon.pouringState = 'idle';
        spoon.pouringUntil = 0;
      }
    }

    // 更新勺子状态
    updateSpoonState();
    
    // 更新学生干部状态
    updateInspectorState();

    // 盘子拖动
    if (plateDrag.dragging && !plateDrag.taken) {
      const minX = GAME_ELEMENTS_CONFIG.PLATE.dragMinX;
      const maxX = GAME_ELEMENTS_CONFIG.PLATE.dragMaxX === 0 ? W - plate.w : GAME_ELEMENTS_CONFIG.PLATE.dragMaxX;
      const minY = GAME_ELEMENTS_CONFIG.PLATE.dragMinY;
      const maxY = GAME_ELEMENTS_CONFIG.PLATE.dragMaxY === 0 ? H - plate.h : GAME_ELEMENTS_CONFIG.PLATE.dragMaxY;
      
      plateDrag.x = clamp(pointer.x - plateDrag.offsetX, minX, maxX);
      plateDrag.y = clamp(pointer.y - plateDrag.offsetY, minY, maxY);
    } else if (!plateDrag.dragging && !plateDrag.taken) {
      // 盘子不在拖拽状态且未被拿走时，回到固定位置
      if (!plateDrag.initialized) {
        plateDrag.x = W * LAYOUT_CONFIG.PLATE.x + (LAYOUT_CONFIG.PLATE.offsetX || 0);
        plateDrag.y = H * LAYOUT_CONFIG.PLATE.y + (LAYOUT_CONFIG.PLATE.offsetY || 0);
        plateDrag.initialized = true;
      }
    }
    // plate绘制位置驱动逻辑层的 plate 碰撞区域
    if (!plateDrag.taken) {
      plate.x = plateDrag.x; 
      plate.y = plateDrag.y;
    }

    // Student进场/离场与等待 (仅在正式游戏模式下)
    if (game.state === 'playing') {
      if (student.state === 'entering') {
        student.x += student.speed * dt;
        if (student.x >= student.targetX) { 
          student.x = student.targetX; 
          // 到位后先进入点菜阶段2秒
          student.state = 'ordering';
          student.orderingUntil = game.time + 2;
          student.attentionState = 'looking';
          student.nextToggleT = 0; // 点菜阶段不切换
          student.patienceIncreasePerSec = randRange(CONFIG.STUDENT.attentionSpeedRange[0], CONFIG.STUDENT.attentionSpeedRange[1]);
          student.patienceDecreasePerSec = randRange(CONFIG.STUDENT.distractionSpeedRange[0], CONFIG.STUDENT.distractionSpeedRange[1]);
          // 到达后才给出点单勺数
          student.needScoops = Math.floor(randRange(CONFIG.STUDENT.needScoopsRange[0], CONFIG.STUDENT.needScoopsRange[1]));
          // 初始化交付耐心值：每勺菜给3秒耐心时间
          student.deliveryPatienceMax = student.needScoops * CONFIG.STUDENT.patiencePerScoop;
          student.deliveryPatience = student.deliveryPatienceMax;
          // 播放点菜talking音效
          playSfx('talking');
          
          // 学生点菜时盘子出现
          plateDrag.taken = false;
          plateDrag.x = W * LAYOUT_CONFIG.PLATE.x + (LAYOUT_CONFIG.PLATE.offsetX || 0); 
          plateDrag.y = H * LAYOUT_CONFIG.PLATE.y + (LAYOUT_CONFIG.PLATE.offsetY || 0); 
          plate.x = plateDrag.x; 
          plate.y = plateDrag.y;
        }
      } else if (student.state === 'ordering') {
        // 2秒点菜阶段，显示standby形象，不进行注意力切换
        if (game.time >= student.orderingUntil) {
          student.state = 'waiting';
          // 点菜结束后开始随机切换注意力
          student.attentionState = 'looking';
          student.nextToggleT = game.time + randRange(CONFIG.STUDENT.attentionToggleRange[0], CONFIG.STUDENT.attentionToggleRange[1]);
          student.patienceIncreasePerSec = randRange(CONFIG.STUDENT.attentionSpeedRange[0], CONFIG.STUDENT.attentionSpeedRange[1]);
          student.patienceDecreasePerSec = randRange(CONFIG.STUDENT.distractionSpeedRange[0], CONFIG.STUDENT.distractionSpeedRange[1]);
        }
      } else if (student.state === 'thanking') {
        // 停留一小会儿说谢谢
        if (game.time >= student.thanksUntil) {
          student.state = 'leaving';
        }
      } else if (student.state === 'leaving') {
        student.x += student.speed * dt;
        if (student.x > W + 120) {
          // 下一位学生
          student.state = 'entering';
          student.x = -200;
          student.needScoops = 0;
          student.deliveredScoops = 0; student.deliveredTotalFill = 0;
          student.deliveryPatience = 0; student.deliveryPatienceMax = 0;
          plateFill.total = 0; plateFill.scoops = 0;
          // 盘子保持隐藏状态，等学生点菜时才出现
        }
      }

      // 交付耐心条：仅在等待状态下降低
      if (student.state === 'waiting') {
        student.deliveryPatience = clamp(student.deliveryPatience - dt, 0, student.deliveryPatienceMax);
        if (student.deliveryPatience <= 0) {
          lose(CONFIG.FAIL_MESSAGES.patienceTimeout);
        }
      }

      // Attention toggle every 2-5s randomly, and randomize vigilance speeds each time
      if (student.state === 'waiting' && game.time >= student.nextToggleT) {
        student.attentionState = student.attentionState === 'looking' ? 'distracted' : 'looking';
        student.nextToggleT = game.time + randRange(CONFIG.STUDENT.attentionToggleRange[0], CONFIG.STUDENT.attentionToggleRange[1]);
        student.patienceIncreasePerSec = randRange(CONFIG.STUDENT.attentionSpeedRange[0], CONFIG.STUDENT.attentionSpeedRange[1]);
        student.patienceDecreasePerSec = randRange(CONFIG.STUDENT.distractionSpeedRange[0], CONFIG.STUDENT.distractionSpeedRange[1]);
      }
    }

    // Inspector appear / move (仅在正式游戏模式下)
    if (game.state === 'playing') {
      // 测试控制台输出 - 学生干部状态检查
      if (Math.floor(game.time) % 5 === 0 && game.time - Math.floor(game.time) < 0.1) {
        console.log('学生干部状态检查:', {
          gameState: game.state,
          inspectorActive: inspector.isActive,
          inspectorPhase: inspector.phase,
          nextAppearT: inspector.nextAppearT,
          currentTime: game.time,
          timeUntilAppear: inspector.nextAppearT - game.time,
          appearChance: CONFIG.INSPECTOR.appearChance,
          appearInterval: CONFIG.INSPECTOR.appearIntervalRange
        });
      }
      
      if (!inspector.isActive && game.time >= inspector.nextAppearT) {
        console.log('学生干部出现检查 - 时间到了，检查概率...');
        // 10% 概率出现，否则延后下次检查时间
        if (Math.random() < CONFIG.INSPECTOR.appearChance) {
          console.log('学生干部出现！');
          inspector.isActive = true;
          inspector.phase = 'entering';
          inspector.x = -inspector.w; inspector.dir = 1;
        } else {
          console.log('学生干部未出现，延后下次检查');
          inspector.nextAppearT = game.time + randRange(CONFIG.INSPECTOR.appearIntervalRange[0], CONFIG.INSPECTOR.appearIntervalRange[1]);
        }
      }
      if (inspector.isActive) {
        if (inspector.phase === 'entering') {
          inspector.x += inspector.speed * dt;
          if (inspector.x >= inspector.stopX) {
            inspector.x = inspector.stopX;
            inspector.phase = 'waiting';
            inspector.waitUntil = game.time + CONFIG.INSPECTOR.stayDuration; // 停留时间
            console.log('学生干部到达停留位置，开始等待');
          }
        } else if (inspector.phase === 'waiting') {
          if (game.time >= inspector.waitUntil) {
            inspector.phase = 'leaving';
            inspector.dir = 1;
            console.log('学生干部等待结束，开始离开');
          }
        } else if (inspector.phase === 'leaving') {
          inspector.x += inspector.speed * dt;
          if (inspector.x > W + inspector.w) {
            console.log('学生干部离开完成');
            inspector.isActive = false;
            inspector.phase = 'idle';
            inspector.nextAppearT = game.time + randRange(CONFIG.INSPECTOR.appearIntervalRange[0], CONFIG.INSPECTOR.appearIntervalRange[1]);
          }
        }
      }
    }

    // 舀菜逻辑已移到 updateSpoonState() 中处理，这里不再需要

    // 倒菜逻辑已在 mouseup 里处理（需要松手）

    // 自动倒入：勺子碰撞遮罩与盘子碰撞遮罩重叠时自动提交（非空）
    if (spoon.isScooped && spoon.fillAmount > 0 && spoon.pouringState === 'idle') {
      const spoonMask = getCollisionMask('spoon', COLLISION_CONFIG.spoon);
      const plateMask = getCollisionMask('plate', COLLISION_CONFIG.plate);
      
      if (checkCollisionMaskOverlap(spoonMask, plateMask)) {
        // 开始倒菜：先播放pourFull（移除注意力限制，倒菜不受学生注意力影响）
        spoon.pouringState = 'pouring';
        spoon.pouringUntil = game.time + 0.3; // 0.3秒后倒菜完成
        plateFill.total += spoon.fillAmount;
        plateFill.scoops += 1;
        // 每倒一勺菜给3秒耐心时间
        if (student.state === 'waiting') {
          student.deliveryPatience = clamp(student.deliveryPatience + CONFIG.STUDENT.patiencePerScoop, 0, student.deliveryPatienceMax);
        }
      }
    }

    // 盘子与学生碰撞检测（仅在正式游戏模式下）
    if (game.state === 'playing') {
      // 检测盘子碰撞遮罩是否与学生碰撞遮罩重叠
      const plateMask = getCollisionMask('plate', COLLISION_CONFIG.plate);
      const studentMask = getCollisionMask('student', COLLISION_CONFIG.student);
      
      if (checkCollisionMaskOverlap(plateMask, studentMask) && student.state === 'waiting' && !plateDrag.taken && plateDrag.dragging) {
        const need = Math.max(1, student.needScoops);
        const percent = need > 0 ? (plateFill.total / need) : 0;
        const hasEnoughScoops = plateFill.scoops >= need;
        const hasEnoughPercent = percent >= 0.4;
        
        if (hasEnoughScoops && hasEnoughPercent) {
          // 成功：学生拿走盘子
          student.state = 'thanking';
          student.thanksUntil = game.time + 1.2;
          plateDrag.taken = true; // 盘子消失
          game.stats.successCount++;
          // 成功音效
          playSfx('success');
          
          // 根据勺数判断是否超出需求，并计算扣钱
          const needScoops = Math.max(1, student.needScoops);
          if (plateFill.scoops > needScoops) {
            student.overServed = true; // 超出需求
            // 计算超量扣钱：每勺10元
            const excessScoops = plateFill.scoops - needScoops;
            const penalty = excessScoops * CONFIG.ECONOMY.penaltyPerExcessScoop;
            game.income = Math.max(0, game.income - penalty); // 确保不会扣到负数
            
            // 显示扣钱提示 - 增强显示效果
            floatTips.push({ 
              x: student.x, 
              y: student.y - 50, 
              text: '-¥' + penalty.toFixed(0), 
              ttl: 3.0, // 显示更久
              vy: -15, 
              alpha: 1,
              color: '#ff0000', // 更鲜艳的红色
              fontSize: 24, // 更大的字体
              isPenalty: true // 标记为惩罚提示
            });
            
            console.log(`超量扣钱: 需要${needScoops}勺，实际${plateFill.scoops}勺，超量${excessScoops}勺，扣钱${penalty}元`);
          } else {
            student.overServed = false; // 刚好满足需求
          }
          
          // 盘子消失，等待下一个学生进来后再出现
          plateDrag.dragging = false;
          plateDrag.x = GAME_ELEMENTS_CONFIG.PLATE.disappearX;
          plateDrag.y = GAME_ELEMENTS_CONFIG.PLATE.disappearY;
          plate.x = plateDrag.x; 
          plate.y = plateDrag.y;
          
          // 提交后盘子内菜自动清零
          plateFill.total = 0; 
          plateFill.scoops = 0;
        } else {
          // 交付失败：勺数或百分比不足
          plateDrag.taken = true; // 失败时隐藏盘子
          let failMessage;
          if (!hasEnoughScoops && !hasEnoughPercent) {
            failMessage = `失败：需要 ${need} 勺且平均≥40%，当前勺数 ${plateFill.scoops}，平均 ${Math.round(percent * 100)}%`;
          } else if (!hasEnoughScoops) {
            failMessage = `失败：需要 ${need} 勺，当前只有 ${plateFill.scoops} 勺`;
          } else {
            failMessage = `失败：装盘仅 ${Math.round(percent * 100)}%（需≥40%）`;
          }
          lose(failMessage);
          // 失败音效
          playSfx('fail');
        }
        // 交付后清空盘子累计，防止重复结算
        plateFill.total = 0; plateFill.scoops = 0;
      }
    }

    // Shake mechanic when carrying food (only when holding down) 且必须在菜盆区域
    if (spoon.isScooped && pointer.isDown && circleRectOverlap(spoon.x, spoon.y, spoon.radius, potShakeZone.x, potShakeZone.y, potShakeZone.w, potShakeZone.h)) {
        // 移除限制：现在允许在被盯着时抖菜，但会触发失败
      
      const lx = spoon.lastX ?? spoon.x;
      const ly = spoon.lastY ?? spoon.y;
      const dx = spoon.x - lx;
      const vx = dx / dt; // px/s 水平速度
      const dir = vx === 0 ? 0 : (vx > 0 ? 1 : -1);
      const speedThresh = CONFIG.SHAKING.speedThreshold; // 需要足够快的左右速度

      // 开始抖菜检测
      if (Math.abs(vx) > speedThresh && dir !== 0) {
        // 初始化抖菜状态
        if (spoon.shakeStartTime === 0) {
          spoon.shakeStartTime = game.time;
          spoon.shakeLeftDone = false;
          spoon.shakeRightDone = false;
          spoon.shakeMinX = spoon.x;
          spoon.shakeMaxX = spoon.x;
        }
        
        // 更新移动范围
        spoon.shakeMinX = Math.min(spoon.shakeMinX, spoon.x);
        spoon.shakeMaxX = Math.max(spoon.shakeMaxX, spoon.x);
        spoon.shakeRange = spoon.shakeMaxX - spoon.shakeMinX;
        
        // 检测左甩和右甩
        if (dir === -1 && !spoon.shakeLeftDone) {
          spoon.shakeLeftDone = true;
        } else if (dir === 1 && !spoon.shakeRightDone) {
          spoon.shakeRightDone = true;
        }
        
        // 检查是否完成一次完整的抖菜（0.5秒内完成左甩和右甩）
        const shakeDuration = game.time - spoon.shakeStartTime;
        if (shakeDuration <= 0.5 && spoon.shakeLeftDone && spoon.shakeRightDone) {
          // 完成一次抖菜，根据移动范围计算抖菜量
          const rangeIntensity = Math.min(1, spoon.shakeRange / 100); // 移动范围越大，抖菜量越多
          const drop = clamp(CONFIG.SHAKING.minDrop + rangeIntensity * (CONFIG.SHAKING.maxDrop - CONFIG.SHAKING.minDrop), CONFIG.SHAKING.minDrop, CONFIG.SHAKING.maxDrop);
          const before = spoon.fillAmount;
          spoon.fillAmount = clamp(spoon.fillAmount - drop, 0, 1);
          const actualDrop = Math.max(0, before - spoon.fillAmount);
          
          if (actualDrop > 0) {
            const earn = actualDrop * CONFIG.ECONOMY.basePricePerScoop; // 按掉落比例计
            game.income += earn;
            game.stats.totalShakes++;
            game.stats.totalDropped += actualDrop;
            game.stats.lastShakeTime = game.time;
            // 浮动提示
            floatTips.push({ x: spoon.x, y: spoon.y - 10, text: '+¥' + earn.toFixed(2), ttl: 1.2, vy: -24, alpha: 1 });
            // 记录本次抖掉百分比，显示在勺子旁
            spoon.lastDropPercent = Math.round(actualDrop * 100);
            spoon.lastDropUntil = game.time + 1.0;
          }

          // Fail conditions（只在触发抖动时判定，且仅在正式游戏模式下）
          if (game.state === 'playing') {
            // 检查是否被学生盯着
            if (student.attentionState === 'looking') {
              lose(CONFIG.FAIL_MESSAGES.studentSeen);
              playSfx('fail');
              return; // 立即返回，不继续执行后续逻辑
            }
            // 检查是否被干部盯着
            if (inspector.isActive && inspector.phase === 'waiting') {
              lose(CONFIG.FAIL_MESSAGES.inspectorCaught);
              playSfx('fail');
              return; // 立即返回，不继续执行后续逻辑
            }
          }
          
          // 重置抖菜状态
          spoon.shakeStartTime = 0;
          spoon.shakeLeftDone = false;
          spoon.shakeRightDone = false;
          spoon.shakeMinX = 0;
          spoon.shakeMaxX = 0;
          spoon.shakeRange = 0;
        } else if (shakeDuration > 0.5) {
          // 超时，重置抖菜状态
          spoon.shakeStartTime = 0;
          spoon.shakeLeftDone = false;
          spoon.shakeRightDone = false;
          spoon.shakeMinX = 0;
          spoon.shakeMaxX = 0;
          spoon.shakeRange = 0;
        }
      }
      
      spoon.lastX = spoon.x; spoon.lastY = spoon.y;
    } else {
      // 离开菜盆或松开时重置抖菜状态
      spoon.shakeStartTime = 0;
      spoon.shakeLeftDone = false;
      spoon.shakeRightDone = false;
      spoon.shakeMinX = 0;
      spoon.shakeMaxX = 0;
      spoon.shakeRange = 0;
      spoon.lastX = spoon.x; spoon.lastY = spoon.y;
    }

    // 更新最近一次差点被发现的时间
    if (game.stats.lastShakeTime > 0) {
      const timeSinceLastShake = game.time - game.stats.lastShakeTime;
      if (student.attentionState === 'looking' && timeSinceLastShake < CONFIG.SCORING.nearMissThreshold) {
        game.stats.closestNearMiss = Math.min(game.stats.closestNearMiss, timeSinceLastShake);
      }
    }

    // 失败过渡：显示3秒愤怒后进入结算
    if (game.state === 'failing') {
      if (game.time >= game.failUntil) {
        game.state = 'over';
        game.running = false;
        gameScreen.classList.add('game-over'); // 添加CSS类隐藏外快UI
      }
    }
  }

  function win(msg) {
    // 无尽模式：成功不结束游戏，继续下一轮
    // 这里可以添加成功提示，但不结束游戏
  }
  function lose(msg) {
    if (!game.running) return;
    game.overReason = msg;
    
    // 判断失败类型并进入相应的失败场景
    if (game.state === 'playing') {
      // 判断是学生失败还是干部失败
      if (msg === CONFIG.FAIL_MESSAGES.inspectorCaught || 
          (inspector.isActive && inspector.phase === 'waiting')) {
        // 干部失败场景
        game.failureType = 'inspector';
        inspector.angryUntil = game.time + 3.0; // 干部愤怒3秒
        game.failUntil = inspector.angryUntil;
      } else {
        // 学生失败场景
        game.failureType = 'student';
        student.state = 'thanking';
        student.overServed = 'failed';
        student.thanksUntil = game.time + 3.0; // 学生愤怒3秒
        game.failUntil = student.thanksUntil;
      }
      game.state = 'failing';
      return;
    }
    game.running = false;
    game.state = 'over';
    gameScreen.classList.add('game-over'); // 添加CSS类隐藏外快UI
  }

  function getRating() {
    // 如果有失败原因，按正常评级计算
    if (game.overReason) {
      const dropRate = game.stats.totalShakes > 0 ? (game.stats.totalDropped / game.stats.totalShakes) : 0;
      const successRate = game.stats.successCount > 0 ? 1 : 0;
      const nearMissBonus = game.stats.closestNearMiss < CONFIG.SCORING.nearMissThreshold ? CONFIG.SCORING.nearMissBonus : 0;
      const score = dropRate * CONFIG.SCORING.dropRateWeight + successRate * CONFIG.SCORING.successRateWeight + nearMissBonus * CONFIG.SCORING.nearMissBonusWeight;
      
      for (const [rating, config] of Object.entries(CONFIG.RATINGS)) {
        if (score >= config.threshold) return rating;
      }
      return 'F';
    } else {
      // 时间结束自然结算，S评级起步
      const dropRate = game.stats.totalShakes > 0 ? (game.stats.totalDropped / game.stats.totalShakes) : 0;
      const successRate = game.stats.successCount > 0 ? 1 : 0;
      const nearMissBonus = game.stats.closestNearMiss < CONFIG.SCORING.nearMissThreshold ? CONFIG.SCORING.nearMissBonus : 0;
      const score = dropRate * CONFIG.SCORING.dropRateWeight + successRate * CONFIG.SCORING.successRateWeight + nearMissBonus * CONFIG.SCORING.nearMissBonusWeight;
      
      // 时间结束自然结算，最低S评级
      if (score >= 0.9) return 'SSS';
      if (score >= 0.8) return 'SS';
      return 'S'; // 时间结束自然结算，最低S评级
    }
  }

  function drawRect(r) { ctx.fillRect(r.x, r.y, r.w, r.h); }

  // 绘制倒计时进度条
  function drawRoundTimer() {
    const progressBarHeight = 30; // 增加高度
    const progressBarY = 60;
    const progressBarMargin = 10; // 减少边距，让进度条更宽
    const progressBarWidth = W - progressBarMargin * 2;
    const progressBarX = progressBarMargin;
    
    // 计算进度百分比
    const progress = game.roundRemaining / CONFIG.ROUND.durationSec;
    const currentWidth = progressBarWidth * progress;
    
    // 背景条
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
    
    // 进度条
    if (progress > 0.3) {
      ctx.fillStyle = '#4caf50'; // 绿色
    } else if (progress > 0.1) {
      ctx.fillStyle = '#ff9800'; // 橙色
    } else {
      ctx.fillStyle = '#f44336'; // 红色
    }
    ctx.fillRect(progressBarX, progressBarY, currentWidth, progressBarHeight);
    
    // 边框
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
    
    // 时间文字
    const timeText = formatTime(game.roundRemaining);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(timeText, W / 2, progressBarY + progressBarHeight + 20);
    
    // 重置线条宽度
    ctx.lineWidth = 1;
  }

  function render() {
    ctx.clearRect(0, 0, W, H);

    // 第一层：bg_1（最底层）
    if (backgroundImages.bg1) {
      ctx.drawImage(backgroundImages.bg1, 0, 0, W, H);
    }

      // 第二层：学生干部（在正式游戏模式和失败模式下都渲染）
      if ((game.state === 'playing' || game.state === 'failing') && inspector.isActive) {
        const inspectorImage = inspectorImages[inspector.currentImage];
        
        // 测试控制台输出 - 学生干部渲染状态
        if (Math.floor(game.time) % 3 === 0 && game.time - Math.floor(game.time) < 0.1) {
          console.log('学生干部渲染状态:', {
            gameState: game.state,
            inspectorActive: inspector.isActive,
            inspectorPhase: inspector.phase,
            currentImage: inspector.currentImage,
            imageLoaded: !!inspectorImage,
            position: { x: inspector.x, y: inspector.y },
            size: { w: inspector.w, h: inspector.h },
            stopX: inspector.stopX,
            allImages: {
              standby: !!inspectorImages.standby,
              walking: !!inspectorImages.walking,
              angry: !!inspectorImages.angry
            }
          });
        }
        
        if (inspectorImage) {
          ctx.drawImage(inspectorImage, inspector.x, inspector.y, inspector.w, inspector.h);
        } else {
          // 备用：如果图片未加载，显示颜色矩形
          console.log('学生干部图片未加载，显示备用矩形');
          ctx.fillStyle = GAME_ELEMENTS_CONFIG.INSPECTOR.color;
          ctx.fillRect(inspector.x, inspector.y, inspector.w, inspector.h);
        }
      }

    // 第三层：学生（在正式游戏模式和失败模式下都渲染）
    if (game.state === 'playing' || game.state === 'failing') {
      // 根据学生状态和注意力状态选择图片
      let studentImage = null;
      
      if (student.state === 'entering' || student.state === 'leaving') {
        // 移动时显示walking图片
        studentImage = studentImages.walking;
      } else if (student.state === 'ordering') {
        // 点菜阶段显示standby
        studentImage = studentImages.standby;
      } else if (student.state === 'waiting') {
        // 等待时根据注意力状态选择图片
        if (student.attentionState === 'looking') {
          studentImage = studentImages.watchingYou; // 盯着玩家时显示watching you图片
        } else {
          studentImage = studentImages.watchingPhone; // 转头时显示watching phone图片
        }
      } else if (student.state === 'thanking') {
        // 感谢时根据交付结果选择图片
        if (student.overServed === 'failed') {
          studentImage = studentImages.angry; // 交付失败显示angry图片
        } else if (student.overServed === true || student.overServed === false) {
          studentImage = studentImages.happy; // 交付成功显示happy图片
        } else {
          studentImage = studentImages.standby; // 默认显示standby图片
        }
      } else {
        // 默认显示standby图片
        studentImage = studentImages.standby;
      }

      // 如果有图片则绘制图片，否则绘制矩形作为后备
      if (studentImage) {
        ctx.drawImage(studentImage, student.x - student.w / 2, student.y - student.h, student.w, student.h);
      } else {
        // 后备：绘制矩形
        ctx.fillStyle = '#446';
        ctx.fillRect(student.x - student.w / 2, student.y - student.h, student.w, student.h);
      }

      // 交付耐心进度条（仅等待时显示）
      const barW = 120, barH = 10;
      const bx = student.x - barW / 2;
      const by = student.y - student.h - 18;
      if (student.state === 'waiting' && student.deliveryPatienceMax > 0) {
        ctx.fillStyle = '#333'; ctx.fillRect(bx, by, barW, barH);
        const patienceRatio = student.deliveryPatience / student.deliveryPatienceMax;
        ctx.fillStyle = patienceRatio > 0.3 ? '#4caf50' : '#e53935';
        ctx.fillRect(bx, by, barW * patienceRatio, barH);
        ctx.strokeStyle = '#555'; ctx.strokeRect(bx, by, barW, barH);
      }

      if (student.state === 'waiting') {
        // 大号提示气泡
        const tipText = student.attentionState === 'looking' ? '盯着你!' : '转头了';
        const color = student.attentionState === 'looking' ? '#ff5252' : '#8bc34a';
        const tw = 120, th = 34;
        const tx = student.x - tw/2;
        const ty = by + 14;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(tx, ty, tw, th);
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.strokeRect(tx, ty, tw, th);
        ctx.fillStyle = color; ctx.font = 'bold 18px system-ui, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(tipText, student.x, ty + 23);
        ctx.lineWidth = 1;
      }

      // 学生点单提示：明确显示点了多少勺（在点菜和等待状态时显示）
      if ((student.state === 'ordering' || student.state === 'waiting') && student.needScoops > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        const tipW = 96, tipH = 26;
        const tipX = student.x - tipW/2;
        const tipY = by - 26;
        ctx.fillRect(tipX, tipY, tipW, tipH);
        ctx.strokeStyle = '#ddd'; ctx.strokeRect(tipX, tipY, tipW, tipH);
        ctx.fillStyle = '#fff'; ctx.font = '14px system-ui, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('点: ' + student.needScoops + ' 勺', student.x, tipY + 17);
      }

      // 成功语：谢谢阿姨（居中显示在学生身体上方）
      if (student.state === 'thanking') {
        const tw = 200, th = 34;
        const tx = student.x - tw/2;
        const ty = student.y - student.h - 60;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(tx, ty, tw, th);
        ctx.strokeStyle = '#ffd54f'; ctx.strokeRect(tx, ty, tw, th);
        ctx.fillStyle = '#ffd54f'; ctx.font = '14px system-ui, sans-serif';
        ctx.textAlign = 'center';
        let thanksText;
        if (student.overServed === 'failed') {
          thanksText = '不够！我要更多！'; // 交付失败时的消息
        } else if (student.overServed === true) {
          thanksText = '阿姨给的真多，下次还来'; // 超出需求时的消息
        } else {
          thanksText = '谢谢阿姨'; // 刚好满足需求时的消息
        }
        ctx.fillText(thanksText, student.x, ty + 22);
      }

      // 可视化学生碰撞区域（半透明，便于调试）
      if (student.state === 'waiting') {
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(student.x, student.y, student.w, student.h);
      }
    }

    // 第四层：bg_2
    if (backgroundImages.bg2) {
      ctx.drawImage(backgroundImages.bg2, 0, 0, W, H);
    }

    // 第五层：菜盆交互区
    // Counter area background (半透明覆盖层)
    ctx.fillStyle = GAME_ELEMENTS_CONFIG.BACKGROUND.counterAreaColor;
    ctx.fillRect(0, H * GAME_ELEMENTS_CONFIG.BACKGROUND.counterAreaY, W, H * GAME_ELEMENTS_CONFIG.BACKGROUND.counterAreaHeight);

    // 菜盆精灵区域改为透明，仅保留判定区
    // 不绘制菜盆图片，保持透明

    // 第六层：盘子（并在上方显示百分比标签）
    // Plate - 根据勺数显示不同图片，交付后不显示
    if (!plateDrag.taken) {
      let plateImage = null;
      if (plateFill.scoops === 0) {
        // 没有菜，显示空盘子
        plateImage = plateImages.empty;
      } else if (plateFill.scoops <= 2) {
        // 勺数小于等于2勺，显示少菜盘子
        plateImage = plateImages.less;
      } else {
        // 勺数大于2勺，显示多菜盘子
        plateImage = plateImages.more;
      }
      
      if (plateImage) {
        // 绘制盘子图片
        ctx.drawImage(plateImage, plate.x, plate.y, plate.w, plate.h);
      } else {
        // 如果图片未加载，使用备用颜色
        ctx.fillStyle = GAME_ELEMENTS_CONFIG.PLATE.color;
        drawRect(plate);
      }

      // 显示装盘勺数和百分比
      if (game.state === 'playing' && student.state !== 'entering') {
        const need = Math.max(1, student.needScoops);
        const percent = clamp((plateFill.total / need) * 100, 0, 999);
        const percentLabel = Math.round(percent) + '%';
        const scoopLabel = plateFill.scoops + '勺';
        
        // 百分比显示
        const boxW = 64, boxH = 22;
        const boxX = plate.x + plate.w/2 - boxW/2;
        const boxY = plate.y - 28;
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeStyle = '#ffd54f';
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.fillStyle = '#ffd54f';
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(percentLabel, boxX + boxW/2, boxY + 16);
        
        // 勺数显示
        const scoopBoxW = 48, scoopBoxH = 20;
        const scoopBoxX = plate.x + plate.w/2 - scoopBoxW/2;
        const scoopBoxY = plate.y - 55;
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(scoopBoxX, scoopBoxY, scoopBoxW, scoopBoxH);
        ctx.strokeStyle = '#4caf50';
        ctx.strokeRect(scoopBoxX, scoopBoxY, scoopBoxW, scoopBoxH);
        ctx.fillStyle = '#4caf50';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(scoopLabel, scoopBoxX + scoopBoxW/2, scoopBoxY + 14);
      }
    }

    // 盘子交付后消失（仅在失败时保持隐藏；成功会立即复位显示）
    if (game.state === 'playing' && plateDrag.taken) {
      plate.x = GAME_ELEMENTS_CONFIG.PLATE.disappearX;
      plate.y = GAME_ELEMENTS_CONFIG.PLATE.disappearY;
    }

    // 更新HTML显示（结算画面时隐藏外快UI）
    if (game.state !== 'over') {
      earningsAmount.textContent = game.income.toFixed(2);
    }

    // 第七层：勺子（最顶层）
    const spoonImage = spoonImages[spoon.currentImage];
    if (spoonImage) {
      // 使用配置中的图片尺寸
      const imageWidth = GAME_ELEMENTS_CONFIG.SPOON.imageWidth * GAME_ELEMENTS_CONFIG.SPOON.scale;
      const imageHeight = GAME_ELEMENTS_CONFIG.SPOON.imageHeight * GAME_ELEMENTS_CONFIG.SPOON.scale;
      const offsetX = imageWidth / 2;
      const offsetY = imageHeight / 2;
      ctx.drawImage(spoonImage, spoon.x - offsetX, spoon.y - offsetY, imageWidth, imageHeight);
    } else {
      // 后备：如果图片未加载，使用原来的圆形渲染
      ctx.save();
      ctx.translate(spoon.x, spoon.y);
      ctx.fillStyle = GAME_ELEMENTS_CONFIG.SPOON.color;
      ctx.beginPath(); ctx.arc(0, 0, spoon.radius, 0, Math.PI * 2); ctx.fill();
      // fill visualization
      if (spoon.isScooped && spoon.fillAmount > 0) {
        ctx.fillStyle = '#8d6e63';
        const r = spoon.radius - 6;
        const a = clamp(spoon.fillAmount, 0, 1) * Math.PI; // half-disk fill
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r, Math.PI, Math.PI + a, false);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

     // 倒计时进度条（最顶层，在背景之前绘制）
   if (game.state === 'playing' || game.state === 'tutorial') {
    drawRoundTimer();
  }

    // 倒计时进度条（最顶层）
    if (game.state === 'playing' || game.state === 'tutorial') {
      drawRoundTimer();
    }

    // 调试层：碰撞遮罩（最顶层）
    if (DEBUG_CONFIG.showCollisionMasks) {
      // 学生碰撞遮罩
      ctx.fillStyle = DEBUG_CONFIG.studentMaskColor;
      ctx.fillRect(
        student.x + COLLISION_CONFIG.student.offsetX, 
        student.y + COLLISION_CONFIG.student.offsetY, 
        COLLISION_CONFIG.student.width, 
        COLLISION_CONFIG.student.height
      );
      
      // 盘子碰撞遮罩
      ctx.fillStyle = DEBUG_CONFIG.plateMaskColor;
      ctx.fillRect(
        plate.x + COLLISION_CONFIG.plate.offsetX, 
        plate.y + COLLISION_CONFIG.plate.offsetY, 
        COLLISION_CONFIG.plate.width, 
        COLLISION_CONFIG.plate.height
      );
      
      // 勺子碰撞遮罩（圆形）
      ctx.fillStyle = DEBUG_CONFIG.spoonMaskColor;
      ctx.beginPath();
      ctx.arc(
        spoon.x + COLLISION_CONFIG.spoon.offsetX, 
        spoon.y + COLLISION_CONFIG.spoon.offsetY, 
        COLLISION_CONFIG.spoon.radius, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
      
      // 勺子点击遮罩（长方形）
      ctx.fillStyle = DEBUG_CONFIG.spoonClickMaskColor;
      ctx.fillRect(
        spoon.x + COLLISION_CONFIG.spoonClick.offsetX, 
        spoon.y + COLLISION_CONFIG.spoonClick.offsetY, 
        COLLISION_CONFIG.spoonClick.width, 
        COLLISION_CONFIG.spoonClick.height
      );
      
      // 菜盆碰撞遮罩
      ctx.fillStyle = DEBUG_CONFIG.potMaskColor;
      ctx.fillRect(
        pot.x + COLLISION_CONFIG.pot.offsetX, 
        pot.y + COLLISION_CONFIG.pot.offsetY, 
        COLLISION_CONFIG.pot.width, 
        COLLISION_CONFIG.pot.height
      );
      
      // 菜盆抖菜区域遮罩
      ctx.fillStyle = 'rgba(255, 0, 255, 0.2)'; // 紫色半透明
      ctx.fillRect(
        pot.x + COLLISION_CONFIG.potShakeZone.offsetX, 
        pot.y + COLLISION_CONFIG.potShakeZone.offsetY, 
        COLLISION_CONFIG.potShakeZone.width, 
        COLLISION_CONFIG.potShakeZone.height
      );
    }

    // 勺子菜量百分比显示（始终显示）
    const spoonPercentage = Math.round(spoon.fillAmount * 100);
    const percentageLabel = spoonPercentage + '%';
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(spoon.x + 24, spoon.y - 36, 54, 20);
    ctx.strokeStyle = '#ffd54f';
    ctx.strokeRect(spoon.x + 24, spoon.y - 36, 54, 20);
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(percentageLabel, spoon.x + 24 + 27, spoon.y - 21);

    // 渲染外快浮动提示
    for (let i = floatTips.length - 1; i >= 0; i--) {
      const tip = floatTips[i];
      tip.ttl -= 1/60;
      tip.y += tip.vy * (1/60);
      tip.alpha = Math.max(0, tip.ttl / (tip.ttl > 1.5 ? 2.0 : 1.2)); // 扣钱提示显示更久
      ctx.globalAlpha = tip.alpha;
      
      // 惩罚提示特殊处理
      if (tip.isPenalty) {
        // 添加阴影效果让文字更突出
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // 使用更大的字体和更鲜艳的颜色
        ctx.fillStyle = tip.color || '#ff0000';
        ctx.font = `bold ${tip.fontSize || 24}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(tip.text, tip.x, tip.y);
        
        // 重置阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      } else {
        // 普通提示
        ctx.fillStyle = tip.color || '#ffd54f';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(tip.text, tip.x, tip.y);
      }
      
      ctx.globalAlpha = 1;
      if (tip.ttl <= 0) floatTips.splice(i, 1);
    }

    // 新手引导提示
    if (tutorial.isActive && tutorial.currentStep <= 2) {
      const stepConfig = TUTORIAL_CONFIG[`step${tutorial.currentStep}`];
      if (stepConfig && stepConfig.position === 'spoon') {
        // 在勺子旁边显示提示
        const tipX = spoon.x + 60;
        const tipY = spoon.y - 20;
        const tipW = 200;
        const tipH = 60;
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(tipX, tipY, tipW, tipH);
        ctx.strokeStyle = '#ffd54f';
        ctx.lineWidth = 2;
        ctx.strokeRect(tipX, tipY, tipW, tipH);
        
        // 文字
        ctx.fillStyle = '#ffd54f';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(stepConfig.title, tipX + 10, tipY + 20);
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillText(stepConfig.message, tipX + 10, tipY + 40);
      }
    }

    // Over overlay (start screen is now handled by HTML)

    if (game.state === 'over') {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, W, H);
      
      // 结算界面
      const rating = getRating();
      const dropRate = game.stats.totalShakes > 0 ? Math.round((game.stats.totalDropped / game.stats.totalShakes) * 100) : 0;
      
      // 根据是否有失败原因来决定表现评价
      const performanceText = game.overReason ? 
        CONFIG.NEAR_MISS_MESSAGES.hadNearMiss : 
        CONFIG.NEAR_MISS_MESSAGES.perfect;
      
      // 标题
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 32px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('结算', W/2, H/2 - 180);
      
      // 显示失败原因
      if (game.overReason) {
        ctx.fillStyle = '#ff5252';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.fillText('失败原因: ' + game.overReason, W/2, H/2 - 140);
      }
      
      // 评级
      ctx.font = 'bold 48px system-ui, sans-serif';
      ctx.fillStyle = CONFIG.RATINGS[rating]?.color || '#fff';
      ctx.fillText(rating, W/2, H/2 - 80);
      
      // 统计信息
      ctx.fillStyle = '#fff';
      ctx.font = '18px system-ui, sans-serif';
      ctx.fillText(`抖菜成功率: ${dropRate}%`, W/2, H/2 - 20);
      ctx.fillText(`成功服务: ${game.stats.successCount} 次`, W/2, H/2 + 20);
      ctx.fillText(`外快收入: ¥${game.income.toFixed(2)}`, W/2, H/2 + 60);
      ctx.fillText(performanceText, W/2, H/2 + 100);
      
      // 提示文字
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillText('点击下方按钮再试一次', W/2, H/2 + 140);
      
      // 再来一局按钮
      const buttonW = 120, buttonH = 40;
      const buttonX = W/2 - buttonW/2;
      const buttonY = H/2 + 180;
      
      // 按钮背景
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(buttonX, buttonY, buttonW, buttonH);
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = 2;
      ctx.strokeRect(buttonX, buttonY, buttonW, buttonH);
      
      // 按钮文字
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('再来一局', W/2, buttonY + 26);
    }
    
    // 个人署名（最顶层，所有状态下都显示）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Created by 银河系居民', W - 10, H - 10);
  }

  let last = performance.now();
  function frame(t) {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  // 初始化游戏
  async function initGame() {
    await loadBackgroundImages();
    await loadAudio();
    
    // 应用开始按钮配置
    applyStartButtonConfig();
    
    reset();
    requestAnimationFrame(frame);
    
    // 尝试在页面加载完成后播放背景音乐（可能需要用户交互）
    setTimeout(() => {
      console.log('尝试播放背景音乐...');
      playMusic();
    }, 1000);
    
    // 示例：添加更多学生角色（如果有图片的话）
    // addStudentRole('student3', {
    //   name: '学生3',
    //   images: {
    //     walking: 'img/student3_walking.png',
    //     standby: 'img/student3_standby.png',
    //     watchingYou: 'img/student3_watching you.png',
    //     watchingPhone: 'img/student3_wantching phone.png',
    //     happy: 'img/student3_happy.png',
    //     angry: 'img/student3_angry.png'
    //   }
    // });
    
    // 输出可用的学生角色
    console.log('可用的学生角色:', getAvailableStudentRoles());
    console.log('当前学生角色:', currentStudentRole);
  }

  // 加载音频资源
  async function loadAudio() {
    // 背景音乐
    audio.music = new Audio(CONFIG.AUDIO.paths.music);
    audio.music.loop = true;
    audio.music.volume = audio.ui.musicVolume;
    audio.music.preload = 'auto';
    
    // 添加音频加载事件监听
    audio.music.addEventListener('canplaythrough', () => {
      console.log('背景音乐加载完成，可以播放');
    });
    audio.music.addEventListener('error', (e) => {
      console.error('背景音乐加载失败:', e);
    });

    // 音效
    audio.sfx.fail = new Audio(CONFIG.AUDIO.paths.fail);
    audio.sfx.success = new Audio(CONFIG.AUDIO.paths.success);
    audio.sfx.talking = new Audio(CONFIG.AUDIO.paths.talking);
    setSfxVolume(audio.ui.sfxVolume);
    
    console.log('音频资源加载完成');
  }

  function setMusicVolume(v) {
    audio.ui.musicVolume = v;
    if (audio.music) audio.music.volume = v;
  }
  function setSfxVolume(v) {
    audio.ui.sfxVolume = v;
    Object.values(audio.sfx).forEach(a => { if (a) a.volume = v; });
  }

  function playMusic() {
    if (!audio.ui.musicEnabled || !audio.music) {
      console.log('背景音乐未启用或未加载:', { enabled: audio.ui.musicEnabled, loaded: !!audio.music });
      return;
    }
    // 避免重复启动
    if (audio.music.paused) {
      audio.music.currentTime = 0;
      audio.music.play().then(() => {
        console.log('背景音乐开始播放');
      }).catch((error) => {
        console.error('背景音乐播放失败:', error);
      });
    } else {
      console.log('背景音乐已在播放中');
    }
  }
  function stopMusic() {
    if (audio.music && !audio.music.paused) {
      audio.music.pause();
    }
  }
  function playSfx(name) {
    if (!audio.ui.sfxEnabled) return;
    const a = audio.sfx[name];
    if (a) {
      a.currentTime = 0;
      a.play().catch(() => {});
    }
  }

  // 工具：格式化时间（秒 -> MM:SS）
  function formatTime(sec) {
    const total = Math.max(0, Math.floor(sec));
    const m = Math.floor(total / 60);
    const s = total % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  initGame();
})();