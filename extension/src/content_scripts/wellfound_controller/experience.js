import { simulateTyping, waitForElement, simulateFullClick, setReactInputValue } from './utils';
export async function fillCompany(companyName) {
    const input = document.querySelector("#downshift-2-input");
    if (!input) {
        console.warn("CareerMatch: company field not found");
        return false;
    }
    input.focus();
    await simulateTyping(input, companyName);
    const results = await waitForElement(".styles_menu__POsOr .styles_menu__POsOr"); // placeholder, confirm real class
    if (!results) {
        console.warn("CareerMatch: no company results appeared for", companyName);
        const createButton = document.querySelector(".styles_menu__POsOr button.styles-module_component__88XzG");
        if (createButton) {
            simulateFullClick(createButton);
            console.log(`CareerMatch: created new company entry "${companyName}"`);
            return true;
        }
        else {
            return false;
        }
    }
    // Case 1: try to find an exact (or close) match among real results
    const exactMatch = Array.from(results).find((el) => el.getAttribute("data-test")?.includes(companyName));
    if (exactMatch) {
        simulateFullClick(exactMatch);
        console.log(`CareerMatch: selected existing company "${companyName}"`);
        return true;
    }
    // Case 2: no exact match — fall back to "Create X" button
    const createButton = document.querySelector(".styles_menu__POsOr button.styles-module_component__88XzG");
    if (createButton) {
        simulateFullClick(createButton);
        console.log(`CareerMatch: created new company entry "${companyName}"`);
        return true;
    }
    console.warn(`CareerMatch: neither match nor create button found for "${companyName}"`);
    return false;
}
export async function fillWelfoundWorkExperience(data) {
    for (const da of data) {
        const addNewExperience = document.querySelector("a.styles_add__EROyj");
        if (!addNewExperience) {
            console.warn("CareerMatch: 'Add experience' button not found — skipping this entry");
            continue;
        }
        addNewExperience.click();
        await new Promise((res) => setTimeout(res, 300)); // let the new experience form mount
        //company
        await fillCompany(da.company);
        //work title
        let field = document.getElementById("form-input--title");
        if (!field) {
            console.warn("CareerMatch: title field not found on page");
            return;
        }
        setReactInputValue(field, da.title);
        //start date
        field = document.querySelector('[for="form-input--startedAt"] input');
        if (!field) {
            console.warn("CareerMatch: started at field not found on page");
            return;
        }
        field.focus();
        await simulateTyping(field, da.startDate);
        field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        field.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
        await new Promise((res) => setTimeout(res, 200));
        let committedValue = field.value;
        console.log(`CareerMatch: startedAt field now shows "${committedValue}"`);
        //end data
        field = document.querySelector('[name="form-input--endedAt"] input');
        if (!field) {
            console.warn("CareerMatch: endedat field not found on page");
            return;
        }
        field.focus();
        await simulateTyping(field, da.endDate);
        field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        field.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
        await new Promise((res) => setTimeout(res, 200));
        committedValue = field.value;
        console.log(`CareerMatch: ended at field now shows "${committedValue}"`);
        //description
        field = document.getElementById("form-input--description");
        if (!field) {
            console.warn("CareerMatch: description field not found on page");
            return;
        }
        setReactInputValue(field, da.description);
    }
}
