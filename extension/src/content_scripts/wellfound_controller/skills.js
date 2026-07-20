import { simulateTyping, waitForElement, simulateFullClick } from './utils';
export const fillWellfoundSkills = async (skills) => {
    let input;
    for (const skill of skills) {
        input = document.querySelector('[placeholder="e.g. Python, React"]');
        if (!input) {
            console.warn("CareerMatch: skills input field not found on page");
            return;
        }
        input.focus();
        await simulateTyping(input, skills[0]);
        await new Promise((res) => setTimeout(res, 200));
        const options = await waitForElement(".styles_component__O6Mqu");
        console.log(options);
        if (!options) {
            console.log(`no options appered for ${skill}`);
            const createButton = document.querySelector(".styles-module_component__88XzG.styles_button__YZJix.styles_component__sMuDw");
            simulateFullClick(createButton);
            return;
        }
        const exactMatch = Array.from(options).find((el) => el.getAttribute("data-test") == skill);
        if (exactMatch) {
            simulateFullClick(exactMatch);
            console.log(`CareerMatch: selected existing skill "${skill}"`);
        }
        else {
            const createButton = document.querySelector(".styles-module_component__88XzG.styles_button__YZJix.styles_component__sMuDw");
            simulateFullClick(createButton);
        }
    }
};
export const fillWellFoundAchivement = async (achivement) => {
    const input = document.querySelector("#form-input--whatIveBuilt");
    if (!input) {
        console.warn("CareerMatch: skills input field not found on page");
        return;
    }
    input.focus();
    await simulateTyping(input, achivement);
};
