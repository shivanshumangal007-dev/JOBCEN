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

function fillWellfoundPrimaryRole(PrimaryRole: string) {
  const ProleField = document.getElementById(
    "form-input--primaryRole",
  ) as HTMLInputElement | null;
  if (!ProleField) {
    console.warn("CareerMatch: primary role field not found on page");
    return;
  }
  setReactInputValue(ProleField, PrimaryRole);
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

  setReactInputValue(input, placeName)

  const options = await waitForElement('[role="option"]')
  if (!options) {
    console.warn("CareerMatch: no suggestions appeared for", placeName)
    return false
  }

  const match = Array.from(options).find((opt) =>
    opt.getAttribute("data-test")?.toLowerCase().includes(placeName.toLowerCase())
  ) as HTMLElement | undefined

  if (!match) {
    console.warn(`CareerMatch: no location match found for "${placeName}"`)
    return false
  }

  match.click()
  return true
}
setTimeout(() => {
  fillWellfoundBio(
    "Full-stack engin  er testing autofill from CareerMatch extension.",
  );
  fillWellfoundName("testing");
  // fillWellfoundPrimaryRole("Software Engineer")
  fillLocation("new york");
}, 1000);
