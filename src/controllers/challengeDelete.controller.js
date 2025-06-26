import { test } from "@playwright/test";

export class ChallengeDeletePage {
    constructor(request) {
        this.request = request;
    };

    async delete(token, id) {
        return test.step("Создание задания через PUT", async () => {
            const RESPONSE = await this.request.delete(`/todos/${id}`, {
                headers: {
                    "X-Challenger": token,
                },
            });
            return RESPONSE;
        });
    };
}