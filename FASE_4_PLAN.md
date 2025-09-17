# Fase 4: Frontend - Gestión de Bancos - Plan de Implementación

## Visión General
Este documento detalla el plan completo para implementar la gestión de bancos en el frontend, utilizando Alpine.js y conectándose con las APIs existentes del backend.

## Estado Actual
- ✅ Backend API completa para bancos (CRUD completo)
- ✅ Estructura frontend básica con Alpine.js
- ✅ Dashboard principal con estadísticas
- ✅ Sistema de autenticación funcional

## APIs Disponibles para Bancos

### Endpoints Principales
- `GET /api/banks` - Listar bancos con filtros y paginación
- `POST /api/banks` - Crear nuevo banco
- `GET /api/banks/:bankId/details` - Obtener detalles de banco
- `PUT /api/banks/:bankId` - Actualizar banco
- `DELETE /api/banks/:bankId` - Eliminar banco

### Parámetros de Filtros (GET /api/banks)
- `env?: string` - Filtrar por entorno
- `name?: string` - Filtrar por nombre
- `api?: string` - Filtrar por tipo de API
- `country?: string` - Filtrar por país
- `page?: string` - Número de página
- `limit?: string` - Límite de resultados por página

### Estructura de Datos para Creación/Actualización

#### Campos Requeridos
- `bank_id: string` - Identificador único del banco
- `name: string` - Nombre del banco
- `bank_codes: string[]` - Códigos bancarios
- `api: string` - Tipo de API
- `api_version: string` - Versión de la API
- `aspsp: string` - ASPSP del banco
- `country: string` - País del banco
- `auth_type_choice_required: boolean` - Requiere elección de tipo de autenticación

#### Campos Opcionales
- `bic?: string | null` - Código BIC
- `real_name?: string | null` - Nombre real
- `product_code?: string | null` - Código de producto
- `bank_group_id?: string | null` - ID del grupo bancario
- `logo_url?: string | null` - URL del logo
- `documentation?: string | null` - Documentación
- `keywords?: Record<string, unknown> | null` - Palabras clave
- `attribute?: Record<string, unknown> | null` - Atributos adicionales

## Componentes a Implementar

### 1. Vista de Listado de Bancos (`banks.html`)

#### Funcionalidades
- **Tabla de bancos**: Mostrar lista con información relevante
- **Paginación**: Navegación entre páginas de resultados
- **Filtros en tiempo real**: Búsqueda por nombre, país, API
- **Acciones rápidas**: Editar, Eliminar, Ver detalles
- **Indicadores de carga**: Mostrar durante peticiones asíncronas
- **Manejo de errores**: Mostrar mensajes de error amigables

#### Columnas de la Tabla
- ID del Banco
- Nombre
- País
- API
- Versión
- ASPSP
- Acciones (Editar, Eliminar, Ver)

#### Controles de Filtros
- Campo de búsqueda por nombre
- Selector de país
- Selector de tipo de API
- Selector de entorno
- Botón de limpiar filtros

### 2. Formulario de Creación/Edición (`bank-form.html`)

#### Secciones del Formulario
- **Información Básica**: Campos requeridos principales
- **Información Adicional**: Campos opcionales
- **Configuración de Entornos**: Configuración por entorno
- **Palabras Clave y Atributos**: Campos dinámicos

#### Validaciones
- **Campos requeridos**: Validación en tiempo real
- **Formato de email**: Para campos de contacto
- **Longitud mínima**: Para contraseñas y campos de texto
- **Formato específico**: Para códigos bancarios y BIC

#### Estados del Formulario
- **Modo creación**: Formulario vacío
- **Modo edición**: Cargar datos existentes
- **Cargando**: Deshabilitar durante envío
- **Error**: Mostrar mensajes de validación

### 3. Modal de Confirmación de Eliminación

#### Características
- **Diálogo modal**: Superposición sobre contenido actual
- **Información del banco**: Mostrar nombre y ID
- **Confirmación**: Requerir acción explícita
- **Cancelación**: Permitir cancelar operación
- **Protección**: Evitar eliminaciones accidentales

### 4. Vista Detallada de Banco (`bank-details.html`)

