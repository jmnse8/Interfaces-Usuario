"use strict"

import * as U from './util.js';

/**
 * Librería de cliente para las prácticas de IU 2022-23.
 * 
 * Para las prácticas, por favor - NO TOQUES ESTE CÓDIGO.
 *
 * NOTA:
 * En una aplicación con servidor, este fichero contendría sólo llamadas al "backend" de verdad
 * Para un ejemplo de cómo podría funcionar esto, ver 
 * https://github.com/manuel-freire/iu2122/blob/main/src/main/resources/static/js/pmgrapi.js
 * donde todos los métodos de tipo addAlgo, rmAlgo, setAlgo son llamadas AJAX
 * 
 * Fuera de las prácticas, lee la licencia: dice lo que puedes hacer con él,
 * que es casi cualquier cosa siempre y cuando
 * - no digas que eres el autor original
 * - no me eches la culpa si algo no funciona como esperas
 *
 * @Author manuel.freire@fdi.ucm.es
 */

/**
 * El estado global de la aplicación.
 */
class State {
    /**
     * Constructor de un estado global
     * @param {String} name 
     * @param {[User]} users, que pueden ser alumnos o profesores 
     * @param {[Course]} courses, que son ofertas académicas tipo "Excel II"
     * @param {[Edition]} editions, que son ediciones de cursos con una serie de alumnos y profesores
     * @param {[Result]} results, que son notas de alumnos en ediciones, y sus valoraciones de las mismas
     */
    constructor(name, users, courses, editions, results) {
        this.name = name;
        this.users = users || [];
        this.courses = courses || [];
        this.editions = editions || [];
        this.results = results || [];
    }
}

/**
 * Un usuario; puede ser profesor o alumno o incluso administrador
 */
class User {
    /**
     * Constructor de User
     * @param {number} id
     * @param {string} dni 
     * @param {string} name
     * @param {string} email
     * @param {UserRole} role ("STUDENT", "TEACHER" ó "ADMIN)
     */
    constructor(id, dni, name, email, role, editions) {
        this.id = +id;
        this.dni = dni;
        this.name = name;
        this.email = email;
        this.role = role;
    }
}

/**
 * Un curso
 */
class Course {
    /**
     * Constructor de Course
     * @param {number} id
     * @param {string} name 
     * @param {CourseArea} area 
     * @param {CourseLevel} level 
     */
    constructor(id, name, area, level) {
        this.id = +id;
        this.name = name;
        this.area = area;
        this.level = level;
    }
}

/**
 * Una edición de un curso, con alumnos y profesores
 */
class Edition {
    /**
     * Constructor de Edition
     * @param {number} id
     * @param {number} course id del curso
     * @param {string} name nombre de la edición, generado a partir del del curso
     * @param {number} year of start
     * @param {[number]} students (ids de alumnos)
     * @param {[number]} teachers (ids de profesores)
     */
    constructor(id, course, name, year, students, teachers) {
        this.id = +id;
        this.course = course;
        this.name = name;
        this.year = +year;
        this.students = students || [];
        this.teachers = teachers || [];
    }
}

/**
 * Posibles roles.
 * Todos los roles pueden ver listados de cursos y buscar por distintos criterios.
 */
const UserRole = {
    STUDENT: 'alumno', // puede ver sus notas y valorar ediciones en las que ha sido alumno
    TEACHER: 'profesor', // en sus ediciones, puede ver listados y detalles de alumnos, y poner notas
    ADMIN: 'admin', // puede ver todo y modificar alumnos, cursos, y ediciones
}

/**
 * Posibles áreas de cursos.
 */
const CourseArea = {
    OFFICE: 'ofimática',
    INTERNET: 'internet',
    IT: 'tec. informáticas',
}

/**
 * Posibles niveles de cursos.
 */
const CourseLevel = {
    INITIATION: 'iniciación',
    GENERALIST: 'generalista',
    SPECIALIST: 'especialización',
}

/**
 * Un resultado de un alumno en una edición
 */
class Result {
    /**
     * Constructor de Result
     * @param {number} id
     * @param {number} edition id de edición
     * @param {number} student id de estudiante
     * @param {number | null} grade (0 a 10 ambos inclusive, o null si no valorado)
     * @param {number | null} rating (1 a 5 ambos inclusive, o null si no valorado)
     */
    constructor(id, edition, student, grade, rating) {
        this.id = id;
        this.edition = edition;
        this.student = student;
        this.grade = grade;
        this.rating = rating;
    }
}

