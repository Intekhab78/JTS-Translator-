import axios from 'axios';

let BASE_URL = 'http://localhost:5000';

export const getBaseUrl = () => BASE_URL;

export const checkBackend = async (): Promise<string> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2 seconds timeout
        
        const res = await fetch('http://localhost:5000/', { 
            method: 'GET',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (res.ok) {
            BASE_URL = 'http://localhost:5000';
            console.log('Using local backend:', BASE_URL);
        } else {
            throw new Error('Local backend returned non-OK status');
        }
    } catch (e) {
        BASE_URL = 'https://translatorapi.jtsonline.shop';
        console.log('Local backend not reachable. Falling back to online backend:', BASE_URL);
    }
    
    // Setup Axios request interceptor to rewrite the hardcoded URL dynamically
    axios.interceptors.request.use((config) => {
        if (config.url && config.url.startsWith('http://localhost:5000')) {
            config.url = config.url.replace('http://localhost:5000', BASE_URL);
        }
        return config;
    });

    // Monkey patch global fetch to rewrite the hardcoded URL dynamically
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
        if (typeof input === 'string' && input.startsWith('http://localhost:5000')) {
            input = input.replace('http://localhost:5000', BASE_URL);
        } else if (input instanceof URL && input.href.startsWith('http://localhost:5000')) {
            input = new URL(input.href.replace('http://localhost:5000', BASE_URL));
        } else if (input instanceof Request && input.url.startsWith('http://localhost:5000')) {
            input = new Request(input.url.replace('http://localhost:5000', BASE_URL), input);
        }
        return originalFetch(input, init);
    };

    return BASE_URL;
};
