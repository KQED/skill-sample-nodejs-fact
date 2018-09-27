/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const cookbook = require('./alexa-cookbook.js');
const https = require('https');
const fetch = require("node-fetch");
const htmlToText = require('html-to-text');

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

const SKILL_NAME = 'election props';
const GET_FACT_MESSAGE = 'Here\'s your fact: ';
const HELP_MESSAGE = 'You can say tell me a space fact, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const FALLBACK_MESSAGE = 'The Space Facts skill can\'t help you with that.  It can help you discover facts about space if you say tell me a space fact. What can I help you with?';
const FALLBACK_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

//=========================================================================================================================================
//TODO: Replace this data with your own.  You can find translations of this data at http://github.com/alexa/skill-sample-node-js-fact/lambda/data
//=========================================================================================================================================


//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        return request.type === `LaunchRequest`;
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(`Welcome To election props, Which props will you like to listen`)
            .reprompt(`Which props will you like to listen?`)
            .getResponse();
    },
};


const GetPropsIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetPropsIntent');
  },
    handle(handlerInput) {
        async function buildAlexaResponse(){
            const { intent } = handlerInput.requestEnvelope.request;
           console.log(intent)
            const url = `https://demo-api.kqed.org/propositions`;
            let response = await fetch(url);
            const json = await response.json();
            const title = json[intent.slots.Answer.value-1].title
            const content = htmlToText.fromString(json[intent.slots.Answer.value-1].content)
            return handlerInput.responseBuilder
                .speak(title)
                .speak(content)
                .getResponse();
        }


    return buildAlexaResponse()
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const FallbackHandler = {
  // 2018-May-01: AMAZON.FallbackIntent is only currently available in en-US locale.
  //              This handler will not be triggered except in that locale, so it can be
  //              safely deployed for any locale.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(FALLBACK_MESSAGE)
      .reprompt(FALLBACK_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
      LaunchRequestHandler,
      GetPropsIntent,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
