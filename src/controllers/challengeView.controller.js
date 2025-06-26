import { test } from "@playwright/test";

export class ChallengeViewPage {
    constructor(request) {
        this.request = request;
    };

    async get(token) {
        return test.step("Получение списка заданий", async () => {
            const RESPONSE = await this.request.get("/todos", {
                headers: {
                    "X-Challenger": token,
                }
            });
            return RESPONSE;
        });
    };

    async getFormat(token, format = "xml" | "json" | "any") {
        return test.step("Получение списка заданий по формату", async () => {
            if (format === "xml") {
                const RESPONSE = await this.request.get("/todos", {
                    headers: {
                        "X-Challenger": token,
                        "Accept": "application/xml",
                    }
                });
                return RESPONSE;
            } else if (format === "json") {
                const RESPONSE = await this.request.get("/todos", {
                    headers: {
                        "X-Challenger": token,
                        "Accept": "application/json",
                    }
                });
                return RESPONSE
            } else {
                const RESPONSE = await this.request.get("/todos", {
                    headers: {
                        "X-Challenger": token,
                        "Accept": "*/*",
                    }
                });
                return RESPONSE
            }
        });
    };

    async getFail(token) {
        return test.step("Невалидный запрос списка заданий", async () => {
            const RESPONSE = await this.request.get("/todo", {
                headers: {
                    "X-Challenger": token,
                }
            });
            return RESPONSE;
        });
    };

    async getFilter(token, param, value) {
        return test.step("Фильтрация списка заданий через параметр", async () => {
            const RESPONSE = await this.request.get(`/todos?${param}=${value}`, {
                headers: {
                    "X-Challenger": token,
                }
            });
            return RESPONSE;
        });
    };

    // Получение конкретного задания по его id 
    async getSpecificId(token, id) {
        return test.step("Получение конкретного задания", async () => {
            const RESPONSE = await this.request.get(`/todos/${id}`, {
                headers: {
                    "X-Challenger": token,
                }
            });
            return RESPONSE;
        });
    };

    // Получение массива с id заданий
    async getChallengeListId(token) {
        const RESPONSE = await this.get(token);
        const BODY = await RESPONSE.json();
        let array = [];

        for (let i = 0; i < BODY.todos.length; i++) {
            array.push(BODY.todos[i].id)
        };
        return array;
    };
};