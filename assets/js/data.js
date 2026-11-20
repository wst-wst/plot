/* 所有记录数据集中在这里，新增一篇只需要往数组里加一个对象。图片放在 assets/img/ 下，用相对路径引用。 */

const PLOG_POSTS = [
  {
    id: 'harbin-first-snow',
    title: '哈尔滨的第一场雪',
    date: '2026-11-14',
    location: '哈尔滨 · 中央大街',
    city: '哈尔滨',
    tags: ['旅行', '冬日'],
    ratio: '4 / 3',
    excerpt: '雪落下来的时候，整条街忽然安静了。',
    body: [
      '中央大街的石头路面被雪填平了棱角，走起来有点滑。卖烤红薯的推车冒白气，玻璃上结了一层雾。',
      '我在一家旧书店门口站了很久。老板把收音机音量调小，问我是不是第一次来。我说是。他说，那你运气不错，今年的第一场。'
    ],
    photos: [
      {
        src: 'assets/img/harbin-first-snow-1.jpg',
        alt: '哈尔滨中央大街的第一场雪，暖色店铺灯光映在雪地上',
        caption: '17:42，街灯刚亮起来'
      },
      {
        src: 'assets/img/harbin-first-snow-2.jpg',
        alt: '雪天街边的烤红薯推车冒着热气',
        caption: '手里那块红薯，是那天最暖的东西'
      }
    ]
  },
  {
    id: 'october-windowsill',
    title: '十月的窗台',
    date: '2026-10-28',
    location: '北京 · 家里',
    city: '北京',
    tags: ['日常', '光影'],
    ratio: '3 / 4',
    excerpt: '下午四点，光会准时爬上这面墙。',
    body: [
      '搬到这间房子以后，最先喜欢上的是西边这扇窗。十月的下午四点，光会斜斜地铺到书架上，把书脊照成一片金色。',
      '那天没做什么正经事。泡了茶，翻了两页书，然后一直看着灰尘在光里飘。'
    ],
    photos: [
      {
        src: 'assets/img/october-windowsill-1.jpg',
        alt: '十月下午的阳光照在书架和窗台的茶杯上',
        caption: '16:07，一年里最舒服的角度'
      }
    ]
  },
  {
    id: 'morning-market',
    title: '早市八点',
    date: '2026-10-05',
    location: '成都 · 玉林',
    city: '成都',
    tags: ['城市', '食物'],
    ratio: '4 / 3',
    excerpt: '菜市场的八点，比任何咖啡店都提神。',
    body: [
      '玉林的早市七点半就热闹起来。卖菜的大姐嗓门很大，切肉的师傅刀起刀落，空气里混着花椒和泥土的味道。',
      '我买了两个刚出锅的锅盔，站在路边吃完。芝麻掉了一身。'
    ],
    photos: [
      {
        src: 'assets/img/morning-market-1.jpg',
        alt: '成都早市上摆满蔬菜和辣椒的摊位',
        caption: '八点零五分，人最多的时候'
      }
    ]
  },
  {
    id: 'seaside-wind',
    title: '海边的风把帽子吹走了',
    date: '2026-09-21',
    location: '青岛 · 小麦岛',
    city: '青岛',
    tags: ['旅行', '秋日'],
    ratio: '3 / 4',
    excerpt: '追帽子的那两百米，是今年跑得最快的一次。',
    body: [
      '九月的小麦岛风很大，草被吹成一片一片的浪。帽子飞出去的时候我愣了一秒，然后开始跑。',
      '最后帽子挂在一块礁石上，完好无损。我坐回草地，看海看了两个小时，什么也没想。'
    ],
    photos: [
      {
        src: 'assets/img/seaside-wind-1.jpg',
        alt: '青岛小麦岛被风吹弯的草地和远处的海',
        caption: '风大到说话要喊'
      }
    ]
  },
  {
    id: 'spring-long-walk',
    title: '春天适合走很长的路',
    date: '2026-04-19',
    location: '杭州 · 西湖',
    city: '杭州',
    tags: ['旅行', '日常'],
    ratio: '3 / 4',
    excerpt: '从断桥走到苏堤，走了三个小时，没觉得累。',
    body: [
      '四月的杭州，风里有股青草被晒过的味道。湖边全是拍照的人，我沿着苏堤一直走，走到人少了才停下。',
      '坐在长椅上啃了一个面包，看两只鸭子吵架。'
    ],
    photos: [
      {
        src: 'assets/img/spring-long-walk-1.jpg',
        alt: '春天西湖边垂柳和小路',
        caption: '苏堤中段，风刚刚好'
      }
    ]
  }
];
