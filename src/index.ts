// ComponentJS - globals
declare var cs: Function;
declare var app: any;
declare var window: any

import waitForElm from './helper/waitForElement';

(function() {
    let lastBooking: null | any = null;
    setTimeout(() => {
        if (window.userscriptObserverDateChanged) {
            cs("/rootui/model/view/panel/model/view/bookinglist/model").unobserve(window.userscriptObserverDateChanged);
            window.userscriptObserverDateChanged = undefined;
        }
        window.userscriptObserverDateChanged = cs("/rootui/model/view/panel/model/view/bookinglist/model").observe({
            name: "global:command:newBooking",
            func: (_ev: Event, booking: { _className: string; }) => {
                if (booking._className === "TimeBooking") {
                    lastBooking = booking;
                }
            }
        });
    }, 2000);

    // auto-click skip button
    waitForElm(".introjs-button.introjs-skipbutton").then((elm: any) => {
        elm.click();
    });

    waitForElm('.filter').then((filter: Element) => {
        const addGitHubButton = async (filter: Element): Promise<void> => {
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
                const pspElem = app.dm.findByExample("PSPElement", {}).find((elem: { id: string; }) => elem.id === psp);

                if (!user || !pat) {
                    console.log('no GitHub user or pat or orga');
                    return;
                }

                // get repos from GitHub
                const path = `user/repos`;
                const allRepos = (await fetchGithubApi(path)).map((repo: {full_name: string}) => repo.full_name) as string[];
                const relevantRepos = allRepos.filter((repo) => !repo.startsWith(user));

                // TODO: fix this - get from selected date
                const dateStart = new Date(lastBooking.bookingDay.id.substring(0, 4), lastBooking.bookingDay.id.substring(4, 6), lastBooking.bookingDay.id.substring(6, 8));
                dateStart.setDate(dateStart.getDay() - 1);
                dateStart.setHours(0, 0, 0, 0);
                const dateEnd = new Date(dateStart);
                dateEnd.setHours(23, 59, 59, 999);

                // get commits from GitHub
                const commits = (await Promise.all(
                    relevantRepos.map((repo) => {
                        const url = `repos/${repo}/commits?per_page=100&author=${user}` +
                            `&since=${dateStart.toISOString()}&until=${dateEnd.toISOString()}`;
                        const commits = fetchGithubApi(url);
                        return commits;
                    })
                )).flat().map((commit: {commit: {message: string}}) => commit.commit.message) as string[];

                // remove merge commits
                const filteredCommits = commits.filter((commit) => !commit.startsWith('Merge pull request') && !commit.startsWith('Merge branch'));
                // find jira tickets
                const jiraPattern = /([A-Z]{2,10}-\d{1,6})/g;
                const jiraTickets = filteredCommits.map((commit) => {
                    const matches = commit.match(jiraPattern);
                    return matches ? matches[0] : null;
                }).filter((ticket) => ticket !== null) as string[];

                // ticket workload share
                const ticketWorkload = jiraTickets.reduce((acc, ticket) => {
                    acc[ticket] = acc[ticket] ? acc[ticket] + 1 : 1;
                    return acc;
                }, {} as {[key: string]: number});
                const overall = Object.values(ticketWorkload).reduce((acc, val) => acc + val, 0);
                const ticketWorkloadShare = Object.entries(ticketWorkload).map(([ticket, workload]) => {
                    return {ticket, workload, share: workload / overall};
                });

                console.log(ticketWorkloadShare);

                // add bookings
                const bookings = ticketWorkloadShare.map(tws => {
                    const booking = app.util.EntityCreateUtil.createProjectBooking(lastBooking);
                    booking.description = `${tws.ticket}: ${tws.workload} commits`;
                    // TODO: maybe remove the time used by other bookings
                    booking.duration = Math.round(lastBooking.duration * tws.share);
                    booking.pspelement = pspElem;
                });
            };
        };
        addGitHubButton(filter);
    });

    waitForElm('.settingsDetails').then((settingsDetail: Element) => {
        if (!settingsDetail) return;

        const addGitHubCredentialSettings = async (settingsDetail: Element) => {
            const user = localStorage.getItem('github_user') || '';
            const pat = localStorage.getItem('github_pat') || '';
            const psp = localStorage.getItem('github_psp') || '';
            const pspElems: {id: string, name: string}[] = 
                // @ts-ignore
                window['app'] ? app.dm?.findByExample("PSPElement", {}) : [];

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
                            pspElems.map(pspElem => 
                                `<option value="${pspElem.id}"${psp === pspElem.id ? ' selected' : ''}>` + 
                                `${pspElem.name}</option>`
                            ).join('') +
                        '</select>' +
                    '</div>' +
                '</div>';

            newSettingsDetailSection.querySelector('#github_user')?.addEventListener('change', setLocalStorageFromInput);
            newSettingsDetailSection.querySelector('#github_pat')?.addEventListener('change', setLocalStorageFromInput);
            newSettingsDetailSection.querySelector('#github_psp')?.addEventListener('change', setLocalStorageFromInput);
        };
        addGitHubCredentialSettings(settingsDetail);
    });

    function fetchGithubApi(path: string) {
        const user = localStorage.getItem('github_user');
        const pat = localStorage.getItem('github_pat');
    
        return fetch('https://api.github.com/' + path, {
            headers: {
                Authorization: `Basic ${btoa(`${user}:${pat}`)}`,
                // Authorization: `Bearer ${pat}}`,
                'Content-Type': 'application/json',
                Accept: 'application/vnd.github.v3+json',
            },
        }).then((res) => res.json());
    }
    
    function setLocalStorageFromInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        const key = target.id;
        const value = target.value;
        localStorage.setItem(key, value);
    }
})();
