import { setReactInputValue } from './utils';
export function fillWellfoundBioWebsiteUrl(url) {
    const BioUrlField = document.getElementById("form-input--onlineBioUrl");
    if (!BioUrlField) {
        console.warn("CareerMatch: BioUrl field not found on page");
        return;
    }
    setReactInputValue(BioUrlField, url);
}
export function fillWellfoundLinkedinUrl(url) {
    const LinkedinUrlField = document.getElementById("form-input--linkedinUrl");
    if (!LinkedinUrlField) {
        console.warn("CareerMatch: LinkedinUrl field not found on page");
        return;
    }
    setReactInputValue(LinkedinUrlField, url);
}
export function fillWellfoundGithubUrl(url) {
    const GithubUrlField = document.getElementById("form-input--githubUrl");
    if (!GithubUrlField) {
        console.warn("CareerMatch: GithubUrl field not found on page");
        return;
    }
    setReactInputValue(GithubUrlField, url);
}
export function fillWellfoundTwitterUrl(url) {
    const TwitterUrlField = document.getElementById("form-input--twitterUrl");
    if (!TwitterUrlField) {
        console.warn("CareerMatch: TwitterUrl field not found on page");
        return;
    }
    setReactInputValue(TwitterUrlField, url);
}