/**
 * Utilidades
 */
class Util {

    /**
     * Genera un usuario al azar
     */
    static randomUser(id, prefixes, role) {
        const nombre = U.randomChoice(U.randomFirstNames);
        const apellidos = U.fill(2, () => U.randomChoice(U.randomLastNames));
        const name = `${nombre} ${apellidos[0]} ${apellidos[1]}`;
        const enombre = nombre.indexOf(' ') == -1 ?
            nombre : nombre.split(' ').map(o => o[0]).join('');
        let email = `${enombre}${apellidos[0][0]}${apellidos[1][0]}`.toLowerCase();
        email = `${U.unique(email, prefixes)}@ucm.es`

        // id, dni, name, email, role, editions
        return new User(
            id, U.generateDni(), name, email, role
        );
    }

    /**
     * Genera muchos usuarios al azar
     */
    static randomUsers(n, startId, role) {
        const prefixes = new Map();
        return U.fill(n, () => Util.randomUser(startId++, prefixes, role));
    }

    /**
     * Genera un curso al azar, evitando elegir nombres presentes en 'prev'
     */
    static randomCourse(id, prev) {
        let name = '';
        if (prev.size >= U.randomCourses.length - 1) {
            const candidate = U.randomChoice(U.randomCourses) + " I";
            while (!name) {
                if (!prev.has(candidate)) {
                    prev.add(candidate);
                    name = candidate;
                } else {
                    candidate += "I";
                }
            }
        } else {
            while (!name) {
                const candidate = U.randomChoice(U.randomCourses);
                if (!prev.has(candidate)) {
                    prev.add(candidate);
                    name = candidate;
                }
            }
        }
        return new Course(
            id,
            name,
            U.randomChoice([...Object.values(CourseArea)]),
            U.randomChoice([...Object.values(CourseLevel)])
        )
    }

    /**
     * Genera datos de prueba, según parámetros
     * 
     * @param {number} nStudents - usuarios a generar
     * @param {number} nCourses - cursos a generar
     * @param {number} firstYear - primera edición
     * @param {number} nYears 
     */
    static populate(nStudents, nCourses, firstYear, nYears) {
        const nAdmins = 2;
        const nTeachers = 10;

        const maxStudentsCourse = 10;
        const minStudentsCourse = 30;

        // users
        const admins = Util.randomUsers(2, lastId, UserRole.ADMIN);
        lastId += nAdmins;
        const students = Util.randomUsers(nStudents, lastId, UserRole.STUDENT);
        lastId += nStudents;
        const teachers = Util.randomUsers(nTeachers, lastId, UserRole.TEACHER);
        lastId += nTeachers;

        // courses
        const names = new Set();
        const courses = U.fill(nCourses, () => Util.randomCourse(lastId++, names));

        // editions & results
        const editions = []
        const results = []
        for (let i = 0, y = firstYear; i < nYears; i++, y++) {
            const lastEdition = (i == nYears - 1)
            for (let c of courses) {
                if (Math.random() < .5) continue; // probabilidad de que no hay edicion ese año

                const nEnrolled = U.randomInRange(maxStudentsCourse, minStudentsCourse);
                const eStudents = U.randomSample(students, nEnrolled);
                const eTeachers = U.randomSample(teachers,
                    U.randomInRange(1, Math.floor(nEnrolled / 10) + 1))
                const e = new Edition(
                    lastId++, c.id, mkEditionName(c.name, y), y,
                    eStudents.map(o => o.id), eTeachers.map(o => o.id));
                editions.push(e);
                for (let a of eStudents) {
                    results.push(new Result(
                        lastId++,
                        e.id,
                        a.id,
                        lastEdition ? null : U.randomInRange(0, 10),
                        lastEdition || (Math.random() < 0.3) ? null : U.randomInRange(1, 5)
                    ))
                }
            }
        }

        return new State("CFIs UCM", [...admins, ...students, ...teachers],
            courses, editions, results)
    }
}

// cache de IDs
// (se llena vía getId, y se consulta vía resolve, que sí es público; 
//  modificado en métodos de tipo add, rm y set)
let cache = new Map();
// ultimo ID usado (incrementado en métodos de tipo addAlgo)
let lastId = 0;
// el estado global (modificado en métodos de la API tipo add, rm, y set )
let state = new State();

/**
 * Inicializa el estado a uno dado o, si no se especifica, uno generado al azar
 * 
 * @param {State} [newState] 
 */
function init(newState) {
    state = updateState(newState);
    console.log("inicializado!", state);
}

