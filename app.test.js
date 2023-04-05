//supertests
const request = require('supertest');
const { appApp, appStart } = require('./appServer.js');
const { authApp, authStart } = require('./authServer.js');
const mongoose = require('mongoose');
const userModel = require('./userModel.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PokemonAuthError } = require('./errors.js');
const { asyncWrapper } = require('./asyncWrapper.js');
const { decode } = require('punycode');

beforeAll(async () => {
    await authStart;
    await appStart;
});

afterAll(async () => {
    await mongoose.connection.close();
});
//-----------------------------------------------------------
describe('POST /register', () => {

    // - Test that the /register endpoint creates a new user in the database with the correct hashed password
    it('should create a new user in the database with the correct hashed password', async () => {
        const user = {
            username: 'test',
            password: 'testtest',
            email: 'test@test.com',
            role: 'user'
        }

        const res = await request(authApp).post('/register').send(user);
        expect(res.status).toBe(200);
        expect(res.body.username).toBe(user.username);
        expect(res.body.email).toBe(user.email);
        expect(res.body.role).toBe(user.role);
        expect(res.body.password).not.toBe(user.password);
        const hashedPassword = res.body.password;
        const isMatch = await bcrypt.compare(user.password, hashedPassword);
        expect(isMatch).toBe(true);
    });

    // - Test that the /register endpoint throws a PokemonAuthError for an existing username
    it('should return an error for an existing username', async () => {
        const user = {
            username: 'test',
            password: 'testtest',
            email: 'test@test1.com',
            role: 'user'
        }
        const res = await request(authApp).post('/register').send(user);
        expect(res.status).toBe(409);
        expect(res.text).toBe('User already exists');
    });

    // - Test that the /register endpoint throws a PokemonAuthError for an existing email
    it('should return an error for an existing email', async () => {
        const user = {
            username: 'test1',
            password: 'testtest',
            email: 'test@test.com',
            role: 'user'
        }
        const res = await request(authApp).post('/register').send(user);
        expect(res.status).toBe(409);
        expect(res.text).toBe('Email already exists');
    });

    // - Test that the /register endpoint throws a PokemonAuthError for a missing username
    it('should return an error for a missing username', async () => {
        const user = {
            password: 'test',
            email: 'test@test.com'
        }
        const res = await request(authApp).post('/register').send(user);
        expect(res.status).toBe(401);
        expect(res.text).toBe('Missing username, password or email');
    });

    // - Test that the /register endpoint throws a PokemonAuthError for a missing password
    it('should return an error for a missing password', async () => {
        const user = {
            username: 'test',
            email: 'test@test.com'
        }
        const res = await request(authApp).post('/register').send(user);
        expect(res.status).toBe(401);
        expect(res.text).toBe('Missing username, password or email');
    });

    // - Test that the /register endpoint throws a PokemonAuthError for a missing email
    it('should return an error for a missing email', async () => {
        const user = {
            username: 'test',
            password: 'test'
        }
        const res = await request(authApp).post('/register').send(user);
        expect(res.status).toBe(401);
        expect(res.text).toBe('Missing username, password or email');
    });


    // - Test that the /register endpoint throws a PokemonAuthError for a username that is too short
    it('should return an error for a username that is too short', async () => {
        const user = {
            username: 'te',
            password: 'testtest',
            email: 'test@test.com'
        }
        const res = await request(authApp).post('/register').send(user);
        expect(res.status).toBe(401);
        expect(res.text).toBe('Username must be between 3 and 20 characters');
    });

    // - Test that the /register endpoint throws a PokemonAuthError for a username that is too long
    it('should return an error for a username that is too long', async () => {
        const user = {
            username: 'testkjadhflkajdshf aichjasd kfjhcasjkfhasdjkfhas',
            password: 'testtest',
            email: 'test@test.com'
        }
        const res = await request(authApp).post('/register').send(user);
        expect(res.status).toBe(401);
        expect(res.text).toBe('Username must be between 3 and 20 characters');
    });

    // - Test that the /register endpoint throws a PokemonAuthError for a password that is too short
    it('should return an error for a password that is too short', async () => {
        const user = {
            username: 'test',
            password: 'te',
            email: 'test@test.com'
        }
        const res = await request(authApp).post('/register').send(user);
        expect(res.status).toBe(401);
        expect(res.text).toBe('Password must be between 6 and 20 characters');
    });

    // - Test that the /register endpoint throws a PokemonAuthError for a password that is too long
    it('should return an error for a password that is too short', async () => {
        const user = {
            username: 'test',
            password: 'tealisdhfakdsjhfbahjdsfbkjahsdvglasjdhvbaslvjhasdl',
            email: 'test@test.com'
        }
        const res = await request(authApp).post('/register').send(user);
        expect(res.status).toBe(401);
        expect(res.text).toBe('Password must be between 6 and 20 characters');
    });
});
//-----------------------------------------------------------

//-----------------------------------------------------------

describe('POST /login', () => {

    // - Test that the /login endpoint returns a JWT access token and refresh token for valid credentials
    it('should return a JWT access token and refresh token for valid credentials', async () => {
        const user = {
            username: 'admin',
            password: 'admin'
        }
        const res = await request(authApp).post('/login').send(user);
        expect(res.status).toBe(200);
        expect(res.body.username).toBe(user.username);
        let tokens = res.headers.authorization.split(' ');
        expect(tokens[0]).toBe('Bearer');
        expect(tokens[2]).toBe('Refresh');
    });

    // - Test that the /login endpoint throws a PokemonAuthError for invalid credentials
    it('should return an error for invalid username', async () => {
        const user = {
            username: 'invalid username',
            password: 'admin'
        }
        const res = await request(authApp).post('/login').send(user);
        expect(res.status).toBe(404);
        expect(res.text).toBe('User not found');
    });

    it('should return an error for invalid password', async () => {
        const user = {
            username: 'admin',
            password: 'invalid password'
        }
        const res = await request(authApp).post('/login').send(user);
        expect(res.status).toBe(401);
        expect(res.text).toBe('Invalid password');
    });
});
// //-----------------------------------------------------------

describe('GET /logout', () => {
    // - Test that the /logout endpoint returns a 200 status code
    it('should return a 200 status code', async () => {
        const user = {
            username: 'admin',
            password: 'admin'
        }
        const res = await request(authApp).post('/login').send(user);
        expect(res.status).toBe(200);
    });

    // - Test that the /logout endpoint returns a 404 for an invalid username
    it('should return a 404 for an invalid username', async () => {
        const user = {
            username: 'invalid username',
            password: 'admin'
        }
        const res = await request(authApp).get('/logout').send(user);
        expect(res.status).toBe(404);
        expect(res.text).toBe('User not found');
    });
});


//-----------------------------------------------------------

describe('POST /requestNewAccessToken', () => {
    // - Test that the /requestNewAccessToken endpoint returns a new JWT access token for a valid refresh token
    it('should return a new JWT access token for a valid refresh token', async () => {
        const user = {
            username: 'admin',
            password: 'admin'
        }
        let res = await request(authApp).post('/login').send(user);
        let tokens = res.headers.authorization.split(' ');
        let refresh_token = tokens[2] + ' ' + tokens[3];
        res = await request(authApp).post('/requestNewAccessToken').set('Authorization', refresh_token);
        expect(res.status).toBe(200);
        tokens = res.headers.authorization.split(' ');
        expect(tokens[0]).toBe('Bearer');
        await request(authApp).get('/logout').send(user);
    });

    it('should return an error for a missing header', async () => {
        let res = await request(authApp).post('/requestNewAccessToken').set('Authorization', null);
        expect(res.status).toBe(401);
        expect(res.text).toBe('Invalid Token: Not a Refresh token.');
    });

    it('should return an error for a non-refresh token', async () => {
        let token = 'Bearer a;ldkfjasf';
        let res = await request(authApp).post('/requestNewAccessToken').set('Authorization', token);
        expect(res.status).toBe(401);
        expect(res.text).toBe('Invalid Token: Not a Refresh token.');
    });
});
//-----------------------------------------------------------

//-----------------------------------------------------------
// - Test that the JWT access token can be decoded and contains the correct user data
describe('POST /login', () => {
    it('should return a JWT access token and refresh token for valid credentials', async () => {
        const user = {
            username: 'admin',
            password: 'admin'
        }
        const res = await request(authApp).post('/login').send(user);
        const tokens = res.headers.authorization.split(' ');
        const access_token = tokens[1];
        const decoded = jwt.verify(access_token, 'pokeUsers access token');
        expect(decoded.username).toBe(user.username);
        expect(decoded.role).toBe('admin');
        await request(authApp).get('/logout').send(user);
    });
});
//-----------------------------------------------------------

// More tests:

//-----------------------------------------------------------

describe('GET /api/v1/pokemon', () => {
    // - Test that a user can successfully register, login, and make a request with a JWT access token
    it('should return a pokemon', async () => {
        const user = {
            username: 'testToGetPokemon',
            password: 'testToGetPokemon',
            role: 'user',
            email: 'test1@test.com',
        }
        let res = await request(authApp).post('/register').send(user);
        res = await request(authApp).post('/login').send(user);
        let tokens = res.headers.authorization.split(' ');
        const access_token = tokens[0] + ' ' + tokens[1];
        res = await request(appApp).get('/api/v1/pokemon').set('Authorization', access_token);
        expect(res.status).toBe(200);
        expect(res.text).toBe("Here's your pokemon. Enjoy!");
    });

    // - Test that an unauthenticated user cannot access protected endpoints
    it('should return an error for an unauthenticated user', async () => {
        const res = await request(appApp).get('/api/v1/pokemon').set('Authorization', ';slkdfjglksdf');
        expect(res.status).toBe(401);
        expect(res.text).toBe('Invalid access token. No access.');
    });

    // - Test that a refresh token cannot be used to access protected endpoints
    it('should return an error for a refresh token', async () => {
        const res = await request(appApp).get('/api/v1/pokemon').set('Authorization', 'Refresh ;slkdfjglksdf');
        expect(res.status).toBe(401);
        expect(res.text).toBe('Invalid access token. No access.');
    });
});

// - Test that non-admin user cannot access admin protected routes
describe('POST /api/v1/pokemon', () => {
    it('should return an error for a non-admin user', async () => {
        const user = {
            username: 'testToGetPokemon',
            password: 'testToGetPokemon',
        }
        let res = await request(authApp).post('/login').send(user);
        let tokens = res.headers.authorization.split(' ');
        const access_token = tokens[0] + ' ' + tokens[1];
        res = await request(appApp).post('/api/v1/pokemon').set('Authorization', access_token);
        expect(res.status).toBe(401);
        expect(res.text).toBe('Not authorized to access this route.');
    });
});
// //-----------------------------------------------------------
