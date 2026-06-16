// ============================================================
// Datos de la app: roster, colores y datos iniciales de turnos
// ============================================================

const ROSTER = [
  'Cabeza', 'Campi', 'Capdevila', 'Celina', 'Diaz', 'Echague',
  'Frias', 'Gomez', 'Hidalgo', 'Ibañez', 'Laporta', 'Martinez',
  'Milisenda', 'Montilla', 'Sallas'
];

// "Otros": gente que NO hace turnos regulares, solo aparece en días específicos
// (abogados, gente de oficios, marcadores especiales)
const OTROS = [
  'MARTIN', 'ALVARO',
  'JUAN DIAZ LOZA', 'JUAN PABLO GODOY', 'MARTIN VILLANUEVA', 'ALVARO GRIGNOLA',
  'FERIADO'
];

// Alias mantenidos por compatibilidad con código que aún los referencia
const ABOGADOS = ['JUAN DIAZ LOZA', 'JUAN PABLO GODOY', 'MARTIN VILLANUEVA', 'ALVARO GRIGNOLA'];
const OFICIOS = ['MARTIN', 'ALVARO'];
const SPECIAL = ['FERIADO'];

const ALL_OPTIONS = [...ROSTER, ...OTROS];

// Color de equipo asignado a cada persona (idéntico al Excel)
const COLORS = {
  // Equipo durazno
  'Sallas':    '#F4B083',
  'Milisenda': '#F4B083',
  // Equipo amarillo
  'Hidalgo':  '#FFC000',
  'Ibañez':   '#FFC000',
  'Laporta':  '#FFC000',
  // Equipo verde
  'Cabeza':   '#C5E0B3',
  'Martinez': '#C5E0B3',
  'Celina':   '#C5E0B3',
  // Equipo azul
  'Frias':    '#8EAADB',
  'Diaz':     '#8EAADB',
  'Echague':  '#8EAADB',
  // Equipo violeta
  'Capdevila':'#7030A0',
  'Gomez':    '#7030A0',
  // Equipo gris
  'Campi':    '#BFBFBF',
  'Montilla': '#BFBFBF',
  // Abogados y oficios (gris claro)
  'JUAN DIAZ LOZA':    '#D8D8D8',
  'JUAN PABLO GODOY':  '#D8D8D8',
  'MARTIN VILLANUEVA': '#D8D8D8',
  'ALVARO GRIGNOLA':   '#D8D8D8',
  'MARTIN':            '#D8D8D8',
  'ALVARO':            '#D8D8D8',
  // Especial
  'FERIADO':           '#FCD9D9'
};

// Nombres con texto blanco (fondo oscuro)
const WHITE_TEXT = new Set(['Capdevila', 'Gomez']);

