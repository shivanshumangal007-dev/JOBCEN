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
  setReactInputValue(input, "");
  input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true }));
  input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));

  let current = "";
  for (const char of text) {
    current += char;
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: char, bubbles: true }),
    );
    setReactInputValue(input, current);
    input.dispatchEvent(
      new KeyboardEvent("keyup", { key: char, bubbles: true }),
    );
    await new Promise((res) => setTimeout(res, 60)); // mimic natural typing speed
  }
}
function simulateFullClick(element: HTMLElement) {
  const opts = { bubbles: true, cancelable: true, view: window, button: 0 };
  element.dispatchEvent(new PointerEvent("pointerdown", opts));
  element.dispatchEvent(new MouseEvent("mousedown", opts));
  element.dispatchEvent(new PointerEvent("pointerup", opts));
  element.dispatchEvent(new MouseEvent("mouseup", opts));
  element.dispatchEvent(new MouseEvent("click", opts));
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
async function fillLocation(placeName: string) {
  const closeBtn = document.querySelector(
    ".styles_close__oAq6U",
  ) as HTMLElement | null;
  if (closeBtn) {
    closeBtn.click();
    await waitForElement('[data-test="Downshift--input"]');
  }

  const input = document.querySelector(
    '[data-test="Downshift--input"]',
  ) as HTMLInputElement | null;
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

  const target = Array.from(options).find((opt) =>
    opt
      .getAttribute("data-test")
      ?.toLowerCase()
      .includes(placeName.toLowerCase()),
  ) as HTMLElement | undefined;

  if (!target) {
    console.warn(`CareerMatch: no location match found for "${placeName}"`);
    return false;
  }

  simulateFullClick(target);
  return true;
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

//work experience
type WorkExperience = {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};
async function fillCompany(companyName: string) {
  const input = document.querySelector(
    "#downshift-2-input",
  ) as HTMLInputElement | null;

  if (!input) {
    console.warn("CareerMatch: company field not found");
    return false;
  }

  input.focus();
  await simulateTyping(input, companyName);

  const results = await waitForElement(
    ".styles_menu__POsOr .styles_menu__POsOr",
  ); // placeholder, confirm real class
  if (!results) {
    console.warn("CareerMatch: no company results appeared for", companyName);
    const createButton = document.querySelector(
      ".styles_menu__POsOr button.styles-module_component__88XzG",
    ) as HTMLButtonElement;
    if (createButton) {
      simulateFullClick(createButton);
      console.log(`CareerMatch: created new company entry "${companyName}"`);
      return true;
    } else {
      return false;
    }
  }

  // Case 1: try to find an exact (or close) match among real results
  const exactMatch = Array.from(results).find((el) =>
    el.getAttribute("data-test")?.includes(companyName),
  ) as HTMLElement | undefined;

  if (exactMatch) {
    simulateFullClick(exactMatch);
    console.log(`CareerMatch: selected existing company "${companyName}"`);
    return true;
  }

  // Case 2: no exact match — fall back to "Create X" button
  const createButton = document.querySelector(
    ".styles_menu__POsOr button.styles-module_component__88XzG",
  ) as HTMLButtonElement;

  if (createButton) {
    simulateFullClick(createButton);
    console.log(`CareerMatch: created new company entry "${companyName}"`);
    return true;
  }

  console.warn(
    `CareerMatch: neither match nor create button found for "${companyName}"`,
  );
  return false;
}
async function fillWelfoundWorkExperience(data: WorkExperience[]) {
  for (const da of data) {
    const addNewExperience = document.querySelector(
      "a.styles_add__EROyj",
    ) as HTMLElement | null;
    if (!addNewExperience) {
      console.warn("CareerMatch: 'Add experience' button not found — skipping this entry");
      continue;
    }
    addNewExperience.click();
    await new Promise((res) => setTimeout(res, 300)); // let the new experience form mount

    //company
    await fillCompany(da.company);
    //work title
    let field = document.getElementById(
      "form-input--title",
    ) as HTMLInputElement | null;
    if (!field) {
      console.warn("CareerMatch: title field not found on page");
      return;
    }
    setReactInputValue(field, da.title);
    //start date
    field = document.querySelector(
      '[for="form-input--startedAt"] input',
    ) as HTMLInputElement | null;
    if (!field) {
      console.warn("CareerMatch: started at field not found on page");
      return;
    }
    field.focus();
    await simulateTyping(field, da.startDate);

    field.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    field.dispatchEvent(
      new KeyboardEvent("keyup", { key: "Enter", bubbles: true }),
    );

    await new Promise((res) => setTimeout(res, 200));

    let committedValue = field.value;
    console.log(`CareerMatch: startedAt field now shows "${committedValue}"`);

    //end data
    field = document.querySelector(
      '[name="form-input--endedAt"] input',
    ) as HTMLInputElement | null;
    if (!field) {
      console.warn("CareerMatch: endedat field not found on page");
      return;
    }
    field.focus();
    await simulateTyping(field, da.endDate);

    field.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    field.dispatchEvent(
      new KeyboardEvent("keyup", { key: "Enter", bubbles: true }),
    );

    await new Promise((res) => setTimeout(res, 200));

    committedValue = field.value;
    console.log(`CareerMatch: ended at field now shows "${committedValue}"`);
    //description
    field = document.getElementById(
      "form-input--description",
    ) as HTMLInputElement | null;
    if (!field) {
      console.warn("CareerMatch: description field not found on page");
      return;
    }
    setReactInputValue(field, da.description);
  }
}

const sampleWorkExperience: WorkExperience = {
  company: "Google",
  title: "Frontend Developer Intern",
  location: "Remote",
  startDate: "May 2026",
  endDate: "July 2026",
  description:
    "Developed responsive React components using TypeScript and Tailwind CSS. Built reusable UI components, implemented drag-and-drop functionality for the file explorer, collaborated with backend developers to integrate REST APIs, fixed UI bugs, and participated in code reviews and sprint planning.",
};

type EducationData = {
  SchoolName : string;
  degree : string;
  fieldOfStudy : string;
  graduationYear: string;
  CGPA: number;
  maxGpa: number;
  
}
async function fillSchoolName(SchoolName: string) {
  const input = document.querySelector(
    "#downshift-3-input",
  ) as HTMLInputElement | null;

  if (!input) {
    console.warn("CareerMatch: School name field not found"); 
    return false;
  }

  input.focus();
  await simulateTyping(input, SchoolName);

  const results = await waitForElement(
    "#downshift-5-menu .styles_component__O6Mqu",
  ); 
  if (!results) {
    console.warn("CareerMatch: no School name results appeared for", SchoolName);
    // case 1
    const createButton = document.querySelector(
      ".styles_menu__POsOr button.styles-module_component__88XzG",
    ) as HTMLButtonElement;
    if (createButton) {
      simulateFullClick(createButton);
      console.log(`CareerMatch: created new company entry "${SchoolName}"`);
      return true;
    } else {
      return false;
    }
  }
  console.log(results)
  // Case 2: try to find an exact (or close) match among real results
  const exactMatch = Array.from(results).find((el) =>
    el.getAttribute("data-test") == SchoolName
  ) as HTMLElement | undefined;

  if (exactMatch) {
    simulateFullClick(exactMatch);
    console.log(`CareerMatch: selected existing company "${SchoolName}"`);
    return true;
  }


  console.warn(
    `CareerMatch: neither match nor create button found for "${SchoolName}"`,
  );
  return false;
}
async function addWellfoundEducation(data : EducationData){

  const addNewExperienceButton = document.querySelector(
      "a.styles_add__QCFDU",
    ) as HTMLElement | null;
    if (!addNewExperienceButton || addNewExperienceButton.textContent?.toLowerCase() !== "+ add education") {
      console.warn("CareerMatch: 'Add experience' button not found — skipping this entry");
      return;
    }
    addNewExperienceButton.click();
    await new Promise((res) => setTimeout(res, 300)); 
    
    await fillSchoolName(data.SchoolName);
    await new Promise((res) => setTimeout(res, 300)); 

    //graduation year and month
    let field = document.querySelector(
      '[for="form-input--graduationDate"] input',
    ) as HTMLInputElement | null;
    if (!field) {
      console.warn("CareerMatch: graduationDate field not found on page");
      return;
    }
    field.focus();
    await simulateTyping(field, data.graduationYear);

    field.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    field.dispatchEvent(
      new KeyboardEvent("keyup", { key: "Enter", bubbles: true }),
    );

    await new Promise((res) => setTimeout(res, 200));

    let committedValue = field.value;
    console.log(`CareerMatch: startedAt field now shows "${committedValue}"`);

    // degree

    //field of study
    field = document.getElementById("form-input--majors[0]") as HTMLInputElement | null;
    if(!field){
      console.warn("CareerMatch: field of study field not found on page");
      return;
    }
    setReactInputValue(field, data.fieldOfStudy);

    //cgpa
    field = document.querySelector("#form-input--gpa") as HTMLInputElement | null;
    if(!field){
      console.warn("CareerMatch: cgpa field not found on page");
      return;
    }
    setReactInputValue(field, data.CGPA.toString());

    //max cgpa
    field = document.querySelector("#form-input--maxGpa") as HTMLInputElement | null;
    if(!field){
      console.warn("CareerMatch: max cgpa field not found on page");
      return;
    }
    setReactInputValue(field, data.maxGpa.toString());
    
}

const sampleEducation : EducationData = {
  SchoolName : "Indian Institute of Information Technology, Allahabad",
  degree : "Bachelor of Technology",
  fieldOfStudy : "Computer Science and Engineering",
  graduationYear: "July 2026",
  CGPA: 8.5,
  maxGpa: 9,
}
async function runAllFillers() {
  // plain text fields — fast, but still sequential for predictable logging/debugging
  fillWellfoundBio(
    "Full-stack engineer testing autofill from CareerMatch extension.",
  );
  fillWellfoundName("shivanshu");
  fillWellfoundBioWebsiteUrl("www.portfolio.com");
  fillWellfoundLinkedinUrl("www.linkedin.com");
  fillWellfoundGithubUrl("www.github.com/shivanshumangal007");
  fillWellfoundTwitterUrl("www.twitter.com/shivanshum0007");

  // dropdown/search fields — MUST run one at a time.
  // fillWellfoundPrimaryRole and fillWellfoundOpenToRole both query ".select__option",
  // so running them concurrently causes one to click into the other's open dropdown.
  await fillWellfoundPrimaryRole("Data Scientist");
  await new Promise((res) => setTimeout(res, 300)); // let the dropdown fully close before the next one opens

  await fillLocation("delhi");
  await new Promise((res) => setTimeout(res, 300));

  await fillWellfoundOpenToRole(["Mobile"]);
  await new Promise((res) => setTimeout(res, 300));

  await fillWelfoundWorkExperience([sampleWorkExperience]);
  await new Promise((res) => setTimeout(res, 300));

  await addWellfoundEducation(sampleEducation);
}

setTimeout(() => {
  runAllFillers();
}, 1000);