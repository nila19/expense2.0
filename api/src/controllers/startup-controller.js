'use strict';

import _ from 'lodash';

import {
  doConnect as _doConnect,
  getAllCities as _getAllCities,
  getDefaultCity as _getDefaultCity,
  getCategories as _getCategories,
  getDescriptions as _getDescriptions,
  getEntryMonths as _getEntryMonths,
  getTransMonths as _getTransMonths,
  getAccounts as _getAccounts,
  getBills as _getBills,
} from 'services/startup-service';

export const doConnect = async (req, resp) => {
  const { db, log } = req.app.locals;
  const data = await _doConnect(db, log);
  return resp.json(data);
};

export const getAllCities = async (req, resp) => {
  const data = await _getAllCities(req.app.locals.db);
  return resp.json({ code: 0, data: data });
};

export const getDefaultCity = async (req, resp) => {
  const data = await _getDefaultCity(req.app.locals.db);
  return resp.json({ code: 0, data: data });
};

export const getCategories = async (req, resp) => {
  const data = await _getCategories(req.app.locals.db, req.body.cityId);
  return resp.json({ code: 0, data: data });
};

export const getDescriptions = async (req, resp) => {
  const data = await _getDescriptions(req.app.locals.db, req.body.cityId);
  return resp.json({ code: 0, data: data });
};

export const getEntryMonths = async (req, resp) => {
  const data = await _getEntryMonths(req.app.locals.db, req.body.cityId);
  return resp.json({ code: 0, data: data });
};

export const getTransMonths = async (req, resp) => {
  const data = await _getTransMonths(req.app.locals.db, req.body.cityId);
  return resp.json({ code: 0, data: data });
};

export const getAccounts = async (req, resp) => {
  const data = await _getAccounts(req.app.locals.db, req.body.cityId);
  return resp.json({ code: 0, data: data });
};

export const getBills = async (req, resp) => {
  const data = await _getBills(req.app.locals.db, req.body.cityId);
  return resp.json({ code: 0, data: data });
};
