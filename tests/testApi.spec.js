import { expect } from "@playwright/test";
import { test } from "../src/helper/fixtures/index";
import { TodoBuilder } from "../src/helper/builder/builder";

let token;

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
        tag: "@ViewChallenges",
        tag: "@Get",
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
        tag: "@ViewChallenges",
        tag: "@Get",
    }, async ({ api }) => {
        const RESPONSE = await api.challengeView.getFail(token);

        await expect(RESPONSE.status()).toBe(404);
    });

    test("Проверка просмотра каждого конкретного задания", {
        tag: "@ViewChallenges",
        tag: "@Get",
    }, async ({ api }) => {
        let idArray = await api.challengeView.getChallengeListId(token);

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

    test("Проверка просмотра конкретного задания по несуществующему id", {
        tag: "@ViewChallenges",
        tag: "@Get",
    }, async ({ api }) => {
        const RESPONSE = await api.challengeView.getSpecificId(token, 0);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(404);
        await expect(BODY.errorMessages).toEqual(['Could not find an instance with todos/0']);
    });

    test("Поверка фильтрации заданий через параметры", {
        tag: "@ViewChallenges",
        tag: "@Get",
    }, async ({ api }) => {
        const GET_PARAM = {
            description: "description",
            doneStatus: "doneStatus",
            id: "id",
            title: "title",
        };
        const RESPONSE = await api.challengeView.getFilter(token, GET_PARAM.doneStatus, false);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(200);
        // Задания отфильтрованы согласно выбранному фильтру
        BODY.todos.forEach(status => {
            expect(status.doneStatus).toBe(false);
        });
    });

    test("Поверка отображения задания в xml формате", {
        tag: "@ViewChallenges",
        tag: "@Get",
    }, async ({ api }) => {
        const RESPONSE = await api.challengeView.getFormat(token, "xml");
        const HEADERS = RESPONSE.headers();
        const CONTENT = HEADERS["content-type"];

        await expect(RESPONSE.status()).toBe(200);
        await expect(CONTENT).toEqual("application/xml");
    });

    test("Поверка отображения задания в json формате", {
        tag: "@ViewChallenges",
        tag: "@Get",
    }, async ({ api }) => {
        const RESPONSE = await api.challengeView.getFormat(token, "json");
        const HEADERS = RESPONSE.headers();
        const CONTENT = HEADERS["content-type"];

        await expect(RESPONSE.status()).toBe(200);
        await expect(CONTENT).toEqual("application/json");
    });

    test("Поверка отображения задания в any формате", {
        tag: "@ViewChallenges",
        tag: "@Get",
    }, async ({ api }) => {
        const RESPONSE = await api.challengeView.getFormat(token, "any");
        const HEADERS = RESPONSE.headers();
        const CONTENT = HEADERS["content-type"];

        await expect(RESPONSE.status()).toBe(200);
        await expect(CONTENT).toEqual("application/json");
    });
});

