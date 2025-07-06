import { test } from "@playwright/test";

export class ChallengeUpdatePage {
    constructor(request) {
        this.request = request;
    };
    
    async postUpdate(token, id, title ) {
        return test.step("обновление задания через POST", async () => {
            const RESPONSE = await this.request.post(`/todos/${id}`, {
                headers: {
                    "X-Challenger": token,
                },
                data: {
                    title: `${title}`,
                }
            });
            return RESPONSE;
        });
    };

    async putUpdate(token, id, title, description, status) {
        return test.step("Обновление задания через PUT", async () => {
            const RESPONSE = await this.request.put(`/todos/${id}`, {
                headers: {
                    "X-Challenger": token,
                },
                data: {
                    title: `${title}`,
                    doneStatus: status,
                    description: `${description}`,
                }
            });
            return RESPONSE;
        });
    };

    async putUpdateNoTitle(token, id) {
        return test.step("Обновление заголовка задания через PUT", async () => {
            const RESPONSE = await this.request.put(`/todos/${id}`, {
                headers: {
                    "X-Challenger": token,
                },
                data: {
                    description: "123",
                }
            });
            return RESPONSE;
        });
    };

    async putUpdateId(token, id) {
        return test.step("Изменение id задания через PUT", async () => {
            const RESPONSE = await this.request.put(`/todos/${id}`, {
                headers: {
                    "X-Challenger": token,
                },
                data: {
                    id: 0,
                    description: "123",
                }
            });
            return RESPONSE;
        });
    };

    async putUpdateField(token, id) {
        return test.step("Изменение id задания через PUT", async () => {
            const RESPONSE = await this.request.put(`/todos/${id}`, {
                headers: {
                    "X-Challenger": token,
                },
                data: {
                    field: "123",
                }
            });
            return RESPONSE;
        });
    };
};