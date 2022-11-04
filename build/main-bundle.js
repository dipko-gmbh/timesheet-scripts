// ==UserScript==
// @name         Timeshit
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Make Timesheet less shit!
// @author       DIPKO
// @match        https://timesheet.msg.de/
// @icon         https://dipko.de/cms/wp-content/uploads/2022/06/cropped-dipko_favicon-192x192.png
// @grant        none
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/helper/waitForElement.ts":
/*!**************************************!*\
  !*** ./src/helper/waitForElement.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const waitForElm = (selector) => {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
        const observer = new MutationObserver((mutations) => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (waitForElm);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _helper_waitForElement__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helper/waitForElement */ "./src/helper/waitForElement.ts");

(function () {
    let lastBooking = null;
    let lastBookingObserver = null;
    setTimeout(() => {
        if (lastBookingObserver) {
            cs("/rootui/model/view/panel/model/view/bookinglist/model").unobserve(lastBookingObserver);
            lastBookingObserver = undefined;
        }
        lastBookingObserver = cs("/rootui/model/view/panel/model/view/bookinglist/model").observe({
            name: "global:command:newBooking",
            func: (_ev, booking) => {
                if (booking._className === "TimeBooking") {
                    lastBooking = booking;
                }
            }
        });
    }, 2000);
    // auto-click skip button
    (0,_helper_waitForElement__WEBPACK_IMPORTED_MODULE_0__["default"])(".introjs-button.introjs-skipbutton").then((elm) => {
        elm.click();
    });
    (0,_helper_waitForElement__WEBPACK_IMPORTED_MODULE_0__["default"])('.filter').then((filter) => {
        const addGitHubButton = async (filter) => {
            const gitButton = filter.appendChild(document.createElement('div'));
            gitButton.classList.add('protectButton');
            gitButton.innerHTML =
                '<div class="buttonIcon"><i class="fa fa-github"></i></div>' +
                    '<div class="buttonText">GitHub Import</div>';
            gitButton.onclick = async () => {
                if (!lastBooking) {
                    cs("//rootui/model").publish("handleError", "Userscript 'Timeshit': please add a time booking. The prediction is always done for the last added time booking.", true);
                    return;
                }
                const user = localStorage.getItem('github_user');
                const pat = localStorage.getItem('github_pat');
                const psp = localStorage.getItem('github_psp');
                const pspElem = app.dm.findByExample("PSPElement", {}).find((elem) => elem.id === psp);
                if (!user || !pat) {
                    console.error('no GitHub user or pat or orga');
                    cs("//rootui/model").publish("handleError", "Userscript 'Timeshit': To use this feature you first need to set the github credentials in the settings tab and reload!", true);
                    return;
                }
                // get repos from GitHub
                const path = `user/repos`;
                const allRepos = (await fetchGithubApi(path)).map((repo) => repo.full_name);
                const relevantRepos = allRepos.filter((repo) => !repo.startsWith(user));
                // TODO: fix this - get from selected date
                const dateStart = new Date(parseInt(lastBooking.bookingDay.id.substring(0, 4)), parseInt(lastBooking.bookingDay.id.substring(4, 6)) - 1, parseInt(lastBooking.bookingDay.id.substring(6, 8)));
                dateStart.setDate(dateStart.getDay() - 1);
                dateStart.setHours(0, 0, 0, 0);
                const dateEnd = new Date(dateStart);
                dateEnd.setHours(23, 59, 59, 999);
                // get commits from GitHub
                const commits = (await Promise.all(relevantRepos.map((repo) => {
                    const url = `repos/${repo}/commits?per_page=100&author=${user}` +
                        `&since=${dateStart.toISOString()}&until=${dateEnd.toISOString()}`;
                    const commits = fetchGithubApi(url);
                    return commits;
                }))).flat().map((commit) => commit.commit.message);
                // remove merge commits
                const filteredCommits = commits.filter((commit) => !commit.startsWith('Merge pull request') && !commit.startsWith('Merge branch'));
                // find jira tickets
                const jiraPattern = /([A-Z]{2,10}-\d{1,6})/g;
                const jiraTickets = filteredCommits.map((commit) => {
                    const matches = commit.match(jiraPattern);
                    return matches ? matches[0] : null;
                }).filter((ticket) => ticket !== null);
                // ticket workload share
                const ticketWorkload = jiraTickets.reduce((acc, ticket) => {
                    acc[ticket] = acc[ticket] ? acc[ticket] + 1 : 1;
                    return acc;
                }, {});
                const overall = Object.values(ticketWorkload).reduce((acc, val) => acc + val, 0);
                const ticketWorkloadShare = Object.entries(ticketWorkload).map(([ticket, workload]) => {
                    return {
                        ticket,
                        workload,
                        share: workload / overall
                    };
                });
                console.log(ticketWorkloadShare);
                // calc unbooked working hours
                const dayDuration = lastBooking.bookingDay.timeBookings.reduce((acc, time) => acc + parseFloat(time.duration), 0);
                const unbookedHours = !lastBooking.bookingDay?.timeBookings || lastBooking.bookingDay.timeBookings.length === 0
                    ? dayDuration
                    : dayDuration - lastBooking.bookingDay.timeBookings.reduce((acc, booking) => {
                        return acc + booking.projectBookings.reduce((acc2, projectBooking) => acc2 + parseFloat(projectBooking.duration), 0);
                    }, 0);
                // add bookings
                ticketWorkloadShare.forEach(tws => {
                    const booking = app.util.EntityCreateUtil.createProjectBooking(lastBooking);
                    if (tws.workload > 1) {
                        booking.description = `${tws.ticket}: ${tws.workload} commits`;
                    }
                    else {
                        const commit = filteredCommits.find((commit) => commit.includes(tws.ticket));
                        booking.description = `${tws.ticket}: ${commit}`;
                    }
                    booking.duration = Math.round(unbookedHours * tws.share * 100) / 100;
                    booking.pspelement = pspElem;
                });
                // re-render
                cs("/rootui/model/view/panel/model/view/bookinglist/model").touch("global:data:bookings");
                cs("//rootui/model").value("command:showMessage", "Added Jira Ticket bookings from GitHub");
            };
        };
        addGitHubButton(filter);
    });
    (0,_helper_waitForElement__WEBPACK_IMPORTED_MODULE_0__["default"])('.settingsDetails').then((settingsDetail) => {
        if (!settingsDetail)
            return;
        const addGitHubCredentialSettings = async (settingsDetail) => {
            const user = localStorage.getItem('github_user') || '';
            const pat = localStorage.getItem('github_pat') || '';
            const psp = localStorage.getItem('github_psp') || '';
            const pspElems = window['app'] ? app.dm?.findByExample("PSPElement", {}) : [];
            const newSettingsDetailSection = settingsDetail.appendChild(document.createElement('div'));
            newSettingsDetailSection.classList.add('msgDetailBlock', 'github_connection');
            newSettingsDetailSection.innerHTML =
                '<div class="header">GitHub Credentials</div>' +
                    '<div class="grid">' +
                    '<div class="label">Username</div>' +
                    `<div class="value"><input class="msgInput" id="github_user" value="${user}"/></div>` +
                    '</div>' +
                    '<div class="grid">' +
                    '<div class="label">Personal Access Token</div>' +
                    `<div class="value"><input class="msgInput" id="github_pat" value="${pat}"/></div>` +
                    '</div>' +
                    '<div class="grid">' +
                    '<div class="label">Default PSP-Element</div>' +
                    '<div class="value">' +
                    '<select class="msgInput" id="github_psp">' +
                    pspElems.map(pspElem => `<option value="${pspElem.id}"${psp === pspElem.id ? ' selected' : ''}>` +
                        `${pspElem.name}</option>`).join('') +
                    '</select>' +
                    '</div>' +
                    '</div>';
            newSettingsDetailSection.querySelector('#github_user')?.addEventListener('change', setLocalStorageFromInput);
            newSettingsDetailSection.querySelector('#github_pat')?.addEventListener('change', setLocalStorageFromInput);
            newSettingsDetailSection.querySelector('#github_psp')?.addEventListener('change', setLocalStorageFromInput);
        };
        addGitHubCredentialSettings(settingsDetail);
    });
    function fetchGithubApi(path) {
        const user = localStorage.getItem('github_user');
        const pat = localStorage.getItem('github_pat');
        return fetch('https://api.github.com/' + path, {
            headers: {
                // Authorization: `Bearer ${pat}}`, // <-- according to docs this should work, but it doesn't
                Authorization: `Basic ${btoa(`${user}:${pat}`)}`,
                'Content-Type': 'application/json',
                Accept: 'application/vnd.github.v3+json',
            },
        }).then((res) => res.json());
    }
    function setLocalStorageFromInput(event) {
        const target = event.target;
        const key = target.id;
        const value = target.value;
        localStorage.setItem(key, value);
    }
})();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0EsaUVBQWUsVUFBVSxFQUFDOzs7Ozs7O1VDakIxQjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7O0FDTmlEO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQSxJQUFJLGtFQUFVO0FBQ2Q7QUFDQSxLQUFLO0FBQ0wsSUFBSSxrRUFBVTtBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxRUFBcUU7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxLQUFLLCtCQUErQixLQUFLO0FBQ2xGLGtDQUFrQyx3QkFBd0IsU0FBUyxzQkFBc0I7QUFDekY7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMsS0FBSyxJQUFJLElBQUk7QUFDekQ7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLElBQUk7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpREFBaUQsV0FBVyxJQUFJLGNBQWM7QUFDOUU7QUFDQTtBQUNBO0FBQ0EsaURBQWlELFdBQVcsSUFBSSxPQUFPO0FBQ3ZFO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsSUFBSSxrRUFBVTtBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1GQUFtRjtBQUNuRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwRkFBMEYsS0FBSztBQUMvRjtBQUNBO0FBQ0E7QUFDQSx5RkFBeUYsSUFBSTtBQUM3RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOERBQThELFdBQVcsR0FBRyxzQ0FBc0M7QUFDbEgsMkJBQTJCLGFBQWE7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNENBQTRDLEtBQUs7QUFDakQsd0NBQXdDLFFBQVEsS0FBSyxHQUFHLElBQUksR0FBRztBQUMvRDtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90aW1lc2hlZXQtc2NyaXB0cy8uL3NyYy9oZWxwZXIvd2FpdEZvckVsZW1lbnQudHMiLCJ3ZWJwYWNrOi8vdGltZXNoZWV0LXNjcmlwdHMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdGltZXNoZWV0LXNjcmlwdHMvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3RpbWVzaGVldC1zY3JpcHRzL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vdGltZXNoZWV0LXNjcmlwdHMvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly90aW1lc2hlZXQtc2NyaXB0cy8uL3NyYy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB3YWl0Rm9yRWxtID0gKHNlbGVjdG9yKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKG11dGF0aW9ucykgPT4ge1xuICAgICAgICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSk7XG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgICBzdWJ0cmVlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcbmV4cG9ydCBkZWZhdWx0IHdhaXRGb3JFbG07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB3YWl0Rm9yRWxtIGZyb20gJy4vaGVscGVyL3dhaXRGb3JFbGVtZW50JztcbihmdW5jdGlvbiAoKSB7XG4gICAgbGV0IGxhc3RCb29raW5nID0gbnVsbDtcbiAgICBsZXQgbGFzdEJvb2tpbmdPYnNlcnZlciA9IG51bGw7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmIChsYXN0Qm9va2luZ09ic2VydmVyKSB7XG4gICAgICAgICAgICBjcyhcIi9yb290dWkvbW9kZWwvdmlldy9wYW5lbC9tb2RlbC92aWV3L2Jvb2tpbmdsaXN0L21vZGVsXCIpLnVub2JzZXJ2ZShsYXN0Qm9va2luZ09ic2VydmVyKTtcbiAgICAgICAgICAgIGxhc3RCb29raW5nT2JzZXJ2ZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgbGFzdEJvb2tpbmdPYnNlcnZlciA9IGNzKFwiL3Jvb3R1aS9tb2RlbC92aWV3L3BhbmVsL21vZGVsL3ZpZXcvYm9va2luZ2xpc3QvbW9kZWxcIikub2JzZXJ2ZSh7XG4gICAgICAgICAgICBuYW1lOiBcImdsb2JhbDpjb21tYW5kOm5ld0Jvb2tpbmdcIixcbiAgICAgICAgICAgIGZ1bmM6IChfZXYsIGJvb2tpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoYm9va2luZy5fY2xhc3NOYW1lID09PSBcIlRpbWVCb29raW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdEJvb2tpbmcgPSBib29raW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSwgMjAwMCk7XG4gICAgLy8gYXV0by1jbGljayBza2lwIGJ1dHRvblxuICAgIHdhaXRGb3JFbG0oXCIuaW50cm9qcy1idXR0b24uaW50cm9qcy1za2lwYnV0dG9uXCIpLnRoZW4oKGVsbSkgPT4ge1xuICAgICAgICBlbG0uY2xpY2soKTtcbiAgICB9KTtcbiAgICB3YWl0Rm9yRWxtKCcuZmlsdGVyJykudGhlbigoZmlsdGVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGFkZEdpdEh1YkJ1dHRvbiA9IGFzeW5jIChmaWx0ZXIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGdpdEJ1dHRvbiA9IGZpbHRlci5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSk7XG4gICAgICAgICAgICBnaXRCdXR0b24uY2xhc3NMaXN0LmFkZCgncHJvdGVjdEJ1dHRvbicpO1xuICAgICAgICAgICAgZ2l0QnV0dG9uLmlubmVySFRNTCA9XG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJidXR0b25JY29uXCI+PGkgY2xhc3M9XCJmYSBmYS1naXRodWJcIj48L2k+PC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiYnV0dG9uVGV4dFwiPkdpdEh1YiBJbXBvcnQ8L2Rpdj4nO1xuICAgICAgICAgICAgZ2l0QnV0dG9uLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFsYXN0Qm9va2luZykge1xuICAgICAgICAgICAgICAgICAgICBjcyhcIi8vcm9vdHVpL21vZGVsXCIpLnB1Ymxpc2goXCJoYW5kbGVFcnJvclwiLCBcIlVzZXJzY3JpcHQgJ1RpbWVzaGl0JzogcGxlYXNlIGFkZCBhIHRpbWUgYm9va2luZy4gVGhlIHByZWRpY3Rpb24gaXMgYWx3YXlzIGRvbmUgZm9yIHRoZSBsYXN0IGFkZGVkIHRpbWUgYm9va2luZy5cIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgdXNlciA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdnaXRodWJfdXNlcicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhdCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdnaXRodWJfcGF0Jyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcHNwID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2dpdGh1Yl9wc3AnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwc3BFbGVtID0gYXBwLmRtLmZpbmRCeUV4YW1wbGUoXCJQU1BFbGVtZW50XCIsIHt9KS5maW5kKChlbGVtKSA9PiBlbGVtLmlkID09PSBwc3ApO1xuICAgICAgICAgICAgICAgIGlmICghdXNlciB8fCAhcGF0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ25vIEdpdEh1YiB1c2VyIG9yIHBhdCBvciBvcmdhJyk7XG4gICAgICAgICAgICAgICAgICAgIGNzKFwiLy9yb290dWkvbW9kZWxcIikucHVibGlzaChcImhhbmRsZUVycm9yXCIsIFwiVXNlcnNjcmlwdCAnVGltZXNoaXQnOiBUbyB1c2UgdGhpcyBmZWF0dXJlIHlvdSBmaXJzdCBuZWVkIHRvIHNldCB0aGUgZ2l0aHViIGNyZWRlbnRpYWxzIGluIHRoZSBzZXR0aW5ncyB0YWIgYW5kIHJlbG9hZCFcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZ2V0IHJlcG9zIGZyb20gR2l0SHViXG4gICAgICAgICAgICAgICAgY29uc3QgcGF0aCA9IGB1c2VyL3JlcG9zYDtcbiAgICAgICAgICAgICAgICBjb25zdCBhbGxSZXBvcyA9IChhd2FpdCBmZXRjaEdpdGh1YkFwaShwYXRoKSkubWFwKChyZXBvKSA9PiByZXBvLmZ1bGxfbmFtZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVsZXZhbnRSZXBvcyA9IGFsbFJlcG9zLmZpbHRlcigocmVwbykgPT4gIXJlcG8uc3RhcnRzV2l0aCh1c2VyKSk7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogZml4IHRoaXMgLSBnZXQgZnJvbSBzZWxlY3RlZCBkYXRlXG4gICAgICAgICAgICAgICAgY29uc3QgZGF0ZVN0YXJ0ID0gbmV3IERhdGUocGFyc2VJbnQobGFzdEJvb2tpbmcuYm9va2luZ0RheS5pZC5zdWJzdHJpbmcoMCwgNCkpLCBwYXJzZUludChsYXN0Qm9va2luZy5ib29raW5nRGF5LmlkLnN1YnN0cmluZyg0LCA2KSkgLSAxLCBwYXJzZUludChsYXN0Qm9va2luZy5ib29raW5nRGF5LmlkLnN1YnN0cmluZyg2LCA4KSkpO1xuICAgICAgICAgICAgICAgIGRhdGVTdGFydC5zZXREYXRlKGRhdGVTdGFydC5nZXREYXkoKSAtIDEpO1xuICAgICAgICAgICAgICAgIGRhdGVTdGFydC5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRlRW5kID0gbmV3IERhdGUoZGF0ZVN0YXJ0KTtcbiAgICAgICAgICAgICAgICBkYXRlRW5kLnNldEhvdXJzKDIzLCA1OSwgNTksIDk5OSk7XG4gICAgICAgICAgICAgICAgLy8gZ2V0IGNvbW1pdHMgZnJvbSBHaXRIdWJcbiAgICAgICAgICAgICAgICBjb25zdCBjb21taXRzID0gKGF3YWl0IFByb21pc2UuYWxsKHJlbGV2YW50UmVwb3MubWFwKChyZXBvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGByZXBvcy8ke3JlcG99L2NvbW1pdHM/cGVyX3BhZ2U9MTAwJmF1dGhvcj0ke3VzZXJ9YCArXG4gICAgICAgICAgICAgICAgICAgICAgICBgJnNpbmNlPSR7ZGF0ZVN0YXJ0LnRvSVNPU3RyaW5nKCl9JnVudGlsPSR7ZGF0ZUVuZC50b0lTT1N0cmluZygpfWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbW1pdHMgPSBmZXRjaEdpdGh1YkFwaSh1cmwpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29tbWl0cztcbiAgICAgICAgICAgICAgICB9KSkpLmZsYXQoKS5tYXAoKGNvbW1pdCkgPT4gY29tbWl0LmNvbW1pdC5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgbWVyZ2UgY29tbWl0c1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkQ29tbWl0cyA9IGNvbW1pdHMuZmlsdGVyKChjb21taXQpID0+ICFjb21taXQuc3RhcnRzV2l0aCgnTWVyZ2UgcHVsbCByZXF1ZXN0JykgJiYgIWNvbW1pdC5zdGFydHNXaXRoKCdNZXJnZSBicmFuY2gnKSk7XG4gICAgICAgICAgICAgICAgLy8gZmluZCBqaXJhIHRpY2tldHNcbiAgICAgICAgICAgICAgICBjb25zdCBqaXJhUGF0dGVybiA9IC8oW0EtWl17MiwxMH0tXFxkezEsNn0pL2c7XG4gICAgICAgICAgICAgICAgY29uc3QgamlyYVRpY2tldHMgPSBmaWx0ZXJlZENvbW1pdHMubWFwKChjb21taXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGNvbW1pdC5tYXRjaChqaXJhUGF0dGVybik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaGVzID8gbWF0Y2hlc1swXSA6IG51bGw7XG4gICAgICAgICAgICAgICAgfSkuZmlsdGVyKCh0aWNrZXQpID0+IHRpY2tldCAhPT0gbnVsbCk7XG4gICAgICAgICAgICAgICAgLy8gdGlja2V0IHdvcmtsb2FkIHNoYXJlXG4gICAgICAgICAgICAgICAgY29uc3QgdGlja2V0V29ya2xvYWQgPSBqaXJhVGlja2V0cy5yZWR1Y2UoKGFjYywgdGlja2V0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGFjY1t0aWNrZXRdID0gYWNjW3RpY2tldF0gPyBhY2NbdGlja2V0XSArIDEgOiAxO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgICAgIH0sIHt9KTtcbiAgICAgICAgICAgICAgICBjb25zdCBvdmVyYWxsID0gT2JqZWN0LnZhbHVlcyh0aWNrZXRXb3JrbG9hZCkucmVkdWNlKChhY2MsIHZhbCkgPT4gYWNjICsgdmFsLCAwKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0aWNrZXRXb3JrbG9hZFNoYXJlID0gT2JqZWN0LmVudHJpZXModGlja2V0V29ya2xvYWQpLm1hcCgoW3RpY2tldCwgd29ya2xvYWRdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JrbG9hZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoYXJlOiB3b3JrbG9hZCAvIG92ZXJhbGxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aWNrZXRXb3JrbG9hZFNoYXJlKTtcbiAgICAgICAgICAgICAgICAvLyBjYWxjIHVuYm9va2VkIHdvcmtpbmcgaG91cnNcbiAgICAgICAgICAgICAgICBjb25zdCBkYXlEdXJhdGlvbiA9IGxhc3RCb29raW5nLmJvb2tpbmdEYXkudGltZUJvb2tpbmdzLnJlZHVjZSgoYWNjLCB0aW1lKSA9PiBhY2MgKyBwYXJzZUZsb2F0KHRpbWUuZHVyYXRpb24pLCAwKTtcbiAgICAgICAgICAgICAgICBjb25zdCB1bmJvb2tlZEhvdXJzID0gIWxhc3RCb29raW5nLmJvb2tpbmdEYXk/LnRpbWVCb29raW5ncyB8fCBsYXN0Qm9va2luZy5ib29raW5nRGF5LnRpbWVCb29raW5ncy5sZW5ndGggPT09IDBcbiAgICAgICAgICAgICAgICAgICAgPyBkYXlEdXJhdGlvblxuICAgICAgICAgICAgICAgICAgICA6IGRheUR1cmF0aW9uIC0gbGFzdEJvb2tpbmcuYm9va2luZ0RheS50aW1lQm9va2luZ3MucmVkdWNlKChhY2MsIGJvb2tpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2MgKyBib29raW5nLnByb2plY3RCb29raW5ncy5yZWR1Y2UoKGFjYzIsIHByb2plY3RCb29raW5nKSA9PiBhY2MyICsgcGFyc2VGbG9hdChwcm9qZWN0Qm9va2luZy5kdXJhdGlvbiksIDApO1xuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICAvLyBhZGQgYm9va2luZ3NcbiAgICAgICAgICAgICAgICB0aWNrZXRXb3JrbG9hZFNoYXJlLmZvckVhY2godHdzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYm9va2luZyA9IGFwcC51dGlsLkVudGl0eUNyZWF0ZVV0aWwuY3JlYXRlUHJvamVjdEJvb2tpbmcobGFzdEJvb2tpbmcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHdzLndvcmtsb2FkID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYm9va2luZy5kZXNjcmlwdGlvbiA9IGAke3R3cy50aWNrZXR9OiAke3R3cy53b3JrbG9hZH0gY29tbWl0c2A7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21taXQgPSBmaWx0ZXJlZENvbW1pdHMuZmluZCgoY29tbWl0KSA9PiBjb21taXQuaW5jbHVkZXModHdzLnRpY2tldCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm9va2luZy5kZXNjcmlwdGlvbiA9IGAke3R3cy50aWNrZXR9OiAke2NvbW1pdH1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJvb2tpbmcuZHVyYXRpb24gPSBNYXRoLnJvdW5kKHVuYm9va2VkSG91cnMgKiB0d3Muc2hhcmUgKiAxMDApIC8gMTAwO1xuICAgICAgICAgICAgICAgICAgICBib29raW5nLnBzcGVsZW1lbnQgPSBwc3BFbGVtO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIHJlLXJlbmRlclxuICAgICAgICAgICAgICAgIGNzKFwiL3Jvb3R1aS9tb2RlbC92aWV3L3BhbmVsL21vZGVsL3ZpZXcvYm9va2luZ2xpc3QvbW9kZWxcIikudG91Y2goXCJnbG9iYWw6ZGF0YTpib29raW5nc1wiKTtcbiAgICAgICAgICAgICAgICBjcyhcIi8vcm9vdHVpL21vZGVsXCIpLnZhbHVlKFwiY29tbWFuZDpzaG93TWVzc2FnZVwiLCBcIkFkZGVkIEppcmEgVGlja2V0IGJvb2tpbmdzIGZyb20gR2l0SHViXCIpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgYWRkR2l0SHViQnV0dG9uKGZpbHRlcik7XG4gICAgfSk7XG4gICAgd2FpdEZvckVsbSgnLnNldHRpbmdzRGV0YWlscycpLnRoZW4oKHNldHRpbmdzRGV0YWlsKSA9PiB7XG4gICAgICAgIGlmICghc2V0dGluZ3NEZXRhaWwpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IGFkZEdpdEh1YkNyZWRlbnRpYWxTZXR0aW5ncyA9IGFzeW5jIChzZXR0aW5nc0RldGFpbCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdXNlciA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdnaXRodWJfdXNlcicpIHx8ICcnO1xuICAgICAgICAgICAgY29uc3QgcGF0ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2dpdGh1Yl9wYXQnKSB8fCAnJztcbiAgICAgICAgICAgIGNvbnN0IHBzcCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdnaXRodWJfcHNwJykgfHwgJyc7XG4gICAgICAgICAgICBjb25zdCBwc3BFbGVtcyA9IHdpbmRvd1snYXBwJ10gPyBhcHAuZG0/LmZpbmRCeUV4YW1wbGUoXCJQU1BFbGVtZW50XCIsIHt9KSA6IFtdO1xuICAgICAgICAgICAgY29uc3QgbmV3U2V0dGluZ3NEZXRhaWxTZWN0aW9uID0gc2V0dGluZ3NEZXRhaWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xuICAgICAgICAgICAgbmV3U2V0dGluZ3NEZXRhaWxTZWN0aW9uLmNsYXNzTGlzdC5hZGQoJ21zZ0RldGFpbEJsb2NrJywgJ2dpdGh1Yl9jb25uZWN0aW9uJyk7XG4gICAgICAgICAgICBuZXdTZXR0aW5nc0RldGFpbFNlY3Rpb24uaW5uZXJIVE1MID1cbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImhlYWRlclwiPkdpdEh1YiBDcmVkZW50aWFsczwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImdyaWRcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJsYWJlbFwiPlVzZXJuYW1lPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgIGA8ZGl2IGNsYXNzPVwidmFsdWVcIj48aW5wdXQgY2xhc3M9XCJtc2dJbnB1dFwiIGlkPVwiZ2l0aHViX3VzZXJcIiB2YWx1ZT1cIiR7dXNlcn1cIi8+PC9kaXY+YCArXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJncmlkXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibGFiZWxcIj5QZXJzb25hbCBBY2Nlc3MgVG9rZW48L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgYDxkaXYgY2xhc3M9XCJ2YWx1ZVwiPjxpbnB1dCBjbGFzcz1cIm1zZ0lucHV0XCIgaWQ9XCJnaXRodWJfcGF0XCIgdmFsdWU9XCIke3BhdH1cIi8+PC9kaXY+YCArXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJncmlkXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibGFiZWxcIj5EZWZhdWx0IFBTUC1FbGVtZW50PC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwidmFsdWVcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxzZWxlY3QgY2xhc3M9XCJtc2dJbnB1dFwiIGlkPVwiZ2l0aHViX3BzcFwiPicgK1xuICAgICAgICAgICAgICAgICAgICBwc3BFbGVtcy5tYXAocHNwRWxlbSA9PiBgPG9wdGlvbiB2YWx1ZT1cIiR7cHNwRWxlbS5pZH1cIiR7cHNwID09PSBwc3BFbGVtLmlkID8gJyBzZWxlY3RlZCcgOiAnJ30+YCArXG4gICAgICAgICAgICAgICAgICAgICAgICBgJHtwc3BFbGVtLm5hbWV9PC9vcHRpb24+YCkuam9pbignJykgK1xuICAgICAgICAgICAgICAgICAgICAnPC9zZWxlY3Q+JyArXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2Pic7XG4gICAgICAgICAgICBuZXdTZXR0aW5nc0RldGFpbFNlY3Rpb24ucXVlcnlTZWxlY3RvcignI2dpdGh1Yl91c2VyJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHNldExvY2FsU3RvcmFnZUZyb21JbnB1dCk7XG4gICAgICAgICAgICBuZXdTZXR0aW5nc0RldGFpbFNlY3Rpb24ucXVlcnlTZWxlY3RvcignI2dpdGh1Yl9wYXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgc2V0TG9jYWxTdG9yYWdlRnJvbUlucHV0KTtcbiAgICAgICAgICAgIG5ld1NldHRpbmdzRGV0YWlsU2VjdGlvbi5xdWVyeVNlbGVjdG9yKCcjZ2l0aHViX3BzcCcpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBzZXRMb2NhbFN0b3JhZ2VGcm9tSW5wdXQpO1xuICAgICAgICB9O1xuICAgICAgICBhZGRHaXRIdWJDcmVkZW50aWFsU2V0dGluZ3Moc2V0dGluZ3NEZXRhaWwpO1xuICAgIH0pO1xuICAgIGZ1bmN0aW9uIGZldGNoR2l0aHViQXBpKHBhdGgpIHtcbiAgICAgICAgY29uc3QgdXNlciA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdnaXRodWJfdXNlcicpO1xuICAgICAgICBjb25zdCBwYXQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZ2l0aHViX3BhdCcpO1xuICAgICAgICByZXR1cm4gZmV0Y2goJ2h0dHBzOi8vYXBpLmdpdGh1Yi5jb20vJyArIHBhdGgsIHtcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAvLyBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7cGF0fX1gLCAvLyA8LS0gYWNjb3JkaW5nIHRvIGRvY3MgdGhpcyBzaG91bGQgd29yaywgYnV0IGl0IGRvZXNuJ3RcbiAgICAgICAgICAgICAgICBBdXRob3JpemF0aW9uOiBgQmFzaWMgJHtidG9hKGAke3VzZXJ9OiR7cGF0fWApfWAsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi92bmQuZ2l0aHViLnYzK2pzb24nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSkudGhlbigocmVzKSA9PiByZXMuanNvbigpKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2V0TG9jYWxTdG9yYWdlRnJvbUlucHV0KGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgY29uc3Qga2V5ID0gdGFyZ2V0LmlkO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHRhcmdldC52YWx1ZTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XG4gICAgfVxufSkoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==