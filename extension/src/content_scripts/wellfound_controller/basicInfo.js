import { setReactInputValue, waitForElement, simulateTyping, simulateFullClick } from './utils';
export function fillWellfoundBio(bioText) {
    const bioField = document.getElementById("form-input--bio");
    if (!bioField) {
        console.warn("CareerMatch: bio field not found on page");
        return;
    }
    setReactInputValue(bioField, bioText);
}
export function fillWellfoundName(fullName) {
    const nameField = document.getElementById("form-input--name");
    if (!nameField) {
        console.warn("CareerMatch: name field not found on page");
        return;
    }
    setReactInputValue(nameField, fullName);
}
export async function fillLocation(placeName) {
    const closeBtn = document.querySelector(".styles_close__oAq6U");
    if (closeBtn) {
        closeBtn.click();
        await waitForElement('[data-test="Downshift--input"]');
    }
    const input = document.querySelector('[data-test="Downshift--input"]');
    if (!input) {
        console.warn("CareerMatch: location input not found");
        return false;
    }
    input.focus(); // some widgets only trigger search logic on a focused field
    await simulateTyping(input, placeName);
    const options = await waitForElement('[role="option"]');
    if (!options) {
        console.warn("CareerMatch: no suggestions appeared for", placeName);
        return false;
    }
    const target = Array.from(options).find((opt) => opt
        .getAttribute("data-test")
        ?.toLowerCase()
        .includes(placeName.toLowerCase()));
    if (!target) {
        console.warn(`CareerMatch: no location match found for "${placeName}"`);
        return false;
    }
    simulateFullClick(target);
    return true;
}
