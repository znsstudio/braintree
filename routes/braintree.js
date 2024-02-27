var express = require('express');
var router = express.Router();

const braintree = require("braintree");
const {
    v4: uuidv4
} = require('uuid');
const {
    faker
} = require('@faker-js/faker');

const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.merchantId,
    publicKey: process.env.publicKey,
    privateKey: process.env.privateKey
});

router.get('/custome-create', async function (req, res, next) {

    const customer = await gateway.customer.create({
        id: uuidv4(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        fax: faker.phone.number(),
    }).then(result => {
        return result.customer;
    });

    let creditCardParams = {
        customerId: customer.id,
        number: '4111111111111111',
        expirationDate: '06/2026',
        cvv: '100'
      };

    await gateway.creditCard.create(creditCardParams, (err, response) => {

        const customerData = {
            customer,
            payment : response.creditCard
        };

        res.render('subscription', customerData);

    });

});

router.get('/subscription', (req, res) => {
    res.render('subscription');
});


router.post('/subscription', async function (req, res, next) {

    let subscriptionObject = {
        id: uuidv4()
    };

    requestBody = req.body;

    Object.keys(requestBody).forEach(key => {
        // Check if the property's value is not empty
        if (requestBody[key] != "") {
          // Add the key-value pair to the existingObject
          subscriptionObject[key] = requestBody[key];
        }
      });

    res.json(await gateway.subscription.create(subscriptionObject).then(result => {
        return result;
    }));

});

router.get('/plan', (req, res) => {
    res.render('plan');
});

router.post('/plan', async function (req, res, next) {

    let planObject = {};

    requestBody = req.body;

    Object.keys(requestBody).forEach(key => {
        // Check if the property's value is not empty
        if (requestBody[key] != "") {
          // Add the key-value pair to the existingObject
          planObject[key] = requestBody[key];
        }
      });

    res.json(await gateway.plan.create(planObject).then(result => {
        return result;
    }));

});

module.exports = router;