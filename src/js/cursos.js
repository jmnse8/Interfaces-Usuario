"use strict"

import * as Cm from './cmapi.js'
import * as V from './vistas.js'
import * as E from './eventos.js'
import * as U from './util.js'

/**
 * Para las prácticas de IU, pon aquí (o en otros js externos incluidos desde tus .htmls) el código
 * necesario para añadir comportamientos a tus páginas.
 * 
 * Este fichero actúa como el pegamento que junta todo. En particular
 * - conecta con el backend (o bueno, al menos lo simular), a través de cmapi.js
 * - genera vistas (usando vistas.js)
 * - asocia comportamientos a las vistas (con ayuda de eventos.js)
 * 
 * Fuera de las prácticas, lee la licencia: dice lo que puedes hacer con él:
 * lo que quieras siempre y cuando
 * - no digas que eres el autor original
 * - no me eches la culpa si algo no funciona como esperas
 *
 * @Author manuel.freire@fdi.ucm.es
 */

// Algunos emoticonos que puede resultar útiles: 🔍 ✏️ 🗑️ ➕ 🧑‍🏫 🧑‍🔧 👥 🎓

//
// Función que refresca toda la interfaz. Debería llamarse tras cada operación
//
function update() {
    console.log('UPDATE()');
    try {
        // vaciamos los contenedores
        U.clean("#users");
        U.clean("#courses");

        // y los volvemos a rellenar con su nuevo contenido
        U.add("#courses", V.createCoursesTable(Cm.getCourses()));
        U.add("#users", V.createUserTable(Cm.getUsers()));

        // y añadimos manejadores para los eventos de los elementos recién creados

        E.bindRmCourseRow("#courses button.rm-fila")
        E.bindRmUserRow("#users button.rm-fila")

        E.bindAddEditionToCourse(".add-edition", () => update())

        E.bindDetails("#courses .edition-link","#details",
            (id) => V.createDetailsForEdition(Cm.resolve(id)),
            (id) => {
                console.log('hola');
                const edition = Cm.resolve(id);
                E.bindRmEditionDetails(".rm-edition", update);
                E.bindAddUserToEdition(".add-profesor-to-edition",
                    "#cmModal .modal-title", "#cmEditForm", "#cmAcceptModal", () => modalEdit,
                    () => `Añadiendo profesor a <i>${edition.name}</i>`,
                    () => V.prepareAddUserToEditionModal(edition, Cm.UserRole.TEACHER),
                    () => U.one(`#d${id}`).click());
                E.bindAddUserToEdition(".add-alumno-to-edition",
                    "#cmModal .modal-title", "#cmEditForm", "#cmAcceptModal", () => modalEdit,
                    () => `Añadiendo alumno a <i>${edition.name}</i>`,
                    () => V.prepareAddUserToEditionModal(edition, Cm.UserRole.STUDENT),
                    () => U.one(`#d${id}`).click());
                update();
            });

        E.bindDetailsUser("#users .edition-link", '#details',
            (id) => V.createDetailsForUser(Cm.resolve(id)),
            (id) => {
                E.bindSetResults(".set-result", () => U.one(`#d${id}`).click());
                update();
            }
        )
        E.bindRmFromEdition(".rm-from-edition", () => update());

        E.bindAddOrEditUser(".add-user,.set-user",
            "#cmModal .modal-title", "#cmEditForm", "#cmAcceptModal", () => modalEdit,
            (user) => user ? `Editando <i>${user.name}</i>` : "Añadiendo usuario",
            (user) => V.prepareAddOrEditUserModal(user),
            () => update());
        E.bindAddOrEditCourse(".add-course,.set-course",
            "#cmModal .modal-title", "#cmEditForm", "#cmAcceptModal", () => modalEdit,
            (course) => course ? `Editando <i>${course.name}</i>` : "Añadiendo curso",
            (course) => V.prepareAddOrEditCourseModal(course),
            () => update());

        E.bindSearch("#search-in-users-input", ".user-card");
        E.bindSearch("#search-in-courses-input", ".course-card");
        //E.bindSearch("#search-in-teachers-input", ".teacher-table-row");
        //E.bindSearch("#search-in-students-input", ".student-table-row");
        E.bindSearch("#search-in-user-editions-input", ".user-edition-table-row");
        

            E.bindSelectCard(".selectCardUser");


        E.bindSortColumn("tr>th");

        E.alternaBusquedaAvanzadaUsuarios("#search-advanced-toggle-courses-table", "#search-in-courses-input", "#filter-in-courses");
        //E.alternaBusquedaAvanzadaUsuarios("#search-advanced-toggle-edition-details", "#search-in-students-input", "#filter-in-students");
        E.alternaBusquedaAvanzadaUsuarios("#search-advanced-toggle-user-table", "#search-in-users-input", "#filter-in-users");
        //E.alternaBusquedaAvanzadaUsuarios("#search-advanced-toggle-user-details", "#search-in-user-editions-input", "#filter-in-users");
        
        // filtros usuario
        document.querySelectorAll("#filter-in-users input, #filter-in-users select").forEach(o =>{
            o.addEventListener('input', e => {
                E.advancedUserFilter("#filter-in-users", ".user-card");
            })
        });

        document.querySelector("#reset-search-advanced-user-table").addEventListener('click', e => {
            E.removeUserFilter("#filter-in-users", ".user-card");
        });

        document.querySelector("#reset-search-advanced-courses-table").addEventListener('click', e => {
            E.removeCourseFilter("#filter-in-courses", ".course-card");
        });

        //filtros cursos
        document.querySelectorAll("#filter-in-courses input, #filter-in-courses select").forEach(o =>{
            o.addEventListener('input', e => {
                E.advancedCourseFilter("#filter-in-courses", ".course-card");
            })
        });

        document.querySelector("#selectAllCards").addEventListener('click', e => {
            E.selectAllCard();
        });
        document.querySelector("#removeSelCards").addEventListener('click', e => {
            E.removeSelCards();
        });
        E.addSelCards("#addSelCards",
        "#cmModal .modal-title", "#cmEditForm", "#cmAcceptModal", () => modalEdit,
        () => `Matricular usuarios`,
        () => V.prepareAddSelectedUserModal(),
        () => update());
    } catch (e) {
        console.log('Error actualizando', e);
    }
}

/* U.one("#save").addEventListener('click', () => Cm.saveState());
U.one("#clean").addEventListener('click', () => localStorage.clear());
U.one("#restore").addEventListener('click', () => {
    Cm.restoreState();
    update()
}); */
export function save(){
    return Cm.saveState()
}
export function restore(token) {
    Cm.restoreState(token);
    update()
}

//
// Código que se ejecuta al lanzar la aplicación. 
// No pongas código de este tipo en ningún otro sitio
//Añadido export para poder usarlo en eventos :(
export const modalEdit = new bootstrap.Modal(document.querySelector('#cmModal'));

export const modalDelete = new bootstrap.Modal(document.querySelector('#dltModal'));


Cm.init()
update()

// cosas que exponemos para poder usarlas desde la consola
window.update = update;
window.Cm = Cm;
window.V = V;
window.E = E;
window.U = U;