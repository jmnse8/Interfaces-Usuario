"use strict"

import * as Cm from './cmapi.js'

/**
 * Para las prácticas de IU, pon aquí (o en otros js externos incluidos desde tus .htmls) el código
 * necesario para añadir comportamientos a tus páginas.
 *
 * Este fichero, `vistas.js` contiene código para generar html dinámicamente 
 * a partir del modelo (cmapi.js); y también código de comportamiento. 
 * El fichero `pegamento.js` contiene código para asociar vistad de este fichero
 * a partes de páginas.
 *
 * Fuera de las prácticas, lee la licencia: dice lo que puedes hacer con él:
 * lo que quieras siempre y cuando
 * - no digas que eres el autor original
 * - no me eches la culpa si algo no funciona como esperas
 *
 * @Author manuel.freire@fdi.ucm.es
 */

const roleClasses = {
    [Cm.UserRole.TEACHER]: "badge text-bg-primary opacity-50",
    [Cm.UserRole.STUDENT]: "badge text-bg-success opacity-50",
    [Cm.UserRole.ADMIN]: "badge text-bg-warning opacity-50"
}

const areaClasses = {
    [Cm.CourseArea.OFFICE]: "badge text-bg-secondary opacity-50",
    [Cm.CourseArea.INTERNET]: "badge text-bg-warning opacity-50",
    [Cm.CourseArea.IT]: "badge text-bg-danger opacity-50"
}

const levelClasses = {
    [Cm.CourseLevel.INITIATION]: "badge text-bg-success opacity-25",
    [Cm.CourseLevel.GENERALIST]: "badge text-bg-success opacity-50",
    [Cm.CourseLevel.SPECIALIST]: "badge text-bg-success opacity-75"
}


function userRow(user, editions) {
    const matriculas = editions.filter(o => o.students.indexOf(user.id) != -1)
    const docencia = editions.filter(o => o.teachers.indexOf(user.id) != -1)
    return `
    <tr data-id="${user.id}" class="user-table-row">
        <td>${user.name}</td>
        <td><span class="${roleClasses[user.role]}">${user.role}</span></td>
        <td>${user.email}</td>
        <td>${user.dni}</td>
        <td>${Math.max(matriculas.length, docencia.length)}</td>
        <td>
        <div class="btn-group">
            <button id="d${user.id}" title="Muestra las ediciones en las que figura ${user.name}" 
                class="edition-link btn btn-outline-secondary btn-sm">👁️</button>        
            <button title="Edita el usuario ${user.name}" 
                class="set-user btn btn-outline-primary btn-sm">✏️</button>
            <button title="Elimina a ${user.name} del sistema, y de todas las ediciones" 
                class="rm-fila btn btn-outline-danger btn-sm">🗑️</button>
        </div>
        </td>
    </tr>
    `;
}

export function createUserTable(users) {
    const editions = Cm.getEditions();
    const filas = users.map(o => userRow(o, editions)).join('');

    const botonNuevoUsuario = `
        <button title="Crea un nuevo usuario" 
            class="add-user btn btn-outline-primary glow-button">➕</button>`
    /* AÑADIDO BOTÓN FILTRO */
    return `
    <h4 class="mt-3">Usuarios</h4>

    <div class="row">
        <div class="col md-auto input-group">
            <input id="search-in-users-input" type="search" class="form-control" placeholder="Filtrar" />
            <span class="input-group-text" id="search-in-users-button">🔍</span>
        </div>
    
        <div class="col">
            <button id="search-advanced-toggle-user-table" title="Búsqueda avanzada"
                class="btn btn-outline-secondary">📝</button>
        </div>

        <div class="col text-end">${botonNuevoUsuario}</div>
    </div>

    <div id="filter-in-users" class="m-2 p-2 border border-2 rounded">
                    <div class="row p-1">
                        <div class="col-8">
                            <input type="search" name="name" class="form-control form-control-sm" name=""
                                placeholder="Nombre o fragmento">
                        </div>
                        <div class="col-4">
                            <input type="search" name="dni" class="form-control form-control-sm"
                                placeholder="DNI o fragmento">
                        </div>
                    </div>
                    <div class="row p-1">
                        <div class="col-6">
                            <input type="search" name="email" class="form-control form-control-sm"
                                placeholder="correo o fragmento">
                        </div>
                        <div class="col-6">
                            <select name="role" class="form-select form-select-sm">
                                <option value="">ninguno</option>
                                <option value="admin">admin</option>
                                <option value="alumno">alumno</option>
                                <option value="profesor">profesor</option>
                            </select>
                        </div>
                    </div>
                </div>

    <table class="table">
    <tr>
        <th>Nombre</th>
        <th>Rol</th>
        <th>Correo</th>
        <th>DNI</th>
        <th title="número de ediciones en las que es alumno y/ó profesor">A/P</th>
        <th>Acciones</th>        
    </tr>
    ${filas}
    </table>
 `;
}