/**
 * Devuelve el objeto (User, Course, Edition, ó Result) con esa id
 * @param {number} id a buscar
 * @returns {(User|Course|Edition|Result|undefined)} 
 */
function resolve(id) {
    if (!cache.has(+id)) {
        throw Error("ID not found: " + id);
    }
    return U.clone(cache.get(+id));
}

// acceso y refresco de la cache de IDs
// privado
function getId(id, object, overwrite) {
    const found = cache.has(id);
    if (object) {
        if (found && !overwrite) {
            const old = JSON.stringify(cache.get(+id));
            const cur = JSON.stringify(object);
            throw Error(`duplicate ID ${id}; old '${old}', new '${cur}'`);
        }
        cache.set(+id, object);
    } else {
        if (!found) throw Error("ID not found: " + id);
        return cache.get(+id);
    }
}

// refresca cachés
// privado
function updateState(newState) {
    cache = new Map();
    // si no se especifica un estado, se inventa uno nuevo
    const s = newState || Util.populate(40, 10, 2020, 3);
    s.users.forEach(o => getId(o.id, o));
    s.courses.forEach(o => getId(o.id, o));
    s.editions.forEach(o => getId(o.id, o));
    s.results.forEach(o => getId(o.id, o));
    //console.log("Updated state", s);
    return s;
}

/**
 * añade un curso al sistema
 */
function addCourse(course) {
    console.log("añadiendo ", course);
    const c = new Course(lastId++, course.name, course.area, course.level);
    getId(c.id, c, false);
    state.courses.push(c);
}

/**
 * modifica un curso del sistema
 */
function setCourse(course) {
    if (!cache.has(course.id)) {
        throw Error(`Cannot modify course with id ${course.id}: not found`);
    }

    // reemplaza en cursos
    U.doWhere(state.courses, o => o.id == course.id, (a, i) => a[i] = course);

    // reemplaza nombre en ediciones
    U.doWhere(state.editions, o => o.course == course.id,
        (a, i) => a[i].name = mkEditionName(course.name, a[i].year));

    // regenera cachés
    state = updateState(state)
}

/**
 * elimina un curso del sistema
 */
function rmCourse(courseId) {
    if (!cache.has(+courseId)) {
        throw Error(`Cannot rm course with id ${courseId}: not found`);
    }

    // borra de cursos
    U.rmWhere(state.courses, o => o.id == courseId);

    // para cada edicion, borra sus resultados
    for (let e of state.editions.filter(o => o.course == courseId)) {
        U.rmWhere(state.results, o => o.edition == e.id);
    }

    // borra ediciones
    U.rmWhere(state.editions, o => o.course == courseId);

    // regenera cachés: cosas pueden haber sido borradas
    state = updateState(state)
}

function mkEditionName(courseName, year) {
    const sufijo = `${year}-${(""+(year+1)).slice(-2)}`; // 2022-23
    return `${courseName} (${sufijo})`;
}

/**
 * añade una edición de un curso al sistema
 */
function addEdition(course, year, studentIds, teacherIds) {
    const e = new Edition(
        lastId++, course.id,
        mkEditionName(course.name, year), year,
        studentIds || [],
        teacherIds || []
    );
    getId(e.id, e);
    state.editions.push(e);

    return e;
}

/**
 * modifica una edición de un curso del sistema
 */
function setEdition(edition) {
    const old = getId(edition.id);

    // elimina duplicados de listas de profes y alumnos
    edition.teachers = [...new Set(edition.teachers)]
    edition.students = [...new Set(edition.students)]

    // reemplaza en ediciones
    U.doWhere(state.editions, o => o.id == edition.id, (a, i) => a[i] = edition);

    // rm student results that are no longer in the edition
    const unEnrolledIds = U.inOneButNotAnother(old.students, edition.students);

    for (let userId of unEnrolledIds) {
        U.rmWhere(state.results, o => o.student == userId && o.edition == edition.id);
    }
    // regenera cachés: cosas pueden haber sido borradas
    state = updateState(state)
}

/**
 * elimina una edición de un curso del sistema
 */
function rmEdition(editionId) {
    if (!cache.has(+editionId)) {
        throw Error(`Cannot rm edition with id ${editionId}: not found`);
    }

    U.rmWhere(state.editions, o => o.id == editionId);
    U.rmWhere(state.results, o => o.edition == editionId);

    // regenera cachés: cosas pueden haber sido borradas
    state = updateState(state)
}

