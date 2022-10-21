import waitForElm from './helper/waitForElement';

(() => {
    waitForElm('.filter').then((filter: Element | null) => {
        const addGitHubButton = async (filter: Element): Promise<void> => {
            if (!filter) return;

            const gitButton = filter.appendChild(document.createElement('button'));
            gitButton.innerHTML = '<span class="buttonText">GitHub Import</span>';
            gitButton.classList.add('protectButton');
            gitButton.setAttribute(
                'style',
                'border: 0; font-family: "Open sans",Helvetica,Arial,sans-serif!important; background-color: inherit; font-weight: 500;'
            );
            gitButton.onclick = () => {
                console.log('i clicked the Button!!');
            };
        };
        addGitHubButton(filter as Element);
    });

    waitForElm('.settingsDetails').then((settingsDetail: Element | null) => {
        if (!settingsDetail) return;

        const addGitHubCredentialSettings = async (settingsDetail: Element) => {
            const newSettingsDetailSection = settingsDetail.appendChild(
                document.createElement('div')
            );
            newSettingsDetailSection.classList.add('msgDetailBlock');
            newSettingsDetailSection.setAttribute('style', 'height: 400px; width: 100vw');

            newSettingsDetailSection.innerHTML =
                '<span class="buttonText">testtestests</span>';
        };
        addGitHubCredentialSettings(settingsDetail as Element);
    });
})();
