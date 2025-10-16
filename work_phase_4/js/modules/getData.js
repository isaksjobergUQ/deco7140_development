const fetchGetData = (url, headers = {}) => {
    return fetch(url, {
        method: "GET",
        headers: headers,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
            return null;
        });
};

export { fetchGetData };

