import waitForElm from './helper/waitForElement';

(() => {
    waitForElm('.filter').then((filter: Element) => {
        const addGitHubButton = async (filter: Element): Promise<void> => {
            if (!filter) return;

            const gitButton = filter.appendChild(document.createElement('button'));
            gitButton.innerHTML = '<span class="buttonText">GitHub Import</span>';
            gitButton.classList.add('protectButton');
            gitButton.setAttribute(
                'style',
                'border: 0; font-family: "Open sans",Helvetica,Arial,sans-serif!important; background-color: inherit; font-weight: 500;'
            );
            gitButton.onclick = async () => {
                const user = localStorage.getItem('github_user');
                const pat = localStorage.getItem('github_pat');

                if (!user || !pat) {
                    console.log('no GitHub user or pat or orga');
                    return;
                }

                // get repos from GitHub
                const path = `user/repos`;
                const allRepos = (await fetchGithubApi(path)).map((repo: {full_name: string}) => repo.full_name) as string[];
                const relevantRepos = allRepos.filter((repo) => !repo.startsWith(user));

                // TODO: fix this - get from selected date
                const dateStart = new Date();
                dateStart.setDate(dateStart.getDay() - 1);
                dateStart.setHours(0, 0, 0, 0);
                const dateEnd = new Date();
                dateEnd.setHours(23, 59, 59, 999);

                // get commits from GitHub
                const commits = (await Promise.all(
                    relevantRepos.map((repo) => {
                        const url = `repos/${repo}/commits?per_page=100&author=${user}` +
                            `&since=${dateStart.toISOString()}&until=${dateEnd.toISOString()}`;
                        const commits = fetchGithubApi(url);
                        return commits;
                    })
                )).flat().map((commit: {sha: string, commit: {message: string}}) => commit.commit.message) as string[];
                // remove merge commits
                const filteredCommits = commits.filter((commit) => !commit.startsWith('Merge pull request') && !commit.startsWith('Merge branch'));
                // find jira tickets
                const jiraPattern = /([A-Z]{2,10}-\d{1,6})/g;
                const jiraTickets = filteredCommits.map((commit) => {
                    const matches = commit.match(jiraPattern);
                    return matches ? matches[0] : null;
                }).filter((ticket) => ticket !== null) as string[];

                console.log(jiraTickets);
            };
        };
        addGitHubButton(filter);
    });

    waitForElm('.settingsDetails').then((settingsDetail: Element) => {
        if (!settingsDetail) return;

        const addGitHubCredentialSettings = async (settingsDetail: Element) => {
            const user = localStorage.getItem('github_user') || '';
            const pat = localStorage.getItem('github_pat') || '';

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
                '</div>';

            newSettingsDetailSection.querySelector('#github_user')?.addEventListener('change', setLocalStorageFromInput);
            newSettingsDetailSection.querySelector('#github_pat')?.addEventListener('change', setLocalStorageFromInput);
        };
        addGitHubCredentialSettings(settingsDetail);
    });
})();

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
