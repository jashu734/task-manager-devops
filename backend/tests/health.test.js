const request = require('supertest');
const express = require('express');

// Mock pool query for isolated health test
jest.mock('../db', () => ({
  pool: {
    query: jest.fn(),
  },
  initDb: jest.fn(),
}));

const { pool } = require('../db');
const app = require('../server');

describe('API & Health Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /health returns 200 when database query succeeds', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });

    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('UP');
    expect(res.body.database).toEqual('connected');
  });

  test('GET /health returns 500 when database query fails', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB Connection Refused'));

    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(500);
    expect(res.body.status).toEqual('DOWN');
  });
});
