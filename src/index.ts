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
                    console.log('no GitHub user or pat');
                    return;
                }
                // get REPOS
                const url = `https://api.github.com/orgs/dipko-gmbh/repos?affiliation=owner&per_page=100`; // visibility=public
                const repos = await fetch(url, {
                    headers: {
                        Authorization: `Basic ${btoa(`${user}:${pat}`)}`,
                        // Authorization: `token ${pat}}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/vnd.github.v3+json',
                    },
                }).then((res) => res.json());
                console.log(repos);
            };
        };
        addGitHubButton(filter);
    });

    waitForElm('.settingsDetails').then((settingsDetail: Element) => {
        if (!settingsDetail) return;

        const addGitHubCredentialSettings = async (settingsDetail: Element) => {
            const user = localStorage.getItem('github_user');
            const pat = localStorage.getItem('github_pat');

            const newSettingsDetailSection = settingsDetail.appendChild(document.createElement('div'));
            newSettingsDetailSection.classList.add('msgDetailBlock', 'github_connection');
            // newSettingsDetailSection.setAttribute('style', 'width: 100vw');

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

        waitForElm('.github_connection')
    });
})();

function setLocalStorageFromInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const key = target.id;
    const value = target.value;
    localStorage.setItem(key, value);
}