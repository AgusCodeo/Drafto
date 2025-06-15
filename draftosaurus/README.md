# 🦕 Draftosaurus - Sistema de Seguimiento y Juego Digital

Una aplicación web completa para el juego de mesa Draftosaurus que incluye tanto un modo de seguimiento para el juego físico como un modo de juego digital completo.

## 📋 Características

### 🎯 Dos Modos de Juego
- **Modo Seguimiento**: Herramienta auxiliar para contar puntos y validar reglas del juego físico
- **Modo Juego Digital**: Experiencia completa de juego digital con mecánicas de draft

### 🎮 Funcionalidades Principales
- ✅ Gestión de jugadores y partidas
- ✅ Colocación de dinosaurios con validación de reglas
- ✅ Sistema de puntuación automático según reglas oficiales
- ✅ Lanzamiento de dado con restricciones de colocación
- ✅ Soporte bilingüe (Español/Inglés)
- ✅ Interfaz responsive para móviles y tablets
- ✅ API REST completa para todas las operaciones

### 🦕 Mecánicas del Juego Implementadas
- **6 Especies de Dinosaurios**: T-Rex, Estegosaurio, Triceratops, Braquiosaurio, Pterodáctilo, Velociraptor
- **7 Recintos Diferentes** con reglas específicas:
  - Bosque de Igualdad (misma especie, puntuación exponencial)
  - Pradera de Diferencias (especies diferentes, puntuación triangular)
  - Pradera del Amor (parejas dan 5 puntos)
  - Trío Arbolado (exactamente 3 = 7 puntos)
  - Rey de la Jungla (mayoría de especies = 7 puntos)
  - Isla Solitaria (único de su especie = 7 puntos)
  - Río (1 punto por dinosaurio)
- **Bonus T-Rex**: +1 punto por recinto con al menos un T-Rex
- **Dado de Colocación**: 6 caras con restricciones de ubicación

## 🛠️ Tecnologías Utilizadas

### Backend
- **PHP 8.2** - Lenguaje de programación principal
- **MariaDB 10.11** - Base de datos relacional
- **Apache 2.4** - Servidor web
- **API REST** - Arquitectura de comunicación

### Frontend
- **HTML5** - Estructura de la aplicación
- **CSS3** - Estilos y diseño responsive
- **JavaScript ES6+** - Lógica de la aplicación
- **Google Fonts** - Tipografías

### Base de Datos
- **Esquema normalizado** con 8 tablas principales
- **Soporte para UUID** para identificadores únicos
- **Índices optimizados** para consultas eficientes

## 📁 Estructura del Proyecto

```
/app/draftosaurus/
├── backend/                 # Backend PHP
│   ├── config/
│   │   └── database.php     # Configuración de base de datos
│   ├── models/
│   │   ├── User.php         # Modelo de usuarios
│   │   ├── Game.php         # Modelo de juegos
│   │   └── ScoringEngine.php # Motor de puntuación
│   ├── api/
│   │   ├── users.php        # API de usuarios
│   │   ├── games.php        # API de juegos
│   │   └── boards.php       # API de tableros
│   └── index.php            # Router principal de API
├── frontend/                # Frontend web
│   ├── css/
│   │   └── styles.css       # Estilos principales
│   ├── js/
│   │   ├── app.js           # Aplicación principal
│   │   ├── i18n.js          # Internacionalización
│   │   └── gameRules.js     # Validación de reglas
│   ├── index.html           # Aplicación principal
│   └── test.html            # Panel de pruebas
└── database/
    └── schema.sql           # Esquema de base de datos
```

## 🚀 Instalación y Configuración

### Requisitos Previos
- PHP 8.2+
- MariaDB/MySQL 10.11+
- Apache 2.4+
- Módulos PHP: mysqli, json, curl

### Configuración del Servidor
1. **Configurar Apache**:
   ```bash
   # Habilitar sitio Draftosaurus
   a2ensite draftosaurus
   a2enmod rewrite
   service apache2 restart
   ```

2. **Configurar Base de Datos**:
   ```bash
   # Crear base de datos
   mysql -u root -p
   CREATE DATABASE draftosaurus;
   
   # Importar esquema
   mysql -u root -p draftosaurus < database/schema.sql
   ```

3. **Configurar Credenciales**:
   - Editar `backend/config/database.php` con credenciales correctas

### Acceso a la Aplicación
- **Aplicación Principal**: `http://localhost/frontend/index.html`
- **Panel de Pruebas**: `http://localhost/frontend/test.html`
- **API Health Check**: `http://localhost/api/health`

## 🎯 Uso de la Aplicación

### Modo Seguimiento
1. Seleccionar "Modo Seguimiento" en la pantalla principal
2. Configurar jugadores (2-5 jugadores)
3. Ingresar nombre del juego e iniciar
4. Para cada turno:
   - Lanzar dado (opcional, para restricciones)
   - Seleccionar dinosaurio y recinto
   - Colocar en el tablero
5. Calcular puntuaciones finales

