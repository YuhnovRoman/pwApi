import { ChallengeStartPage, ChallengeViewPage, ChallengeCreatePage, ChallengeUpdatePage, ChallengeStatusCodePage, ChallengeDeletePage } from "./index";

export class ApiPage {
    constructor(request) {
        this.request = request;
        this.challengeStart = new ChallengeStartPage(request);
        this.challengeView = new ChallengeViewPage(request);
        this.challengeCreate = new ChallengeCreatePage(request);
        this.challengeUpdate = new ChallengeUpdatePage(request);
        this.challengeStatusCode = new ChallengeStatusCodePage(request);
        this.challengeDelete = new ChallengeDeletePage(request);
    };
};