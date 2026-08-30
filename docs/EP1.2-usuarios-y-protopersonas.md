# EP 1.2 - Usuarios objetivo y proto-personas

**FocalWare** · Priorización de limpieza por riesgo de incendio en las quebradas de Valparaíso

[← Volver al README](../README.md)

---

> **Para el equipo:** cada bloque **Por completar** dice qué falta en esa sección. Escribe tu nombre en *asignado a*, completa la sección y **borra el bloque** al terminar. Commitea tu parte desde tu propia cuenta.

---

> **Nota metodológica.** Durante esta etapa del proyecto no se realizó contacto directo con usuarios. La caracterización que sigue corresponde a una **aproximación preliminar** elaborada mediante investigación documental: fuentes académicas, informes públicos, estadísticas, sitios institucionales, normativa y análisis de soluciones existentes. Las proto-personas presentadas **no representan usuarios reales**, sino perfiles hipotéticos construidos a partir de esas fuentes secundarias y de supuestos razonados, los cuales se declaran explícitamente en la sección 9.

---

## 1. Alcance y método

El objetivo de este documento es caracterizar a quienes usarían FocalWare antes de tener acceso a usuarios reales, de modo que las decisiones de diseño e implementación puedan justificarse en algo más que en intuición del equipo.

El procedimiento seguido fue:

1. Delimitar el problema y su contexto territorial (desarrollado en el README, sección *Problema que aborda*).
2. Identificar los grupos de personas afectadas por ese problema y los que intervienen en su resolución.
3. Revisar fuentes secundarias para describir sus características, necesidades y limitaciones.
4. Traducir esa revisión en dos proto-personas, una por cada rol del sistema.
5. Declarar los supuestos utilizados, para que puedan validarse o corregirse más adelante.

> **Por completar - asignado a: ---------**
> Agregar un párrafo sobre las **soluciones existentes** que se revisaron (SOSAFE, sistemas de reclamos municipales, apps de reporte de microbasurales). Qué se tomó de ellas y qué se descartó.

## 2. Grupos de usuarios identificados

> **Por completar - asignado a: --------**
> Definir los dos grupos de usuarios a los que apunta la aplicación y qué los diferencia.

### 2.1 Habitantes de los cerros y quebradas de Valparaíso

> **Por completar - asignado a: ---------**
> Describir **características generales · necesidades · posibles dificultades** del grupo. Citar al menos una fuente.

### 2.2 Funcionarios municipales a cargo de la gestión de residuos y emergencias

> **Por completar - asignado a ---------**
> Ídem: características, necesidades y dificultades del grupo, con fuente.

## 3. Contexto de uso

> **Por completar - asignado a: ---------**
> Dónde y en qué situación usaría el sistema cada grupo: lugar, tiempo disponible, calidad de señal, dispositivo.
> El contraste entre ambos contextos es lo que justifica el RNF-05 (móvil vs. escritorio).

## 4. Objetivos y tareas dentro del sistema

> **Por completar - asignado a: ---------**
> Listar las tareas de cada grupo **vinculando cada una a un RF**. Formato: *"Reportar un microbasural en su cuadra (RF-01)"*.
> Vecino/a: RF-01, 02, 03, 05, 07 · Funcionario: RF-03, 06, 08, 09.

## 5. Nivel estimado de experiencia tecnológica

> **Por completar - asignado a: ---------**
> Estimar el nivel digital de cada grupo y justificarlo.
> Conectarlo con decisiones del diseño: por qué el reporte son 3 pasos (RNF-01), por qué los controles miden 44×44 px, por qué se comprimen las imágenes a 300 KB (RNF-06).

## 6. Necesidades de accesibilidad, seguridad y privacidad

> **Por completar - asignado a: ---------**
> Qué necesita cada grupo y por qué aplica a este problema. Asociar cada una a su RNF.
> Pistas: temor a represalias al denunciar un vertedero (RNF-04), conectividad intermitente en los cerros (RF-02, RNF-06), legibilidad para usuarios mayores (RNF-01).

## 7. Roles considerados en el sistema

> **Por completar - asignado a: ---------**
> Referenciar la tabla de permisos del [README](../README.md#roles-del-sistema) y explicar **por qué se separaron en dos roles** y qué ve uno que el otro no.

## 8. Proto-personas

> **Por completar - asignado a: ---------**
> Dos perfiles hipotéticos, uno por rol, con nombre ficticio y los **7 campos obligatorios**:
> tipo de rol · características generales · necesidades principales · objetivos de uso · dificultades o frustraciones · funcionalidades que utilizaría · dispositivo y contexto de acceso.
> Ninguno es opcional: el PDF los exige "como mínimo".

### 8.1 [nombre vecina/o] - Vecina/o de cerro

> **Por completar — asignado a: ---------**
> Los 7 campos. No presentarlo como usuario real.

### 8.2 [nombre funcionario/a] - Funcionario municipal

> **Por completar — asignado a: ---------**
> Los 7 campos. No presentarlo como usuario real.

## 9. Supuestos declarados

> **Por completar - asignado a: ---------**
> Mínimo 3 supuestos usados para construir los perfiles. Cada uno debe ser **verificable**: en qué se apoya y cómo se comprobaría.
> Ejemplo: *"se asume que la mayoría de los vecinos accede desde móvil y no desde computador"*.

## 10. Fuentes consultadas

> **Por completar - asignado a: ---------**
> Todas las fuentes citadas arriba, con formato consistente (autor, título, año, enlace).
> Incluir las que respaldan el **incendio de 2015** y los **Desafíos CTD Litoral #11 y #30** ya mencionados en el README.
