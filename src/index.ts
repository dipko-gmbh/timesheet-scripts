import waitForElm from './helper/waitForElement';

(async () => {
    const filter = await waitForElm('.filter');
    console.log('Hello from timesheet improver!!!');
    const addGitHubButton = async (filter: Element): Promise<void> => {
        console.log('addGitHubButton');
        const gitButton = filter.appendChild(document.createElement('button'));
        console.log('gitButton:', gitButton);
        gitButton.innerHTML = '<span class="buttonText">GitHub Import</span>';
        gitButton.classList.add('protectButton');
        gitButton.setAttribute(
            'style',
            'border: 0; font-family: "Open sans",Helvetica,Arial,sans-serif!important; background-color: inherit; font-weight: 500;'
        )
        gitButton.onclick = () => {
            console.log('i clicked the Button!!');
        };
    };

    if (filter) {
        addGitHubButton(filter as Element);
    }
})();
