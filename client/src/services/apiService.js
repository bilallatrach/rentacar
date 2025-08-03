// apiService.js

const apiUrl = process.env.REACT_APP_API_URL;

const apiService = {
  async fetchData(endpoint, options = {}) {
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, options);
      if (!response.ok) {
        const respJSon = await response.json();
        console.log("ERROR resp json", respJSon);
        return { data: null, error: respJSon.msg };
      }
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  async postData(endpoint, body, options = {}) {
    return this.fetchData(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(body),
      ...options,
    });
  },
  async authPostData(endpoint, body, options = {}) {
    const token = localStorage.getItem("token");
    return this.fetchData(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      body: JSON.stringify(body),
      ...options,
    });
  },

  async putData(endpoint, body, options = {}) {
    return this.fetchData(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(body),
      ...options,
    });
  },

  async deleteData(endpoint, options = {}) {
    return this.fetchData(endpoint, {
      method: "DELETE",
      ...options,
    });
  },
};

export default apiService;
