"use strict"

import * as Cm from './cmapi.js'
import * as U from './util.js'

/**
 * Para las prácticas de IU, pon aquí (o en otros js externos incluidos desde tus .htmls) el código
 * necesario para añadir comportamientos a tus páginas.
 *
 * Este fichero, `eventos.js`, contiene código para asociar comportamientos a acciones.
 *
 * Fuera de las prácticas, lee la licencia: dice lo que puedes hacer con él:
 * lo que quieras siempre y cuando
 * - no digas que eres el autor original
 * - no me eches la culpa si algo no funciona como esperas
 *
 * @Author manuel.freire@fdi.ucm.es
 */

export function bindDetails(clickSelector, detailsSelector, htmlGenerationFn, listenersFn) {
    U.all(clickSelector).forEach(o => o.addEventListener('click', e => {
        const id = e.target.dataset.id || e.target.closest("tr").dataset.id;
        console.log(e, id);
        U.one(detailsSelector).innerHTML = htmlGenerationFn(id);
        listenersFn(id);
    }))
}


export function bindRmFromEdition(clickSelector, callback) {
    U.all(clickSelector).forEach(o => o.addEventListener('click', e => {
        const userId = e.target.closest('tr').dataset.userId;
        const editionId = e.target.closest('tr').dataset.editionId;
        console.log(e, userId, editionId);
        const edition = Cm.resolve(editionId);
        edition.students = edition.students.filter(o => o != userId);
        edition.teachers = edition.students.filter(o => o != userId);
        Cm.setEdition(edition);
        e.target.closest("tr").remove();
        callback();
    }));
}

export function bindRmEditionDetails(clickSelector, callback) {
    U.one(clickSelector).addEventListener('click', e => {
        const id = e.target.dataset.id;
        console.log(e, id);
        Cm.rmEdition(id);
        callback();
    });
}

export function bindAddEditionToCourse(clickSelector, callback) {
    U.all(clickSelector).forEach(o => o.addEventListener('click', e => {
        const id = e.target.closest("tr").dataset.id;
        const year = e.target.dataset.year;
        console.log(e, id, year);
        Cm.addEdition(Cm.resolve(id), year);
        callback();
    }));
}

export function bindRmCourseRow(clickSelector) {
    U.all(clickSelector).forEach(o => o.addEventListener('click', e => {
        const row = e.target.closest("tr");
        const id = row.dataset.id;
        console.log(e, id);
        Cm.rmCourse(id);
        row.remove();
    }));
}

export function bindRmUserRow(clickSelector) {
    U.all(clickSelector).forEach(o => o.addEventListener('click', e => {
        const row = e.target.closest("tr");
        const id = row.dataset.id;
        console.log(e, id);
        Cm.rmUser(id);
        row.remove();
    }));
}

export function bindAddUserToEdition(clickSelector, formTitleSelector, formSelector, formAcceptSelector,
    modalFn, formTitleFn, formContentsFn, callback) {

    U.one(clickSelector).addEventListener('click', e => {
        const id = e.target.dataset.id;
        console.log(e, id);
        const edition = Cm.resolve(id);

        modalFn().show();
        const form = U.one(formSelector);
        U.one(formTitleSelector).innerHTML = formTitleFn(edition);
        form.innerHTML = formContentsFn(edition);
        const acceptButton = U.one(formAcceptSelector);
        const acceptListener = ae => {
            const dniInput = form.querySelector("select[name=dni]");
            console.log(dniInput, dniInput.value);
            const dni = dniInput.value;
            const candidates = Cm.getUsers({ dni });
            if (candidates.length == 1) {
                candidates[0].role == Cm.UserRole.STUDENT ?
                    edition.students.push(candidates[0].id) :
                    edition.teachers.push(candidates[0].id);
                Cm.setEdition(edition);
                modalFn().hide();
                acceptButton.removeEventListener('click', acceptListener);
                callback();
            } else {
                // show errors by clicking hidden submit button only if there *are* errors
                dniInput.setCustomValidity("No hay nadie con ese DNI");
                form.querySelector("button[type=submit]").click()
            }
        }
        acceptButton.addEventListener('click', acceptListener);
    });
};

export function bindAddOrEditUser(clickSelector, formTitleSelector, formSelector, formAcceptSelector,
    modalFn, formTitleFn, formContentsFn, callback) {

    U.all(clickSelector).forEach(o => o.addEventListener('click', e => {
        const id = e.target.closest("tr") ?
            e.target.closest("tr").dataset.id :
            undefined;
        const user = id ? Cm.resolve(id) : undefined;

        console.log(e, user);
        modalFn().show();
        const form = U.one(formSelector);
        U.one(formTitleSelector).innerHTML = formTitleFn(user);
        form.innerHTML = formContentsFn(user);
        const acceptButton = U.one(formAcceptSelector);
        const acceptListener = ae => {
            const dniInput = form.querySelector("input[name=dni]");

            dniInput.setCustomValidity(U.isValidDni(dniInput.value) ?
                "" : "DNI inválido");

            console.log(dniInput, dniInput.value, U.generateDni(dniInput.value.substring(0, 8)));
            if (form.checkValidity()) {
                const u = new Cm.User(id || -1,
                    form.querySelector("input[name=dni]").value,
                    form.querySelector("input[name=name]").value,
                    form.querySelector("input[name=email]").value,
                    form.querySelector("input[name=role]:checked").value, // sin ':checked' falla
                )
                if (id) { Cm.setUser(u); } else { Cm.addUser(u); }
                modalFn().hide();
                acceptButton.removeEventListener('click', acceptListener);
                callback();
            } else {
                // show errors by clicking hidden submit button only if there *are* errors
                form.querySelector("button[type=submit]").click()
            }
        };
        acceptButton.addEventListener('click', acceptListener);
    }));
};

