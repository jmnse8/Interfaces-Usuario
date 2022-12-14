"use strict"

import * as Cm from './cmapi.js'
import * as U from './util.js'
import * as C from './cursos.js'

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
        const id = e.target.dataset.id || e.target.closest(".card").dataset.id;
        console.log(e, id);
        let idDiv = detailsSelector + e.target.dataset.name;

        const elemento = U.one(idDiv);//;

        elemento.innerHTML = htmlGenerationFn(id);
        elemento.closest('.card').style.width = '90%';


        //Contendo de listenersFn(id); traido aquí ya que la linea 51 salta excepción pero hace que funcione, de la forma normal no se  porque no va
        const edition = Cm.resolve(id);

        bindMinEdition(edition.id, idDiv);

        bindRmEditionDetails(".rm-edition", update);
        bindAddUserToEdition(".add-profesor-to-edition",
            "#cmModal .modal-title", "#cmEditForm", "#cmAcceptModal", () => C.modalEdit,//he tenido que importar el modal aquí para usarlo
            () => `Añadiendo profesor a <i>${edition.name}</i>`,
            () => V.prepareAddUserToEditionModal(edition, Cm.UserRole.TEACHER),
            () => U.one(`#d${id}`).click());
        bindAddUserToEdition(".add-alumno-to-edition",
            "#cmModal .modal-title", "#cmEditForm", "#cmAcceptModal", () => C.modalEdit,
            () => `Añadiendo alumno a <i>${edition.name}</i>`,
            () => V.prepareAddUserToEditionModal(edition, Cm.UserRole.STUDENT),
            () => U.one(`#d${id}`).click());
        //update();

        // toggle boton de filtro avanzado
        alternaBusquedaAvanzadaUsuarios("#search-advanced-toggle-edition-details" + edition.id, "#search-in-students-input" + edition.id, "#filter-in-students" + edition.id);
        //botón reset filtro avanzado
        document.querySelector("#reset-search-advanced-edition-details" + edition.id).addEventListener('click', e => {
            removeStudentFilter("#filter-in-students" + edition.id, ".student-table-row");
        });

        //Evento de filtro avanzado
        document.querySelectorAll("#filter-in-students" + edition.id + " input, #filter-in-students" + edition.id + " select").forEach(o => {
            o.addEventListener('input', e => {
                advancedStudentFilter("#filter-in-students" + edition.id, ".student-table-row");
            })
        });



        //Metido esta linea aquí porque he quitado el update de arriba
        bindRmFromEdition(".rm-from-edition", () => { });//quitado update para que no cierre la vista ¿?
        bindSearch("#search-in-students-input" + edition.id, ".student-table-row");
        bindSearch("#search-in-teachers-input" + edition.id, ".teacher-table-row");

        //lo que hace que se actualice la tarjeta con las cosas nuevas(salta excepción)
        //document.querySelector(idDiv) = elemento;


        //listenersFn(id);//esta linea no se llega a ejecutar

    }))
}

export function bindDetailsUser(clickSelector, detailsSelector, htmlGenerationFn, listenersFn) {
    U.all(clickSelector).forEach(o => o.addEventListener('click', e => {
        const id = e.target.dataset.id || e.target.closest(".card").dataset.id;
        console.log(e, id);
        let idDiv = detailsSelector + e.target.dataset.name;

        const elemento = U.one(idDiv);//;

        //console.log(htmlGenerationFn(id));

        elemento.innerHTML = htmlGenerationFn(id);
        elemento.closest('.card').style.width = '90%';




        //Contendo de listenersFn(id); traido aquí ya que la linea 51 salta excepción pero hace que funcione, de la forma normal no se  porque no va
        const user = Cm.resolve(id);

        bindMinEdition(user.id, idDiv);

        bindSetResults(".set-result", () => U.one(`#d${id}`).click());


        //Metido esta linea aquí porque he quitado el update de arriba
        bindRmFromEdition(".rm-from-edition", () => { });//quitado update para que no cierre la vista ¿?
        bindSearch("#search-in-user-editions-input" + user.id, ".user-edition-table-row");
        //bindSearch("#search-in-teachers-input"+edition.id, ".teacher-table-row");

        //lo que hace que se actualice la tarjeta con las cosas nuevas(salta excepción)
        //document.querySelector(idDiv) = elemento;


        //listenersFn(id);//esta linea no se llega a ejecutar

    }))
}

