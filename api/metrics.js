import crypto from 'crypto';

const metricsStore = {
    totalRequests: 0,
    startTime: Date.now(),
    statusCodes: {
        '2xx': 0,
        '3xx': 0,
        '4xx': 0,
        '5xx': 0,
        other: 0
    },
    routes: {},
    recentErrors: []
};

const MAX_RECENT_ERRORS = 50;

function generateRequestId() {
    return crypto.randomBytes(8).toString('hex');
}

function getStatusCodeGroup(status) {
    if (status >= 200 && status < 300) return '2xx';
    if (status >= 300 && status < 400) return '3xx';
    if (status >= 400 && status < 500) return '4xx';
    if (status >= 500 && status < 600) return '5xx';
    return 'other';
}

function metricsMiddleware(req, res, next) {
    const requestId = generateRequestId();
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);

    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const statusGroup = getStatusCodeGroup(res.statusCode);

        metricsStore.totalRequests++;
        metricsStore.statusCodes[statusGroup] = (metricsStore.statusCodes[statusGroup] || 0) + 1;

        const routePath = req.route?.path || req.path;
        const routeKey = `${req.method} ${routePath}`;
        if (!metricsStore.routes[routeKey]) {
            metricsStore.routes[routeKey] = { count: 0, totalTime: 0, avgTime: 0 };
        }
        metricsStore.routes[routeKey].count++;
        metricsStore.routes[routeKey].totalTime += duration;
        metricsStore.routes[routeKey].avgTime = Math.round(
            metricsStore.routes[routeKey].totalTime / metricsStore.routes[routeKey].count
        );

        if (!metricsStore.routes[routePath]) {
            metricsStore.routes[routePath] = { count: 0, totalTime: 0, avgTime: 0 };
        }
        metricsStore.routes[routePath].count++;
        metricsStore.routes[routePath].totalTime += duration;
        metricsStore.routes[routePath].avgTime = Math.round(
            metricsStore.routes[routePath].totalTime / metricsStore.routes[routePath].count
        );

        if (res.statusCode >= 500) {
            const errorEntry = {
                requestId,
                path: req.path,
                method: req.method,
                statusCode: res.statusCode,
                timestamp: new Date().toISOString()
            };
            metricsStore.recentErrors.unshift(errorEntry);
            if (metricsStore.recentErrors.length > MAX_RECENT_ERRORS) {
                metricsStore.recentErrors.pop();
            }
        }
    });

    next();
}

function getMetrics() {
    const mem = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();

    return {
        requestId: {
            enabled: true,
            header: 'X-Request-Id'
        },
        totalRequests: metricsStore.totalRequests,
        uptime: Math.floor(uptime),
        statusCodes: { ...metricsStore.statusCodes },
        routes: { ...metricsStore.routes },
        recentErrors: [...metricsStore.recentErrors],
        runtime: {
            memory: {
                rss: mem.rss,
                heapTotal: mem.heapTotal,
                heapUsed: mem.heapUsed,
                external: mem.external,
                arrayBuffers: mem.arrayBuffers
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system
            }
        }
    };
}

function getMetricsSnapshot() {
    return JSON.parse(JSON.stringify(getMetrics()));
}

function resetMetrics() {
    metricsStore.totalRequests = 0;
    metricsStore.statusCodes = {
        '2xx': 0,
        '3xx': 0,
        '4xx': 0,
        '5xx': 0,
        other: 0
    };
    metricsStore.routes = {};
    metricsStore.recentErrors = [];
}

function sanitizePrometheusLabelValue(value) {
    if (value === undefined || value === null) {
        return '';
    }
    const str = String(value);
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function sanitizePrometheusMetricValue(value) {
    if (!Number.isFinite(value)) {
        return 0;
    }
    return value;
}

function getPrometheusRouteMetrics() {
    return Object.entries(metricsStore.routes)
        .filter(([routeKey, data]) => routeKey.includes(' ') && typeof data === 'object' && data !== null)
        .map(([routeKey, data]) => {
            const firstSpaceIndex = routeKey.indexOf(' ');
            const method = routeKey.slice(0, firstSpaceIndex);
            const route = routeKey.slice(firstSpaceIndex + 1);

            return {
                method,
                route,
                count: sanitizePrometheusMetricValue(data.count),
                avgTime: sanitizePrometheusMetricValue(data.avgTime)
            };
        });
}

function formatPrometheusMetrics() {
    const mem = process.memoryUsage();
    const uptime = process.uptime();
    const lines = [];
    const routeMetrics = getPrometheusRouteMetrics();

    lines.push('# HELP http_requests_total Total number of HTTP requests');
    lines.push('# TYPE http_requests_total counter');
    lines.push(`http_requests_total ${sanitizePrometheusMetricValue(metricsStore.totalRequests)}`);

    lines.push('# HELP http_requests_by_status HTTP requests grouped by status code');
    lines.push('# TYPE http_requests_by_status counter');
    for (const [status, count] of Object.entries(metricsStore.statusCodes)) {
        lines.push(`http_requests_by_status{status="${sanitizePrometheusLabelValue(status)}"} ${sanitizePrometheusMetricValue(count)}`);
    }

    lines.push('# HELP http_request_duration_average_ms Average request duration in milliseconds by method and route');
    lines.push('# TYPE http_request_duration_average_ms gauge');
    for (const entry of routeMetrics) {
        lines.push(
            `http_request_duration_average_ms{method="${sanitizePrometheusLabelValue(entry.method)}",route="${sanitizePrometheusLabelValue(entry.route)}"} ${entry.avgTime}`
        );
    }

    lines.push('# HELP http_request_count_total Total requests by method and route');
    lines.push('# TYPE http_request_count_total counter');
    for (const entry of routeMetrics) {
        lines.push(
            `http_request_count_total{method="${sanitizePrometheusLabelValue(entry.method)}",route="${sanitizePrometheusLabelValue(entry.route)}"} ${entry.count}`
        );
    }

    lines.push('# HELP process_uptime_seconds Process uptime in seconds');
    lines.push('# TYPE process_uptime_seconds gauge');
    lines.push(`process_uptime_seconds ${sanitizePrometheusMetricValue(uptime)}`);

    lines.push('# HELP process_memory_rss_bytes Process resident set size memory in bytes');
    lines.push('# TYPE process_memory_rss_bytes gauge');
    lines.push(`process_memory_rss_bytes ${sanitizePrometheusMetricValue(mem.rss)}`);

    lines.push('# HELP process_memory_heap_used_bytes Process heap used memory in bytes');
    lines.push('# TYPE process_memory_heap_used_bytes gauge');
    lines.push(`process_memory_heap_used_bytes ${sanitizePrometheusMetricValue(mem.heapUsed)}`);

    lines.push('# HELP process_memory_heap_total_bytes Process heap total memory in bytes');
    lines.push('# TYPE process_memory_heap_total_bytes gauge');
    lines.push(`process_memory_heap_total_bytes ${sanitizePrometheusMetricValue(mem.heapTotal)}`);

    lines.push('# HELP process_memory_external_bytes Process external memory in bytes');
    lines.push('# TYPE process_memory_external_bytes gauge');
    lines.push(`process_memory_external_bytes ${sanitizePrometheusMetricValue(mem.external)}`);

    return lines.join('\n') + '\n';
}

export {
    metricsMiddleware,
    getMetrics,
    getMetricsSnapshot,
    resetMetrics,
    metricsStore,
    generateRequestId,
    formatPrometheusMetrics
};
