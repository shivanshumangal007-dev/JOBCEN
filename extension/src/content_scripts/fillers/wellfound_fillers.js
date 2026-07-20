import { fillWellfoundBio, fillWellfoundName, fillLocation, fillWellfoundBioWebsiteUrl, fillWellfoundLinkedinUrl, fillWellfoundGithubUrl, fillWellfoundTwitterUrl, fillWellfoundPrimaryRole, fillWellfoundOpenToRole, fillWelfoundWorkExperience, addWellfoundEducation, fillWellfoundSkills, fillWellFoundAchivement } from '../wellfound_controller';
console.log("JOBCEN is loaded succesfully on wellfound");
const sampleWorkExperience = {
    company: "Google",
    title: "Frontend Developer Intern",
    location: "Remote",
    startDate: "May 2026",
    endDate: "July 2026",
    description: "Developed responsive React components using TypeScript and Tailwind CSS. Built reusable UI components, implemented drag-and-drop functionality for the file explorer, collaborated with backend developers to integrate REST APIs, fixed UI bugs, and participated in code reviews and sprint planning.",
};
const sampleEducation = {
    SchoolName: "Indian Institute of Information Technology, Allahabad",
    degree: "Bachelor of Technology",
    fieldOfStudy: "Computer Science and Engineering",
    graduationYear: "July 2026",
    CGPA: 8.5,
    maxGpa: 9,
};
async function runAllFillers() {
    // plain text fields — fast, but still sequential for predictable logging/debugging
    fillWellfoundBio("Full-stack engineer testing autofill from CareerMatch extension.");
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
    await new Promise((res) => setTimeout(res, 300));
    await fillWellfoundSkills(["Django"]);
    await new Promise((res) => setTimeout(res, 300));
    await fillWellFoundAchivement("djangoproject");
}
setTimeout(() => {
    runAllFillers();
}, 1000);
