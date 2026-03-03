import express from 'express';
import * as functions from 'firebase-functions';
export declare const createNestServer: (expressInstance: express.Express) => Promise<void>;
export declare const api: functions.https.HttpsFunction;