function ratingForEdition(results, e) {
    let rating = 0;
    let n = 0,
        max = 0;
    results.filter(o => o.edition == e.id).forEach(r => {
        if (r.rating) {
            rating += r.rating;
            n++;
        }
        max++;
    });
    const estrellitas = n ?
        `${''.padStart(Math.floor(rating/n), '⭐')} ${(rating/n).toFixed(1)}` :
        '(no disponible)'
    return `${estrellitas} ${n}/${max}`;
}

function courseRow(course, editions, results) {
    const ratings = editions.filter(o => o.course == course.id).map(e =>
        `<button id="d${e.id}" data-id="${e.id}" 
            class="edition-link btn btn-outline-secondary btn-sm" 
            title="${ratingForEdition(results, e)}">${e.year}</button>`
    );

    const year = new Date().getFullYear();
    const hasCurrentEdition = editions.filter(o => o.course == course.id && o.year == year).length == 0;

    return `
    <tr data-id="${course.id}" class="course-table-row">
        <td>${course.name}</td>
        <td><span class="${areaClasses[course.area]}">${course.area}</span></td>
        <td><span class="${levelClasses[course.level]}">${course.level}</span></td>
        <td>${ratings.join(' ')} 
            <button data-year="${year}" title="Crea una edición ${year} para el curso ${course.name}" 
                class="add-edition btn btn-outline-primary btn-sm" 
                ${hasCurrentEdition ? "":"disabled"}>➕</button>
        </td>
        <td>
        <div class="btn-group">
            <button title="Edita el curso ${course.name}" 
                class="set-course btn btn-outline-primary btn-sm">✏️</button>
            <button title="Elimina el curso ${course.name} del sistema, y todas sus ediciones" 
                class="rm-fila btn btn-outline-danger btn-sm">🗑️</button>                
        </div>
        </td>        
    </tr>
    `;
}