#### Información a Mostrar
- **Datos principales**: Todos los campos del banco
- **Configuración por entorno**: Detalles de configuración
- **Relaciones**: Grupo bancario asociado
- **Metadatos**: Fechas de creación/actualización
- **Acciones**: Editar, Eliminar, Volver

## Componentes Alpine.js

### 1. `banksList` Component
```javascript
Alpine.data('banksList', () => ({
    banks: [],
    filters: {
        name: '',
        country: '',
        api: '',
        env: ''
    },
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    },
    isLoading: false,
    error: null,
    
    // Métodos
    async loadBanks(),
    async deleteBank(bankId),
    applyFilters(),
    clearFilters(),
    changePage(page),
    showBankDetails(bankId),
    editBank(bankId)
}))
```

### 2. `bankForm` Component
```javascript
Alpine.data('bankForm', () => ({
    form: {
        // Todos los campos del formulario
    },
    isEditing: false,
    bankId: null,
    isLoading: false,
    errors: {},
    successMessage: '',
    
    // Métodos
    async submit(),
    async loadBankData(bankId),
    validateField(field),
    validateForm(),
    resetForm(),
    cancel()
}))
```

### 3. `confirmDialog` Component
```javascript
Alpine.data('confirmDialog', () => ({
    isOpen: false,
    bank: null,
    isLoading: false,
    
    // Métodos
    open(bank),
    close(),
    async confirm()
}))
```

## Estilos CSS Adicionales

### 1. Estilos para Tablas
```css
.banks-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.banks-table th,
.banks-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
}

.banks-table th {
    background: #f7fafc;
    font-weight: 600;
    color: #4a5568;
}

.banks-table tr:hover {
    background: #f7fafc;
}
```

### 2. Estilos para Formularios Complejos
```css
.form-section {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-section-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e2e8f0;
}

.form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}
```

### 3. Estilos para Modal Dialog
```css
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-dialog {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
    margin-bottom: 1rem;
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
}

.modal-body {
    margin-bottom: 1.5rem;
    color: #4a5568;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}
```

### 4. Estilos para Estados de Carga y Error
```css
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.error-alert {
    background: #fed7d7;
    border: 1px solid #feb2b2;
    color: #c53030;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
}

.success-alert {
    background: #c6f6d5;
    border: 1px solid #9ae6b4;
    color: #276749;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
}
```

## Estructura de Archivos a Crear

### 1. Vistas HTML
```
src/apps/banks/frontend/views/banks/
├── banks.html              # Vista principal de listado
├── bank-form.html          # Formulario de creación/edición
└── bank-details.html       # Vista detallada de banco
```

### 2. Contenido de `banks.html`
- Título: "Gestión de Bancos"
- Tabla con listado de bancos
- Controles de filtros y paginación
- Botón de "Agregar Nuevo Banco"
- Modal de confirmación de eliminación

### 3. Contenido de `bank-form.html`
- Título dinámico: "Crear Banco" / "Editar Banco"
- Formulario con todas las secciones
- Botones: "Guardar", "Cancelar"
- Validaciones en tiempo real

### 4. Contenido de `bank-details.html`
- Título: "Detalles del Banco"
- Información organizada por secciones
- Botones: "Editar", "Eliminar", "Volver"

## Integración con Dashboard Existente

### 1. Actualizar Navegación
```html
<!-- En dashboard.html -->
<nav>
    <ul class="nav-links">
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/banks">Bancos</a></li>
        <li><a href="/bank-groups">Grupos</a></li>
        <li><a href="#" @click="logout()">Logout</a></li>
    </ul>
</nav>
```

### 2. Actualizar Quick Actions
```html
<!-- En dashboard.html -->
<div style="display: flex; gap: 1rem; flex-wrap: wrap;">
    <a href="/banks" class="btn btn-primary">Manage Banks</a>
    <a href="/bank-groups" class="btn btn-secondary">Manage Bank Groups</a>
    <a href="#" class="btn btn-secondary">View Reports</a>
</div>
```

