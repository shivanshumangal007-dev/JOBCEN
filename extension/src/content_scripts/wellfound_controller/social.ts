import { setReactInputValue } from './utils';

export function fillWellfoundBioWebsiteUrl(url: string) {
  const BioUrlField = document.getElementById(
    "form-input--onlineBioUrl",
  ) as HTMLInputElement | null;
  if (!BioUrlField) {
    console.warn("CareerMatch: BioUrl field not found on page");
    return;
  }
  setReactInputValue(BioUrlField, url);
}

export function fillWellfoundLinkedinUrl(url: string) {
  const LinkedinUrlField = document.getElementById(
    "form-input--linkedinUrl",
  ) as HTMLInputElement | null;
  if (!LinkedinUrlField) {
    console.warn("CareerMatch: LinkedinUrl field not found on page");
    return;
  }
  setReactInputValue(LinkedinUrlField, url);
}

export function fillWellfoundGithubUrl(url: string) {
  const GithubUrlField = document.getElementById(
    "form-input--githubUrl",
  ) as HTMLInputElement | null;
  if (!GithubUrlField) {
    console.warn("CareerMatch: GithubUrl field not found on page");
    return;
  }
  setReactInputValue(GithubUrlField, url);
}

export function fillWellfoundTwitterUrl(url: string) {
  const TwitterUrlField = document.getElementById(
    "form-input--twitterUrl",
  ) as HTMLInputElement | null;
  if (!TwitterUrlField) {
    console.warn("CareerMatch: TwitterUrl field not found on page");
    return;
  }
  setReactInputValue(TwitterUrlField, url);
}
