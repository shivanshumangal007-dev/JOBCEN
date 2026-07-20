import { simulateTyping, waitForElement, simulateFullClick, setReactInputValue } from './utils';
export async function fillSchoolName(SchoolName) {
    const input = document.querySelector("#downshift-3-input");
    if (!input) {
        console.warn("CareerMatch: School name field not found");
        return false;
    }
    input.focus();
    await simulateTyping(input, SchoolName);
    const results = await waitForElement("#downshift-5-menu .styles_component__O6Mqu");
    if (!results) {
        console.warn("CareerMatch: no School name results appeared for", SchoolName);
        // case 1
        const createButton = document.querySelector(".styles_menu__POsOr button.styles-module_component__88XzG");
        if (createButton) {
            simulateFullClick(createButton);
            console.log(`CareerMatch: created new company entry "${SchoolName}"`);
            return true;
        }
        else {
            return false;
        }
    }
    console.log(results);
    // Case 2: try to find an exact (or close) match among real results
    const exactMatch = Array.from(results).find((el) => el.getAttribute("data-test") == SchoolName);
    if (exactMatch) {
        simulateFullClick(exactMatch);
        console.log(`CareerMatch: selected existing company "${SchoolName}"`);
        return true;
    }
    console.warn(`CareerMatch: neither match nor create button found for "${SchoolName}"`);
    return false;
}
export async function addWellfoundEducation(data) {
    const addNewExperienceButton = document.querySelector("a.styles_add__QCFDU");
    if (!addNewExperienceButton ||
        addNewExperienceButton.textContent?.toLowerCase() !== "+ add education") {
        console.warn("CareerMatch: 'Add experience' button not found — skipping this entry");
        return;
    }
    addNewExperienceButton.click();
    await new Promise((res) => setTimeout(res, 300));
    await fillSchoolName(data.SchoolName);
    await new Promise((res) => setTimeout(res, 300));
    //graduation year and month
    let field = document.querySelector('[for="form-input--graduationDate"] input');
    if (!field) {
        console.warn("CareerMatch: graduationDate field not found on page");
        return;
    }
    field.focus();
    await simulateTyping(field, data.graduationYear);
    field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    field.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
    await new Promise((res) => setTimeout(res, 200));
    let committedValue = field.value;
    console.log(`CareerMatch: startedAt field now shows "${committedValue}"`);
    // degree
    //field of study
    field = document.getElementById("form-input--majors[0]");
    if (!field) {
        console.warn("CareerMatch: field of study field not found on page");
        return;
    }
    setReactInputValue(field, data.fieldOfStudy);
    //cgpa
    field = document.querySelector("#form-input--gpa");
    if (!field) {
        console.warn("CareerMatch: cgpa field not found on page");
        return;
    }
    setReactInputValue(field, data.CGPA.toString());
    //max cgpa
    field = document.querySelector("#form-input--maxGpa");
    if (!field) {
        console.warn("CareerMatch: max cgpa field not found on page");
        return;
    }
    setReactInputValue(field, data.maxGpa.toString());
}
