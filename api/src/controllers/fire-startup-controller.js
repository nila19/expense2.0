'use strict';

import _ from 'lodash';

import {
  connectToFirebase,
  getAllFireCities as _getAllFireCities,
  getCapitalFireCities as _getCapitalFireCities,
  getPopulatedCapitalFireCities as _getPopulatedCapitalFireCities,
  getCAFireCities as _getCAFireCities,
  getMuseumLandmarks as _getMuseumLandmarks,
} from 'services/fire-startup-service';

export const doConnect = async (req, resp) => {
  const { firebase, log } = req.app.locals;
  const fireData = await connectToFirebase(firebase, log);
  return resp.json({ code: fireData.code, data: { ...fireData.data } });
};

export const getAllFireCities = async (req, resp) => {
  const data = await _getAllFireCities(req.app.locals.firebase);
  return resp.json({ code: 0, data: data });
};

export const getCapitalFireCities = async (req, resp) => {
  const data = await _getCapitalFireCities(req.app.locals.firebase);
  return resp.json({ code: 0, data: data });
};

export const getPopulatedCapitalFireCities = async (req, resp) => {
  const data = await _getPopulatedCapitalFireCities(req.app.locals.firebase);
  return resp.json({ code: 0, data: data });
};

export const getCAFireCities = async (req, resp) => {
  const data = await _getCAFireCities(req.app.locals.firebase);
  return resp.json({ code: 0, data: data });
};

export const getMuseumLandmarks = async (req, resp) => {
  const data = await _getMuseumLandmarks(req.app.locals.firebase);
  return resp.json({ code: 0, data: data });
};
