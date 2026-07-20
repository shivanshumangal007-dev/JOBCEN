import { simulateTyping, waitForElement, simulateFullClick } from './utils';

export const fillWellfoundSkills = async (skills: string[]) => {
  let input: HTMLInputElement | null;
  for (const skill of skills) {
    input = document.querySelector(
      '[placeholder="e.g. Python, React"]',
    ) as HTMLInputElement | null;
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
      const createButton = document.querySelector(
        ".styles-module_component__88XzG.styles_button__YZJix.styles_component__sMuDw",
      ) as HTMLButtonElement;
      simulateFullClick(createButton);
      return;
    }
    const exactMatch = Array.from(options).find(
      (el) => el.getAttribute("data-test") == skill,
    ) as HTMLElement | undefined;

    if (exactMatch) {
      simulateFullClick(exactMatch);
      console.log(`CareerMatch: selected existing skill "${skill}"`);
    } else {
      const createButton = document.querySelector(
        ".styles-module_component__88XzG.styles_button__YZJix.styles_component__sMuDw",
      ) as HTMLButtonElement;
      simulateFullClick(createButton);
    }
  }
};

export const fillWellFoundAchivement = async (achivement: string) => {
  const input = document.querySelector(
    "#form-input--whatIveBuilt",
  ) as HTMLInputElement;
  if (!input) {
    console.warn("CareerMatch: skills input field not found on page");
    return;
  }
  input.focus();
  await simulateTyping(input, achivement)
};