### 3. Actualizar Rutas en `routes.ts`
```typescript
// Añadir rutas para gestión de bancos
app.get('/banks', serveStatic('views/banks/banks.html'));
app.get('/banks/new', serveStatic('views/banks/bank-form.html'));
app.get('/banks/:id/edit', serveStatic('views/banks/bank-form.html'));
app.get('/banks/:id/details', serveStatic('views/banks/bank-details.html'));
```

## Flujo de Usuario

### 1. Listado de Bancos
1. Usuario accede a `/banks`
2. Componente carga lista de bancos
3. Usuario puede filtrar y paginar
4. Usuario puede crear, editar, eliminar o ver detalles

### 2. Creación de Banco
1. Usuario hace clic en "Agregar Nuevo Banco"
2. Navega a formulario vacío
3. Completa campos requeridos
4. Envía formulario
5. Redirige a listado con mensaje de éxito

### 3. Edición de Banco
1. Usuario hace clic en "Editar" en listado
2. Navega a formulario con datos cargados
3. Modifica campos necesarios
4. Envía formulario
5. Redirige a listado con mensaje de éxito

### 4. Eliminación de Banco
1. Usuario hace clic en "Eliminar" en listado
2. Se abre modal de confirmación
3. Usuario confirma eliminación
4. Se elimina banco y se actualiza lista

## Manejo de Errores

### 1. Errores de Red
- Mostrar mensaje genérico de conexión
- Permitir reintentar operación
- Registrar error en consola

### 2. Errores de API
- Mostrar mensaje específico del servidor
- Validar códigos de estado HTTP
- Manejar errores de autenticación

### 3. Errores de Validación
- Mostrar errores por campo
- Resaltar campos inválidos
- Permitir corrección y reenvío

## Pruebas y Validación

### 1. Pruebas Funcionales
- Crear banco con todos los campos
- Editar banco existente
- Eliminar banco con confirmación
- Filtrar por diferentes criterios
- Paginar resultados

### 2. Pruebas de Error
- Enviar formulario vacío
- Enviar datos inválidos
- Simular error de red
- Probar con token inválido

### 3. Pruebas de Usabilidad
- Validar flujo completo
- Probar en diferentes dispositivos
- Verificar accesibilidad
- Validar rendimiento

## Criterios de Aceptación

### 1. Funcionalidad
- [ ] CRUD completo para bancos
- [ ] Filtros funcionales
- [ ] Paginación operativa
- [ ] Validaciones efectivas
- [ ] Manejo de errores adecuado

### 2. Experiencia de Usuario
- [ ] Interfaz intuitiva
- [ ] Retroalimentación visual
- [ ] Tiempos de carga aceptables
- [ ] Diseño responsive
- [ ] Navegación fluida

### 3. Calidad de Código
- [ ] Código limpio y organizado
- [ ] Componentes reutilizables
- [ ] Estilos consistentes
- [ ] Sin errores de consola
- [ ] Buen rendimiento

## Próximos Pasos

1. **Crear estructura de vistas para bancos**
   - Crear carpeta `views/banks/`
   - Implementar `banks.html`
   - Implementar `bank-form.html`
   - Implementar `bank-details.html`

2. **Implementar componentes Alpine.js**
   - Crear componente `banksList`
   - Crear componente `bankForm`
   - Crear componente `confirmDialog`
   - Integrar con archivos HTML

3. **Conectar con APIs existentes**
   - Implementar llamadas a endpoints
   - Manejar respuestas y errores
   - Implementar autenticación JWT
   - Probar integración completa

4. **Añadir estilos adicionales**
   - Implementar estilos para tablas
   - Añadir estilos para formularios
   - Crear estilos para modales
   - Optimizar diseño responsive

5. **Probar integración completa**
   - Realizar pruebas funcionales
   - Validar manejo de errores
   - Probar en diferentes navegadores
   - Optimizar rendimiento

## Notas Importantes

- **Consistencia**: Mantener coherencia con estilos existentes
- **Seguridad**: Validar todos los datos de entrada
- **Performance**: Optimizar cargas y peticiones
- **Mantenibilidad**: Código limpio y bien documentado
- **Escalabilidad**: Diseñar para futuras funcionalidades

---
**Estado**: Planificación completada
**Próxima Fase**: Implementación
**Fecha**: Septiembre 2025