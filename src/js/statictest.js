"use strict"

import * as Cm from './cmapi.js'
import * as V from './vistas.js'
import * as E from './eventos.js'
import * as U from './util.js'

/**
 * Para las prácticas de IU, pon aquí (o en otros js externos incluidos desde tus .htmls) el código
 * necesario para añadir comportamientos a tus páginas.
 * 
 * Este fichero está pensado para usarse desde static.html
 * 
 * Fuera de las prácticas, lee la licencia: dice lo que puedes hacer con él:
 * lo que quieras siempre y cuando
 * - no digas que eres el autor original
 * - no me eches la culpa si algo no funciona como esperas
 *
 * @Author manuel.freire@fdi.ucm.es
 */

//
// Código que se ejecuta al lanzar la aplicación. 
// No pongas código de este tipo en ningún otro sitio
//

// añade filtrado
E.bindSearch("#search-in-users-input", ".user-table-row");
E.bindSearch("#search-in-courses-input", ".course-table-row");
E.bindSearch("#search-in-teachers-input", ".teacher-table-row");
E.bindSearch("#search-in-students-input", ".student-table-row");
E.bindSearch("#search-in-user-editions-input", ".user-edition-table-row");

// añade ordenación
E.bindSortColumn("tr>th");

E.alternaBusquedaAvanzadaUsuarios("#search-advanced-toggle", "#search-in-users-input", "#filter-in-users");
E.alternaBusquedaAvanzadaUsuarios("#search-advanced-toggleC", "#search-in-courses-input", "#filter-in-courses");

// cosas que exponemos para poder usarlas desde la consola
window.Cm = Cm;
window.V = V;
window.E = E;
window.U = U;