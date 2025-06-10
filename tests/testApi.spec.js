import { expect } from "@playwright/test";
import { test } from "../src/fixtures/index";

let token;
let idArray = [];

test.describe("Просмотр заданий", () => {
    test.beforeAll(async ({ api }) => {
        token = await api.challengeStart.post();
    });

    test("Проверка списка со статусами челленджей", {
        tag: "@challengeStatus"
    }, async ({ api }) => {
        const RESPONSE = await api.challengeStart.get(token);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(200);
        await expect(BODY.challenges).toHaveLength(59);
    });

    test("Проверка списка всех заданий", {
        tag: "@challengeView"
    }, async ({ api }) => {
        const RESPONSE = await api.challengeView.get();
        const RESPONSE_TOKEN = await api.challengeView.get(token);
        const BODY = await RESPONSE.json();
        const BODY_TOKEN = await RESPONSE_TOKEN.json();


        await expect(RESPONSE.status()).toBe(200);
        await expect(RESPONSE_TOKEN.status()).toBe(200);

        await expect(BODY.todos).toHaveLength(10);
        await expect(BODY_TOKEN.todos).toHaveLength(10);

        // Список заданий с токеном и без токена должны отличаться
        await expect(BODY.todos).not.toStrictEqual(BODY_TOKEN.todos);
    });

    test("Проверка ошибки запроса на просмотр заданий", {
        tag: "@challengeView"
    }, async ({ api }) => {
        const RESPONSE = await api.challengeView.getFail(token);

        await expect(RESPONSE.status()).toBe(404);
    });

    test("Проверка просмотра каждого конкретного задания", {
        tag: "@challengeView"
    }, async ({ api }) => {
        idArray = await api.challengeView.getChallengeListId(token);

        for (let i = 0; i < idArray.length; i++) {
            const RESPONSE = await api.challengeView.getSpecificId(token, idArray[i]);
            const BODY = await RESPONSE.json();

            await expect(RESPONSE.status()).toBe(200);
            //Каждое задание должно содержать определенные поля с определенными типами
            await expect(BODY.todos).toMatchObject([{
                description: expect.any(String),
                doneStatus: expect.any(Boolean),
                id: expect.any(Number),
                title: expect.any(String),
            }]);
        };
    });
});