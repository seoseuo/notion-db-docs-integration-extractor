require("dotenv").config();
const app = require("./app");

const HOST = process.env.URL || "localhost";
const PORT = process.env.PORT || 3000;

app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
