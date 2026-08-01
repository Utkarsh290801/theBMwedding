const API = {

    baseURL: "https://bm-wedding-three.vercel.app",

    async request(endpoint, options = {}) {

        const url = `${this.baseURL.replace(/\/$/, "")}${endpoint}`;
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