// ============================================================
// Datos iniciales — extraídos del Excel histórico
// Estructura: { "YYYY-MM": { "dia": [[nombreA, nombreB], ...] } }
// Estos datos se cargan solo la PRIMERA vez. Luego, todo lo
// que el usuario edita se guarda en localStorage.
// ============================================================
const SEED_DATA = {
  "2023-08": {
    "1": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "2": [
      [
        "Barcia",
        "Celina"
      ]
    ],
    "3": [
      [
        "Barcia",
        "Celina"
      ]
    ],
    "4": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "5": [
      [
        "Frias",
        "Milisenda"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "6": [
      [
        "Frias",
        "Milisenda"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "7": [
      [
        "Sallas",
        "Echague"
      ]
    ],
    "8": [
      [
        "Sallas",
        "Echague"
      ]
    ],
    "9": [
      [
        "Montilla",
        "Aquino"
      ]
    ],
    "10": [
      [
        "Montilla",
        "Aquino"
      ]
    ],
    "11": [
      [
        "Frias",
        "Capdevila"
      ]
    ],
    "12": [
      [
        "Barcia",
        "Celina"
      ],
      [
        "Capdevila",
        null
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "13": [
      [
        "Barcia",
        "Celina"
      ],
      [
        "Gomez",
        null
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "14": [
      [
        "Campi",
        "Diaz"
      ]
    ],
    "15": [
      [
        "Campi",
        "Diaz"
      ]
    ],
    "16": [
      [
        "Sallas",
        "Echague"
      ]
    ],
    "17": [
      [
        "Sallas",
        "Echague"
      ]
    ],
    "18": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "19": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "20": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "21": [
      [
        "Frias",
        "Milisenda"
      ]
    ],
    "22": [
      [
        "Frias",
        "Milisenda"
      ]
    ],
    "23": [
      [
        "Campi",
        "Diaz"
      ]
    ],
    "24": [
      [
        "Campi",
        "Diaz"
      ]
    ],
    "25": [
      [
        "Barcia",
        "Celina"
      ],
      [
        "Capdevila",
        null
      ]
    ],
    "26": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "27": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "28": [
      [
        "Montilla",
        "Aquino"
      ]
    ],
    "29": [
      [
        "Montilla",
        "Aquino"
      ]
    ],
    "30": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "31": [
      [
        "Cabeza",
        "Martinez"
      ]
    ]
  },
  "2023-09": {
    "14": [
      [
        "Campi",
        "Diaz"
      ]
    ],
    "15": [
      [
        "Campi",
        "Diaz"
      ]
    ],
    "16": [
      [
        "Sallas",
        "Echague"
      ]
    ],
    "17": [
      [
        "Sallas",
        "Echague"
      ]
    ],
    "18": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "19": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "20": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "21": [
      [
        "Frias",
        "Milisenda"
      ]
    ],
    "22": [
      [
        "Frias",
        "Milisenda"
      ]
    ],
    "23": [
      [
        "Campi",
        "Diaz"
      ]
    ],
    "24": [
      [
        "Campi",
        "Diaz"
      ]
    ],
    "25": [
      [
        "Barcia",
        "Celina"
      ],
      [
        "Capdevila",
        null
      ]
    ],
    "26": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "27": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "28": [
      [
        "Montilla",
        "Aquino"
      ]
    ],
    "29": [
      [
        "Montilla",
        "Aquino"
      ]
    ],
    "30": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "31": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "1": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "2": [
      [
        "Milisenda",
        "Gomez"
      ]
    ],
    "3": [
      [
        "Milisenda",
        "Gomez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "4": [
      [
        "Montilla",
        "Echague"
      ]
    ],
    "5": [
      [
        "Montilla",
        "Echague"
      ]
    ],
    "6": [
      [
        "Sallas",
        "Barcia"
      ]
    ],
    "7": [
      [
        "Sallas",
        "Barcia"
      ]
    ],
    "8": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "9": [
      [
        "Campi",
        "Capdevila"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "10": [
      [
        "Campi",
        "Capdevila"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "11": [
      [
        "Sallas",
        "Celina"
      ]
    ],
    "12": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "13": [
      [
        "Milisenda",
        "Gomez"
      ]
    ]
  },
  "2023-10": {
    "18": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Van Genderen",
        null
      ]
    ],
    "19": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Van Genderen",
        null
      ]
    ],
    "20": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "21": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "22": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "23": [
      [
        "Sallas",
        "Celina"
      ],
      [
        "Criado",
        null
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "24": [
      [
        "Sallas",
        "Celina"
      ],
      [
        "Criado",
        null
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "25": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "26": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "27": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "28": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "29": [
      [
        "Sallas",
        "Celina"
      ]
    ],
    "30": [
      [
        "Frias",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "1": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "2": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "3": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "4": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "5": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "6": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "7": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "8": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "9": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "10": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "11": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "12": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "13": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "Feriado",
        null
      ]
    ],
    "14": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "15": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "16": [
      [
        "Campi",
        "Echague"
      ],
      [
        "Feriado",
        null
      ]
    ],
    "17": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "31": [
      [
        "Frias",
        "Diaz"
      ]
    ]
  },
  "2023-11": {
    "16": [
      [
        "Campi",
        "Echague"
      ],
      [
        "Feriado",
        null
      ]
    ],
    "17": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "18": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "19": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "20": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Milisendas",
        null
      ]
    ],
    "21": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "22": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "23": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "24": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "25": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "26": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "27": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "Milisendas",
        null
      ]
    ],
    "28": [
      [
        "Campi",
        "Echague"
      ],
      [
        "Milisendas",
        null
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "29": [
      [
        "Campi",
        "Echague"
      ],
      [
        "Milisendas",
        null
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "30": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "31": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "1": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "2": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "3": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "4": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "5": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "6": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "7": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "8": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "9": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "10": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "11": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "12": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "13": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "14": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "15": [
      [
        "Montilla",
        "Milisenda"
      ]
    ]
  },
  "2023-12": {
    "20": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "21": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "22": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "23": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "24": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "25": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "26": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "27": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "28": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "29": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "30": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "1": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "2": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "3": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "4": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "5": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "6": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Criado",
        null
      ]
    ],
    "7": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Criado",
        null
      ]
    ],
    "8": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "9": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "10": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "11": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "12": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "13": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "14": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "15": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "16": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Criado",
        null
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "17": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Criado",
        null
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "18": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "19": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "31": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "MARTIN",
        null
      ]
    ]
  },
  "2024-01": {
    "18": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "19": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "20": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "21": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "22": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "23": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "24": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "25": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "26": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "27": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "28": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "29": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "30": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "31": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "1": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "2": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "3": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "4": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "5": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "6": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "7": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "8": [
      [
        "Capdevila",
        "Milisenda"
      ]
    ],
    "9": [
      [
        "Capdevila",
        "Milisenda"
      ]
    ],
    "10": [
      [
        "Capdevila",
        "Milisenda"
      ]
    ],
    "11": [
      [
        "Capdevila",
        "Milisenda"
      ]
    ],
    "12": [
      [
        "Capdevila",
        "Milisenda"
      ]
    ],
    "13": [
      [
        "Capdevila",
        "Milisenda"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "14": [
      [
        "Capdevila",
        "Milisenda"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "15": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Capdevila",
        "Milisenda"
      ]
    ],
    "16": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "17": [
      [
        "Sallas",
        "Gomez"
      ]
    ]
  },
  "2024-02": {
    "15": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Capdevila",
        "Milisenda"
      ]
    ],
    "16": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "17": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "18": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "19": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "20": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "21": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "22": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "23": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "24": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "25": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "26": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "27": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "28": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "29": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "30": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "31": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "1": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "2": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "3": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "4": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "5": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "6": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "7": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "8": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "9": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "10": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "11": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "12": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "13": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "14": [
      [
        "Campi",
        "Echague"
      ]
    ]
  },
  "2024-03": {
    "19": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "20": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "21": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "22": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "23": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "24": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "25": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "26": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "27": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "28": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "29": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "1": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "2": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "3": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "4": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "5": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "6": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "7": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "8": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "9": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "10": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "11": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "12": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "13": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "14": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "15": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "16": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "17": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "18": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "30": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "31": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "MARTIN",
        null
      ]
    ]
  },
  "2024-04": {
    "18": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "19": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "20": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "21": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "22": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "23": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "24": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "25": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "26": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "27": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "28": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "29": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "30": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "31": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "1": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "2": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "3": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "4": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "5": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "6": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "7": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "8": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "9": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "10": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "11": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "12": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "13": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "14": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "15": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "16": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "17": [
      [
        "Montilla",
        "Milisenda"
      ]
    ]
  },
  "2024-05": {
    "22": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "23": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "24": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "25": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "26": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "27": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "28": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "29": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "30": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "1": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "2": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "3": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "4": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "5": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "6": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "7": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "8": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "9": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "10": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "11": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "12": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "13": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "14": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "15": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "16": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "17": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "18": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "19": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "20": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "21": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "31": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ]
  },
  "2024-06": {
    "20": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "21": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "22": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "23": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "24": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "25": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "26": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "27": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "28": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "29": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "30": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "31": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "1": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "2": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "3": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "4": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "5": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "6": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "7": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "8": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "9": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "10": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "11": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "12": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "13": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "14": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "15": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "16": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "17": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "18": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "19": [
      [
        "Montilla",
        "Milisenda"
      ]
    ]
  },
  "2024-07": {
    "17": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "18": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "19": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "20": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "21": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "22": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "23": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "24": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "25": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "26": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "27": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "28": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "29": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "30": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "1": [
      [
        "Ibañez",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "2": [
      [
        "Ibañez",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "3": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "4": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "5": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "6": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "7": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "8": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri / Garcia Silvina",
        null
      ]
    ],
    "9": [
      [
        "Hidalgo",
        "Montilla"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri / Garcia Silvina",
        null
      ]
    ],
    "10": [
      [
        "Hidalgo",
        "Montilla"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri / Garcia Silvina",
        null
      ]
    ],
    "11": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri / Garcia Silvina",
        null
      ]
    ],
    "12": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri / Garcia Silvina",
        null
      ]
    ],
    "13": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri / Garcia Silvina",
        null
      ]
    ],
    "14": [
      [
        "Hidalgo",
        "Montilla"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri / Garcia Silvina",
        null
      ]
    ],
    "15": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri / Dulor Bernarda",
        null
      ]
    ],
    "16": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri / Dulor Bernarda",
        null
      ]
    ],
    "31": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ]
  },
  "2024-08": {
    "22": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri / Dulor Bernarda",
        null
      ]
    ],
    "23": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "24": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "25": [
      [
        "Ibañez",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "26": [
      [
        "Ibañez",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "27": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "28": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "29": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri / Dulor Bernarda",
        null
      ]
    ],
    "30": [
      [
        "Hidalgo",
        "Montilla"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "31": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "1": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "2": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "3": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "4": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "5": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "6": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "7": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "8": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "9": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "10": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Aron",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "11": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Aron",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "12": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "13": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "14": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "15": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "16": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "17": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "18": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "19": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "20": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "21": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Aron",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ]
  },
  "2024-09": {
    "19": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "20": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "21": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Aron",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "22": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Aron",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "23": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "24": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "25": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "26": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "27": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "28": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "29": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "30": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Aron",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "31": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "1": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "2": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "3": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "4": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "5": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "6": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "7": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "8": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "9": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "10": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "11": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "12": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "13": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "14": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "15": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "16": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "17": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "18": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ]
  },
  "2024-10": {
    "16": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "17": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "18": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "19": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "20": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "21": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "22": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "23": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "24": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "25": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "26": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "27": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "28": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "29": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "30": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "1": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "2": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "3": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "4": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "5": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "6": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "7": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "8": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "9": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "10": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "11": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "12": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "13": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "14": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "15": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "31": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ]
  },
  "2024-11": {
    "21": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "22": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "23": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "24": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "25": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "26": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "27": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "28": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "29": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "30": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "31": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "1": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "2": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "3": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "4": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "5": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "6": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "7": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "8": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "9": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "10": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "11": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "12": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "13": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "14": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "15": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "16": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "17": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Tula Norri",
        null
      ]
    ],
    "18": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "19": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "20": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ]
  },
  "2024-12": {
    "18": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "19": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "20": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "21": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "22": [
      [
        "Montilla",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "23": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "24": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "25": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "26": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "27": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "28": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "29": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "30": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "1": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "2": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "3": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "4": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "5": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "6": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "7": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "8": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Dulor Bernarda",
        null
      ]
    ],
    "9": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "10": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "11": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "12": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "13": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "14": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "15": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "16": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "17": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "31": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ]
  },
  "2025-01": {
    "16": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "17": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "18": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "19": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "20": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "21": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "22": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "23": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "24": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "25": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "26": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "27": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "28": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "29": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "30": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "31": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ANTECEDENTES",
        null
      ],
      [
        "Garcia Silvina",
        null
      ]
    ],
    "1": [
      [
        "Cabeza",
        "Montilla"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "2": [
      [
        "Cabeza",
        "Montilla"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "3": [
      [
        "Cabeza",
        "Montilla"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "4": [
      [
        "Cabeza",
        "Montilla"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "5": [
      [
        "Cabeza",
        "Montilla"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "6": [
      [
        "Cabeza",
        "Montilla"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "7": [
      [
        "Cabeza",
        "Montilla"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "8": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Milisenda",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "9": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Milisenda",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "10": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Milisenda",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "11": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Milisenda",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "12": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Milisenda",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "13": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Milisenda",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "14": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "Milisenda",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "15": [
      [
        "Cabeza",
        "Milisenda"
      ],
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ]
  },
  "2025-02": {
    "20": [
      [
        "Campi",
        "Capdevila"
      ],
      [
        "Celina",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "21": [
      [
        "Campi",
        "Capdevila"
      ],
      [
        "Celina",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "22": [
      [
        "Campi",
        "Capdevila"
      ],
      [
        "Celina",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "23": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "24": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "25": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "26": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "27": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "28": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "29": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "30": [
      [
        "Campi",
        "Capdevila"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "31": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "1": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "2": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "3": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "4": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "5": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "6": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "7": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "8": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "9": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "10": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "11": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "12": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "13": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "14": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "15": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "16": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "17": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "18": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "19": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ]
  },
  "2025-03": {
    "17": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "18": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "19": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "20": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "21": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "22": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "23": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "24": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "25": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "26": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "27": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "28": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ANTECEDENTES",
        null
      ]
    ],
    "1": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "2": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "3": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "4": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "5": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "6": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "7": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ],
    "8": [
      [
        "Campi",
        "Echague"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "9": [
      [
        "Campi",
        "Echague"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "10": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "11": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "12": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "13": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "14": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "15": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "16": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "29": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "30": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "31": [
      [
        "Campi",
        "Echague"
      ]
    ]
  },
  "2025-04": {
    "17": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ],
    "18": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ],
    "19": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "20": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "21": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ]
    ],
    "22": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "23": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "24": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "25": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "26": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ],
    "27": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ],
    "28": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "29": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "30": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "31": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "1": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "2": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "3": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ]
    ],
    "4": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "5": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "6": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "7": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "8": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "9": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "10": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "11": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "12": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "13": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "14": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ]
    ],
    "15": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ]
    ],
    "16": [
      [
        "Frias",
        "Diaz"
      ]
    ]
  },
  "2025-05": {
    "21": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "22": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "23": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ],
    "24": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ],
    "25": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ]
    ],
    "26": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "27": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "28": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "29": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "30": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "1": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "2": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "3": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "4": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "5": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "6": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "7": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "8": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "9": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "10": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "11": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "12": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ],
    "13": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ],
    "14": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ]
    ],
    "15": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "Raflo",
        null
      ]
    ],
    "16": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "17": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "18": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "19": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "20": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "31": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "MARTIN",
        null
      ]
    ]
  },
  "2025-06": {
    "19": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "20": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "21": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "22": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "23": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "24": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "25": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "26": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "27": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "28": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "29": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "30": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "31": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "1": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "2": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "3": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "4": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "5": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "6": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "7": [
      [
        "Capdevila",
        "Laporta"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "8": [
      [
        "Capdevila",
        "Laporta"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "9": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "10": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "11": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "12": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "13": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "14": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "15": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "16": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "17": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "18": [
      [
        "Capdevila",
        "Laporta"
      ]
    ]
  },
  "2025-07": {
    "16": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "17": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "18": [
      [
        "Capdevila",
        "Laporta"
      ]
    ],
    "19": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "20": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "21": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "22": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "23": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "24": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "25": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "26": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "27": [
      [
        "Capdevila",
        "Laporta"
      ]
    ],
    "28": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "29": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "30": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "1": [
      [
        "Capdevila",
        "Montilla"
      ]
    ],
    "2": [
      [
        "Ibañez",
        "Gomez"
      ]
    ],
    "3": [
      [
        "Ibañez",
        "Gomez"
      ]
    ],
    "4": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "5": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "6": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "7": [
      [
        "Sallas",
        "Diaz"
      ],
      [
        "Campi",
        "Echague"
      ],
      [
        "JUAN PABLO GODOY",
        null
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "MARTIN VILLANUEVA",
        null
      ]
    ],
    "8": [
      [
        "Sallas",
        "Diaz"
      ],
      [
        "Campi",
        "Echague"
      ],
      [
        "JUAN PABLO GODOY",
        null
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "MARTIN VILLANUEVA",
        null
      ]
    ],
    "9": [
      [
        "Sallas",
        "Diaz"
      ],
      [
        "Campi",
        "Echague"
      ],
      [
        "JUAN PABLO GODOY",
        null
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "MARTIN VILLANUEVA",
        null
      ]
    ],
    "10": [
      [
        "Sallas",
        "Diaz"
      ],
      [
        "Campi",
        "Echague"
      ],
      [
        "JUAN PABLO GODOY",
        null
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "MARTIN VILLANUEVA",
        null
      ]
    ],
    "11": [
      [
        "Sallas",
        "Diaz"
      ],
      [
        "Campi",
        "Echague"
      ],
      [
        "JUAN PABLO GODOY",
        null
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "MARTIN VILLANUEVA",
        null
      ]
    ],
    "12": [
      [
        "Sallas",
        "Diaz"
      ],
      [
        "Campi",
        "Echague"
      ],
      [
        "JUAN PABLO GODOY",
        null
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "MARTIN VILLANUEVA",
        null
      ]
    ],
    "13": [
      [
        "Sallas",
        "Diaz"
      ],
      [
        "Campi",
        "Echague"
      ],
      [
        "JUAN PABLO GODOY",
        null
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "MARTIN VILLANUEVA",
        null
      ]
    ],
    "14": [
      [
        "Hidalgo",
        "Laporta"
      ],
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "ALVARO GRIGNOLA",
        null
      ]
    ],
    "15": [
      [
        "Hidalgo",
        "Laporta"
      ],
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "ALVARO GRIGNOLA",
        null
      ]
    ],
    "31": [
      [
        "Frias",
        "Sallas"
      ]
    ]
  },
  "2025-08": {
    "21": [
      [
        "Hidalgo",
        "Laporta"
      ],
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ALVARO GRIGNOLA",
        null
      ]
    ],
    "22": [
      [
        "Capdevila",
        "Milisenda"
      ]
    ],
    "23": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "24": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "25": [
      [
        "Frias",
        "Campi"
      ]
    ],
    "26": [
      [
        "Ibañez",
        "Gomez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "27": [
      [
        "Ibañez",
        "Gomez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "28": [
      [
        "Capdevila",
        "Hidalgo"
      ]
    ],
    "29": [
      [
        "Capdevila",
        "Laporta"
      ]
    ],
    "30": [
      [
        "Frias",
        "Echague"
      ]
    ],
    "31": [
      [
        "Frias",
        "Sallas"
      ]
    ],
    "1": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "2": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "3": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "4": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "5": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "6": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "7": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "8": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "9": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "10": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "11": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "12": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "13": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "14": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "15": [
      [
        "Hidalgo",
        "Laporta"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "16": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "17": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "18": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "19": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "20": [
      [
        "Campi",
        "Echague"
      ]
    ]
  },
  "2025-09": {
    "18": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "19": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "20": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "21": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "22": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "23": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "24": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "25": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "26": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "27": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "28": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "29": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "30": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "31": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "1": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ],
    "2": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ],
    "3": [
      [
        "Hidalgo",
        "Laporta"
      ]
    ],
    "4": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "5": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "6": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "7": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "8": [
      [
        "Capdevila",
        "Montilla"
      ]
    ],
    "9": [
      [
        "Capdevila",
        "Montilla"
      ]
    ],
    "10": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "11": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "12": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "13": [
      [
        "Milisenda",
        "Celina"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "14": [
      [
        "Milisenda",
        "Celina"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "15": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "16": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "17": [
      [
        "Frias",
        "Diaz"
      ]
    ]
  },
  "2025-10": {
    "22": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "23": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "24": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "25": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "26": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "27": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "28": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "29": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "30": [
      [
        "Hidalgo",
        "Laporta"
      ]
    ],
    "1": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "2": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "3": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "4": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "5": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "6": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "7": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "8": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "9": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "10": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "11": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "12": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "13": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "14": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "15": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "16": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "17": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "(Laporta)",
        null
      ]
    ],
    "18": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "19": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "20": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "21": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "31": [
      [
        "Frias",
        "Diaz"
      ]
    ]
  },
  "2025-11": {
    "20": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "21": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "22": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "23": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "24": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "25": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "26": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "27": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "28": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "29": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "(Laporta)",
        null
      ]
    ],
    "30": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "(Laporta)",
        null
      ]
    ],
    "31": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "1": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "2": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "3": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "4": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "5": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "6": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "7": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "8": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "9": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "10": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "11": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "12": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "13": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "14": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "15": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "16": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "17": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "18": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "19": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ]
  },
  "2025-12": {
    "17": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "18": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "19": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "20": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "21": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "22": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "23": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "24": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "25": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "26": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "27": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "28": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "29": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "30": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "1": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "2": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "3": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ],
    "4": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "5": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "6": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "7": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "8": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "9": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "10": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "11": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "12": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "13": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "14": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "15": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ],
    "16": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "31": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ]
  },
  "2026-02": {
    "22": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "23": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "24": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "25": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "26": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ],
    "27": [
      [
        "Campi",
        "Echague"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "28": [
      [
        "Campi",
        "Echague"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "29": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "30": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "31": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "1": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "2": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "3": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "4": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "5": [
      [
        "Frias",
        "Diaz"
      ]
    ],
    "6": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "7": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "8": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "9": [
      [
        "Diaz",
        "Laporta"
      ]
    ],
    "10": [
      [
        "Diaz",
        "Laporta"
      ]
    ],
    "11": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "12": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "13": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "14": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "15": [
      [
        "Campi",
        "Echague"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "16": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "17": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "18": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "19": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "20": [
      [
        "Diaz",
        "Laporta"
      ]
    ],
    "21": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "MARTIN",
        null
      ]
    ]
  },
  "2026-03": {
    "16": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "17": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "18": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "19": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "20": [
      [
        "Diaz",
        "Laporta"
      ]
    ],
    "21": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "22": [
      [
        "Montilla",
        "Milisenda"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "23": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "24": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "25": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "26": [
      [
        "Cabeza",
        "Martinez"
      ]
    ],
    "27": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "28": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "1": [
      [
        "Capdevila",
        "Celina"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "2": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "3": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "4": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "5": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "6": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "7": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "8": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "9": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "10": [
      [
        "Hidalgo",
        "Ibañez"
      ]
    ],
    "11": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "12": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "13": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "14": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "15": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "29": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "30": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ],
    "31": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ]
  },
  "2026-04": {
    "16": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "17": [
      [
        "Campi",
        "Echague"
      ]
    ],
    "18": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "19": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "20": [
      [
        "Sallas",
        "Gomez"
      ]
    ],
    "21": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "22": [
      [
        "Hidalgo",
        "Ibañez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "23": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "24": [
      [
        "Frias",
        "Diaz"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "25": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "26": [
      [
        "Montilla",
        "Milisenda"
      ]
    ],
    "27": [
      [
        "Capdevila",
        "Celina"
      ]
    ],
    "28": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "29": [
      [
        "Sallas",
        "Gomez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "30": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ],
    "31": [
      [
        "Cabeza",
        "Martinez"
      ],
      [
        "Laporta",
        null
      ]
    ],
    "1": [
      [
        "Sallas",
        "Ibañez"
      ],
      [
        "Martinez",
        null
      ]
    ],
    "2": [
      [
        "Hidalgo",
        "Laporta"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "3": [
      [
        "Hidalgo",
        "Laporta"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "4": [
      [
        "Campi",
        "Montilla"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "5": [
      [
        "Campi",
        "Montilla"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "6": [
      [
        "Capdevila",
        "Gomez"
      ]
    ],
    "7": [
      [
        "Capdevila",
        "Gomez"
      ]
    ],
    "8": [
      [
        "Cabeza",
        "Celina"
      ]
    ],
    "9": [
      [
        "Cabeza",
        "Celina"
      ]
    ],
    "10": [
      [
        "Frias",
        "Echague"
      ]
    ],
    "11": [
      [
        "Milisenda",
        "Diaz"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "12": [
      [
        "Milisenda",
        "Diaz"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "13": [
      [
        "Sallas",
        "Ibañez"
      ],
      [
        "Martinez",
        null
      ]
    ],
    "14": [
      [
        "Sallas",
        "Ibañez"
      ],
      [
        "Martinez",
        null
      ]
    ],
    "15": [
      [
        "Campi",
        "Montilla"
      ]
    ]
  },
  "2026-05": {
    "20": [
      [
        "Hidalgo",
        "Laporta"
      ]
    ],
    "21": [
      [
        "Hidalgo",
        "Laporta"
      ]
    ],
    "22": [
      [
        "Milisenda",
        "Diaz"
      ]
    ],
    "23": [
      [
        "Milisenda",
        "Diaz"
      ]
    ],
    "24": [
      [
        "Sallas",
        "Ibañez"
      ],
      [
        "Martinez",
        null
      ]
    ],
    "25": [
      [
        "Capdevila",
        "Gomez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "26": [
      [
        "Capdevila",
        "Gomez"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "27": [
      [
        "Cabeza",
        "Celina"
      ]
    ],
    "28": [
      [
        "Cabeza",
        "Celina"
      ]
    ],
    "29": [
      [
        "Frias",
        "Echague"
      ]
    ],
    "30": [
      [
        "Frias",
        "Echague"
      ]
    ],
    "1": [
      [
        "Ibañez",
        "Echague"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "2": [
      [
        "Ibañez",
        "Montilla"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "3": [
      [
        "Cabeza",
        "Celina"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "4": [
      [
        "Frias",
        "Echague"
      ]
    ],
    "5": [
      [
        "Frias",
        "Echague"
      ]
    ],
    "6": [
      [
        "Sallas",
        "Martinez"
      ]
    ],
    "7": [
      [
        "Sallas",
        "Martinez"
      ]
    ],
    "8": [
      [
        "Cabeza",
        "Celina"
      ]
    ],
    "9": [
      [
        "Hidalgo",
        "Laporta"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "10": [
      [
        "Hidalgo",
        "Laporta"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "11": [
      [
        "Milisenda",
        "Diaz"
      ]
    ],
    "12": [
      [
        "Milisenda",
        "Diaz"
      ]
    ],
    "13": [
      [
        "Capdevila",
        "Gomez"
      ]
    ],
    "14": [
      [
        "Capdevila",
        "Gomez"
      ]
    ],
    "15": [
      [
        "Hidalgo",
        "Laporta"
      ]
    ],
    "16": [
      [
        "Campi",
        "Montilla"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "17": [
      [
        "Campi",
        "Montilla"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "18": [
      [
        "Cabeza",
        "Celina"
      ]
    ],
    "19": [
      [
        "Cabeza",
        "Celina"
      ]
    ],
    "31": [
      [
        "Sallas",
        "Ibañez"
      ],
      [
        "Martinez",
        null
      ],
      [
        "ALVARO",
        null
      ]
    ]
  },
  "2026-06": {
    "18": [
      [
        "Cabeza",
        "Celina"
      ]
    ],
    "19": [
      [
        "Cabeza",
        "Celina"
      ]
    ],
    "20": [
      [
        "Frias",
        "Echague"
      ]
    ],
    "21": [
      [
        "Frias",
        "Echague"
      ]
    ],
    "22": [
      [
        "Campi",
        "Montilla"
      ]
    ],
    "23": [
      [
        "Milisenda",
        "Diaz"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "24": [
      [
        "Milisenda",
        "Diaz"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "25": [
      [
        "Capdevila",
        "Gomez"
      ],
      [
        "FERIADO",
        null
      ]
    ],
    "26": [
      [
        "Capdevila",
        "Gomez"
      ]
    ],
    "27": [
      [
        "Hidalgo",
        "Laporta"
      ]
    ],
    "28": [
      [
        "Hidalgo",
        "Laporta"
      ]
    ],
    "29": [
      [
        "Milisenda",
        "Diaz"
      ]
    ],
    "30": [
      [
        "Sallas",
        "Ibañez"
      ],
      [
        "Martinez",
        null
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "31": [
      [
        "Sallas",
        "Ibañez"
      ],
      [
        "Martinez",
        null
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "1": [
      [
        "Campi",
        "Montilla"
      ]
    ],
    "2": [
      [
        "Campi",
        "Montilla"
      ]
    ],
    "3": [
      [
        "Cabeza",
        "Celina"
      ]
    ],
    "4": [
      [
        "Cabeza",
        "Celina"
      ]
    ],
    "5": [
      [
        "Sallas",
        "Ibañez"
      ],
      [
        "Martinez",
        null
      ]
    ],
    "6": [
      [
        "Frias",
        "Echague"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "7": [
      [
        "Frias",
        "Echague"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "8": [
      [
        "Milisenda",
        "Diaz"
      ]
    ],
    "9": [
      [
        "Milisenda",
        "Diaz"
      ]
    ],
    "10": [
      [
        "Campi",
        "Montilla"
      ]
    ],
    "11": [
      [
        "Campi",
        "Laporta"
      ]
    ],
    "12": [
      [
        "Cabeza",
        "Celina"
      ]
    ],
    "13": [
      [
        "Capdevila",
        "Gomez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "14": [
      [
        "Capdevila",
        "Gomez"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "15": [
      [
        "Laporta",
        "Milisenda"
      ]
    ],
    "16": [
      [
        "Hidalgo",
        "Laporta"
      ]
    ],
    "17": [
      [
        "Sallas",
        "Ibañez"
      ]
    ]
  },
  "2026-07": {
    "22": [
      [
        "Frias",
        "Echague"
      ]
    ],
    "23": [
      [
        "Frias",
        "Echague"
      ]
    ],
    "24": [
      [
        "Milisenda",
        "Diaz"
      ]
    ],
    "25": [
      [
        "Milisenda",
        "Diaz"
      ]
    ],
    "26": [
      [
        "Campi",
        "Montilla"
      ]
    ],
    "27": [
      [
        "Hidalgo",
        "Laporta"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "28": [
      [
        "Hidalgo",
        "Laporta"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "29": [
      [
        "Capdevila",
        "Gomez"
      ]
    ],
    "30": [
      [
        "Capdevila",
        "Gomez"
      ]
    ],
    "1": [
      [
        "Hidalgo",
        "Laporta"
      ]
    ],
    "2": [
      [
        "Cabeza",
        "Celina"
      ]
    ],
    "3": [
      [
        "Cabeza",
        "Celina"
      ]
    ],
    "4": [
      [
        "Milisenda",
        "Diaz"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "5": [
      [
        "Milisenda",
        "Diaz"
      ],
      [
        "ALVARO",
        null
      ]
    ],
    "6": [
      [
        "Frias",
        "Martinez"
      ]
    ],
    "7": [
      [
        "Frias",
        "Martinez"
      ]
    ],
    "8": [
      [
        "Capdevila",
        "Gomez"
      ]
    ],
    "9": [
      [
        "Capdevila",
        "Gomez"
      ]
    ],
    "10": [
      [
        "Milisenda",
        "Laporta"
      ]
    ],
    "11": [
      [
        "Campi",
        "Montilla"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "12": [
      [
        "Campi",
        "Montilla"
      ],
      [
        "MARTIN",
        null
      ]
    ],
    "13": [
      [
        "Sallas",
        "Hidalgo"
      ],
      [
        "Diaz",
        "Celina"
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "ALVARO GRIGNOLA",
        null
      ]
    ],
    "14": [
      [
        "Sallas",
        "Hidalgo"
      ],
      [
        "Diaz",
        "Celina"
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "ALVARO GRIGNOLA",
        null
      ]
    ],
    "15": [
      [
        "Sallas",
        "Hidalgo"
      ],
      [
        "Diaz",
        "Celina"
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "ALVARO GRIGNOLA",
        null
      ]
    ],
    "16": [
      [
        "Sallas",
        "Hidalgo"
      ],
      [
        "Diaz",
        "Montilla"
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "ALVARO GRIGNOLA",
        null
      ]
    ],
    "17": [
      [
        "Sallas",
        "Hidalgo"
      ],
      [
        "Diaz",
        "Montilla"
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "ALVARO GRIGNOLA",
        null
      ]
    ],
    "18": [
      [
        "Sallas",
        "Hidalgo"
      ],
      [
        "Diaz",
        "Montilla"
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "ALVARO GRIGNOLA",
        null
      ]
    ],
    "19": [
      [
        "Sallas",
        "Hidalgo"
      ],
      [
        "Diaz",
        "Montilla"
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "ALVARO GRIGNOLA",
        null
      ]
    ],
    "20": [
      [
        "Cabeza",
        "Frias"
      ],
      [
        "Campi",
        "Gomez"
      ],
      [
        "JUAN PABLO GODOY",
        null
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "MARTIN VILLANUEVA",
        null
      ]
    ],
    "21": [
      [
        "Cabeza",
        "Frias"
      ],
      [
        "Campi",
        "Gomez"
      ],
      [
        "JUAN PABLO GODOY",
        null
      ],
      [
        "JUAN DIAZ LOZA",
        null
      ],
      [
        "MARTIN VILLANUEVA",
        null
      ]
    ]
  }
};

// Versión del seed para invalidar caché de localStorage si actualizás
const SEED_VERSION = '2';
