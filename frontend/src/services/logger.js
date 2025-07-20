const logger = {
  info: (message, meta = {}) => console.log(JSON.stringify({ 
    level: 'INFO', 
    message, 
    timestamp: new Date().toISOString(),
    ...meta 
  })),
  error: (message, meta = {}) => console.error(JSON.stringify({ 
    level: 'ERROR', 
    message, 
    timestamp: new Date().toISOString(),
    ...meta 
  })),
  debug: (message, meta = {}) => console.debug(JSON.stringify({ 
    level: 'DEBUG', 
    message, 
    timestamp: new Date().toISOString(),
    ...meta 
  })),
  warn: (message, meta = {}) => console.warn(JSON.stringify({ 
    level: 'WARN', 
    message, 
    timestamp: new Date().toISOString(),
    ...meta 
  })),
};

export default logger;