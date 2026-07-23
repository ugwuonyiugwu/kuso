import { userRouter } from "@/modules/Landing/procedure";
import { createTRPCRouter } from '../init';
import { messageRouter } from "@/modules/Massage/Procedure";

export const appRouter = createTRPCRouter({
 
 user: userRouter,
 message: messageRouter,
});

export type AppRouter = typeof appRouter; 