export function createCoursesTable(courses) {
    const editions = Cm.getEditions();
    const results = Cm.getResults();
    const filas = courses.map(o => courseRow(o, editions, results)).join('');
    const annos = [...new Set(Cm.getEditions().map(e => e.year))];

    let annosH = "";
    annos.forEach(a => 
        annosH += `<option value="${a}">${a}</option>`);

    const botonNuevoCurso = `
        <button title="Crea un nuevo curso" 
            class="add-course btn btn-outline-primary glow-button">➕</button>`;

    return `
    <h4 class="mt-3">Cursos</h4>

    <div class="row">
        <div class="col md-auto input-group">
            <input id="search-in-courses-input" type="search" class="form-control" placeholder="Filtrar" />
            <span class="input-group-text" id="search-in-users-button">🔍</span>
        </div>
        <div class="col">
            <button id="search-advanced-toggle-courses-table" title="Búsqueda avanzada"
                class="btn btn-outline-secondary">📝</button>
        </div>
        <div class="col text-end">${botonNuevoCurso}</div>
    </div>

    <div id="filter-in-courses" class="m-2 p-2 border border-2 rounded">
                    <div class="row p-1">
                        <div class="col-8">
                            <input type="search" name="name" class="form-control form-control-sm" name=""
                                placeholder="Nombre o fragmento">
                        </div>
                        <div class="col-4">
                        <select class="form-select" name="area" required> 
                        <option value="">ninguno</option>
                        ${generateOption(Cm.CourseArea.INTERNET, areaClasses, courses?.area)}    
                        ${generateOption(Cm.CourseArea.OFFICE, areaClasses, courses?.area)}    
                        ${generateOption(Cm.CourseArea.IT, areaClasses, courses?.area)}    
                    </select>
                        </div>
                    </div>
                    <div class="row p-1">
                        <div class="col-6">
                        <select class="form-select" name="level" required> 
                        <option value="">ninguno</option>
                        ${generateOption(Cm.CourseLevel.INITIATION, levelClasses, courses?.level)}    
                        ${generateOption(Cm.CourseLevel.GENERALIST, levelClasses, courses?.level)}    
                        ${generateOption(Cm.CourseLevel.SPECIALIST, levelClasses, courses?.level)}    
                    </select>
                        </div>
                        <div class="col-6">
                            <select name="year" class="form-select form-select-sm">
                                <option value="">ninguno</option>
                                ${annosH}
                            </select>
                        </div>
                    </div>
                </div>

    <table class="table">
    <tr>
        <th>Nombre</th>
        <th>Área</th>
        <th>Nivel</th>
        <th>Ediciones</th>
        <th>Acciones</th>
    </tr>
    ${filas}
    </table>
 `;
}

function studentRow(user, edition, results) {
    const resultados = results.filter(o => o.student == user.id);
    const nota = resultados.length ? resultados[0].grade : '?';
    return `
    <tr class="student-table-row" data-user-id="${user.id}" data-edition-id="${edition.id}">
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.dni}</td>
        <td class="text-end">${nota != null ? nota : '?'}</td>
        <td>&nbsp;
            <button title="Desmatricula a ${user.name} de ${edition.name}"                 
                class="rm-from-edition btn btn-outline-danger btn-sm">🗑️</button>
        </td>
    </tr>
    `;
}

function teacherRow(user, edition, results) {
    return `
    <tr class="teacher-table-row" data-user-id="${user.id}" data-edition-id="${edition.id}">>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.dni}</td>
        <td>&nbsp;
            <button title="Hace que ${user.name} deje de ser profesor de ${edition.name}" 
                class="rm-from-edition btn btn-outline-danger btn-sm">🗑️</button>
        </td>
    </tr>
    `;
}

export function createDetailsForEdition(edition) {
    const results = Cm.getResults({ edition: edition.id });
    const students = edition.students.map(o => Cm.resolve(o));
    const filasAlumno = students.map(o => studentRow(o, edition, results)).join('');
    const teachers = edition.teachers.map(o => Cm.resolve(o));
    const filasProfesor = teachers.map(o => teacherRow(o, edition)).join('')

    const botonBorrado = `
        <button title="Elimina la edición ${edition.name} del sistema" 
            data-id="${edition.id}"
            class="rm-edition btn btn-outline-danger">🗑️</button>`

    const botonMatricula = (tipo) => `
        <button title="Matricula un ${tipo} para ${edition.name}" 
            data-id="${edition.id}"
            class="add-${tipo}-to-edition btn btn-outline-primary glow-button">➕</button>`

    return `
    <div class="row">
        <div class="col md-auto"><h4 class="md-auto"><i>${edition.name}</i></h4></div>
        <div class="col text-end">${botonBorrado}</div>
    </div>
    <h5 class="mt-3">Profesores</h5>
    <div class="row">
        <div class="col md-auto input-group">
            <input id="search-in-teachers-input" type="search" class="form-control" placeholder="Filtrar" />
            <span class="input-group-text">🔍</span>
        </div>
        
        <div class="col text-end">${botonMatricula("profesor")}</div>
    </div>
    <table class="table w-100 ml-4">
    <tr>
        <th>Nombre</th>
        <th>Correo</th>
        <th>DNI</th>
        <th>Acciones</th>
    </tr>
    ${filasProfesor}
    </table>

    <h5 class="mt-3">Alumnos</h5>
    <div class="row">
        <div class="col md-auto input-group">
            <input id="search-in-students-input" type="search" class="form-control" placeholder="Filtrar" />
            <span class="input-group-text">🔍</span>
        </div>
        <div class="col">
            <button id="search-advanced-toggle-edition-details" title="Búsqueda avanzada"
                class="btn btn-outline-secondary">📝</button>
        </div>
        <div class="col text-end">${botonMatricula("alumno")}</div>
    </div>
    <div id="filter-in-students" class="m-2 p-2 border border-2 rounded">
                    <div class="row p-1">
                        <div class="col-8">
                            <input type="search" name="name" class="form-control form-control-sm" name=""
                                placeholder="Nombre o fragmento">
                        </div>
                        <div class="col-4">
                            <input type="search" name="dni" class="form-control form-control-sm"
                                placeholder="DNI o fragmento">
                        </div>
                    </div>
                    <div class="row p-1">
                        <div class="col-9">
                            <input type="search" name="email" class="form-control form-control-sm"
                                placeholder="correo o fragmento">
                        </div>
                        <div class="col-3">
                        <input type="number" name="nota" class="form-control form-control-sm" min="0" max="10">
                        </div>
                    </div>
                </div>
    <table class="table w-100 ml-4">
    <tr>
        <th>Nombre</th>
        <th>Correo</th>
        <th>DNI</th>
        <th>Nota</th>
        <th>Acciones</th>
    </tr>
    ${filasAlumno}
    </table>

 `;
}

