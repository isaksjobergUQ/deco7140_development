/**
 * POST Form Data Module
 * Reusable function to send form data to API using POST request
 */

const postFormData = async (formEl, endpointUrl, customHeaders = {}) => {
    try {
        const formData = new FormData(formEl);

        // Build headers - don't set Content-Type for FormData (browser will set it with boundary)
        const headers = {
            ...customHeaders,
        };

        const response = await fetch(endpointUrl, {
            method: "POST",
            headers: headers,
            body: formData, // Send FormData directly, not JSON
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = { message: 'Non-JSON response' };
        }

        // Check for success
        // Success response: { person_name: "Name", chat_post_title: "Title", ... }
        // Error response: { chat_post_title: ["error"], chat_post_content: ["error"] }
        // Check if response is ok AND data has actual values (not error arrays)
        const isSuccess = response.ok && 
            (typeof data?.person_name === 'string' || typeof data?.chat_post_title === 'string') &&
            !Array.isArray(data?.chat_post_title) && !Array.isArray(data?.chat_post_content);

        return {
            success: isSuccess,
            data,
        };
    } catch (error) {
        return {
            success: false,
            data: { message: "Network or server error.", error: error.message },
        };
    }
};

export { postFormData };

