import { app } from "@/app";
import { env } from "@/env";

const PORT = env.PORT;

app.listen(console.log(PORT, () => `Server is running on port ${PORT}`));