export function bindSelectCard(clickSelector, callback) {
    U.all(clickSelector).forEach(o => o.addEventListener('click', e => {
        e.target.closest('.user-card').classList.toggle('selectAnimation');

        selectedCard();
        //const options = U.one('#selectedOptions');
    }));
}

function selectedCard() {
    let cont = 0;
    U.all('.user-card').forEach(c => {
        if (Array.from(c.classList).filter(cla => cla === 'selectAnimation').length > 0)
            cont++;
    });
    if (cont > 0) {
        U.one('#selectedOptions').style.display = '';
        if (cont == 1)
            U.one('#textSelOp').textContent = cont + ' USUARIO SELECCIONADO';
        else
            U.one('#textSelOp').textContent = cont + ' USUARIOS SELECCIONADOS';
    }
    else {
        U.one('#selectedOptions').style.display = 'none';
    }
}

export function selectAllCard() {
    let btn = U.one('#selectAllCards');
    if (btn.innerText === 'Deseleccionar todos') {
        U.all('.user-card').forEach(c => {
            c.classList.toggle('selectAnimation');
        });

        btn.innerText = 'Seleccionar todos';
        U.one('#textSelOp').textContent = '0 USUARIOS SELECCIONADOS';
        U.one('#selectedOptions').style.display = 'none';
    }
    else {
        let cont = 0;
        U.all('.user-card').forEach(c => {
            if (Array.from(c.classList).filter(cla => cla === 'selectAnimation').length == 0)
                c.classList.toggle('selectAnimation');
            cont++;
        });
        if (cont == 1)
            U.one('#textSelOp').textContent = cont + ' USUARIO SELECCIONADO';
        else
            U.one('#textSelOp').textContent = cont + ' USUARIOS SELECCIONADOS';

        btn.innerText = 'Deseleccionar todos';
    }

}

// TO DO: Añadir al evento de click del botón de cancelar del modal
//        la eliminación del evento de click del botón de aceptar.
export function removeSelCards() {
    C.modalDelete.show();
    const p = U.one("#modalEliminar");
    p.innerHTML = V.deleteMessageModal(" la selección ");
    const acceptButton = U.one("#acceptDelete");
    const acceptListener = ae => {
        const token = C.save();
        U.all('.user-card').forEach(c => {
            if (Array.from(c.classList).filter(cla => cla === 'selectAnimation').length != 0) {
                const id = c.dataset.id;
                Cm.rmUser(id);
                c.remove();
                U.one('#selectedOptions').style.display = 'none';
            }
        });

        const generatedId = U.randomString(20);
        U.add("#containerParaToast",V.toastMessage("Se ha borrado la seleccion ", generatedId));
        const t = new bootstrap.Toast(document.querySelector("#miToast" + generatedId));
        U.one("#toastButton" + generatedId).addEventListener("click", e=>{
            C.restore(token);
            t.hide();
        });
        t.show();
        acceptButton.removeEventListener("click", acceptListener);
        C.modalDelete.hide();
    };
    acceptButton.addEventListener("click", acceptListener);


}

export function addSelCards(clickSelector, formTitleSelector, formSelector, formAcceptSelector,
    modalFn, formTitleFn, formContentsFn, callback) {

    U.one(clickSelector).addEventListener('click', e => {
        //const id = e.target.dataset.id;
        console.log('aaaaaaaaaaa');
        //const edition = Cm.resolve(id);

        modalFn().show();
        const form = U.one(formSelector);
        U.one(formTitleSelector).innerHTML = formTitleFn();

        form.innerHTML = formContentsFn();

        U.one('#cursoModal').addEventListener('change', e => {
            //console.log(e.target.selectedOptions[0], e.currentTarget.selectedOptions[0]);
            console.log(e.target.selectedOptions[0].value);
            let optionsE = Cm.getEditions().filter(o => o.course == e.target.selectedOptions[0].value).map(ed =>
                `<option value="${ed.id}">${ed.year}</option>`).join();
            console.log(optionsE);
            U.clean('#edicionModal');
            U.add('#edicionModal', optionsE);
        });

        const acceptButton = U.one(formAcceptSelector);
        const acceptListener = ae => {
            const edicionId = form.querySelector("select[name=edicion]").value;
            const edition = Cm.resolve(edicionId);
            U.all('.user-card').forEach(c => {
                if (Array.from(c.classList).filter(cla => cla === 'selectAnimation').length != 0) {
                    c.classList.toggle('selectAnimation');
                    const dni = c.querySelector('.user-dni').innerText;
                    const candidates = Cm.getUsers({ dni });
                    if (candidates[0].role == Cm.UserRole.STUDENT)
                        edition.students.push(candidates[0].id)
                    else if (candidates[0].role == Cm.UserRole.TEACHER)
                        edition.teachers.push(candidates[0].id);
                }
            });
            Cm.setEdition(edition);
            modalFn().hide();
            U.one('#selectedOptions').style.display = 'none';
            acceptButton.removeEventListener('click', acceptListener);
            callback();
        }
        acceptButton.addEventListener('click', acceptListener);
    });
};