export function bindAddOrEditCourse(clickSelector, formTitleSelector, formSelector, formAcceptSelector,
    modalFn, formTitleFn, formContentsFn, callback) {

    U.all(clickSelector).forEach(o => o.addEventListener('click', e => {
        const id = e.target.closest("tr") ?
            e.target.closest("tr").dataset.id :
            undefined;
        const course = id ? Cm.resolve(id) : undefined;

        console.log(e, course);
        modalFn().show();
        const form = U.one(formSelector);
        U.one(formTitleSelector).innerHTML = formTitleFn(course);
        form.innerHTML = formContentsFn(course);
        const acceptButton = U.one(formAcceptSelector);
        const acceptListener = ae => {
            if (form.checkValidity()) {
                const c = new Cm.Course(id || -1,
                    form.querySelector("input[name=name]").value,
                    form.querySelector("select[name=area]").value,
                    form.querySelector("select[name=level]").value
                )
                if (id) { Cm.setCourse(c); } else { Cm.addCourse(c); }
                modalFn().hide();
                acceptButton.removeEventListener('click', acceptListener);
                callback();
            } else {
                // show errors by clicking hidden submit button only if there *are* errors
                form.querySelector("button[type=submit]").click()
            }
        };
        acceptButton.addEventListener('click', acceptListener);
    }));
};

export function bindSearch(inputSelector, rowSelector) {
    const input = U.one(inputSelector);
    if (input == null) {
        return;
    }
    input.addEventListener("input", e => {
        const v = e.target.value.toLowerCase();
        if (!v) {
            U.all(rowSelector).forEach(row => row.style.display = '');
        } else {
            U.all(rowSelector).forEach(row => {
                const o = row.innerText.toLowerCase();
                row.style.display = o.indexOf(v) != -1 ? '' : 'none';
            });
        }
    })
}

function stopEditingPreviousResults(callback) {
    const gradeInput = U.one("#grade-input");
    const ratingInput = U.one("#rating-select");
    if (gradeInput && ratingInput) {
        gradeInput.parentElement.innerText = gradeInput.value || '?';
        ratingInput.parentElement.innerText = ratingInput.value || '?';
        callback();
    }
}

export function bindSetResults(clickSelector, callback) {
    U.all(clickSelector).forEach(o => o.addEventListener('click', e => {
        const row = e.target.closest("tr");

        const ratingCell = row.querySelector(".ed-rating");
        let ratingValue = ratingCell.innerText;
        ratingCell.innerHTML = `
        <select class="form-select" id='rating-select'>
            <option value="1" ${ratingValue == 1 ? "selected" : ""}>⭐</option>
            <option value="2" ${ratingValue == 2 ? "selected" : ""}>⭐⭐</option>
            <option value="3" ${ratingValue == 3 ? "selected" : ""}>⭐⭐⭐</option>
            <option value="4" ${ratingValue == 4 ? "selected" : ""}>⭐⭐⭐⭐</option>
            <option value="5" ${ratingValue == 5 ? "selected" : ""}>⭐⭐⭐⭐⭐</option>
        </select>
        `;

        const gradeCell = row.querySelector(".ed-grade");
        let gradeValue = gradeCell.innerText;
        gradeCell.innerHTML = `
        <input class="form-input" id='grade-input' 
            size="3" type="number" value="${gradeValue == '?' ? "" : gradeValue}"/>
        `;

        // handle lost focus
        row.querySelectorAll("select,input").forEach(e => e.addEventListener("blur",
            () => stopEditingPreviousResults(callback)));

        // handle a change
        row.querySelectorAll("select,input").forEach(e => e.addEventListener("input", ae => {
            const grade = U.one("#grade-input").value || null;
            const rating = U.one("#rating-select").value || null;
            const result = new Cm.Result(-1,
                row.dataset.editionId,
                row.dataset.studentId,
                grade,
                rating
            )
            Cm.setResult(result);
        }));
    }));
}

export function bindSortColumn(clickSelector) {
    U.all(clickSelector).forEach(o => o.addEventListener('click', e => {
        const th = e.target;
        const table = th.closest('table');

        // devuelve el valor en la columna i-esima
        // ver https://stackoverflow.com/a/49041392/15472
        const valueAt = (row, i) => row.children[i].innerText || row.children[i].textContent;

        // devuelve una función de comparación para 2 elementos, sobre col. idx, creciente o no (asc)
        const comparador = (idx, asc) => (a, b) => ((v1, v2) =>
            v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ?
            v1 - v2 :
            v1.toString().localeCompare(v2)
        )(valueAt(asc ? a : b, idx), valueAt(asc ? b : a, idx));

        // comprueba y actualiza asc (ascendente)
        let asc = th.dataset.asc || 0;
        th.setAttribute("data-asc", asc == 0 ? 1 : 0)

        // reordena las filas y almacena la ordenación para la siguiente iteración
        Array.from(table.querySelectorAll('tr:nth-child(n+2)'))
            .sort(comparador(Array.from(th.parentNode.children).indexOf(th), asc == 1))
            .forEach(tr => table.appendChild(tr));

    }));
}