function userEditionRow(edition, user, results) {
    let result = Cm.getResults({ student: user.id, edition: edition.id });
    result = result.length ? result[0] : 0;
    const student = user.role == Cm.UserRole.STUDENT;

    let buttons = '';
    if (student) {
        const rating = result && result.rating ? result.rating : '?';
        const grade = result && result.grade ? result.grade : '?';
        buttons = `
            <td class="ed-rating">${rating}</td>
            <td class="ed-grade">${grade}</td>
        `;
    }

    return `
    <tr class="user-edition-table-row" data-user-id="${user.id}" data-edition-id="${edition.id}">
        <td>${edition.name}</td>
        <td>${ratingForEdition(results, edition)}</td>
        ${buttons}
        <td>
        <div class="btn-group">
            <button title="Cambia nota y/o valoración para ${user.name} en ${edition.name}" 
                class="set-result btn btn-outline-secondary btn-sm">✏️</button>
            <button title="Saca a ${user.name} de ${edition.name}" 
                class="rm-from-edition btn btn-outline-danger btn-sm">🗑️</button>
        </div>
        </td>
    </tr>
    `;
}

export function createDetailsForUser(user) {
    const studentEditions = Cm.getEditions().filter(o => o.students.indexOf(user.id) != -1);
    const teacherEditions = Cm.getEditions().filter(o => o.teachers.indexOf(user.id) != -1);

    const results = Cm.getResults();
    const filasEdicionUsuario = [...studentEditions, ...teacherEditions].map(
        o => userEditionRow(o, user, results)).join('')

    const student = user.role == Cm.UserRole.STUDENT;
/* 
    const botonMatricula = (tipo) => `
        <button title="Matricula un ${tipo} para ${edition.name}" 
            data-id="${edition.id}"
            class="add-${tipo}-to-edition btn btn-outline-primary glow-button">➕</button>` */

    return `
    <div class="row">
        <div class="col md-auto"><h4 class="md-auto"><i>${user.name}</i></h4></div>
    </div>
    <h5 class="mt-3">Ediciones donde participa</h5>
    <div class="row">
        <div class="col md-auto input-group">
            <input id="search-in-user-editions-input" type="search" class="form-control" placeholder="Filtrar" />
            <span class="input-group-text">🔍</span>
        </div>
        <div class="col">
            <button id="search-advanced-toggle-user-details" title="Búsqueda avanzada"
                class="btn btn-outline-secondary">📝aaa</button>
        </div>
    </div>

    <table class="table w-100">
    <tr>
        <th>Edición</th>
        <th>Valoración global</th>
        ${student ? '<th>Valoración propia</th>': ''}
        ${student ? '<th>Nota</th>': ''}
        <th>Acciones</th>
    </tr>
    ${filasEdicionUsuario}
    </table>   
 `;
}

