const express = require('express');
const cors = require('cors');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const taskRoutes = require('./modules/tasks/task.routes');
const errorHandler = require('./common/errorHandler');
const { NotFoundError } = require('./common/errors');
const ApiResponse = require('./common/response');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    return ApiResponse.success(res, { app: 'Smart Task Manager API', version: '1.0.0' }, 'API service online');
});

app.get('/api/health', (req, res) => {
    return ApiResponse.success(res, { status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

app.use((req, res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

app.use(errorHandler);

module.exports = app;
