/**
 * POST Form Data Module
 * Reusable function to send form data to API using POST request
 */

const postFormData = async (formEl, endpointUrl, customHeaders = {}) => {
    try {
        // Create FormData object from form inputs
        const formData = new FormData(formEl);
        
        // Send POST request to API endpoint
        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...customHeaders
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        
        // Convert response to JavaScript object
        const data = await response.json();
        
        // Return success status and data
        return {
            success: response.ok && data.status === 'success',
            data,
        };
    } catch (error) {
        // Handle network or server errors gracefully
        return {
            success: false,
            data: { message: 'Network or server error.', error },
        };
    }
};

export { postFormData };