export function prepareAddUserToEditionModal(edition, role) {
    let bad = [...edition.teachers, ...edition.students];
    let candidates = Cm.getUsers({ role }).filter(o => bad.indexOf(o.id) == -1);
    let options = candidates.map(o => `<option value="${o.dni}">${o.name} (${o.dni})</option>`).join();
    return `
    <form class="row">
        <div class="col-md-auto">
            <select class="form-select" name="dni" required>
                ${options}
            </select>
        </div>
        <button style="display: none" type="submit">Invisible, sólo para validación</button>
    </form>
    `;
}

function generateRadio(value, spanStyleDict, prevValue) {
    return `
                <input class="form-check-input" type="radio" name="role" 
                    id="radio-${value}" value="${value}" required
                    ${prevValue && prevValue==value ?"checked":""}>
                <label class="form-check-label" for="radio-student">
                    <span class="${spanStyleDict[value]}">${value}</span></label>
                </label>    
    `
}

export function prepareAddOrEditUserModal(prev) {
    return `
    <form class="row g-3">
            <div class="col-md-12">
                <input type="text" class="form-control" name="name" placeholder="Nombre" 
                ${prev?.name ? 'value="'+prev.name+'"' : ''} required>
            </div>

            <div class="col-md-8">
                <input type="email" class="form-control" name="email" placeholder="email" 
                ${prev?.email ? 'value="'+prev.email+'"' : ''} required">
            </div>
            <div class="col-md-4">
                <input type="text" class="form-control" name="dni" placeholder="DNI/NIE" 
                ${prev?.dni ? 'value="'+prev.dni+'"' : ''} pattern="[0-9]{8}[A-Z]" required>
            </div>
            <div class="col-md-12">
                <hr>
            </div>
            <div class="col-md-4 text-center">
                ${generateRadio(Cm.UserRole.STUDENT, roleClasses, prev?.role)}    
            </div>
            <div class="col-md-4 text-center">
                ${generateRadio(Cm.UserRole.TEACHER, roleClasses, prev?.role)}    
            </div>
            <div class="col-md-4 text-center">
                ${generateRadio(Cm.UserRole.ADMIN, roleClasses, prev?.role)}    
            </div>           
        <button style="display: none" type="submit">Invisible, sólo para validación</button>
    </form>
    `;
}

function generateOption(value, spanStyleDict, prevValue) {
    return `
                <option value="${value}" ${prevValue && prevValue==value ?"selected":""}>
                    <span class="${spanStyleDict[value]}">${value}</span>
                </option>
    `
}

export function prepareAddOrEditCourseModal(prev) {
    return `
    <form class="row g-3">
            <div class="col-md-12">
                <input type="text" class="form-control" name="name" placeholder="Nombre" 
                    ${prev?.name ? 'value="'+prev.name+'"' : ''} required>
            </div>

            <div class="col-md-12">
                <hr>
            </div>
            <div class="col-md-6">
                <select class="form-select" name="area" required> 
                    ${generateOption(Cm.CourseArea.INTERNET, areaClasses, prev?.area)}    
                    ${generateOption(Cm.CourseArea.OFFICE, areaClasses, prev?.area)}    
                    ${generateOption(Cm.CourseArea.IT, areaClasses, prev?.area)}    
                </select>
            </div>
            <div class="col-md-6">
                <select class="form-select" name="level" required> 
                    ${generateOption(Cm.CourseLevel.INITIATION, levelClasses, prev?.level)}    
                    ${generateOption(Cm.CourseLevel.GENERALIST, levelClasses, prev?.level)}    
                    ${generateOption(Cm.CourseLevel.SPECIALIST, levelClasses, prev?.level)}    
                </select>
            </div>
       <button style="display: none" type="submit">Invisible, sólo para validación</button>
    </form>
    `;
}