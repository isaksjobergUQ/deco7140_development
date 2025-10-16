/**
 * POST Form Data Module
 * Reusable function to send form data to API using POST request
 */

const postFormData = async (formEl, endpointUrl, customHeaders = {}) => {
    try {
        const formData = new FormData(formEl);

        const response = await fetch(endpointUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...customHeaders,
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });

        const data = await response.json();

        return {
            success: response.ok && data.status === "success",
            data,
        };
    } catch (error) {
        return {
            success: false,
            data: { message: "Network or server error.", error },
        };
    }
};

export { postFormData };

