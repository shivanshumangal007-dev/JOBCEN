import {
  fillWellfoundBio,
  fillWellfoundName,
  fillLocation,
  fillWellfoundBioWebsiteUrl,
  fillWellfoundLinkedinUrl,
  fillWellfoundGithubUrl,
  fillWellfoundTwitterUrl,
  fillWellfoundPrimaryRole,
  fillWellfoundOpenToRole,
  fillWelfoundWorkExperience,
  addWellfoundEducation,
  fillWellfoundSkills,
  fillWellFoundAchivement,
  WellfoundProfileData
} from '../wellfound_controller';
import { fillwellfoundPronouns } from '../wellfound_controller/Identity';

console.log("JOBCEN is loaded succesfully on wellfound");

export const dummyProfileData: WellfoundProfileData = {
  bio: "Full-stack engineer testing autofill from CareerMatch extension.",
  name: "shivanshu",
  websiteUrl: "www.portfolio.com",
  linkedinUrl: "www.linkedin.com",
  githubUrl: "www.github.com/shivanshumangal007",
  twitterUrl: "www.twitter.com/shivanshum0007",
  primaryRole: "Data Scientist",
  location: "delhi",
  openToRoles: ["Mobile"],
  workExperience: [
    {
      company: "Google",
      title: "Frontend Developer Intern",
      location: "Remote",
      startDate: "May 2026",
      endDate: "July 2026",
      description: "Developed responsive React components using TypeScript and Tailwind CSS. Built reusable UI components, implemented drag-and-drop functionality for the file explorer, collaborated with backend developers to integrate REST APIs, fixed UI bugs, and participated in code reviews and sprint planning.",
    }
  ],
  education: [
    {
      SchoolName: "Indian Institute of Information Technology, Allahabad",
      degree: "Bachelor of Technology",
      fieldOfStudy: "Computer Science and Engineering",
      graduationYear: "July 2026",
      CGPA: 8.5,
      maxGpa: 9,
    }
  ],
  skills: ["Django"],
  achievements: "djangoproject",
  identity: "he/him"
};

export async function runAllFillers(data: WellfoundProfileData) {
  // plain text fields — fast, but still sequential for predictable logging/debugging
  fillWellfoundBio(data.bio);
  fillWellfoundName(data.name);
  fillWellfoundBioWebsiteUrl(data.websiteUrl);
  fillWellfoundLinkedinUrl(data.linkedinUrl);
  fillWellfoundGithubUrl(data.githubUrl);
  fillWellfoundTwitterUrl(data.twitterUrl);

  // dropdown/search fields — MUST run one at a time.
  await fillWellfoundPrimaryRole(data.primaryRole);
  await new Promise((res) => setTimeout(res, 300)); // let the dropdown fully close before the next one opens

  await fillLocation(data.location);
  await new Promise((res) => setTimeout(res, 300));

  await fillWellfoundOpenToRole(data.openToRoles);
  await new Promise((res) => setTimeout(res, 300));

  await fillWelfoundWorkExperience(data.workExperience);
  await new Promise((res) => setTimeout(res, 300));

  for (const edu of data.education) {
    await addWellfoundEducation(edu);
    await new Promise((res) => setTimeout(res, 300));
  }
  
  await fillWellfoundSkills(data.skills);
  await new Promise((res) => setTimeout(res, 300));
  
  await fillWellFoundAchivement(data.achievements);
  await new Promise((res) => setTimeout(res, 300));

  await fillwellfoundPronouns(data.identity);
  await new Promise((res) => setTimeout(res, 300));
}

setTimeout(() => {
  runAllFillers(dummyProfileData);
}, 1000);