// función para meter click event a el botón de minimizar la edición
function bindMinEdition(idDiv, id) {
    //console.log('creaMini');
    //console.log(U.one('#mini-'+idDiv));
    let idBtn = '#mini-' + idDiv;
    U.one(idBtn).addEventListener('click', e => {
        console.log('minimiza');
        const elemento = U.one(id);//;

        elemento.innerHTML = '';
        elemento.closest('.card').style.width = '20em';
        //document.querySelector(id) = elemento;
    });

}


// TO DO: Añadir al evento de click del botón de cancelar del modal
//        la eliminación del evento de click del botón de aceptar.
export function bindRmFromEdition(clickSelector, callback) {
    U.all(clickSelector).forEach(o => o.addEventListener('click', e => {
        C.modalDelete.show();
       
        const p = U.one("#modalEliminar");
        console.log(Cm.resolve(e.target.closest('tr').dataset.userId).name);
        const userName = Cm.resolve(e.target.closest('tr').dataset.userId).name;
        p.innerHTML = V.deleteMessageModal( userName + " de " + Cm.resolve(e.target.closest('tr').dataset.editionId).name);
        const acceptButton = U.one("#acceptDelete");
        const acceptListener = ae => {
            const token = C.save();
            const userId = e.target.closest('tr').dataset.userId;
            const editionId = e.target.closest('tr').dataset.editionId;
            console.log(e, userId, editionId);
            const edition = Cm.resolve(editionId);
            edition.students = edition.students.filter(o => o != userId);
            edition.teachers = edition.students.filter(o => o != userId);
            Cm.setEdition(edition);
            e.target.closest("tr").remove();
            C.modalDelete.hide();
            
            U.add("#containerParaToast",V.toastMessage("Se ha borrado al usuario " + userName, userId));
            const t = new bootstrap.Toast(document.querySelector("#miToast" + userId));
            U.one("#toastButton" + userId).addEventListener("click", e=>{
                C.restore(token);
                t.hide();
            });
            t.show();
            acceptButton.removeEventListener('click', acceptListener);
            callback();
        };
        acceptButton.addEventListener("click", acceptListener);
    }));
}

// TO DO: Añadir al evento de click del botón de cancelar del modal
//        la eliminación del evento de click del botón de aceptar.
export function bindRmEditionDetails(clickSelector, callback) {
    U.one(clickSelector).addEventListener('click', e => {
        C.modalDelete.show();
        const p = U.one("#modalEliminar");
        const name = Cm.resolve(e.target.dataset.id).name;
        p.innerHTML = V.deleteMessageModal(name);
        const acceptButton = U.one("#acceptDelete");
        const acceptListener = ae => {
            const token = C.save();
            const id = e.target.dataset.id;
            console.log(e, id);
            Cm.rmEdition(id);
            C.modalDelete.hide();

            U.add("#containerParaToast",V.toastMessage("Se ha borrado la edicion " + name, id));
            const t = new bootstrap.Toast(document.querySelector("#miToast" + id));
            U.one("#toastButton" + id).addEventListener("click", e=>{
                C.restore(token);
                t.hide();
            });

            t.show();
            acceptButton.removeEventListener('click', acceptListener);
            callback();
        };
        acceptButton.addEventListener("click", acceptListener);
    });
}

export function bindAddEditionToCourse(clickSelector, callback) {
    U.all(clickSelector).forEach(o => o.addEventListener('click', e => {
        const id = e.target.closest(".card").dataset.id;
        const year = e.target.dataset.year;
        console.log(e, id, year);
        Cm.addEdition(Cm.resolve(id), year);
        callback();
    }));
}

