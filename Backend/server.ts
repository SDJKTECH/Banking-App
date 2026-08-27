import app from "./app";
import {env} from './src/config/env';
import { logger } from "./src/lib/logger";

const PORT = env.port;

app.listen(PORT, () => {
    logger.info(`Server running at http://localhost:${PORT}`);
});