### Modo Digital
1. Seleccionar "Modo Juego Digital"
2. Configurar jugadores y crear partida
3. El sistema maneja automáticamente:
   - Distribución de dinosaurios
   - Mecánicas de draft
   - Validación de reglas
   - Cálculo de puntuaciones

## 📊 Sistema de Puntuación

### Bosque de Igualdad
- 1 dino: 2 puntos
- 2 dinos: 4 puntos
- 3 dinos: 8 puntos
- 4 dinos: 12 puntos
- 5 dinos: 18 puntos
- 6 dinos: 24 puntos

### Pradera de Diferencias
- 1 dino: 1 punto
- 2 dinos: 3 puntos
- 3 dinos: 6 puntos
- 4 dinos: 10 puntos
- 5 dinos: 15 puntos
- 6 dinos: 21 puntos

### Otros Recintos
- **Pradera del Amor**: 5 puntos por pareja
- **Trío Arbolado**: 7 puntos si hay exactamente 3
- **Rey de la Jungla**: 7 puntos si tienes mayoría de esa especie
- **Isla Solitaria**: 7 puntos si es único de su especie
- **Río**: 1 punto por dinosaurio
- **Bonus T-Rex**: +1 punto por recinto con T-Rex

## 🔧 API Endpoints

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users/{id}` - Obtener usuario específico

### Juegos
- `GET /api/games/list` - Listar juegos
- `POST /api/games/create` - Crear juego
- `POST /api/games/join` - Unirse a juego
- `POST /api/games/roll-dice/{gameId}` - Lanzar dado

### Tableros
- `GET /api/boards/{gameId}` - Obtener todos los tableros
- `GET /api/boards/{gameId}/{userId}` - Obtener tablero específico
- `POST /api/boards/place-dinosaur` - Colocar dinosaurio
- `POST /api/boards/calculate-scores` - Calcular puntuaciones

### Utilidades
- `GET /api/species` - Obtener especies de dinosaurios
- `GET /api/health` - Estado de la API

## 🧪 Pruebas

### Panel de Pruebas Integrado
Acceder a `http://localhost/frontend/test.html` para:
- ✅ Verificar estado de la API
- ✅ Crear usuarios y juegos de prueba
- ✅ Probar colocación de dinosaurios
- ✅ Validar cálculos de puntuación
- ✅ Ejecutar flujo completo automatizado

### Ejemplo de Prueba con cURL
```bash
# Crear usuario
curl -X POST http://localhost/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"TestPlayer","email":"test@example.com"}'

# Crear juego
curl -X POST http://localhost/api/games/create \
  -H "Content-Type: application/json" \
  -d '{"game_name":"Test Game","game_mode":"tracking","created_by":"USER_ID"}'

# Colocar dinosaurio
curl -X POST http://localhost/api/boards/place-dinosaur \
  -H "Content-Type: application/json" \
  -d '{"game_id":"GAME_ID","user_id":"USER_ID","dinosaur_species":"trex","pen_location":"forest_of_sameness"}'

# Calcular puntuaciones
curl -X POST http://localhost/api/boards/calculate-scores \
  -H "Content-Type: application/json" \
  -d '{"game_id":"GAME_ID"}'
```

## 🌐 Soporte Multiidioma

La aplicación soporta completamente español e inglés:
- **Interfaz de usuario** traducida
- **Nombres de dinosaurios** en ambos idiomas
- **Mensajes de error** localizados
- **Descripción de reglas** bilingüe

## 📱 Diseño Responsive

- ✅ **Móviles**: Interfaz optimizada para pantallas pequeñas
- ✅ **Tablets**: Diseño adaptativo para tablets
- ✅ **Desktop**: Experiencia completa en escritorio
- ✅ **Accesibilidad**: Soporte para lectores de pantalla

## 🔒 Seguridad

- **Validación de entrada** en frontend y backend
- **Prevención de SQL injection** con prepared statements
- **CORS configurado** para acceso controlado
- **Sanitización de datos** en todas las operaciones

## ⚡ Rendimiento

- **Índices de base de datos** optimizados
- **Consultas eficientes** con JOINs apropiados
- **Carga diferida** de componentes frontend
- **Compresión de assets** en producción

## 🐛 Solución de Problemas

### Problemas Comunes
1. **Error de conexión a base de datos**: Verificar credenciales en `database.php`
2. **API no responde**: Comprobar configuración de Apache y mod_rewrite
3. **Puntuaciones incorrectas**: Verificar integridad de datos en tabla `player_boards`

### Logs
- **Apache**: `/var/log/apache2/draftosaurus_error.log`
- **PHP**: Configurar `error_log` en `php.ini`

## 📄 Licencia

Este proyecto está desarrollado según las especificaciones del proyecto Draftosaurus para uso educativo y de demostración.

## 👥 Autores

Desarrollado como implementación completa del sistema Draftosaurus con PHP, MySQL, HTML, CSS y JavaScript según especificaciones técnicas requeridas.

---

🦕 **¡Disfruta jugando Draftosaurus!** 🎲