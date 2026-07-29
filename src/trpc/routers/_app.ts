import { userRouter } from "@/modules/Landing/procedure";
import { createTRPCRouter } from '../init';
import { messageRouter } from "@/modules/Massage/Procedure";
import { frameRouter } from "@/modules/Admin/procedure";
import { settingsRouter } from "@/modules/Setting/procedure";

export const appRouter = createTRPCRouter({
 
 user: userRouter,
 message: messageRouter,
 frame: frameRouter,
 settings: settingsRouter,
});

export type AppRouter = typeof appRouter; 