test.describe("Создание заданий", () => {
    test.beforeAll(async ({ api }) => {
        token = await api.challengeStart.post();
    });

    test("Создание задания", {
        tag: "@CreateChallenges",
        tag: "@Post"
    }, async ({ api }) => {
        const TODO_DATA = new TodoBuilder()
            .generateTitle(10)
            .generateDescription(10)
            .generate();
        const RESPONSE = await api.challengeCreate.postCreate(token, TODO_DATA.title, TODO_DATA.description);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(201);
        await expect(BODY.title).toEqual(TODO_DATA.title);
        await expect(BODY.description).toEqual(TODO_DATA.description);
    });

    test("Создание задания c невалидным статусом", {
        tag: "@CreateChallenges",
        tag: "@Post"
    }, async ({ api }) => {
        const TODO_DATA = new TodoBuilder()
            .generateTitle()
            .generateDescription()
            .generate();
        const RESPONSE = await api.challengeCreate.postCreate(token, TODO_DATA.title, TODO_DATA.description, "fail");
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(400);
        await expect(BODY.errorMessages).toEqual(['Failed Validation: doneStatus should be BOOLEAN but was STRING']);
    });

    test("Создание задания c длинным заголовком", {
        tag: "@CreateChallenges",
        tag: "@Post"
    }, async ({ api }) => {
        const TODO_DATA = new TodoBuilder()
            .generateTitle(51)
            .generateDescription(10)
            .generate();
        const RESPONSE = await api.challengeCreate.postCreate(token, TODO_DATA.title, TODO_DATA.description);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(400);
        await expect(BODY.errorMessages).toEqual(['Failed Validation: Maximum allowable length exceeded for title - maximum allowed is 50']);
    });

    test("Создание задания c максимально допустимой длинной заголовка и описания", {
        tag: "@CreateChallenges",
        tag: "@Post"
    }, async ({ api }) => {
        const TODO_DATA = new TodoBuilder()
            .generateTitle(50)
            .generateDescription(200)
            .generate();
        const RESPONSE = await api.challengeCreate.postCreate(token, TODO_DATA.title, TODO_DATA.description);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(201);
        await expect(BODY.title).toHaveLength(50);
        await expect(BODY.description).toHaveLength(200);
    });

    test("Создание задания c длинным описанием", {
        tag: "@CreateChallenges",
        tag: "@Post"
    }, async ({ api }) => {
        const TODO_DATA = new TodoBuilder()
            .generateTitle(10)
            .generateDescription(5000)
            .generate();
        const RESPONSE = await api.challengeCreate.postCreate(token, TODO_DATA.title, TODO_DATA.description);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(413);
        await expect(BODY.errorMessages).toEqual(['Error: Request body too large, max allowed is 5000 bytes']);
    });

    test("Создание задания c несуществующим полем", {
        tag: "@CreateChallenges",
        tag: "@Post"
    }, async ({ api }) => {
        const RESPONSE = await api.challengeCreate.postCreateUnrecognized(token);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(400);
        await expect(BODY.errorMessages).toEqual(['Could not find field: UnrecognizedField']);
    });

    test("Создание задания через метод PUT", {
        tag: "@CreateChallenges",
        tag: "@Put"
    }, async ({ api }) => {
        const RESPONSE = await api.challengeCreate.putCreate(token, 0);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(400);
        await expect(BODY.errorMessages).toEqual(['Cannot create todo with PUT due to Auto fields id']);
    });
});

