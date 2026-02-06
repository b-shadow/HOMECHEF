# 🍳 HomeChef - Sistema de Autenticación

## 📋 Estructura del Proyecto

```
src/
├── components/
│   └── Login.tsx           # Componente de login con 3 roles
├── pages/
│   └── Dashboard.tsx       # Dashboard que se muestra después del login
├── services/
│   ├── api.ts              # Servicio de login simulado
│   └── mockData.ts         # Usuarios de prueba
├── types/
│   └── index.ts            # Tipos TypeScript (User, LoginResponse)
├── App.tsx                 # Componente principal (maneja estado de login)
├── main.tsx                # Punto de entrada
└── index.css               # Estilos globales
```

## 🔐 Usuarios de Prueba

Puedes iniciar sesión con cualquiera de estas cuentas:

### Admin
- **Email:** admin@homechef.com
- **Contraseña:** admin123
- **Rol:** Administrador del sistema

### Cocinero
- **Email:** chef@homechef.com
- **Contraseña:** chef123
- **Rol:** Crea y gestiona recetas

### Cliente
- **Email:** cliente@homechef.com
- **Contraseña:** cliente123
- **Rol:** Busca y guarda recetas

## 🚀 Inicio Rápido

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run dev
```
La aplicación se abrirá en http://localhost:3000

### Build
```bash
npm run build
```

## 🎯 Funcionalidades

### Login
- Formulario de login con validación
- 3 roles diferentes (Admin, Cocinero, Cliente)
- Botones rápidos para iniciar sesión con cuentas de prueba
- Mensajes de error y manejo de estados

### Dashboard
- Interfaz personalizada según el rol del usuario
- Información del usuario (nombre, email, rol)
- Lista de características disponibles para cada rol
- Botón para cerrar sesión

## 💻 Tecnologías

- **React 18** - UI Framework
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultrarrápido
- **CSS3** - Estilos personalizados

---

**¡Proyecto listo para desarrollo! 🎉**
