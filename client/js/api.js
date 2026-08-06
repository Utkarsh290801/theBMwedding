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
        const headers = { ...(options.headers || {}) };

        const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

        if (!isFormData && !headers["Content-Type"] && !headers["content-type"]) {
            headers["Content-Type"] = "application/json";
        }

        const response = await fetch(
            url,
            {
                headers,
                ...options
            }
        );

        const contentType = response.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            throw new Error(typeof data === "string" ? data : (data.message || "API Error"));
        }

        return data;
    },

    get(endpoint) {
        return this.request(endpoint);
    },

    post(endpoint, body) {

        const requestBody = body instanceof FormData ? body : JSON.stringify(body);

        return this.request(endpoint, {

            method: "POST",

            body: requestBody

        });

    },

    put(endpoint, body) {

        const requestBody = body instanceof FormData ? body : JSON.stringify(body);

        return this.request(endpoint, {

            method: "PUT",

            body: requestBody

        });

    },

    delete(endpoint) {

        return this.request(endpoint, {

            method: "DELETE"

        });

    }

};