import { test } from "@playwright/test";

export class ChallengeStatusCodePage {
    constructor(request) {
        this.request = request;
    };

    async getPatchStatusCode(token) {
        return test.step("Проверка статус кодов", async () => {
            const RESPONSE = await this.request.patch("/heartbeat", {
                headers: {
                    "X-Challenger": token,
                }
            });
            return RESPONSE;
        });
    };

    async getDeleteStatusCode(token) {
        return test.step("Проверка статус кодов", async () => {
            const RESPONSE = await this.request.delete("/heartbeat", {
                headers: {
                    "X-Challenger": token,
                }
            });
            return RESPONSE;
        });
    };
};