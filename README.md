# Crazy Pizza API
2nd homework assignment for [Pirple's NodeJS master class](https://pirple.thinkific.com/courses/the-nodejs-master-class).
This project is a JSON RESTful API free of 3rd-party dependencies for a pizza-delivery company utilizing Stripe and MailGun external services.

![Logo](https://github.com/marta-krzyk-dev/CrazyPizzaAPI/blob/master/logo_small.jpg?raw=true)

# ROUTES

## USERS

|Method|Header|Query params|Payload|Desc|
|------|---------------|----------------|----------------|----------------|
|`GET`   |`token`* ||`email`\*|Return information about the user except for password in a JSON format.|
|`PUT`   |`token`* ||`email`*, at least one of: \(`firstName`, `lastName`, `password`\)\*| Change one/more of user's information. Email change not allowed.|
|`POST`  | | | `firstName` *, `lastName`\*, `email`\*, `password`\*, `streetAddress`\*|Create a user account.|
|`DELETE`|`token`* ||`email`* |Delete user's account.|

## TOKENS
|Method|Header|Query params|Payload|Desc|
|------|---------------|----------------|----------------|----------------|
|`GET`   ||`id`\*||Get token's id and expiration date.|
|`PUT`   |||`id`\*, `extend`\*|With extend set to true, a valid token's lifespan is extended.|
|`POST`  ||| `email`\*, `password`\* |Log in. Return a new, valid token for the user to use with other routes.|
|`DELETE`||`id`\*||Log out.|

## MENU

|Method|Header|Query params|Payload|Desc|
|------|---------------|----------------|----------------|----------------|
|`GET` |`token`*|||Get menu as a JSON array of pizzas. |

## SHOPPINGCART
|Method|Header|Query params|Payload|Desc|
|------|---------------|----------------|----------------|----------------|
|`GET`   |`token`\*|||Get full list of existing, unpurchased orders for the user.|
|`POST`   |`token`\* ||array of items*, eg. [{"id":1,"amount":2}]|Save an order to the shopping cart. `amount` field in the item is optional. If not supplied, it's set to 1.|
|`DELETE`|`token`\* |`orderid`\*||Delete an order from user's shopping cart.|

## PURCHASE
|Method|Header|Query params|Payload|Desc|
|------|---------------|----------------|----------------|----------------|
|`POST`  |`token`*, `orderId`||array of items, eg. [{"id":1,"amount":2}]| If orderId header is set, the order is loaded from user's shopping cart. If payload is populated (just as in `POST` for `SHOPPINGCART` route), the order is loaded from it. If both are set, orderId precedes. If the payment is successful, a receipt is emailed.|

*Required

## Manual

### Set up
0. Download the project.
1. Open the command prompt (for Windows, click Start icon and type in 'cmd') and go to the project directory.eg. :
`cd C:/HelloAPI`
2. Run the app:
`node index.js`
Optionally, one can set the environment as command line argument (with value of 'production' or 'staging'). The default is 'staging'.
`node index.js production` (for Windows)
`NODE_ENV=production node index.js` (for Linux)
3. The app informs which ports are active.
4. Open up a web browser or a tool like Postman. Start making requests. Follow the Basic scenario below to learn the most useful requests.
5. Push `Ctrl` + `C` to stop the app.

### Basic scenario:
1. Create a user. (`USERS`, `POST`)
2. Log in. (`TOKENS`, `POST`)
3. View menu. (`MENU`, `GET`)
4. Order a pizza. (`SHOPPINGCART`, `POST`)
5. Pay for the order. (`PURCHASE`, `POST`)
6. Check email for a receipt.
7. Log out. (`TOKENS`, `DELETE`)

Please populate the fields in your request according to the ROUTE tables above. Required fields are marked with *.

## API functionalities by route
### Users
1. Create a user (an account).
2. Get user's data.
3. Update user's data.
4. Delete a user (an account).

### Tokens
1. Create a token (log into an account).
2. Get token's data (expiration date and time).
3. Extend token's expiration date.
4. Delete a token (log out).

### Menu
1. Get the menu.

### Shopping cart
1. Create an order (select items from menu).
2. List existing orders (items chosen but not yet purchased).
3. Delete an order.

### Purchase
1. Pay for an existing order.
2. Send an order and pay for it all in one request.

---
Logo: Free Vector Art by Vecteezy.com
