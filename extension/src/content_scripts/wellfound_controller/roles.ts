import { setReactInputValue, waitForElement, simulateTyping, simulateFullClick } from './utils';

export async function fillWellfoundPrimaryRole(PrimaryRole: string) {
  const ProleField = document.getElementById(
    "react-select-form-input--primaryRole-input",
  ) as HTMLInputElement | null;
  if (!ProleField) {
    console.warn("CareerMatch: primary role field not found on page");
    return;
  }
  setReactInputValue(ProleField, PrimaryRole);
  const options = await waitForElement(".select__option");
  if (!options) {
    console.warn("CareerMatch: no suggestions appeared for", PrimaryRole);
    return;
  }
  const match = Array.from(options).find((opt) =>
    opt
      .querySelector("span")
      ?.textContent?.toLowerCase()
      .includes(PrimaryRole.toLowerCase()),
  ) as HTMLElement | undefined;
  if (!match) {
    console.warn(
      `CareerMatch: no primary role match found for "${PrimaryRole}"`,
    );
    return;
  }
  match.dispatchEvent(
    new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      view: window,
    }),
  );
  match.dispatchEvent(
    new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      view: window,
    }),
  );
  match.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true, view: window }),
  );
}

export async function fillWellfoundOpenToRole(roleArr: string[]) {
  for (const role of roleArr) {
    const roleField = document.getElementById(
      "react-select-form-input--roleIds-input",
    ) as HTMLInputElement | null;

    if (!roleField) {
      console.warn("CareerMatch: role field not found on page");
      continue;
    }
    await simulateTyping(roleField, role);

    // wait for suggestions
    const options = await waitForElement(".select__option", 800);
    if (!options) {
      console.warn("CareerMatch: no suggestions for", role);
      continue;
    }

    // ALWAYS pick the first option for auto-complete
    const firstOption = document.querySelector(".select__option");
    if (!firstOption) {
      console.warn("CareerMatch: no selectable option found for", role);
      continue;
    }

    simulateFullClick(firstOption as HTMLElement);
    console.log("selected (first option):", role);
    // small pause so the chip renders
    await new Promise((r) => setTimeout(r, 200));
  }
}
