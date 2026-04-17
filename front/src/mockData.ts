export const mockTags = [
  "Боевик",
  "Комедия",
  "Драма",
  "Фантастика",
  "Триллер",
  "Ужасы",
  "Мультфильм",
  "Для всей семьи",
  "Домашний",
  "Для двоих",
  "Российский",
  "Инди",
  "Атмосферный",
  "Основан на реальных событиях",
  "Классика"
];

export const mockMovies = [
  {
    id: 1,
    title: "Дюна: Часть вторая",
    releaseYear: 2024,
    tags: ["Фантастика", "Приключения"],
    rating: 8.8,
    posterUrl: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGqqut1V.jpg",
    description: "Герцог Пол Атрейдес присоединяется к фременам, чтобы стать Муад'Дибом, одновременно пытаясь предотвратить ужасное, но неминуемое будущее, которое он предвидел: Священную войну во имя его.",
    cast: [
      { name: "Тимоти Шаламе", photoUrl: "https://image.tmdb.org/t/p/w200/hG1z0c2gZ0qXQY0g0Z0c2gZ0qXQ.jpg" },
      { name: "Зендея", photoUrl: "https://image.tmdb.org/t/p/w200/hG1z0c2gZ0qXQY0g0Z0c2gZ0qXQ.jpg" },
      { name: "Ребекка Фергюсон", photoUrl: "https://image.tmdb.org/t/p/w200/hG1z0c2gZ0qXQY0g0Z0c2gZ0qXQ.jpg" }
    ],
    comments: [
      { id: 1, author: "Киноман", text: "Просто потрясающий визуальный ряд!", likes: 142, dislikes: 3 },
      { id: 2, author: "Зритель 42", text: "Первая часть была немного затянута, но эта — шедевр.", likes: 89, dislikes: 12 }
    ]
  },
  {
    id: 2,
    title: "Оппенгеймер",
    releaseYear: 2023,
    tags: ["Драма", "Исторический"],
    rating: 8.5,
    description: "История жизни американского физика-теоретика Роберта Оппенгеймера, который во время Второй мировой войны руководил Манхэттенским проектом по созданию первых образцов ядерного оружия.",
    cast: [
      { name: "Киллиан Мёрфи", photoUrl: "https://image.tmdb.org/t/p/w200/hG1z0c2gZ0qXQY0g0Z0c2gZ0qXQ.jpg" },
      { name: "Эмили Блант", photoUrl: "https://image.tmdb.org/t/p/w200/hG1z0c2gZ0qXQY0g0Z0c2gZ0qXQ.jpg" },
      { name: "Роберт Дауни мл.", photoUrl: "https://image.tmdb.org/t/p/w200/hG1z0c2gZ0qXQY0g0Z0c2gZ0qXQ.jpg" }
    ],
    comments: [
      { id: 1, author: "Физик", text: "Отличный фильм, Нолан как всегда на высоте.", likes: 512, dislikes: 45 },
      { id: 2, author: "Антон", text: "Слишком длинный, но смотрится на одном дыхании.", likes: 34, dislikes: 102 }
    ]
  },
  {
    id: 3,
    title: "Человек-паук: Паутина вселенных",
    releaseYear: 2023,
    tags: ["Мультфильм", "Боевик"],
    rating: 8.7,
    description: "Майлз Моралес отправляется в мульти-вселенную, где объединяется с Гвен Стейси и новой командой Людей-Пауков, чтобы противостоять могущественному злодею.",
    cast: [
      { name: "Шамеик Мур", photoUrl: "https://image.tmdb.org/t/p/w200/hG1z0c2gZ0qXQY0g0Z0c2gZ0qXQ.jpg" },
      { name: "Хейли Стайнфелд", photoUrl: "https://image.tmdb.org/t/p/w200/hG1z0c2gZ0qXQY0g0Z0c2gZ0qXQ.jpg" }
    ],
    comments: [
      { id: 1, author: "Питер Паркер", text: "Стиль анимации просто взрывает мозг!", likes: 200, dislikes: 1 }
    ]
  },
  {
    id: 4,
    title: "Бедные-несчастные",
    releaseYear: 2023,
    tags: ["Комедия", "Фантастика"],
    rating: 8.0,
    description: "История о молодой женщине Белле Бакстер, которую вернул к жизни блестящий и неортодоксальный ученый доктор Годвин Бакстер.",
    cast: [
      { name: "Эмма Стоун", photoUrl: "https://image.tmdb.org/t/p/w200/hG1z0c2gZ0qXQY0g0Z0c2gZ0qXQ.jpg" },
      { name: "Марк Руффало", photoUrl: "https://image.tmdb.org/t/p/w200/hG1z0c2gZ0qXQY0g0Z0c2gZ0qXQ.jpg" }
    ],
    comments: []
  },
  {
    id: 5,
    title: "Бэтмен",
    releaseYear: 2022,
    tags: ["Боевик", "Триллер"],
    rating: 7.8,
    description: "В свой второй год борьбы с преступностью Бэтмен раскрывает коррупцию в Готэм-сити, которая связывает его собственную семью на фоне погони за серийным убийцей.",
    cast: [
      { name: "Роберт Паттинсон", photoUrl: "https://image.tmdb.org/t/p/w200/hG1z0c2gZ0qXQY0g0Z0c2gZ0qXQ.jpg" },
      { name: "Зои Кравиц", photoUrl: "https://image.tmdb.org/t/p/w200/hG1z0c2gZ0qXQY0g0Z0c2gZ0qXQ.jpg" }
    ],
    comments: [
      { id: 1, author: "Готэм", text: "Атмосфера топ.", likes: 450, dislikes: 120 }
    ]
  },
  {
    id: 6,
    title: "Матрица",
    releaseYear: 1999,
    tags: ["Фантастика", "Боевик"],
    rating: 8.7,
    description: "Хакер Нео узнает шокирующую правду о том, что вся его жизнь - это иллюзия, созданная машинами, и присоединяется к повстанцам.",
    cast: [
      { name: "Киану Ривз", photoUrl: "https://image.tmdb.org/t/p/w200/hG1z0c2gZ0qXQY0g0Z0c2gZ0qXQ.jpg" },
      { name: "Кэрри-Энн Мосс", photoUrl: "https://image.tmdb.org/t/p/w200/hG1z0c2gZ0qXQY0g0Z0c2gZ0qXQ.jpg" }
    ],
    comments: []
  },
  {
    id: 7,
    title: "Интерстеллар",
    releaseYear: 2014,
    tags: ["Фантастика", "Драма"],
    rating: 8.6,
    description: "Команда исследователей отправляется сквозь недавно обнаруженную кротовую нору в космосе в попытке обеспечить выживание человечества.",
    cast: [
      { name: "Мэттью Макконахи", photoUrl: "https://image.tmdb.org/t/p/w200/hG1z0c2gZ0qXQY0g0Z0c2gZ0qXQ.jpg" },
      { name: "Энн Хэтэуэй", photoUrl: "https://image.tmdb.org/t/p/w200/hG1z0c2gZ0qXQY0g0Z0c2gZ0qXQ.jpg" }
    ],
    comments: []
  },
  {
    id: 8,
    title: "Унесенные призраками",
    releaseYear: 2001,
    tags: ["Мультфильм", "Приключения"],
    rating: 8.6,
    description: "Десятилетняя Тихиро переезжает с родителями в новый дом. Игнорируя правила, они попадают в пустующий город, который оказывается миром богов и призраков.",
    cast: [
      { name: "Руми Хиираги", photoUrl: "https://image.tmdb.org/t/p/w200/hG1z0c2gZ0qXQY0g0Z0c2gZ0qXQ.jpg" }
    ],
    comments: []
  }
];