// TO DO: Añadir al evento de click del botón de cancelar del modal
//        la eliminación del evento de click del botón de aceptar.
export function bindRmCourseRow(clickSelector) {
    U.all(clickSelector).forEach(o => o.addEventListener('click', e => {
        C.modalDelete.show();
        const p = U.one("#modalEliminar");
        const name = e.target.closest(".card").querySelector(".course-name").innerText
        p.innerHTML = V.deleteMessageModal(name);
        const acceptButton = U.one("#acceptDelete");
        const acceptListener = ae => {
            const token = C.save();
            const card = e.target.closest(".card");
            const id = card.dataset.id;
            console.log(e, id);
            Cm.rmCourse(id);
            card.remove();
            C.modalDelete.hide();
 
            
            U.add("#containerParaToast",V.toastMessage("Se ha borrado el curso " + name, id));
            const t = new bootstrap.Toast(document.querySelector("#miToast" + id));
            U.one("#toastButton" + id).addEventListener("click", e=>{
                C.restore(token);
                t.hide();
            });
            t.show();
            acceptButton.removeEventListener('click', acceptListener);
        };
        acceptButton.addEventListener("click", acceptListener);
    }));
}

// TO DO: Añadir al evento de click del botón de cancelar del modal
//        la eliminación del evento de click del botón de aceptar.
export function bindRmUserRow(clickSelector) {
    U.all(clickSelector).forEach(o => o.addEventListener('click', e => {
        C.modalDelete.show();
        const p = U.one("#modalEliminar");

        const name = e.target.closest(".card").querySelector(".user-name").innerText;

        p.innerHTML = V.deleteMessageModal(name);
        const acceptButton = U.one("#acceptDelete");
        const acceptListener = ae => {
            const token = C.save();
            const card = e.target.closest(".card");
            const id = card.dataset.id;
            console.log(e, id);
            Cm.rmUser(id);
            card.remove();
            C.modalDelete.hide();

           
            U.add("#containerParaToast",V.toastMessage("Se ha borrado al usuario " + name, id));
            const t = new bootstrap.Toast(document.querySelector("#miToast" + id));
            U.one("#toastButton" + id).addEventListener("click", e=>{
                C.restore(token);
                t.hide();
            });
            t.show();
            acceptButton.removeEventListener('click', acceptListener);
        };
        acceptButton.addEventListener("click", acceptListener);
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
        const id = e.target.closest(".card") ?
            e.target.closest(".card").dataset.id :
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
        const id = e.target.closest(".card") ?
            e.target.closest(".card").dataset.id :
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

export function alternaBusquedaAvanzadaUsuarios(selBoton, selNormal, selAvanzada) {
    const avanzado = document.querySelector(selAvanzada);
    const normal = document.querySelector(selNormal).parentElement;
    document.querySelector(selBoton)
        .addEventListener('click', e => {
            const visible = avanzado.style.display != 'none';
            avanzado.style.display = visible ? 'none' : '';
            normal.style.display = visible ? '' : 'none';
        });
    avanzado.style.display = 'none';

}

export function advancedUserFilter(filterSel, rowSel) {

    const filterDiv = document.querySelector(filterSel);
    const name = filterDiv.querySelector("input[name=name]").value.toLowerCase();
    const dni = filterDiv.querySelector("input[name=dni]").value.toLowerCase();
    const email = filterDiv.querySelector("input[name=email]").value.toLowerCase();
    const role = filterDiv.querySelector("select[name=role]").value.toLowerCase();

    for (let r of document.querySelectorAll(rowSel)) {
        let ok1 = true, ok2 = true, ok3 = true, ok4 = true;

        if (name !== '')
            ok1 = (r.querySelector('.user-name').innerText.toLowerCase().indexOf(name) == -1) ? false : true;
        if (role !== '')
            ok2 = (r.querySelector('.user-role').innerText.toLowerCase().indexOf(role) == -1) ? false : true;
        if (email !== '')
            ok3 = (r.querySelector('.user-email').innerText.toLowerCase().indexOf(email) == -1) ? false : true;
        if (dni !== '') {
            ok4 = (r.querySelector('.user-dni').innerText.toLowerCase().indexOf(dni) == -1) ? false : true;
        }
        let ok = (ok1 && ok2 && ok3 && ok4) ? true : false;

        r.style.display = ok ? '' : 'none';
    }
}

export function advancedCourseFilter(filterSel, rowSel) {
    const filterDiv = document.querySelector(filterSel);
    const name = filterDiv.querySelector("input[name=name]").value.toLowerCase();
    const area = filterDiv.querySelector("select[name=area]").value.toLowerCase();
    const level = filterDiv.querySelector("select[name=level]").value.toLowerCase();
    const year = filterDiv.querySelector("select[name=year]").value.toLowerCase();

    for (let r of document.querySelectorAll(rowSel)) {
        let ok1 = true, ok2 = true, ok3 = true, ok4 = true;

        if (name !== '')
            ok1 = (r.querySelector('.course-name').innerText.toLowerCase().indexOf(name) == -1) ? false : true;
        if (area !== '')
            ok2 = (r.querySelector('.course-area').innerText.toLowerCase().indexOf(area) == -1) ? false : true;
        if (level !== '')
            ok3 = (r.querySelector('.course-level').innerText.toLowerCase().indexOf(level) == -1) ? false : true;
        if (year !== '') {
            let years = r.querySelectorAll('.course-year');
            if (years !== null) {
                for (let y of years) {
                    if (!ok4)
                        break;
                    ok4 = (y.innerText.toLowerCase().indexOf(year)) ? false : true;
                }
            }
            else
                ok4 = false;
        }
        let ok = (ok1 && ok2 && ok3 && ok4) ? true : false;

        r.style.display = ok ? '' : 'none';
    }
}

function advancedStudentFilter(filterSel, rowSel) {
    const filterDiv = document.querySelector(filterSel);
    const name = filterDiv.querySelector("input[name=name]").value.toLowerCase();
    const dni = filterDiv.querySelector("input[name=dni]").value.toLowerCase();
    const email = filterDiv.querySelector("input[name=email]").value.toLowerCase();
    const nota = filterDiv.querySelector("input[name=nota]").value.toLowerCase();

    const valueAt = (row, i) => row.children[i].innerText || row.children[i].textContent;

    for (let r of document.querySelectorAll(rowSel)) {
        let ok = true;
        for (let [f, col] of
            [[name, 0], [email, 1], [dni, 2], [nota, 3]]) {
            if (f == '' || !ok) continue;
            const v = valueAt(r, col).toLowerCase();
            //console.log(v, f, col, v.indexOf(f));
            if (v.indexOf(f) == -1) ok = false;
        }
        r.style.display = ok ? '' : 'none';
    }
}

export function removeCourseFilter(filterSel, rowSel) {
    const filterDiv = document.querySelector(filterSel);
    filterDiv.querySelector("input[name=name]").value = '';
    filterDiv.querySelector("select[name=area]").value = '';
    filterDiv.querySelector("select[name=level]").value = '';
    filterDiv.querySelector("select[name=year]").value = '';
    for (let r of document.querySelectorAll(rowSel)) {
        r.style.display = '';
    }
}

function removeStudentFilter(filterSel, rowSel) {
    const filterDiv = document.querySelector(filterSel);
    filterDiv.querySelector("input[name=name]").value = '';
    filterDiv.querySelector("input[name=dni]").value = '';
    filterDiv.querySelector("input[name=email]").value = '';
    filterDiv.querySelector("input[name=nota]").value = '';
    for (let r of document.querySelectorAll(rowSel)) {
        r.style.display = '';
    }
}


export function removeUserFilter(filterSel, rowSel) {
    console.log('hola')
    const filterDiv = document.querySelector(filterSel);
    filterDiv.querySelector("input[name=name]").value = '';
    filterDiv.querySelector("input[name=dni]").value = '';
    filterDiv.querySelector("input[name=email]").value = '';
    filterDiv.querySelector("select[name=role]").value = '';
    for (let r of document.querySelectorAll(rowSel)) {
        r.style.display = '';
    }
}

export function deleteCard(clickSelector, pSelector, pContent, acceptSelector, modalFn) {

    U.all(clickSelector).forEach(o => o.addEventListener('click', e => {
        modalFn().show();
        const p = U.one(pSelector);
        p.innerHTML = pContent;
        const acceptButton = U.one(acceptSelector);
        const acceptListener = ae => {
            const card = e.target.closest(".card");
            const id = card.dataset.id;
            console.log(e, id);
            Cm.rmUser(id);
            card.remove();
        };
        acceptButton.addEventListener("click", acceptListener);
    }));
}