test.describe("Изменение заданий", async () => {
    test.beforeAll(async ({ api }) => {
        token = await api.challengeStart.post();
    });

    test("Обновление заголовка задания через POST", {
        tag: "@UpdateChallenges",
        tag: "@Post"
    }, async ({ api }) => {
        const TODO_DATA = new TodoBuilder()
            .generateTitle(10)
            .generate();
        const ID = await api.challengeView.getChallengeListId();
        const RANDOM_ID = Math.floor(Math.random() * (ID.length - 1));
        const RESPONSE = await api.challengeUpdate.postUpdate(token, RANDOM_ID, TODO_DATA.title);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(200);
        await expect(BODY.title).toEqual(TODO_DATA.title);
    });

    test("Обновление заголовка задания c несуществующим id через POST", {
        tag: "@UpdateChallenges",
        tag: "@Post"
    }, async ({ api }) => {
        const RESPONSE = await api.challengeUpdate.postUpdate(token, 0);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(404);
        await expect(BODY.errorMessages).toEqual(['No such todo entity instance with id == 0 found']);
    });

    test("Обновление задания через PUT", {
        tag: "@UpdateChallenges",
        tag: "@Put"
    }, async ({ api }) => {
        const TODO_DATA = new TodoBuilder()
            .generateTitle(10)
            .generateDescription(50)
            .generate();
        const ID = await api.challengeView.getChallengeListId();
        const RANDOM_ID = Math.floor(Math.random() * (ID.length - 1));
        const RESPONSE = await api.challengeUpdate.putUpdate(token, RANDOM_ID, TODO_DATA.title, TODO_DATA.description, true);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(200);
        await expect(BODY.title).toEqual(TODO_DATA.title);
        await expect(BODY.description).toEqual(TODO_DATA.description);
        await expect(BODY.doneStatus).toEqual(true);
    });

    test("Обновление заголовка задания через PUT", {
        tag: "@UpdateChallenges",
        tag: "@Put"
    }, async ({ api }) => {
        const TODO_DATA = new TodoBuilder()
            .generateTitle(10)
            .generate();
        const ID = await api.challengeView.getChallengeListId();
        const RANDOM_ID = Math.floor(Math.random() * (ID.length - 1));
        const RESPONSE = await api.challengeUpdate.putUpdate(token, RANDOM_ID, TODO_DATA.title);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(200);
        await expect(BODY.title).toEqual(TODO_DATA.title);
    });

    test("Обновление задания через PUT с несуществующим заголовком", {
        tag: "@UpdateChallenges",
        tag: "@Put"
    }, async ({ api }) => {
        const ID = await api.challengeView.getChallengeListId();
        const RANDOM_ID = Math.floor(Math.random() * (ID.length - 1));
        const RESPONSE = await api.challengeUpdate.putUpdateNoTitle(token, RANDOM_ID);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(400);
        await expect(BODY.errorMessages).toEqual(['title : field is mandatory']);
    });

    test("Обновление id задания через PUT", {
        tag: "@UpdateChallenges",
        tag: "@Put"
    }, async ({ api }) => {
        const ID = await api.challengeView.getChallengeListId();
        const RANDOM_ID = Math.floor(Math.random() * (ID.length - 1));
        const RESPONSE = await api.challengeUpdate.putUpdateId(token, RANDOM_ID);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(400);
        await expect(BODY.errorMessages).toEqual([`Can not amend id from ${RANDOM_ID} to 0`]);
    });

    test("Обновление несуществующего задания через PUT", {
        tag: "@UpdateChallenges",
        tag: "@Put"
    }, async ({ api }) => {
        const TODO_DATA = new TodoBuilder()
            .generateTitle(10)
            .generateDescription(50)
            .generate();
        const RESPONSE = await api.challengeUpdate.putUpdate(token, 0, TODO_DATA.title, TODO_DATA.description, true);
        const BODY = await RESPONSE.json();

        console.log(BODY);
        await expect(RESPONSE.status()).toBe(400);
        await expect(BODY.errorMessages).toEqual([`Cannot create todo with PUT due to Auto fields id`]);
    });

    test("Изменение заголовка задания через PUT на слишком длинный заголовок", {
        tag: "@UpdateChallenges",
        tag: "@Put"
    }, async ({ api }) => {
        const TODO_DATA = new TodoBuilder()
            .generateTitle(51)
            .generateDescription(50)
            .generate();
        const ID = await api.challengeView.getChallengeListId();
        const RANDOM_ID = Math.floor(Math.random() * (ID.length - 1));
        const RESPONSE = await api.challengeUpdate.putUpdate(token, RANDOM_ID, TODO_DATA.title, TODO_DATA.description, true);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(400);
        await expect(BODY.errorMessages).toEqual([`Failed Validation: Maximum allowable length exceeded for title - maximum allowed is 50`]);
    });

    test("Изменение описания задания через PUT на слишком длинное описание", {
        tag: "@UpdateChallenges",
        tag: "@Put"
    }, async ({ api }) => {
        const TODO_DATA = new TodoBuilder()
            .generateTitle(10)
            .generateDescription(5001)
            .generate();
        const ID = await api.challengeView.getChallengeListId();
        const RANDOM_ID = Math.floor(Math.random() * (ID.length - 1));
        const RESPONSE = await api.challengeUpdate.putUpdate(token, RANDOM_ID, TODO_DATA.title, TODO_DATA.description, true);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(413);
        await expect(BODY.errorMessages).toEqual([`Error: Request body too large, max allowed is 5000 bytes`]);
    });

    test("Изменение статуса задания через PUT на невалидный тип", {
        tag: "@UpdateChallenges",
        tag: "@Put"
    }, async ({ api }) => {
        const TODO_DATA = new TodoBuilder()
            .generateTitle(10)
            .generateDescription(50)
            .generate();
        const ID = await api.challengeView.getChallengeListId();
        const RANDOM_ID = Math.floor(Math.random() * (ID.length - 1));
        const RESPONSE = await api.challengeUpdate.putUpdate(token, RANDOM_ID, TODO_DATA.title, TODO_DATA.description, "0");
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(400);
        await expect(BODY.errorMessages).toEqual([`Failed Validation: doneStatus : 0 does not match type BOOLEAN (true, false)`]);
    });

    test("Изменение задания через PUT с добавлением нового поля", {
        tag: "@UpdateChallenges",
        tag: "@Put"
    }, async ({ api }) => {
        const ID = await api.challengeView.getChallengeListId();
        const RANDOM_ID = Math.floor(Math.random() * (ID.length - 1));
        const RESPONSE = await api.challengeUpdate.putUpdateField(token, RANDOM_ID);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(400);
        await expect(BODY.errorMessages).toEqual([`Could not find field: field`]);
    });
});

