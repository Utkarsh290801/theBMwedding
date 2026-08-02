const API = {

    baseURL: "https://the-mb-wedding.vercel.app",
    // baseURL: "http://localhost:5000",

    buildUrl(endpoint) {
        const normalizedBase = this.baseURL.replace(/\/+$/, "");
        const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
        return `${normalizedBase}${normalizedEndpoint}`;
    },

    async request(endpoint, options = {}) {

        const url = this.buildUrl(endpoint);
        const response = await fetch(
            url,
            {
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                },
                ...options
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "API Error");
        }

        return data;
    },

    get(endpoint) {
        return this.request(endpoint);
    },

    post(endpoint, body) {

        return this.request(endpoint, {

            method: "POST",

            body: JSON.stringify(body)

        });

    },

    put(endpoint, body) {

        return this.request(endpoint, {

            method: "PUT",

            body: JSON.stringify(body)

        });

    },

    delete(endpoint) {

        return this.request(endpoint, {

            method: "DELETE"

        });

    }

};