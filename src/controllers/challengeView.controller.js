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

    async getFail(token) {
        return test.step("Получение списка заданий", async () => {
            const RESPONSE = await this.request.get("/todo", {
                headers: {
                    "X-Challenger": token,
                }
            });
            return RESPONSE;
        });
    };

    // Получение конкретного задания по его id 
    async getSpecificId(token, id) {
        return test.step("Получение списка заданий", async () => {
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

        for(let i = 0; i < BODY.todos.length; i++) {
            array.push(BODY.todos[i].id)
        };
        return array;
    };
};