test.describe("Проверка статус кодов", async () => {
    test.beforeAll(async ({ api }) => {
        token = await api.challengeStart.post();
    });

    test("Поверка статус кода PATCH", {
        tag: "@ViewStatusCode",
        tag: "@Patch",
    }, async ({ api }) => {
        const RESPONSE = await api.challengeStatusCode.getPatchStatusCode(token);

        await expect(RESPONSE.status()).toBe(500);
    });

    test("Поверка статус кода DELETE", {
        tag: "@ViewStatusCode",
        tag: "@Delete",
    }, async ({ api }) => {
        const RESPONSE = await api.challengeStatusCode.getDeleteStatusCode(token);

        await expect(RESPONSE.status()).toBe(405);
    });
});

test.describe("Удаление задания", async () => {
    test.beforeAll(async ({ api }) => {
        token = await api.challengeStart.post();
    });

    test("Удаление несуществующего задания с несуществующим id", {
        tag: "@deleteChallenges",
        tag: "@Delete"
    }, async ({ api }) => {
        const ID = await api.challengeView.getChallengeListId();
        const RANDOM_ID = Math.floor(Math.random() * (ID.length - 1));
        const RESPONSE = await api.challengeDelete.delete(token, 0);
        const BODY = await RESPONSE.json();

        await expect(RESPONSE.status()).toBe(404);
        await expect(BODY.errorMessages).toEqual([`Could not find any instances with todos/0`]);
    });

    test("Удаление несуществующего задания с валидным id", {
        tag: "@deleteChallenges",
        tag: "@Delete"
    }, async ({ api }) => {
        const ID = await api.challengeView.getChallengeListId();
        const RANDOM_ID = Math.floor(Math.random() * (ID.length - 1));
        const RESPONSE_DELETE = await api.challengeDelete.delete(token, RANDOM_ID);
        const RESPONSE_GET = await api.challengeView.getSpecificId(token, RANDOM_ID);
        const BODY = await RESPONSE_GET.json();

        await expect(RESPONSE_DELETE.status()).toBe(200);
        await expect(RESPONSE_GET.status()).toBe(404);
        await expect(BODY.errorMessages).toEqual([`Could not find an instance with todos/${RANDOM_ID}`]);
    });

    test("Удаление всех заданий", {
        tag: "@deleteChallenges",
        tag: "@Delete"
    }, async ({ api }) => {
        let idArray = await api.challengeView.getChallengeListId(token);

        for (let i = 0; i < idArray.length; i++) {
            const RESPONSE = await api.challengeDelete.delete(token, idArray[i]);

            await expect(RESPONSE.status()).toBe(200);
        };

        for (let i = 0; i < idArray.length; i++) {
            const RESPONSE = await api.challengeView.getSpecificId(token, idArray[i]);
            const BODY = await RESPONSE.json();

            await expect(RESPONSE.status()).toBe(404);
            await expect(BODY.errorMessages).toEqual([`Could not find an instance with todos/${idArray[i]}`]);
        };
    });
});