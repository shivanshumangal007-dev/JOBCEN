console.log("JOBCEN is loaded succesfully on wellfound");

function getNativeValueSetter(
  element: HTMLElement,
): ((value: string) => void) | null {
  let proto = Object.getPrototypeOf(element);
  while (proto) {
    const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
    if (descriptor?.set) return descriptor.set.bind(element);
    proto = Object.getPrototypeOf(proto);
  }
  return null;
}

function setReactInputValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) {
  const setter = getNativeValueSetter(element);
  if (!setter) {
    console.error("CareerMatch: no native value setter found for", element);
    return;
  }
  setter(value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
}
async function simulateTyping(input: HTMLInputElement, text: string) {
  // clear first
  setReactInputValue(input, "")
  input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true }))
  input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }))

  let current = ""
  for (const char of text) {
    current += char
    input.dispatchEvent(new KeyboardEvent("keydown", { key: char, bubbles: true }))
    setReactInputValue(input, current)
    input.dispatchEvent(new KeyboardEvent("keyup", { key: char, bubbles: true }))
    await new Promise((res) => setTimeout(res, 60)) // mimic natural typing speed
  }
}
function simulateFullClick(element: HTMLElement) {
  const opts = { bubbles: true, cancelable: true, view: window, button: 0 }
  element.dispatchEvent(new PointerEvent("pointerdown", opts))
  element.dispatchEvent(new MouseEvent("mousedown", opts))
  element.dispatchEvent(new PointerEvent("pointerup", opts))
  element.dispatchEvent(new MouseEvent("mouseup", opts))
  element.dispatchEvent(new MouseEvent("click", opts))
}
function waitForElement(
  selector: string,
  timeoutMs = 3000,
  intervalMs = 100,
): Promise<NodeListOf<Element> | null> {
  return new Promise((resolve) => {
    const start = Date.now();

    const check = () => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        resolve(elements);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        resolve(null); // timed out, caller handles the null
        return;
      }
      setTimeout(check, intervalMs);
    };

    check();
  });
}
function fillWellfoundBio(bioText: string) {
  const bioField = document.getElementById(
    "form-input--bio",
  ) as HTMLTextAreaElement | null;
  if (!bioField) {
    console.warn("CareerMatch: bio field not found on page");
    return;
  }
  setReactInputValue(bioField, bioText);
}

function fillWellfoundName(fullName: string) {
  const nameField = document.getElementById(
    "form-input--name",
  ) as HTMLInputElement | null;
  if (!nameField) {
    console.warn("CareerMatch: name field not found on page");
    return;
  }
  setReactInputValue(nameField, fullName);
}

async function fillWellfoundPrimaryRole(PrimaryRole: string) {
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

async function fillWellfoundOpenToRole(roleArr: string[]) {
  for (const role of roleArr) {
    const roleField = document.getElementById(
      "react-select-form-input--roleIds-input",
    ) as HTMLInputElement | null;

    if (!roleField) {
      console.warn("CareerMatch: role field not found on page");
      continue;
    }
    await simulateTyping(roleField, role)

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

// social handles
function fillWellfoundBioWebsiteUrl(url: string) {
  const BioUrlField = document.getElementById(
    "form-input--onlineBioUrl",
  ) as HTMLInputElement | null;
  if (!BioUrlField) {
    console.warn("CareerMatch: BioUrl field not found on page");
    return;
  }
  setReactInputValue(BioUrlField, url);
}
function fillWellfoundLinkedinUrl(url: string) {
  const LinkedinUrlField = document.getElementById(
    "form-input--linkedinUrl",
  ) as HTMLInputElement | null;
  if (!LinkedinUrlField) {
    console.warn("CareerMatch: LinkedinUrl field not found on page");
    return;
  }
  setReactInputValue(LinkedinUrlField, url);
}
function fillWellfoundGithubUrl(url: string) {
  const GithubUrlField = document.getElementById(
    "form-input--githubUrl",
  ) as HTMLInputElement | null;
  if (!GithubUrlField) {
    console.warn("CareerMatch: GithubUrl field not found on page");
    return;
  }
  setReactInputValue(GithubUrlField, url);
}
function fillWellfoundTwitterUrl(url: string) {
  const TwitterUrlField = document.getElementById(
    "form-input--twitterUrl",
  ) as HTMLInputElement | null;
  if (!TwitterUrlField) {
    console.warn("CareerMatch: TwitterUrl field not found on page");
    return;
  }
  setReactInputValue(TwitterUrlField, url);
}

async function fillLocation(placeName: string) {
  const closeBtn = document.querySelector(".styles_close__oAq6U") as HTMLElement | null
  if (closeBtn) {
    closeBtn.click()
    await waitForElement('[data-test="Downshift--input"]')
  }

  const input = document.querySelector('[data-test="Downshift--input"]') as HTMLInputElement | null
  if (!input) {
    console.warn("CareerMatch: location input not found")
    return false
  }

  input.focus() // some widgets only trigger search logic on a focused field
  await simulateTyping(input, placeName)

  const options = await waitForElement('[role="option"]')
  if (!options) {
    console.warn("CareerMatch: no suggestions appeared for", placeName)
    return false
  }

  const target = Array.from(options).find((opt) =>
    opt.getAttribute("data-test")?.toLowerCase().includes(placeName.toLowerCase())
  ) as HTMLElement | undefined

  if (!target) {
    console.warn(`CareerMatch: no location match found for "${placeName}"`)
    return false
  }

  simulateFullClick(target)
  return true
}
setTimeout(() => {
  fillWellfoundBio(
    "Full-stack engin  er testing autofill from CareerMatch extension.",
  );
  fillWellfoundName("testing");
  fillWellfoundPrimaryRole("Data Scientist"); //done
  fillLocation("delhi"); //done
  fillWellfoundOpenToRole(["Mobile"]); //done
  fillWellfoundBioWebsiteUrl("www.portfolio.com")
  fillWellfoundLinkedinUrl("www.linkedin.com")
  fillWellfoundGithubUrl("www.github.com/shivanshumangal007")
  fillWellfoundTwitterUrl("www.twitter.com/shivanshum0007")
}, 1000);