/**
 * añade un usuario; ignora el ID para asignarle otro nuevo
 * @param {User} user 
 */
function addUser(user) {
    console.log("añadiendo ", user);
    const u = new User(lastId++, user.dni, user.name, user.email, user.role);
    getId(u.id, u, false);
    state.users.push(u);
}

/**
 * modifica un usuario
 */
function setUser(user) {
    if (!cache.has(user.id)) {
        throw Error(`Cannot set user with id ${user.id}: not found`);
    }

    // reemplaza en usuario
    U.doWhere(state.users, o => o.id == user.id, (a, i) => a[i] = user);
    // reemplaza en cache
    getId(user.id, user, true);
}

/**
 * elimina un usuario del sistema
 */
function rmUser(userId) {
    if (!cache.has(+userId)) {
        throw Error(`Cannot rm user with id ${userId}: not found`);
    }

    // elimina de usuarios
    U.rmWhere(state.users, o => o.id == userId);

    // elimina menciones en ediciones
    for (let e of state.editions) {
        U.rmWhere(e.teachers, o => o == userId);
        U.rmWhere(e.students, o => o == userId);
    }

    // elimina en resultados
    U.rmWhere(state.results, o => o.student == userId);

    // regenera cachés: cosas pueden haber sido borradas
    state = updateState(state)
}

/**
 * crea o actualiza el resultado de un alumno en una edicion
 * Si el alumno no estaba apuntado en esa edicion, tambien le apunta
 */
function setResult(result) {
    if (cache.has(+result.id)) {
        const o = cache.get(result.id);
        o.grade = result.grade;
        o.rating = result.rating;
    } else {
        if (!cache.has(+result.student)) {
            throw Error(`Cannot set results for user with id ${result.user}: not found`);
        }
        if (!cache.has(+result.edition)) {
            throw Error(`Cannot set results for edition with id ${result.edition}: not found`);
        }
        const e = getId(+result.edition);
        if (e.students.indexOf(+result.student) == -1) {
            e.students.push(+result.student);
        }

        let prev = state.results.filter(
            o => o.student == result.student && o.edition == result.edition);

        let o;
        if (prev.length) {
            o = prev[0];
        } else {
            o = new Result(lastId++, +result.edition, +result.student);
            getId(o.id, o);
            state.results.push(o);
        }
        o.grade = +result.grade;
        o.rating = +result.rating;
    }
}

/**
 * Devuelve (copias) de usuarios
 */
function getUsers(pattern) {
    const r = pattern ?
        state.users.filter(o => U.sameAs(o, pattern)) :
        state.users;
    return U.clone(r);
}

/**
 * Devuelve (copias) de cursos
 */
function getCourses(pattern) {
    const r = pattern ?
        state.courses.filter(o => U.sameAs(o, pattern)) :
        state.courses;
    return U.clone(r);
}

/**
 * Devuelve (copias) de editions
 */
function getEditions(pattern) {
    const r = pattern ?
        state.editions.filter(o => U.sameAs(o, pattern)) :
        state.editions;
    return U.clone(r);
}

/**
 * Devuelve (copias) de resultados
 */
function getResults(pattern) {
    const r = pattern ?
        state.results.filter(o => U.sameAs(o, pattern)) :
        state.results;
    return U.clone(r);
}

// cosas que estarán disponibles desde fuera de este módulo
// todo lo que NO se mencione aquí es privado (= inaccesible) desde fuera
// podríamos haber evitado esto añadiendo `export` a todas las funciones "públicas"
export {

    State, // estado de la aplicación; incluye todas las instancias de las siguientes entidades
    // Entidades
    User, // usuario (profe, alumno, o admin)
    Course, // curso abstracto
    Edition, // curso en un año concreto
    Result, // uno por alumno en cada edicion de curso matriculado

    // Enums
    UserRole,
    CourseArea,
    CourseLevel,

    // gestión de entidades
    addUser,
    setUser,
    rmUser,
    addCourse,
    setCourse,
    rmCourse,
    addEdition,
    setEdition,
    rmEdition,
    setResult,
    // hay exactamente 0 ó 1 resultados por alumno de edición; no se borran ni crean nuevos
    getUsers,
    getCourses,
    getEditions,
    getResults,

    // para añadir o eliminar profes o alumnos de ediciones, 
    //   usa setEdition y modifica las listas de IDs de alumnos y/o profesores

    // general
    init, // inicializa el estado; llama para no operar con un modelo vacío
    resolve // devuelve un objeto, por ID
};