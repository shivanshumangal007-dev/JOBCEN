import { simulateFullClick } from "./utils";

const fillwellfoundPronouns = async (pronouns : string) => {
    const input = document.querySelector('#form-input--pronouns') as HTMLElement | null;
    
    if (!input) {
        console.warn("CareerMatch: pronouns field not found on page");
        return false;
    }

    simulateFullClick(input)
    await new Promise((res) => setTimeout(res, 300));

    switch (pronouns) {
        case "he/him":
            const hehim = document.getElementById("react-select-form-input--pronouns-option-0") as HTMLElement | null;
            if (!hehim) {
                console.warn("CareerMatch: he/him option not found on page");
                return false;
            }
            simulateFullClick(hehim);
            return true;
        case "she/her":
            const sheher = document.getElementById("react-select-form-input--pronouns-option-1") as HTMLElement | null;
            if (!sheher) {
                console.warn("CareerMatch: she/her option not found on page");
                return false;
            }
            simulateFullClick(sheher);
            return true;
        case "other":
            const other = document.getElementById("react-select-form-input--pronouns-option-4") as HTMLElement | null;
            if (!other) {
                console.warn("CareerMatch: they/them option not found on page");
                return false;
            }
            simulateFullClick(other);
            return true;
        default:
            return;
    }
}

export {
    fillwellfoundPronouns
}