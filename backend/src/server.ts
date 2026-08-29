import { app } from "./app";
import config from "./config/config";
import { createServer } from "node:http";

const PORT = config.PORT;

const server = createServer(app);

server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
